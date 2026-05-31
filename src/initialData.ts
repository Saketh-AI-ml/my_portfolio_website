import { DBState } from "./types.js";

export const initialData: DBState = {
  profile: {
    name: "Alex Rivera",
    email: "alex.rivera@dev.io",
    tagline: "Staff Full-Stack Architect & Open Source Contributor",
    typingRoles: [
      "Full-Stack Architect",
      "Typescript Enthusiast",
      "Open to High-Impact Roles",
      "Technical Writer"
    ],
    bio: "I build high-performance distributed systems and responsive, polished interfaces. Over the past 6+ years, I have architected web platforms, led cross-functional engineering teams, and contributed heavily to developers-focused tooling. Passionate about performance, clean API designs, and developer experience. Looking to take on complex, challenging engineering problems.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300&h=300",
    resumeUrl: "/assets/Alex_Rivera_Resume.pdf",
    location: "San Francisco, CA (Open to Remote)",
    availableForWork: true,
    experienceYears: 6,
    projectsCount: 14,
    clientsServed: 28,
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      leetcode: "https://leetcode.com"
    }
  },
  projects: [
    {
      id: "proj-1",
      title: "Nova Canvas - Collaborative Workspace",
      slug: "nova-canvas",
      description: "A real-time vector canvas with collaborative whiteboard rooms and infinite canvas rendering.",
      fullDescription: "Nova Canvas reimagines virtual collaboration. Engineered entirely with a lightweight custom WebGL and HTML5 Canvas renderer, it offers smooth panning and zooming on millions of elements. Rooms are synchronized in under 15ms using an authoritative WebSocket engine with conflict-free replicated data types (CRDTs). Integrated drawing states, custom shapes, code editor blocks, and persistent workspaces.",
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&h=500",
        "https://images.unsplash.com/photo-1541462608141-2ff030de4a2a?auto=format&fit=crop&q=80&w=800&h=500"
      ],
      techStack: ["React", "TypeScript", "Node.js", "WebSockets", "Canvas API", "Tailwind CSS"],
      category: "Web & Collaborative",
      liveUrl: "https://example.com/nova-canvas",
      githubUrl: "https://github.com",
      featured: true,
      published: true,
      order: 1,
      createdAt: "2026-01-15T08:00:00Z"
    },
    {
      id: "proj-2",
      title: "OmniTranslate AI",
      slug: "omni-translate-ai",
      description: "AI-powered real-time dialect compiler and multi-file code generator supporting 14 language paradigms.",
      fullDescription: "An advanced code transformation framework. Leverages high-context Gemini models to seamlessly refactor entire legacy codebases from Cobol/Java into modern TypeScript or Rust. Features structured JSON output mapping, type definition preservation, automatic unit-test generation, and performance optimizations. Integrated as a developer CLI and sleek visual playground.",
      images: [
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800&h=500",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=500"
      ],
      techStack: ["Next.js", "Vite", "Gemini API", "Tailwind CSS", "Express", "Docker"],
      category: "AI & Machine Learning",
      liveUrl: "https://example.com/omni-translate",
      githubUrl: "https://github.com",
      featured: true,
      published: true,
      order: 2,
      createdAt: "2026-03-10T08:00:00Z"
    },
    {
      id: "proj-3",
      title: "HyperNode - Cloud Orchestration",
      slug: "hypernode-cloud",
      description: "A supercharged container orchestration and log stream dashboard for hybrid-cloud deployments.",
      fullDescription: "Designed for intensive operations and real-time observability. HyperNode hooks into Kubernetes clusters to provide a unified telemetry interface. Features streaming logs via server-sent events, immediate CPU/Memory hotmaps, container restart trigger routines, and custom alert configuration protocols. Includes a lightning-fast visual dependency generator.",
      images: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=500"
      ],
      techStack: ["React", "D3.js", "Recharts", "Kubernetes", "gRPC", "Go", "Docker"],
      category: "Cloud Native & DevOps",
      liveUrl: "https://example.com/hypernode",
      githubUrl: "https://github.com",
      featured: false,
      published: true,
      order: 3,
      createdAt: "2026-04-05T08:00:00Z"
    }
  ],
  skills: [
    { id: "s1", name: "TypeScript", category: "Languages", icon: "Code2", proficiency: 98, order: 1 },
    { id: "s2", name: "JavaScript", category: "Languages", icon: "Code2", proficiency: 95, order: 2 },
    { id: "s3", name: "Go (Golang)", category: "Languages", icon: "Terminal", proficiency: 82, order: 3 },
    { id: "s4", name: "Python", category: "Languages", icon: "Terminal", proficiency: 85, order: 4 },
    
    { id: "s5", name: "React / Vite", category: "Frameworks", icon: "Atom", proficiency: 96, order: 1 },
    { id: "s6", name: "Express / Node.js", category: "Frameworks", icon: "Cpu", proficiency: 92, order: 2 },
    { id: "s7", name: "Next.js", category: "Frameworks", icon: "Globe", proficiency: 90, order: 3 },
    { id: "s8", name: "Tailwind CSS", category: "Frameworks", icon: "Palette", proficiency: 98, order: 4 },

    { id: "s9", name: "PostgreSQL", category: "Databases", icon: "Database", proficiency: 88, order: 1 },
    { id: "s10", name: "MongoDB", category: "Databases", icon: "Database", proficiency: 84, order: 2 },
    { id: "s11", name: "Redis", category: "Databases", icon: "Zap", proficiency: 86, order: 3 },

    { id: "s12", name: "Docker", category: "Cloud", icon: "Layers", proficiency: 88, order: 1 },
    { id: "s13", name: "Google Cloud (GCP)", category: "Cloud", icon: "CloudSun", proficiency: 84, order: 2 },
    { id: "s14", name: "AWS", category: "Cloud", icon: "Cloud", proficiency: 80, order: 3 },

    { id: "s15", name: "Git & GitHub", category: "Tools", icon: "GitBranch", proficiency: 94, order: 1 },
    { id: "s16", name: "Kubernetes", category: "Tools", icon: "Compass", proficiency: 75, order: 2 },
    { id: "s17", name: "CI/CD Workflows", category: "Tools", icon: "RefreshCw", proficiency: 85, order: 3 },

    { id: "s18", name: "System Architecture", category: "Soft Skills", icon: "Bookmark", proficiency: 92, order: 1 },
    { id: "s19", name: "Team Mentorship", category: "Soft Skills", icon: "Users", proficiency: 90, order: 2 },
    { id: "s20", name: "Technical Writing", category: "Soft Skills", icon: "PenTool", proficiency: 88, order: 3 }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Vortex Labs",
      logo: "Zap",
      role: "Lead Full-Stack Architect",
      startDate: "2024-03",
      endDate: "Present",
      description: [
        "Architected core high-throughput web portals serving 250k+ active daily users.",
        "Halved page latency by implementing intelligent data pre-fetching, bundle optimization, and CDN edge caching.",
        "Mentored a collaborative team of 8 engineers and introduced strict TypeScript styling guidelines and automatic linting pipelines."
      ],
      technologies: ["React", "Vite", "Node.js", "Docker", "PostgreSQL", "Redis", "GCP"],
      location: "San Francisco, CA (Remote)",
      current: true
    },
    {
      id: "exp-2",
      company: "Synthetix Corp",
      logo: "Cpu",
      role: "Senior Software Engineer",
      startDate: "2022-01",
      endDate: "2024-03",
      description: [
        "Led integration of modern generative AI models into internal operations, saving developers 10+ hours weekly.",
        "Built dynamic data visualizations using D3.js and Recharts, improving decision-maker analytics speeds by 35%.",
        "Pioneered transition from single-instance services to highly-scalable Dockerized microservices."
      ],
      technologies: ["React", "Express", "D3.js", "Python", "Docker", "AWS", "GitHub Actions"],
      location: "Seattle, WA (On-Site)",
      current: false
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      startYear: "2020",
      endYear: "2022",
      grade: "GPA: 3.92/4.0",
      courses: ["Advanced Distributed Systems", "Human-Computer Interaction", "Machine Learning"]
    },
    {
      id: "edu-2",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Electrical Engineering & Computer Science",
      startYear: "2016",
      endYear: "2020",
      grade: "GPA: 3.84/4.0",
      courses: ["Data Structures & Algorithms", "Operating Systems", "Database Management Systems"]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      title: "Google Cloud Certified Professional Cloud Architect",
      issuer: "Google Cloud",
      date: "2025-04",
      credentialUrl: "https://cloud.google.com/certification",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300&h=200"
    },
    {
      id: "cert-2",
      title: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services (AWS)",
      date: "2024-11",
      credentialUrl: "https://aws.amazon.com/certification",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300&h=200"
    }
  ],
  testimonials: [
    {
      id: "test-1",
      name: "Marcus Vance",
      role: "VP of Product",
      company: "Vortex Labs",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
      message: "Alex possesses a rare alignment of engineering excellence and product vision. He engineered our real-time collaboration canvas with such performance that competitors could not match our speeds. An invaluable engineering leader.",
      linkedIn: "https://linkedin.com"
    },
    {
      id: "test-2",
      name: "Sarah Jenkins",
      role: "Principal Engineer",
      company: "Synthetix Corp",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
      message: "Working with Alex was a highlight of my time at Synthetix. He writes clean, beautifully modular code, documents decisions with crisp clarity, and raises the bar for everyone around him. I highly recommend him for any architect level role.",
      linkedIn: "https://linkedin.com"
    }
  ],
  blogs: [
    {
      id: "blog-1",
      title: "Mastering Infinite Canvas Renderers in React",
      slug: "mastering-infinite-canvas-renderers",
      excerpt: "An in-depth look at implementing rendering layers, viewport camera transforms, panning math, and scaling on HTML canvas within React.",
      content: `Rendering complex layouts or diagrams requires an interactive infinite workspace. But handling zooming, panning, and rendering millions of points in a typical React component structure frequently leads to lagging performance.

## The Viewport Camera Solution

The cleanest approach separates the **Camera Transform** state from the rendering loop. By using a standard transform matrix $(a, b, c, d, e, f)$ representing translation and scale, you can repaint the layout during rendering:

\`\`\`typescript
interface Camera {
  x: number;
  y: number;
  zoom: number;
}
\`\`

## Coordinate Conversion

To implement hover triggers or drawing elements, convert mouse coordinates from **Screen Space** to **World Space**:

\`\`\`typescript
const screenToWorld = (screenX: number, screenY: number, camera: Camera) => {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  };
};
\`\`\`

By utilizing this math and moving rendering side-effects into requestAnimationFrame loops, you can render complex vectors easily!`,
      coverImage: "https://images.unsplash.com/photo-1541462608141-2ff030de4a2a?auto=format&fit=crop&q=80&w=800&h=400",
      tags: ["React", "HTML5 Canvas", "Performance", "Web Graphics"],
      published: true,
      seoTitle: "React HTML5 Infinite Canvas Tutorial",
      seoDescription: "Learn how to build a high performance zooming and panning infinite canvas in React and TypeScript.",
      createdAt: "2026-05-12T10:00:00Z"
    },
    {
      id: "blog-2",
      title: "Leveraging Structured Formats in LLM Integration",
      slug: "structured-formats-llm-integration",
      excerpt: "How to avoid fragile parsing logic with new schema-validation models, using standard TypeScript schemas and type validations.",
      content: `Integrating artificial intelligence tools inside dynamic apps should not rely on fuzzy string splitting or complex regex checks to clean up JSON blocks.

Using modern AI libraries, like the Google GenAI TypeScript SDK, lets you enforce a perfect output schema directly inside your query!

## Configuring a Response Schema

By declaring the expected JSON structure using a standard schema object, the API returns guaranteed objects:

\`\`\`typescript
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-3.5-flash',
  contents: 'Generate a list of three programming goals',
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          daysCount: { type: Type.INTEGER }
        },
        required: ["title"]
      }
    }
  }
});
\`\`\`

This guarantees your Express server always retrieves exact fields, bypassing parser crashes entirely!`,
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800&h=400",
      tags: ["AI Integration", "TypeScript", "Vite", "Backend Development"],
      published: true,
      seoTitle: "Structured JSON Output in LLMs",
      seoDescription: "A guide on using the responseSchema of `@google/genai` to guarantee strict JSON formats in Express.",
      createdAt: "2026-05-28T14:30:00Z"
    }
  ],
  messages: [
    {
      id: "msg-1",
      name: "Jordan Blake",
      email: "jordan.b@innovatesoft.com",
      subject: "Collab Opportunity - Vortec Platform",
      message: "Hi Alex, I was impressed by your Nova Canvas project. We are looking for a staff architect who understands web graphics and high performance canvas syncing. I would love to hop on a quick call next Tuesday to discuss an opportunity.",
      read: false,
      createdAt: "2026-05-29T09:12:00Z"
    }
  ],
  settings: {
    siteTitle: "Alex Rivera | Staff Software Architect Portfolio",
    metaDescription: "Explore the modern full-stack web platforms, developer packages, and system designs authored by Alex Rivera.",
    ogImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200&h=630",
    accentColor: "#6366f1", // Elegant Indigo
    visibleSections: {
      hero: true,
      about: true,
      skills: true,
      projects: true,
      experience: true,
      education: true,
      certifications: true,
      testimonials: true,
      github: true,
      blog: true,
      contact: true
    },
    analyticsId: "UA-88394-01",
    maintenanceMode: false,
    githubUsername: "octocat"
  },
  stats: {
    pageViews: 1240,
    profileVisits: 648,
    resumeDownloads: 194,
    contactSubmissions: 12,
    deviceBreakdown: {
      mobile: 342,
      tablet: 98,
      desktop: 800
    },
    countryBreakdown: {
      "United States": 520,
      "Canada": 140,
      "United Kingdom": 115,
      "India": 230,
      "Germany": 85,
      "Australia": 42,
      "Others": 108
    }
  }
};
