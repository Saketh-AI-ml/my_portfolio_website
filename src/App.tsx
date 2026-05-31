import React, { useState, useEffect } from "react";
import { DBState, Project, BlogPost } from "./types.js";
import { LucideIcon } from "./components/LucideIcon.js";
import { ProjectDetailModal } from "./components/ProjectDetailModal.js";
import { BlogReaderModal } from "./components/BlogReaderModal.js";
import { AdminPanel } from "./components/AdminPanel.js";

// Static Multi-lingual string dictionaries for requested Bonus localization (English + Hindi)
const i18n = {
  en: {
    hello: "Hi, I'm",
    downloadResume: "Download Resume",
    hireMe: "Hire Me",
    yearsExp: "Years Experience",
    projectsBuilt: "Projects Authored",
    satisfiedClients: "Clients Served",
    aboutTitle: "About Me Profile",
    availabilityBadge: "Open to High-Impact Roles",
    closedBadge: "Currently Occupied",
    skillsTitle: "Skills & Radiations",
    projectsTitle: "Featured Deployments",
    experienceTitle: "Work Timeline",
    educationTitle: "Academic Foundations",
    testimonialsTitle: "Professional Testimony",
    githubTitle: "Open Source Contributions",
    blogTitle: "Engineering Logs & Snippets",
    contactTitle: "Initiate Communication",
    inputName: "Your Distinguished Name",
    inputEmail: "Email Workspace",
    inputSubject: "Conversation Subject",
    inputMessage: "Message context / proposal specifics",
    send: "Transmit Message",
    footerText: "Crafted with dynamic persistence to provide bespoke recruiter experiences.",
    nowLearning: "Currently digesting",
    quickQr: "Get Portfolio QR",
    spotifyTrack: "Now listening to"
  },
  hi: {
    hello: "पेशावर तकनीकी नमस्कार, मैं हूँ",
    downloadResume: "बायोडाटा डाउनलोड करें",
    hireMe: "मुझसे संपर्क करें",
    yearsExp: "वर्षों का अनुभव",
    projectsBuilt: "सफलतापूर्वक प्रोजेक्ट्स",
    satisfiedClients: "क्लाइंट्स का विकास",
    aboutTitle: "मेरा परिचय",
    availabilityBadge: "नवीनतम काम के लिए उपलब्ध",
    closedBadge: "वर्तमान में व्यस्त",
    skillsTitle: "कौशल और तकनीकी क्षमता",
    projectsTitle: "विशेष रुप से प्रदर्शित प्रोजेक्ट्स",
    experienceTitle: "कार्य अनुभव समयरेखा",
    educationTitle: "शैक्षणिक शैक्षणिक नीव",
    testimonialsTitle: "सहयोगियों की अनुशंसा",
    githubTitle: "गिटहब योगदान ग्राफ",
    blogTitle: "तकनीकी अंतर्दृष्टि एवं ब्लॉग",
    contactTitle: "मुझसे संपर्क स्थापित करें",
    inputName: "आपका आदरणीय नाम",
    inputEmail: "ईमेल पता",
    inputSubject: "बातचीत का विषय",
    inputMessage: "प्रस्ताव का संदर्भ एवं विवरण",
    send: "संदेश प्रेषित करें",
    footerText: "भर्तीकर्ताओं के लिए व्यक्तिगत अनुभव प्रदान करने के लिए डायनेमिक सीएमएस द्वारा संचालित।",
    nowLearning: "वर्तमान में सीख रहे हैं",
    quickQr: "पोर्टफोलियो क्यूआर पाएं",
    spotifyTrack: "प्रचलित संगीतमय धुन"
  }
};

export default function App() {
  const [db, setDb] = useState<DBState | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Custom Toasts notifier state
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);
  
  // Modals & Navigation state
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Filter and input states
  const [projectTag, setProjectTag] = useState<string>("All");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sendingForm, setSendingForm] = useState(false);

  // Smooth typing-roles cursor effect variables
  const [roleText, setRoleText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Trigger brief alert feedback
  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  // Load backend database state on startup (visit = true increments stats)
  const loadPortfolioData = async (isInitial = false) => {
    try {
      const visitParam = isInitial ? "visit=true" : "visit=false";
      const response = await fetch(`/api/portfolio/get?${visitParam}`);
      if (!response.ok) throw new Error("Connection to database failed");
      const data = await response.json();
      setDb(data);
    } catch (err: any) {
      console.error(err);
      showToast("Could not load latest values. Falling back to default states.", true);
    }
  };

  useEffect(() => {
    loadPortfolioData(true);
    // Auto restore session token if active
    const savedToken = sessionStorage.getItem("rivera_cms_token");
    if (savedToken) {
      setIsAuthenticated(true);
    }
  }, []);

  // Sync typing animation loops based on tagline roles array
  useEffect(() => {
    if (!db) return;
    const roles = db.profile.typingRoles || [
      "Full-Stack Architect",
      "TypeScript Specialist",
      "Distributed Systems Engineer"
    ];

    const currentString = roles[roleIndex % roles.length];
    let typingSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && charIndex === currentString.length) {
      typingSpeed = 2000; // Hold full sentence before dissolving
      setIsDeleting(true);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setRoleIndex((prev) => prev + 1);
      typingSpeed = 500;
    }

    const timer = setTimeout(() => {
      setRoleText(
        isDeleting 
          ? currentString.substring(0, charIndex - 1)
          : currentString.substring(0, charIndex + 1)
      );
      setCharIndex((prev) => (isDeleting ? prev - 1 : prev + 1));
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, roleIndex, db]);

  if (!db) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-indigo-400 text-sm">
        <LucideIcon name="RefreshCw" className="animate-spin mb-4" size={32} />
        <span className="font-mono tracking-widest text-slate-400">Loading Candidate Portfolio & Database layers...</span>
      </div>
    );
  }

  const { profile, projects, skills, experience, education, certifications, testimonials, blogs, settings } = db;
  const t = lang === "en" ? i18n.en : i18n.hi;

  // Track and record resume download triggered count
  const handleResumeDownload = () => {
    fetch("/api/stats/increment-download", { method: "POST" })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          showToast("Resume layout downloaded! Stats tracker successfully updated.");
          loadPortfolioData();
        }
      })
      .catch(() => {
        // Fallback file download if API is down
        showToast("Initiating standard backup download...");
      });
    
    // Direct safe anchor window open to unblock browser popup
    window.open(profile.resumeUrl, "_blank");
  };

  // Authenticate Admin Credentials on /api/auth/login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login credentials rejected");

      sessionStorage.setItem("rivera_cms_token", data.token);
      setIsAuthenticated(true);
      setShowAdminPanel(true);
      setShowLoginModal(false);
      setLoginPassword("");
      showToast("Access Granted! Welcome to CMS control dashboard.");
    } catch (err: any) {
      showToast(err.message || "Invaild email or password", true);
    }
  };

  // Submit direct message form
  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingForm(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Message delivery failed");

      showToast(data.message || "Your proposal has been logged securely in Alex's inbox!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      loadPortfolioData();
    } catch (err: any) {
      showToast(err.message || "Something went wrong", true);
    } finally {
      setSendingForm(false);
    }
  };

  // Group projects by category
  const activeProjects = projects.filter(p => p.published);
  const categories = ["All", ...Array.from(new Set(activeProjects.map(p => p.category)))];

  // Map settings custom accent variable
  const themeAccent = settings.accentColor || "#6366f1";

  // If maintenance mode is active, prevent visitors unless signed in as administrator
  if (settings.maintenanceMode && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center text-slate-200">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-md">
          <LucideIcon name="Construction" className="mx-auto text-amber-500 animate-bounce mb-4" size={48} />
          <h2 className="text-2xl font-extrabold text-white mb-2">Systems Optimization Active</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Alex is currently executing hot-rebuild routines and updating the CMS database structure. We will be back online instantly.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs font-mono text-slate-500 mb-6">
            MAINTENANCE STATE: LOCKED
          </div>
          
          <button 
            onClick={() => setShowLoginModal(true)}
            className="w-full py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
          >
            Owner Access Hub
          </button>
        </div>

        {/* Administration popup trigger */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-slate-800 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4">CMS Security Login</h3>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Email</label>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Passphrase</label>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" 
                    required 
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowLoginModal(false)} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs">Dismiss</button>
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 font-bold text-xs text-white">Unlock Admin</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-[#070a13] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Absolute particle / star background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] top-12 left-10 animate-pulse" />
        <div className="absolute w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] bottom-12 right-12" />
      </div>

      {/* Dynamic Popups notifications */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4.5 rounded-2xl shadow-2xl border-2 flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
          toast.isError ? 'bg-red-950/90 border-red-800 text-red-200' : 'bg-slate-900/90 border-indigo-500/50 text-indigo-200'
        }`}>
          <LucideIcon name={toast.isError ? "AlertOctagon" : "Award"} size={16} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* CORE FRAMEWORK HEADER BANNER */}
      <header className="sticky top-0 z-30 w-full bg-opacity-70 backdrop-blur-xl border-b border-slate-800/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span style={{ backgroundColor: `${themeAccent}15`, borderColor: `${themeAccent}40` }} className="p-2 border rounded-xl flex items-center justify-center">
              <LucideIcon name="ShieldAlert" style={{ color: themeAccent }} size={16} />
            </span>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">{profile.name}</span>
              <p className="text-[10px] font-mono text-slate-400 leading-none">Recruiter Portfolio & CMS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs font-medium">
            {settings.visibleSections.about && <a href="#about" className="hover:text-indigo-400 transition-colors text-slate-400">About</a>}
            {settings.visibleSections.skills && <a href="#skills" className="hover:text-indigo-400 transition-colors text-slate-400">Skills</a>}
            {settings.visibleSections.projects && <a href="#projects" className="hover:text-indigo-400 transition-colors text-slate-400">Projects</a>}
            {settings.visibleSections.experience && <a href="#timeline" className="hover:text-indigo-400 transition-colors text-slate-400">History</a>}
            {settings.visibleSections.blog && <a href="#blogs" className="hover:text-indigo-400 transition-colors text-slate-400">Blogs</a>}
            {settings.visibleSections.contact && <a href="#contact" className="hover:text-indigo-400 transition-colors text-slate-400">Contact</a>}
          </nav>

          <div className="flex items-center gap-3">
            {/* Language toggle flag (Hindi / English i18n support) */}
            <button 
              onClick={() => {
                setLang(prev => prev === "en" ? "hi" : "en");
                showToast(`Language switched to ${lang === 'en' ? 'Hindi' : 'English'}!`);
              }}
              style={{ borderColor: `${themeAccent}25` }}
              className="px-2.5 py-1.5 text-xs border rounded-xl hover:bg-slate-900/40 flex items-center gap-1 font-semibold text-slate-300"
              title="Switch Localization (Hindi - English)"
            >
              <LucideIcon name="Languages" size={13} />
              <span className="uppercase font-mono">{lang === "en" ? "HI" : "EN"}</span>
            </button>

            {/* Admin control panel button */}
            {isAuthenticated ? (
              <button 
                onClick={() => setShowAdminPanel(true)}
                style={{ borderColor: themeAccent, color: themeAccent }}
                className="px-3.5 py-1.5 text-xs font-bold border-2 rounded-xl bg-slate-900 hover:bg-slate-855 transition-all flex items-center gap-1"
              >
                <LucideIcon name="LayoutDashboard" size={13} />
                CONSOLE
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors"
              >
                ADMIN CORE
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO CONTAINER INTRO */}
      {settings.visibleSections.hero && (
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-28 md:pb-36 px-4 z-10">
          {/* Subtle background gradient glow specifically behind the hero section */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4 sm:gap-10 md:gap-16 items-center">
            
            {/* Visual glow avatar space at Left Side */}
            <div className="col-span-4 sm:col-span-5 flex justify-start order-first">
              <div className="relative w-full max-w-[110px] sm:max-w-[260px] md:max-w-[360px] lg:max-w-[420px] aspect-square rounded-full group">
                {/* Subtle premium static accent outline ring */}
                <div 
                  style={{ borderColor: `${themeAccent}30` }} 
                  className="absolute inset-0 rounded-full border border-solid transition-colors duration-550 group-hover:border-indigo-500/50" 
                />
                
                {/* Secondary static premium glow ring */}
                <div 
                  style={{ 
                    borderColor: `${themeAccent}20`,
                    boxShadow: `0 0 50px ${themeAccent}15` 
                  }} 
                  className="absolute inset-1 sm:inset-3 rounded-full border border-solid transition-all duration-550 group-hover:shadow-[0_0_60px_rgba(99,102,241,0.25)]" 
                />
                
                {/* Beautiful deep gradient outer border circle */}
                <div className="absolute inset-2 sm:inset-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-2xl transition-all duration-500 group-hover:scale-[1.015] group-hover:shadow-indigo-500/20">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 p-0.5 sm:p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900/60 relative">
                      <img 
                        src={profile.avatar} 
                        alt={profile.name} 
                        className="w-full h-full object-cover rounded-full transition-transform duration-700 ease-out group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                      />
                      {/* Premium elegant dark shadow overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-70" />
                    </div>
                  </div>
                </div>
                
                {/* Available for work live pulse badge */}
                {profile.availableForWork && (
                  <span className="absolute bottom-1 right-1 sm:bottom-8 sm:right-8 flex h-3 w-3 sm:h-5 sm:w-5 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 sm:h-5 sm:w-5 bg-emerald-500 border-2 border-[#070a13] shadow-lg"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Intro texts on Opposite (Right) Side */}
            <div className="col-span-8 sm:col-span-7 space-y-3 sm:space-y-6 text-left flex flex-col justify-center">
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[11px] font-mono font-bold bg-[#0f172a] border border-slate-800 text-indigo-300 shadow-sm">
                  <LucideIcon name="Sparkles" className="text-indigo-400 animate-pulse" size={11} />
                  {t.availabilityBadge}
                </span>
              </div>

              <h1 className="text-xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
                <span className="text-slate-400 text-xs sm:text-2xl font-normal block mb-0.5 sm:mb-1 font-sans">{t.hello}</span>
                <span 
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${themeAccent}, #818cf8, #f472b6, #c084fc, ${themeAccent})`,
                    backgroundSize: "200% auto"
                  }} 
                  className="animate-text-shine bg-clip-text text-transparent inline-block pb-0.5 sm:pb-1 font-black"
                >
                  {profile.name}
                </span>
              </h1>

              {/* Typing cycle animation */}
              <div className="h-6 sm:h-8 flex items-center justify-start">
                <p className="text-xs sm:text-xl font-semibold text-slate-300 font-mono flex items-center bg-slate-900/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-slate-800/40">
                  <span className="mr-1 sm:mr-1.5 text-indigo-400">{"> "}</span>
                  <span className="mr-1 text-slate-200">{roleText}</span>
                  <span style={{ backgroundColor: themeAccent }} className="w-1 sm:w-1.5 h-3.5 sm:h-5 animate-pulse inline-block" />
                </p>
              </div>

              <h2 className="text-sm sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Transforming ambitious concepts into <span className="text-indigo-400">clean, premium, architectures</span>.
              </h2>

              <p className="text-slate-400 max-w-xl text-[11px] sm:text-base leading-relaxed font-sans mr-auto line-clamp-2 sm:line-clamp-none">
                {profile.tagline}. Architecting high-throughput distributed systems and creating highly responsive, aesthetic digital experiences with absolute pixel precision.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-start pt-1 sm:pt-2">
                <button
                  onClick={handleResumeDownload}
                  style={{ backgroundColor: themeAccent }}
                  className="px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-white font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 hover:brightness-110 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg transition-all"
                >
                  <LucideIcon name="Download" size={13} />
                  {t.downloadResume}
                </button>
                
                <a
                  href="#contact"
                  className="px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-900/80 text-slate-355 border border-slate-800 text-[10px] sm:text-xs font-bold hover:bg-slate-800 hover:text-white hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2"
                >
                  <LucideIcon name="MailCheck" size={13} />
                  {t.hireMe}
                </a>

                {/* QR Code trigger */}
                <button 
                  onClick={() => setShowQrModal(true)}
                  className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white hover:-translate-y-0.5 transition-all"
                  title="Share Portfolio QR"
                >
                  <LucideIcon name="QrCode" size={13} />
                </button>
              </div>

              {/* Social Channels Row */}
              <div className="flex gap-3 sm:gap-4.5 pt-3 sm:pt-6 border-t border-slate-800/40 justify-start">
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all hover:-translate-y-1">
                    <LucideIcon name="Github" size={14} />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all hover:-translate-y-1">
                    <LucideIcon name="Linkedin" size={14} />
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all hover:-translate-y-1">
                    <LucideIcon name="Twitter" size={14} />
                  </a>
                )}
                {profile.socialLinks.leetcode && (
                  <a href={profile.socialLinks.leetcode} target="_blank" rel="noreferrer" className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all hover:-translate-y-1">
                    <LucideIcon name="Award" size={14} />
                  </a>
                )}
              </div>

            </div>

          </div>
        </section>
      )}

      {/* SECTION 2: ABOUT ME PROFESSIONAL PROFILE */}
      {settings.visibleSections.about && (
        <section id="about" className="py-20 bg-slate-950/20 px-4 relative z-10 border-t border-slate-900">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.aboutTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl glass-panel space-y-6 shadow-xl relative overflow-hidden group">
                <div style={{ backgroundColor: `${themeAccent}08` }} className="absolute -right-2 -top-2 w-32 h-32 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                <p className="text-slate-350 leading-relaxed text-sm md:text-base whitespace-pre-line relative z-10">
                  {profile.bio}
                </p>
                <div className="flex flex-wrap gap-3 items-center relative z-10">
                  <span className="text-xs font-mono font-bold text-slate-500">OPERATIONAL INTENT:</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-950/60 border border-slate-850/60 text-xs font-semibold text-indigo-400 leading-none">{profile.location}</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-950/60 border border-slate-850/60 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 leading-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Open to Work
                  </span>
                </div>
              </div>

              {/* Counters boxes */}
              <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                {[
                  { count: profile.experienceYears, label: t.yearsExp, icon: "History" },
                  { count: profile.projectsCount, label: t.projectsBuilt, icon: "Binary" },
                  { count: profile.clientsServed, label: t.satisfiedClients, icon: "Activity" }
                ].map((stat, idx) => (
                  <div key={idx} className="p-5.5 rounded-2xl glass-panel glass-panel-hover flex items-center gap-4">
                    <span style={{ backgroundColor: `${themeAccent}15`, color: themeAccent }} className="p-3.5 rounded-xl border border-indigo-500/10">
                      <LucideIcon name={stat.icon} size={20} />
                    </span>
                    <div>
                      <p className="text-3xl font-extrabold text-white font-mono leading-none">{stat.count}+</p>
                      <p className="text-xs font-semibold text-slate-400 mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Live progress box ("Currently Learning") */}
            <div className="p-5 rounded-2xl bg-emerald-950/10 border border-emerald-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400 animate-pulse">
                  <LucideIcon name="Rocket" size={16} />
                </span>
                <div>
                  <span className="text-emerald-400 text-xs font-bold font-mono tracking-widest block uppercase">{t.nowLearning}</span>
                  <span className="text-white font-bold text-sm">Kubernetes Cluster Mesh & WASM edge runtimes</span>
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full animate-pulse transition-all duration-[2000ms]" style={{ width: "82%" }} />
              </div>
            </div>

          </div>
        </section>
      )}

      {/* SECTION 3: SKILLS MATRIX CARDS */}
      {settings.visibleSections.skills && (
        <section id="skills" className="py-20 px-4 relative z-10 border-t border-slate-900">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.skillsTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["Languages", "Frameworks", "Databases", "Cloud", "Tools", "Soft Skills"].map((cat) => {
                const subSkills = skills.filter(s => s.category === cat);
                if (subSkills.length === 0) return null;
                return (
                  <div key={cat} className="p-6 rounded-3xl glass-panel glass-panel-hover space-y-4">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1.5 block">
                      {cat}
                    </span>
                    <div className="space-y-4">
                      {subSkills.map((sk) => (
                        <div key={sk.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <LucideIcon name={sk.icon || "Code2"} size={13} className="text-slate-400" />
                              {sk.name}
                            </span>
                            <span className="font-mono text-slate-400 font-bold">{sk.proficiency}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${sk.proficiency}%`, backgroundColor: themeAccent }} 
                              className="h-full rounded-full transition-all duration-[1500ms]" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: PROJECTS GRID & FILTERING */}
      {settings.visibleSections.projects && (
        <section id="projects" className="py-20 bg-slate-950/20 px-4 relative z-10 border-t border-slate-900">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.projectsTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            {/* Tags selection bar */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProjectTag(cat)}
                  style={{
                    backgroundColor: projectTag === cat ? `${themeAccent}15` : "",
                    borderColor: projectTag === cat ? themeAccent : ""
                  }}
                  className={`px-4.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    projectTag === cat ? 'bg-indigo-950/60 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat === "All" ? "Everything" : cat}
                </button>
              ))}
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter(p => p.published && (projectTag === "All" || p.category === projectTag))
                .sort((a, b) => a.order - b.order)
                .map((proj) => (
                  <div 
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className="group rounded-3xl glass-panel glass-panel-hover cursor-pointer overflow-hidden shadow-lg"
                  >
                    {/* Cover image wrap */}
                    <div className="w-full aspect-[16/10] bg-slate-950 overflow-hidden relative border-b border-slate-800">
                      <img src={proj.images?.[0] || ""} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[11px] font-bold text-white font-mono uppercase bg-indigo-650 px-2.5 py-1 rounded-lg">Explore technical details →</span>
                      </div>
                    </div>

                    <div className="p-5.5 space-y-3.5">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{proj.category}</span>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{proj.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{proj.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {proj.techStack.slice(0, 4).map(tech => (
                          <span key={tech} className="px-2.5 py-0.5 rounded-lg text-[10px] bg-slate-950/60 border border-slate-850/50 font-mono text-slate-450">{tech}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 5: EXPERIENCE TIMELINE */}
      {settings.visibleSections.experience && (
        <section id="timeline" className="py-20 px-4 relative z-10 border-t border-slate-900">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.experienceTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            {/* Chronological Vertical logs layout style */}
            <div className="relative border-l-2 border-slate-800 ml-4 md:ml-10 space-y-8 pl-6 md:pl-10">
              {experience.map((exp) => (
                <div key={exp.id} className="relative group">
                  {/* Point icon */}
                  <span style={{ backgroundColor: themeAccent }} className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full border-4 border-[#070a13] ring-2 ring-indigo-550/20" />
                  
                  <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-base font-bold text-white">{exp.role}</h4>
                        <span className="text-xs font-mono text-indigo-400">{exp.company} — {exp.location}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 whitespace-nowrap bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside pl-1 leading-relaxed">
                      {exp.description.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>

                    {/* Associated Technologies used list */}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-850">
                        {exp.technologies.map(tech => (
                          <span key={tech} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: ACADEMIC EDUCATION */}
      {settings.visibleSections.education && (
        <section id="education" className="py-20 bg-slate-950/20 px-4 relative z-10 border-t border-slate-900 animate-fade-in">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.educationTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {education.map((edu) => (
                <div key={edu.id} className="p-6 rounded-3xl glass-panel glass-panel-hover space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{edu.startYear} - {edu.endYear}</span>
                      <h3 className="text-base font-bold text-white mt-1">{edu.degree}</h3>
                      <p className="text-xs text-indigo-400 font-mono mt-0.5">{edu.institution}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-indigo-950 text-indigo-300 font-mono text-xs font-bold border border-indigo-900/60">{edu.field}</span>
                  </div>
                  <p className="text-xs text-emerald-450 font-bold text-sm font-mono">{edu.grade}</p>
                  
                  {edu.courses && edu.courses.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-3.5 border-t border-slate-850">
                      {edu.courses.slice(0, 4).map(c => <span key={c} className="text-[9px] px-2 py-0.5 rounded bg-slate-950 border border-slate-850 font-mono text-slate-400">{c}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: RECOMMENDATIONS TESTIMONIALS */}
      {settings.visibleSections.testimonials && testimonials && testimonials.length > 0 && (
        <section id="testimonials" className="py-20 px-4 relative z-10 border-t border-slate-900">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.testimonialsTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((test) => (
                <div key={test.id} className="p-6 rounded-3xl glass-panel glass-panel-hover space-y-4">
                  <p className="text-slate-300 text-xs md:text-sm italic leading-relaxed whitespace-pre-line font-mono">
                    "{test.message}"
                  </p>
                  
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-850">
                    <img src={test.photo} alt={test.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <div>
                      <h4 className="text-white text-xs font-bold">{test.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{test.role} @ <span className="text-indigo-400 font-bold">{test.company}</span></p>
                    </div>
                    {test.linkedIn && (
                      <a href={test.linkedIn} target="_blank" rel="noreferrer" className="ml-auto text-slate-500 hover:text-white">
                        <LucideIcon name="Linkedin" size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: OPEN SOURCE GITHUB STATS */}
      {settings.visibleSections.github && (
        <section id="github" className="py-20 bg-slate-950/20 px-4 relative z-10 border-t border-slate-900">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.githubTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            {/* Dynamic visual representation of stats */}
            <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-slate-950 text-white animate-pulse">
                    <LucideIcon name="Github" size={20} />
                  </span>
                  <div>
                    <h3 className="text-white font-bold text-sm">@{settings.githubUsername || "octocat"} on GitHub</h3>
                    <p className="text-slate-400 text-xs">Simulated active stream sync from user metadata</p>
                  </div>
                </div>
                
                {/* Micro indicators */}
                <span className="text-[11px] font-mono text-emerald-450 bg-emerald-950/50 border border-emerald-900 px-3 py-1 rounded bg-emerald-400/5 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  STREAK: 14 DAYS
                </span>
              </div>

              {/* Grid counts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { val: "2,410", label: "Year Commitments", color: "text-indigo-400" },
                  { val: "48", label: "Public Repositories", color: "text-blue-400" },
                  { val: "193", label: "Associated Stars", color: "text-amber-400" },
                  { val: "14", label: "Active Pull Requests", color: "text-emerald-400" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-center">
                    <p className={`text-xl md:text-2xl font-extrabold font-mono ${stat.color}`}>{stat.val}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Contribution simulated blocks */}
              <div>
                <p className="text-[11px] font-mono text-slate-400 mb-2 font-bold uppercase tracking-widest">Dynamic Action Graph (Real-time tracking):</p>
                <div className="grid grid-cols-12 md:grid-cols-24 gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {Array.from({ length: 96 }).map((_, idx) => {
                    // Random shading for dynamic contribution visuals
                    const shades = ["bg-slate-950 border-slate-900", "bg-emerald-950/60", "bg-emerald-900/80", "bg-emerald-500", "bg-emerald-400"];
                    const pick = shades[Math.floor(Math.sin(idx * 2) * 2.5 + 2.5)] || shades[0];
                    return (
                      <div 
                        key={idx} 
                        className={`aspect-square w-full min-w-[12px] rounded-xs border ${pick}`} 
                        title={`Commit metrics on slot index ${idx}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 9: TECHNICAL BLOG DRAFTS */}
      {settings.visibleSections.blog && blogs && blogs.length > 0 && (
        <section id="blogs" className="py-20 px-4 relative z-10 border-t border-slate-900 animate-fade-in">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.blogTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <div 
                  key={blog.id}
                  onClick={() => setActiveBlog(blog)}
                  className="p-5 md:p-6 rounded-3xl glass-panel glass-panel-hover cursor-pointer overflow-hidden space-y-3.5 group"
                >
                  <div className="w-full h-40 overflow-hidden bg-slate-950 rounded-2xl relative border border-slate-850/60">
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  </div>

                  <p className="text-xs font-mono text-indigo-400 font-bold flex items-center gap-1.5">
                    <LucideIcon name="Calendar" size={12} />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors pr-6">{blog.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{blog.excerpt}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono font-bold bg-slate-950/60 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-850/50">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 10: CONTACT FORM WITH EMBEDDED MAP */}
      {settings.visibleSections.contact && (
        <section id="contact" className="py-20 px-4 bg-slate-950/20 relative z-10 border-t border-slate-900">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white">{t.contactTitle}</h2>
              <div style={{ backgroundColor: themeAccent }} className="w-12 h-1.5 rounded-full mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form panel */}
              <div className="lg:col-span-7 bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800 backdrop-blur">
                <form onSubmit={handleSendContact} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">{t.inputName}</label>
                      <input 
                        type="text" 
                        value={contactForm.name}
                        onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">{t.inputEmail}</label>
                      <input 
                        type="email" 
                        value={contactForm.email}
                        onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">{t.inputSubject}</label>
                    <input 
                      type="text" 
                      value={contactForm.subject}
                      onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">{t.inputMessage}</label>
                    <textarea 
                      rows={5}
                      value={contactForm.message}
                      onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingForm}
                    style={{ backgroundColor: themeAccent }}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all font-semibold uppercase tracking-wider"
                  >
                    {sendingForm ? (
                      <>
                        <LucideIcon name="RefreshCw" className="animate-spin" size={13} />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <LucideIcon name="Send" size={13} />
                        {t.send}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Map panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-5.5 space-y-4">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wide">Operational Ground Center</h4>
                  <p className="text-slate-400 text-xs">Currently coordinates technical deliveries out of:</p>
                  
                  {/* Human clean metadata */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center gap-3 text-xs">
                    <span className="p-2.5 rounded bg-slate-900 text-indigo-400 font-mono">MAPS:</span>
                    <div>
                      <span className="text-slate-200 font-bold block">{profile.location}</span>
                      <span className="text-slate-500 text-[10px]">United States of America</span>
                    </div>
                  </div>

                  {/* Open Street Map free high contrast embedded map */}
                  <div className="w-full aspect-[4/3] rounded-2xl border border-slate-805 overflow-hidden filter grayscale contrast-125 select-none relative">
                    <iframe 
                      title="Alex Area Location"
                      src="https://maps.google.com/maps?q=San%20Francisco,%20USA&t=&z=11&ie=UTF8&iwloc=&output=embed" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      loading="lazy" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* DYNAMIC PORTFOLIO FOOTER */}
      <footer className="border-t border-slate-900 bg-[#04060b] py-12 px-4 text-center text-slate-500 z-10 relative">
        <div className="max-w-4xl mx-auto space-y-4 text-xs font-mono">
          <p className="font-semibold text-slate-400">
            © {new Date().getFullYear()} — {profile.name} Portfolio CMS
          </p>
          <p className="leading-relaxed max-w-lg mx-auto text-[11px]">
            {t.footerText} Supported on standard TypeScript backends.
          </p>
        </div>
      </footer>

      {/* ACTIVE DETAIL MODALS */}
      {activeProject && (
        <ProjectDetailModal 
          project={activeProject} 
          onClose={() => setActiveProject(null)} 
          accentColor={themeAccent}
        />
      )}

      {activeBlog && (
        <BlogReaderModal 
          blog={activeBlog} 
          onClose={() => setActiveBlog(null)} 
          accentColor={themeAccent}
        />
      )}

      {/* QR Code Popup modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-center">
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-sm space-y-4 text-slate-200">
            <h3 className="text-white text-base font-bold font-mono uppercase tracking-widest">{t.quickQr}</h3>
            <p className="text-slate-400 text-xs">Download or capture using mobile cameras to link straight to Alex's technical resume portal.</p>
            
            <div className="bg-white p-4.5 rounded-2xl inline-block border-4 border-slate-800 shadow-md">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`} 
                alt="Portfolio Link QR" 
                className="w-40 h-40 object-cover"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Shareable profile link copied to clipboard!");
                  setShowQrModal(false);
                }}
                className="px-4.5 py-2 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold transition-all w-full flex items-center justify-center gap-1"
              >
                <LucideIcon name="Copy" size={13} /> Copy link
              </button>
              <button 
                onClick={() => setShowQrModal(false)}
                className="px-4.5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:brightness-110 shadow w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CMS security login dialogue modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <LucideIcon name="X" size={18} />
            </button>

            <h3 className="text-white font-bold text-base mb-1.5 flex items-center gap-2">
              <LucideIcon name="ShieldAlert" className="text-indigo-400 animate-pulse" size={16} />
              CMS Security Console login
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
              Verify administrative passphrase status to initialize CRUD controls and statistics panels.
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Administrative Email</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  placeholder="sakethreddyaluguvelli@gmail.com"
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-650"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Passphrase Key</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  placeholder="••••••••"
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-650"
                  required 
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Default password: <code>password123</code></span>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-505 font-bold text-xs text-white hover:brightness-110 active:scale-95 transition-all"
                >
                  Authorize Console Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CMS ADMINISTRATIVE WORKSPACE OVERLAY PANEL */}
      {showAdminPanel && isAuthenticated && (
        <AdminPanel 
          dbState={db}
          token={sessionStorage.getItem("rivera_cms_token") || ""}
          onRefreshData={loadPortfolioData}
          onClose={() => setShowAdminPanel(false)}
          accentColor={themeAccent}
        />
      )}

    </div>
  );
}
