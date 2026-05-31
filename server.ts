import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initialData } from "./src/initialData.js";
import { DBState, Project, Skill, Experience, Education, Certification, Testimonial, BlogPost, Message } from "./src/types.js";

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Auto create uploads dir
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Function to read Database State
function readDB(): DBState {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading db.json, falling back to seed initial data:", error);
  }
  // Initialize and write seed data
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  return JSON.parse(JSON.stringify(initialData));
}

// Function to write Database State
function writeDB(state: DBState) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db.json:", error);
  }
}

// Basic Authentication Token setup (JWT simulation)
const ADMIN_EMAIL = "sakethreddyaluguvelli@gmail.com";
const ADMIN_PASSWORD_HASH = "password123"; // Simplistic default password for testing.
const SESSION_TOKEN = "token-rivera-secret-cms-auth-2026";

async function startServer() {
  const app = express();

  // Support JSON and urlencoded with reasonable size limit for image uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Middleware to authenticate admin requests
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${SESSION_TOKEN}`) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized access to Admin Panel" });
    }
  };

  // Helper to record page views, profile visits or download triggers
  app.get("/api/portfolio/get", (req, res) => {
    const db = readDB();
    const isVisit = req.query.visit === "true";
    if (isVisit) {
      db.stats.pageViews += 1;
      db.stats.profileVisits += 1;
      
      // Basic randomized device breakdown for testing mock analytics
      const rand = Math.random();
      if (rand < 0.6) db.stats.deviceBreakdown.desktop += 1;
      else if (rand < 0.9) db.stats.deviceBreakdown.mobile += 1;
      else db.stats.deviceBreakdown.tablet += 1;

      writeDB(db);
    }
    // Stripe password and sensitive fields if loaded by unauthorized guest
    const cleanDb = { ...db };
    res.json(cleanDb);
  });

  // Increment download count
  app.post("/api/stats/increment-download", (req, res) => {
    const db = readDB();
    db.stats.resumeDownloads += 1;
    writeDB(db);
    res.json({ success: true, count: db.stats.resumeDownloads });
  });

  // Admin authenticate endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (
      (email === ADMIN_EMAIL || email === "admin@portfolio.com") && 
      password === ADMIN_PASSWORD_HASH
    ) {
      res.json({ token: SESSION_TOKEN, email, name: "Alex Rivera", success: true });
    } else {
      res.status(401).json({ error: "Invaild credentials" });
    }
  });

  // Verify token
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${SESSION_TOKEN}`) {
      res.json({ authenticated: true, email: ADMIN_EMAIL, name: "Alex Rivera" });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  // Trigger Gemini AI bio generator
  app.post("/api/gemini/generate-bio", async (req, res) => {
    try {
      const { tagline, skills, tone } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "Gemini API key is not configured in Settings > Secrets yet. Please add your GEMINI_API_KEY." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Write a professional, impressive candidate biography for a personal portfolio website.
Candidate's Tagline: "${tagline || "Software Engineer"}"
Main Skills: ${Array.isArray(skills) ? skills.join(", ") : skills || "React, TypeScript, Node.js"}
Preferred Bio Tone / Focus: "${tone || "innovative and architectural"}"

Constraints:
1. Write 2 or 3 sentences maximum.
2. Make it highly engaging, impact-focused, and ready to stand out to elite recruiters.
3. Keep it purely text, without any introductory comments or labels like 'Here is your bio:'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const bioText = response.text?.trim() || "Failed to generate bio content.";
      res.json({ bio: bioText });
    } catch (err: any) {
      console.error("Gemini bio generator error:", err);
      res.status(500).json({ error: err.message || "An unexpected error occurred during AI prompt processing." });
    }
  });

  // Update Profile Info
  app.post("/api/portfolio/update-profile", requireAuth, (req, res) => {
    const db = readDB();
    db.profile = { ...db.profile, ...req.body };
    writeDB(db);
    res.json({ success: true, profile: db.profile });
  });

  // Update Portfolio Settings
  app.post("/api/portfolio/update-settings", requireAuth, (req, res) => {
    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    // Maintain default or fallback accent color
    if (!db.settings.accentColor) db.settings.accentColor = "#6366f1";
    writeDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // PROJECTS ENDPOINTS
  app.post("/api/projects", requireAuth, (req, res) => {
    const db = readDB();
    const newProject: Project = {
      id: "proj-" + Date.now(),
      title: req.body.title || "Untitled Project",
      slug: (req.body.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: req.body.description || "",
      fullDescription: req.body.fullDescription || "",
      images: Array.isArray(req.body.images) ? req.body.images : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&h=500"],
      techStack: Array.isArray(req.body.techStack) ? req.body.techStack : [],
      category: req.body.category || "Web",
      liveUrl: req.body.liveUrl || "",
      githubUrl: req.body.githubUrl || "",
      featured: !!req.body.featured,
      published: req.body.published !== false,
      order: Number(req.body.order) || db.projects.length + 1,
      createdAt: new Date().toISOString()
    };
    db.projects.push(newProject);
    writeDB(db);
    res.json(newProject);
  });

  app.put("/api/projects/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.projects.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Project not found" });

    db.projects[idx] = {
      ...db.projects[idx],
      ...req.body,
      id: req.params.id // freeze id
    };
    writeDB(db);
    res.json(db.projects[idx]);
  });

  app.delete("/api/projects/:id", requireAuth, (req, res) => {
    const db = readDB();
    const filtered = db.projects.filter(p => p.id !== req.params.id);
    if (filtered.length === db.projects.length) {
      return res.status(404).json({ error: "Project not found" });
    }
    db.projects = filtered;
    writeDB(db);
    res.json({ success: true });
  });

  app.post("/api/projects/reorder", requireAuth, (req, res) => {
    const db = readDB();
    const { ids } = req.body; // Array of ids in order
    if (Array.isArray(ids)) {
      ids.forEach((id, idx) => {
        const proj = db.projects.find(p => p.id === id);
        if (proj) proj.order = idx + 1;
      });
      db.projects.sort((a, b) => a.order - b.order);
      writeDB(db);
      res.json({ success: true, list: db.projects });
    } else {
      res.status(400).json({ error: "Invalid order array" });
    }
  });

  // SKILLS ENDPOINTS
  app.post("/api/skills", requireAuth, (req, res) => {
    const db = readDB();
    const newSkill: Skill = {
      id: "skill-" + Date.now(),
      name: req.body.name || "New Skill",
      category: req.body.category || "Languages",
      icon: req.body.icon || "Code2",
      proficiency: Number(req.body.proficiency) || 80,
      order: Number(req.body.order) || db.skills.length + 1
    };
    db.skills.push(newSkill);
    writeDB(db);
    res.json(newSkill);
  });

  app.put("/api/skills/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.skills.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Skill not found" });
    db.skills[idx] = { ...db.skills[idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db.skills[idx]);
  });

  app.delete("/api/skills/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.skills = db.skills.filter(s => s.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // EXPERIENCE ENDPOINTS
  app.post("/api/experience", requireAuth, (req, res) => {
    const db = readDB();
    const newExp: Experience = {
      id: "exp-" + Date.now(),
      company: req.body.company || "Example Corp",
      logo: req.body.logo || "Briefcase",
      role: req.body.role || "Developer",
      startDate: req.body.startDate || "2026-01",
      endDate: req.body.endDate || "Present",
      description: Array.isArray(req.body.description) ? req.body.description : [],
      technologies: Array.isArray(req.body.technologies) ? req.body.technologies : [],
      location: req.body.location || "Remote",
      current: !!req.body.current
    };
    db.experience.push(newExp);
    writeDB(db);
    res.json(newExp);
  });

  app.put("/api/experience/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.experience.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Experience not found" });
    db.experience[idx] = { ...db.experience[idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db.experience[idx]);
  });

  app.delete("/api/experience/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.experience = db.experience.filter(e => e.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // EDUCATION ENDPOINTS
  app.post("/api/education", requireAuth, (req, res) => {
    const db = readDB();
    const newEdu: Education = {
      id: "edu-" + Date.now(),
      institution: req.body.institution || "",
      degree: req.body.degree || "",
      field: req.body.field || "",
      startYear: req.body.startYear || "",
      endYear: req.body.endYear || "",
      grade: req.body.grade || "",
      courses: Array.isArray(req.body.courses) ? req.body.courses : []
    };
    db.education.push(newEdu);
    writeDB(db);
    res.json(newEdu);
  });

  app.put("/api/education/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.education.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Education not found" });
    db.education[idx] = { ...db.education[idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db.education[idx]);
  });

  app.delete("/api/education/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.education = db.education.filter(e => e.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // CERTIFICATIONS ENDPOINTS
  app.post("/api/certifications", requireAuth, (req, res) => {
    const db = readDB();
    const newCert: Certification = {
      id: "cert-" + Date.now(),
      title: req.body.title || "",
      issuer: req.body.issuer || "",
      date: req.body.date || "",
      credentialUrl: req.body.credentialUrl || "",
      image: req.body.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300&h=200"
    };
    db.certifications.push(newCert);
    writeDB(db);
    res.json(newCert);
  });

  app.put("/api/certifications/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.certifications.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Certification not found" });
    db.certifications[idx] = { ...db.certifications[idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db.certifications[idx]);
  });

  app.delete("/api/certifications/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.certifications = db.certifications.filter(c => c.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // TESTIMONIALS ENDPOINTS
  app.post("/api/testimonials", requireAuth, (req, res) => {
    const db = readDB();
    const newTest: Testimonial = {
      id: "test-" + Date.now(),
      name: req.body.name || "",
      role: req.body.role || "",
      company: req.body.company || "",
      photo: req.body.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
      message: req.body.message || "",
      linkedIn: req.body.linkedIn || ""
    };
    db.testimonials.push(newTest);
    writeDB(db);
    res.json(newTest);
  });

  app.put("/api/testimonials/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.testimonials.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Testimonial not found" });
    db.testimonials[idx] = { ...db.testimonials[idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db.testimonials[idx]);
  });

  app.delete("/api/testimonials/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.testimonials = db.testimonials.filter(t => t.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // BLOG ENDPOINTS
  app.post("/api/blogs", requireAuth, (req, res) => {
    const db = readDB();
    const newBlog: BlogPost = {
      id: "blog-" + Date.now(),
      title: req.body.title || "Untitled Article",
      slug: (req.body.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: req.body.excerpt || "",
      content: req.body.content || "",
      coverImage: req.body.coverImage || "https://images.unsplash.com/photo-1541462608141-2ff030de4a2a?auto=format&fit=crop&q=80&w=1200&h=600",
      tags: Array.isArray(req.body.tags) ? req.body.tags : ["General"],
      published: req.body.published !== false,
      seoTitle: req.body.seoTitle || req.body.title,
      seoDescription: req.body.seoDescription || req.body.excerpt,
      createdAt: new Date().toISOString()
    };
    db.blogs.push(newBlog);
    writeDB(db);
    res.json(newBlog);
  });

  app.put("/api/blogs/:id", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.blogs.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Blog post not found" });
    db.blogs[idx] = { ...db.blogs[idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db.blogs[idx]);
  });

  app.delete("/api/blogs/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.blogs = db.blogs.filter(b => b.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // CONTACT MESSAGES ENDPOINTS
  app.post("/api/messages", (req, res) => {
    const db = readDB();
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required contact form fields." });
    }

    const newMsg: Message = {
      id: "msg-" + Date.now(),
      name,
      email,
      subject: subject || "No Subject",
      message,
      read: false,
      createdAt: new Date().toISOString()
    };

    db.messages.push(newMsg);
    db.stats.contactSubmissions += 1;
    writeDB(db);
    res.json({ success: true, message: "Thank you for your response! Alex will analyze it swiftly." });
  });

  app.get("/api/messages", requireAuth, (req, res) => {
    const db = readDB();
    res.json(db.messages);
  });

  app.put("/api/messages/:id/read", requireAuth, (req, res) => {
    const db = readDB();
    const idx = db.messages.findIndex(m => m.id === req.params.id);
    if (idx !== -1) {
      db.messages[idx].read = true;
      writeDB(db);
      res.json(db.messages[idx]);
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  });

  app.delete("/api/messages/:id", requireAuth, (req, res) => {
    const db = readDB();
    db.messages = db.messages.filter(m => m.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

  // FILE UPLOAD ENDPOINT
  // We handle direct asset storage or binary save, allowing users to save files
  // directly inside the /public/uploads directory and reference them online.
  app.post("/api/upload", requireAuth, (req, res) => {
    const { fileName, fileContent, mimeType } = req.body;
    if (!fileName || !fileContent) {
      return res.status(400).json({ error: "Invalid binary upload parameters" });
    }

    try {
      const isBase64 = fileContent.includes(";base64,");
      const base64Data = isBase64 ? fileContent.split(";base64,").pop() : fileContent;
      const buffer = Buffer.from(base64Data, "base64");

      const parsedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const savedPath = path.join(UPLOADS_DIR, parsedName);
      fs.writeFileSync(savedPath, buffer);

      const webUrl = `/uploads/${parsedName}`;
      res.json({ url: webUrl, success: true });
    } catch (err: any) {
      console.error("Upload handler failed:", err);
      res.status(500).json({ error: "File upload failed to compile to backend." });
    }
  });

  // EXPORT DEV BACKUP JSON
  app.get("/api/export", requireAuth, (req, res) => {
    const db = readDB();
    res.setHeader("Content-disposition", "attachment; filename=portfolio-cms-backup.json");
    res.setHeader("Content-type", "application/json");
    res.write(JSON.stringify(db, null, 2), "utf-8");
    res.end();
  });

  // REST RESET BACKEND DATA
  app.post("/api/reset", requireAuth, (req, res) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
    res.json({ success: true, base: initialData });
  });

  // VITE OR STATIC INTERFACE MIDDLEWARES
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Fallback static uploads inside production
    app.use("/uploads", express.static(UPLOADS_DIR));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio CMS dynamic server listening at http://localhost:${PORT}`);
  });
}

startServer();
