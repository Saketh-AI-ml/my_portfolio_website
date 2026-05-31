import React, { useState, useEffect } from "react";
import { DBState, Project, Skill, Experience, Education, Certification, Testimonial, BlogPost, Message } from "../types.js";
import { LucideIcon } from "./LucideIcon.js";

interface AdminPanelProps {
  dbState: DBState;
  token: string;
  onRefreshData: () => Promise<void>;
  onClose: () => void;
  accentColor: string;
}

type AdminTab = "dashboard" | "profile" | "projects" | "skills" | "history" | "blogs" | "messages" | "settings";

export function AdminPanel({ dbState, token, onRefreshData, onClose, accentColor }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Common notifications trigger helpers
  const notify = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 4000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  // Safe fetch helper wrapping headers
  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request compiled with an error alert" }));
      throw new Error(err.error || "Request failed");
    }
    return res.json();
  };

  // --- TAB 1: Profile Manager State ---
  const [profileForm, setProfileForm] = useState(dbState.profile);
  const [typingRoleInput, setTypingRoleInput] = useState("");
  const [aiGeneratingBio, setAiGeneratingBio] = useState(false);
  const [bioTone, setBioTone] = useState("architectural and ambitious");

  useEffect(() => {
    setProfileForm(dbState.profile);
  }, [dbState.profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminFetch("/api/portfolio/update-profile", {
        method: "POST",
        body: JSON.stringify(profileForm)
      });
      notify("Profile updated successfully!");
      await onRefreshData();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiBio = async () => {
    setAiGeneratingBio(true);
    try {
      const skillNames = dbState.skills.map(s => s.name).slice(0, 8);
      const res = await adminFetch("/api/gemini/generate-bio", {
        method: "POST",
        body: JSON.stringify({
          tagline: profileForm.tagline,
          skills: skillNames,
          tone: bioTone
        })
      });
      if (res.bio) {
        setProfileForm(prev => ({ ...prev, bio: res.bio }));
        notify("AI Biography generated and updated into fields!");
      }
    } catch (err: any) {
      notify(`AI Generation failed: ${err.message}`, true);
    } finally {
      setAiGeneratingBio(false);
    }
  };

  // --- TAB 2: Projects Manager CRUD State ---
  const [projectSearch, setProjectSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [newImageInput, setNewImageInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  const handleOpenProjectCreate = () => {
    setEditingProject({
      title: "",
      description: "",
      fullDescription: "",
      images: [],
      techStack: [],
      category: "Web",
      liveUrl: "",
      githubUrl: "",
      featured: false,
      published: true,
      order: dbState.projects.length + 1
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setLoading(true);
    try {
      const isNew = !editingProject.id;
      const url = isNew ? "/api/projects" : `/api/projects/${editingProject.id}`;
      const method = isNew ? "POST" : "PUT";

      await adminFetch(url, {
        method,
        body: JSON.stringify(editingProject)
      });
      notify(`Project ${isNew ? 'created' : 'updated'} successfully!`);
      setEditingProject(null);
      await onRefreshData();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setLoading(true);
    try {
      await adminFetch(`/api/projects/${id}`, { method: "DELETE" });
      notify("Project deleted successfully");
      await onRefreshData();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleReorderProject = async (id: string, direction: "up" | "down") => {
    const sorted = [...dbState.projects].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    if (direction === "up" && idx > 0) {
      const temp = sorted[idx].order;
      sorted[idx].order = sorted[idx - 1].order;
      sorted[idx - 1].order = temp;
    } else if (direction === "down" && idx < sorted.length - 1) {
      const temp = sorted[idx].order;
      sorted[idx].order = sorted[idx + 1].order;
      sorted[idx + 1].order = temp;
    } else {
      return; // Boundary limits
    }

    try {
      await adminFetch("/api/projects/reorder", {
        method: "POST",
        body: JSON.stringify({ ids: sorted.map(p => p.id) })
      });
      await onRefreshData();
      notify("Project layout re-ordered!");
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  // --- TAB 3: Skills CRUD State ---
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setLoading(true);
    try {
      const isNew = !editingSkill.id;
      const url = isNew ? "/api/skills" : `/api/skills/${editingSkill.id}`;
      const method = isNew ? "POST" : "PUT";
      await adminFetch(url, {
        method,
        body: JSON.stringify(editingSkill)
      });
      notify("Skill saved!");
      setEditingSkill(null);
      await onRefreshData();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Delete this physical skill?")) return;
    await adminFetch(`/api/skills/${id}`, { method: "DELETE" });
    notify("Skill deleted");
    await onRefreshData();
  };

  // --- TAB 4: History Managers (Experience + Education + Certifications + Testimonials) ---
  const [expForm, setExpForm] = useState<Partial<Experience> | null>(null);
  const [eduForm, setEduForm] = useState<Partial<Education> | null>(null);
  const [certForm, setCertForm] = useState<Partial<Certification> | null>(null);
  const [testForm, setTestForm] = useState<Partial<Testimonial> | null>(null);

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm) return;
    const isNew = !expForm.id;
    const url = isNew ? "/api/experience" : `/api/experience/${expForm.id}`;
    await adminFetch(url, { method: isNew ? "POST" : "PUT", body: JSON.stringify(expForm) });
    setExpForm(null);
    notify("Experience entries synced!");
    await onRefreshData();
  };

  const handleSaveEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm) return;
    const isNew = !eduForm.id;
    const url = isNew ? "/api/education" : `/api/education/${eduForm.id}`;
    await adminFetch(url, { method: isNew ? "POST" : "PUT", body: JSON.stringify(eduForm) });
    setEduForm(null);
    notify("Education credentials saved!");
    await onRefreshData();
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm) return;
    const isNew = !certForm.id;
    const url = isNew ? "/api/certifications" : `/api/certifications/${certForm.id}`;
    await adminFetch(url, { method: isNew ? "POST" : "PUT", body: JSON.stringify(certForm) });
    setCertForm(null);
    notify("Certification synced!");
    await onRefreshData();
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm) return;
    const isNew = !testForm.id;
    const url = isNew ? "/api/testimonials" : `/api/testimonials/${testForm.id}`;
    await adminFetch(url, { method: isNew ? "POST" : "PUT", body: JSON.stringify(testForm) });
    setTestForm(null);
    notify("Testimonials updated!");
    await onRefreshData();
  };

  // --- TAB 5: Blogs CRUD State ---
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    const isNew = !editingBlog.id;
    const url = isNew ? "/api/blogs" : `/api/blogs/${editingBlog.id}`;
    await adminFetch(url, { method: isNew ? "POST" : "PUT", body: JSON.stringify(editingBlog) });
    setEditingBlog(null);
    notify("Article draft published successfully!");
    await onRefreshData();
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await adminFetch(`/api/blogs/${id}`, { method: "DELETE" });
    notify("Article deleted!");
    await onRefreshData();
  };

  // --- TAB 6: Inbox Message States ---
  const handleMarkMessageRead = async (id: string) => {
    await adminFetch(`/api/messages/${id}/read`, { method: "PUT" });
    notify("Message registered as read.");
    await onRefreshData();
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Remove inquiry log?")) return;
    await adminFetch(`/api/messages/${id}`, { method: "DELETE" });
    notify("Contact message removed.");
    await onRefreshData();
  };

  // --- TAB 7: Site Config Accent Picker & Backup State ---
  const [settingsForm, setSettingsForm] = useState(dbState.settings);
  useEffect(() => {
    setSettingsForm(dbState.settings);
  }, [dbState.settings]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch("/api/portfolio/update-settings", {
        method: "POST",
        body: JSON.stringify(settingsForm)
      });
      notify("Global site configs and colors refreshed!");
      await onRefreshData();
    } catch (err: any) {
      notify(err.message, true);
    }
  };

  const handleUploadBinary = async (file: File, type: "avatar" | "resume") => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await adminFetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({
            fileName: file.name,
            fileContent: base64,
            mimeType: file.type
          })
        });
        if (res.url) {
          if (type === "avatar") {
            setProfileForm(prev => ({ ...prev, avatar: res.url }));
          } else {
            setProfileForm(prev => ({ ...prev, resumeUrl: res.url }));
          }
          notify(`${type === 'avatar' ? 'Profile graphic' : 'Resume PDF'} uploaded as web path: ${res.url}`);
        }
      } catch (err: any) {
        notify("File uploading failed", true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackup = () => {
    window.open(`/api/export?token=${token}`, "_blank");
  };

  const handleResetDefaults = async () => {
    if (!confirm("DANGER: This will purge all modifications and load base developers preset. Continue?")) return;
    setLoading(true);
    try {
      await adminFetch("/api/reset", { method: "POST" });
      notify("Portfolio reset to pristine database state.");
      await onRefreshData();
    } catch (err: any) {
      notify(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col md:flex-row text-slate-200">
      
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center justify-between md:mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-600 text-white animate-pulse">
              <LucideIcon name="Settings" size={18} />
            </span>
            <span className="font-bold text-white tracking-wide">CMS Control Center</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <LucideIcon name="X" size={20} />
          </button>
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "dashboard", label: "Dashboard Hub", icon: "LayoutDashboard" },
            { id: "profile", label: "Profile Manager", icon: "User" },
            { id: "projects", label: "Projects CRUD", icon: "FolderGit" },
            { id: "skills", label: "Skills Radar", icon: "Code2" },
            { id: "history", label: "Experience & Edu", icon: "Briefcase" },
            { id: "blogs", label: "Technical Blogs", icon: "BookOpen" },
            { id: "messages", label: `Inbox (${dbState.messages.filter(m => !m.read).length})`, icon: "Mail" },
            { id: "settings", label: "Site Configurations", icon: "Sliders" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              style={{
                backgroundColor: activeTab === tab.id ? `${accentColor}20` : "",
                color: activeTab === tab.id ? accentColor : ""
              }}
              className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all text-xs font-semibold whitespace-nowrap md:w-full text-left ${
                activeTab === tab.id ? 'bg-indigo-950 text-indigo-400 font-bold border-l-3' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <LucideIcon name={tab.icon} size={15} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block mt-auto p-3 bg-slate-950/40 rounded-xl border border-slate-800">
          <p className="text-[10px] font-mono text-slate-500">SIGNED IN AS:</p>
          <p className="text-xs font-semibold text-slate-300 truncate">sakethreddyaluguvelli@gmail.com</p>
          <button 
            onClick={() => {
              sessionStorage.removeItem("rivera_cms_token");
              window.location.reload();
            }}
            className="mt-3.5 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950 border border-red-900/50 text-red-400 hover:text-red-200 transition-colors text-[11px] font-bold"
          >
            <LucideIcon name="LogOut" size={12} />
            Disconnect Session
          </button>
        </div>
      </div>

      {/* Main admin canvas area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8 relative">
        
        {/* Banner notification notifications */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-950/40 border-2 border-red-800 text-red-200 flex items-center gap-2.5 text-sm animate-fade-in">
            <LucideIcon name="AlertCircle" size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-800 text-emerald-200 flex items-center gap-2.5 text-sm animate-fade-in">
            <LucideIcon name="CheckCircle2" size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">Analytics Hub</h2>
                <p className="text-xs text-slate-400 mt-1">Live traffic telemetry, resume metrics and fast shortcut panels</p>
              </div>
              <button 
                onClick={onClose}
                style={{ backgroundColor: accentColor }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium hover:brightness-110 shadow-lg text-xs"
              >
                <LucideIcon name="CornerUpLeft" size={14} />
                Return to Live Portfolio
              </button>
            </div>

            {/* Counters grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Page Views", val: dbState.stats.pageViews, icon: "Eye", color: "text-blue-400" },
                { label: "Profile Visits", val: dbState.stats.profileVisits, icon: "Users", color: "text-amber-500" },
                { label: "Resume Downloads", val: dbState.stats.resumeDownloads, icon: "DownloadCloud", color: "text-emerald-400" },
                { label: "Form Message Inquiries", val: dbState.messages.length, icon: "MailQuestion", color: "text-purple-400" }
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-widest">{c.label}</span>
                    <LucideIcon name={c.icon} className={c.color} size={16} />
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold text-white font-mono mt-1">{c.val}</p>
                </div>
              ))}
            </div>

            {/* Custom SVG telemetry diagrams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="text-sm font-semibold text-slate-300 mb-4 font-mono">Visitor Device Metrics</h4>
                <div className="space-y-3">
                  {[
                    { label: "Desktop Workstations", val: dbState.stats.deviceBreakdown.desktop, total: dbState.stats.deviceBreakdown.desktop + dbState.stats.deviceBreakdown.mobile + dbState.stats.deviceBreakdown.tablet },
                    { label: "Mobile Phones", val: dbState.stats.deviceBreakdown.mobile, total: dbState.stats.deviceBreakdown.desktop + dbState.stats.deviceBreakdown.mobile + dbState.stats.deviceBreakdown.tablet },
                    { label: "Tablet Displays", val: dbState.stats.deviceBreakdown.tablet, total: dbState.stats.deviceBreakdown.desktop + dbState.stats.deviceBreakdown.mobile + dbState.stats.deviceBreakdown.tablet }
                  ].map((dev, i) => {
                    const pct = Math.round((dev.val / (dev.total || 1)) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">{dev.label}</span>
                          <span className="text-white font-bold">{dev.val} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%`, backgroundColor: accentColor }} className="h-full rounded-full transition-all duration-1000" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Geographical telemetry breakdown */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="text-sm font-semibold text-slate-300 mb-4 font-mono">Top Traffic Sources (Country)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(dbState.stats.countryBreakdown).slice(0, 6).map(([country, count]) => (
                    <div key={country} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">{country}</span>
                      <span className="font-mono font-bold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Actions */}
            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40">
              <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-widest font-mono mb-4">Quick Operations</h4>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleOpenProjectCreate}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <LucideIcon name="FolderPlus" size={13} /> Add New Project card
                </button>
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <LucideIcon name="Database" size={13} /> Update Site Configurations
                </button>
                <button 
                  onClick={() => {
                    const toggle = !profileForm.availableForWork;
                    setProfileForm(prev => ({ ...prev, availableForWork: toggle }));
                    adminFetch("/api/portfolio/update-profile", {
                      method: "POST",
                      body: JSON.stringify({ ...profileForm, availableForWork: toggle })
                    }).then(() => {
                      notify("Updated Availability state!");
                      onRefreshData();
                    });
                  }}
                  className="px-4.5 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-emerald-900 text-xs font-bold text-emerald-400 flex items-center gap-1.5 transition-colors"
                >
                  <LucideIcon name="Briefcase" size={13} /> Toggle Work Availability State
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFILE MANAGEMENT */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Update Core Professional Identity</h2>
            <p className="text-slate-400 text-xs mb-6 font-mono">Manage names, avatars, links and generate descriptions instantly using AI.</p>

            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Candidate Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm(v => ({ ...v, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={e => setProfileForm(v => ({ ...v, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Tagline / Current Professional Title</label>
                <input 
                  type="text" 
                  value={profileForm.tagline} 
                  onChange={e => setProfileForm(v => ({ ...v, tagline: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500"
                  required
                />
              </div>

              {/* Avatar file upload / Resume replacement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-900/60 border border-slate-850">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Profile Avatar Graphic (Base64 or url)</label>
                  <div className="flex gap-3 items-center">
                    <img src={profileForm.avatar} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={profileForm.avatar} 
                        onChange={e => setProfileForm(v => ({ ...v, avatar: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files && handleUploadBinary(e.target.files[0], "avatar")}
                        className="mt-1 text-xs text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Resume PDF File upload</label>
                  <div>
                    <input 
                      type="text" 
                      value={profileForm.resumeUrl} 
                      onChange={e => setProfileForm(v => ({ ...v, resumeUrl: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={e => e.target.files && handleUploadBinary(e.target.files[0], "resume")}
                      className="mt-1 text-xs text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* AI Bio Generator Area */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border-2 border-indigo-900/50 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5">
                    <LucideIcon name="Sparkles" className="text-amber-400 animate-bounce" size={15} />
                    Gemini AI-Powered Professional Bio Generator
                  </h4>
                  <span className="text-[10px] bg-indigo-900/60 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded">API Secured</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Analyze your existing tagline alongside current skills array, and construct a bespoke bio dynamically using Google's <code>gemini-3.5-flash</code> model.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-mono">Biography Focus Tone:</span>
                  <select 
                    value={bioTone} 
                    onChange={e => setBioTone(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:border-indigo-500"
                  >
                    <option value="architectural and highly technical">Technical Architectural</option>
                    <option value="warm, casual, and team-focused">Warm & Friendly</option>
                    <option value="disruptive, startup founder energy">Disruptive Startup-Style</option>
                    <option value="minimalist, absolute veteran developer">Minimalist Veteran</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={handleGenerateAiBio}
                    disabled={aiGeneratingBio}
                    style={{ minWidth: "150px" }}
                    className="ml-auto flex items-center justify-center gap-1.5 px-4.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 tracking-wide transition-all"
                  >
                    {aiGeneratingBio ? (
                      <>
                        <LucideIcon name="RefreshCw" className="animate-spin" size={12} />
                        Synthesizing...
                      </>
                    ) : (
                      <>
                        <LucideIcon name="Zap" size={12} />
                        Generate AI Bio
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Professional Biography Presentation</label>
                <textarea 
                  rows={4}
                  value={profileForm.bio} 
                  onChange={e => setProfileForm(v => ({ ...v, bio: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Years of Experience</label>
                  <input 
                    type="number" 
                    value={profileForm.experienceYears} 
                    onChange={e => setProfileForm(v => ({ ...v, experienceYears: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Total Projects Count</label>
                  <input 
                    type="number" 
                    value={profileForm.projectsCount} 
                    onChange={e => setProfileForm(v => ({ ...v, projectsCount: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Clients Logged</label>
                  <input 
                    type="number" 
                    value={profileForm.clientsServed} 
                    onChange={e => setProfileForm(v => ({ ...v, clientsServed: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Work Location Badge</label>
                  <input 
                    type="text" 
                    value={profileForm.location} 
                    onChange={e => setProfileForm(v => ({ ...v, location: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-sm rounded-xl px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Available for Work</label>
                  <div className="flex items-center gap-3 mt-2 h-10">
                    <input 
                      type="checkbox" 
                      id="availChecked"
                      checked={profileForm.availableForWork} 
                      onChange={e => setProfileForm(v => ({ ...v, availableForWork: e.target.checked }))}
                      className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="availChecked" className="text-sm font-semibold select-none text-slate-350 cursor-pointer">
                      {profileForm.availableForWork ? "Active: Shows 'Green' badge" : "In-active: Shows offline alert"}
                    </label>
                  </div>
                </div>
              </div>

              {/* Social Links Sub Group */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-1.5 font-bold">Social Handles Profiles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GitHub Endpoint</label>
                    <input 
                      type="text" 
                      value={profileForm.socialLinks.github || ""} 
                      onChange={e => setProfileForm(v => ({ ...v, socialLinks: { ...v.socialLinks, github: e.target.value } }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                    <input 
                      type="text" 
                      value={profileForm.socialLinks.linkedin || ""} 
                      onChange={e => setProfileForm(v => ({ ...v, socialLinks: { ...v.socialLinks, linkedin: e.target.value } }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Twitter / X Handle</label>
                    <input 
                      type="text" 
                      value={profileForm.socialLinks.twitter || ""} 
                      onChange={e => setProfileForm(v => ({ ...v, socialLinks: { ...v.socialLinks, twitter: e.target.value } }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LeetCode Endpoint</label>
                    <input 
                      type="text" 
                      value={profileForm.socialLinks.leetcode || ""} 
                      onChange={e => setProfileForm(v => ({ ...v, socialLinks: { ...v.socialLinks, leetcode: e.target.value } }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: accentColor }}
                  className="px-6 py-3 rounded-xl text-white font-bold hover:brightness-115 active:scale-95 transition-all w-full text-xs"
                >
                  {loading ? "Saving Professional Matrix..." : "Save Profile Details"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB: PROJECTS MANAGER CRUD */}
        {activeTab === "projects" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Featured Project Works ({dbState.projects.length})</h2>
                <p className="text-slate-400 text-xs mt-0.5">Filter, search, modify, drag layout hierarchy or load showcase drafts</p>
              </div>
              <button 
                onClick={handleOpenProjectCreate}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <LucideIcon name="Plus" size={15} /> Add New Project Work
              </button>
            </div>

            {/* Quick search panel */}
            <div className="flex gap-3 mb-6 bg-slate-900 p-3 rounded-xl border border-slate-850">
              <input 
                type="text"
                placeholder="Search projects database..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white flex-1"
              />
              <select 
                value={projectFilter} 
                onChange={e => setProjectFilter(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded-lg px-3 py-2"
              >
                <option value="All">All Categories</option>
                <option value="Web">Web Apps</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cloud Native & DevOps">Cloud Native & DevOps</option>
              </select>
            </div>

            {/* Editing / Creating Popup View */}
            {editingProject && (
              <div className="mb-8 p-6 rounded-2xl bg-slate-900 border-2 border-indigo-500/35 relative animate-fade-in space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">
                  {editingProject.id ? `Edit ${editingProject.title}` : "Author New Project Entry"}
                </h3>
                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Title</label>
                      <input 
                        type="text" 
                        value={editingProject.title || ""} 
                        onChange={e => setEditingProject(v => ({ ...v, title: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Category</label>
                      <select 
                        value={editingProject.category || "Web"}
                        onChange={e => setEditingProject(v => ({ ...v, category: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="Web">Web & Collaborative</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Cloud Native & DevOps">Cloud Native & DevOps</option>
                        <option value="Open Source">Open Source Packages</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Live Demo Link</label>
                      <input 
                        type="url" 
                        value={editingProject.liveUrl || ""} 
                        onChange={e => setEditingProject(v => ({ ...v, liveUrl: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">GitHub URL</label>
                      <input 
                        type="url" 
                        value={editingProject.githubUrl || ""} 
                        onChange={e => setEditingProject(v => ({ ...v, githubUrl: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Short Description</label>
                    <input 
                      type="text" 
                      value={editingProject.description || ""} 
                      onChange={e => setEditingProject(v => ({ ...v, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Detailed Technical Synopsis</label>
                    <textarea 
                      rows={3}
                      value={editingProject.fullDescription || ""} 
                      onChange={e => setEditingProject(v => ({ ...v, fullDescription: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  {/* Multiple image list manager */}
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase">Project Visual Showcases ({editingProject.images?.length || 0})</label>
                    <div className="flex gap-2 flex-wrap">
                      {editingProject.images?.map((img, i) => (
                        <div key={i} className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-xs">
                          <span className="truncate max-w-[150px]">{img}</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingProject(v => ({ ...v, images: v.images?.filter((_, idx) => idx !== i) }));
                            }}
                            className="text-red-400 hover:text-red-200"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Paste image URL (e.g. Unsplash link)..."
                        value={newImageInput}
                        onChange={e => setNewImageInput(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 flex-1"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (!newImageInput.trim()) return;
                          setEditingProject(v => ({ ...v, images: [...(v.images || []), newImageInput.trim()] }));
                          setNewImageInput("");
                        }}
                        className="bg-indigo-650 hover:bg-indigo-600 text-white font-mono text-xs px-3 py-1 rounded"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Multi-stack tag builder */}
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase font-semibold">Associated Tech Stack Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {editingProject.techStack?.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-900 text-indigo-300 text-[10px] font-mono flex items-center gap-1.5">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => setEditingProject(v => ({ ...v, techStack: v.techStack?.filter((_, idx) => idx !== i) }))}
                            className="text-red-400 hover:text-red-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type tag (e.g. WebSockets, Redis, Electron) and insert..."
                        value={newTagInput}
                        onChange={e => setNewTagInput(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-1.5 flex-1 text-white"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (!newTagInput.trim()) return;
                          setEditingProject(v => ({ ...v, techStack: [...(v.techStack || []), newTagInput.trim()] }));
                          setNewTagInput("");
                        }}
                        className="bg-indigo-650 text-white text-xs px-3 py-1 rounded"
                      >
                        Push Tag
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300">
                      <input 
                        type="checkbox"
                        checked={!!editingProject.featured}
                        onChange={e => setEditingProject(v => ({ ...v, featured: e.target.checked }))}
                        className="accent-indigo-500"
                      />
                      Mark as Featured (Display inside Hero Intro)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300">
                      <input 
                        type="checkbox"
                        checked={!!editingProject.published}
                        onChange={e => setEditingProject(v => ({ ...v, published: e.target.checked }))}
                        className="accent-indigo-500"
                      />
                      Published (Draft otherwise)
                    </label>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 transition-colors"
                    >
                      Cancel Draft
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      style={{ backgroundColor: accentColor }}
                      className="px-6 py-2 rounded-lg text-white font-bold text-xs hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      {loading ? "Syncing..." : "Sync Project details"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Projects Table List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-widest text-[10px]">
                    <th className="py-3 px-4">Workspace Display Order</th>
                    <th className="py-3 px-4">Title & details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Tech-Tags</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">CRUD Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {dbState.projects
                    .filter(proj => {
                      const matchesSearch = proj.title.toLowerCase().includes(projectSearch.toLowerCase()) || proj.description.toLowerCase().includes(projectSearch.toLowerCase());
                      const matchesCategory = projectFilter === "All" || proj.category === projectFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map((proj, idx) => (
                      <tr key={proj.id} className="hover:bg-slate-850/45 text-slate-300">
                        <td className="py-3 px-4">
                          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded font-bold">{proj.order}</span>
                          <div className="inline-flex gap-1 ml-3">
                            <button 
                              onClick={() => handleReorderProject(proj.id, "up")}
                              className="p-1 rounded text-xs bg-slate-850 text-slate-300 hover:bg-slate-800"
                              title="Up"
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => handleReorderProject(proj.id, "down")}
                              className="p-1 rounded text-xs bg-slate-850 text-slate-300 hover:bg-slate-800"
                              title="Down"
                            >
                              ▼
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 overflow-hidden rounded bg-slate-950 border border-slate-800">
                              <img src={proj.images?.[0] || ""} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{proj.title}</p>
                              <p className="text-slate-400 text-[11px] truncate max-w-[200px]">{proj.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">{proj.category}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {proj.techStack.slice(0, 3).map(tech => (
                              <span key={tech} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-slate-400">{tech}</span>
                            ))}
                            {proj.techStack.length > 3 && <span className="text-[9px] font-mono font-bold text-indigo-400">+{proj.techStack.length - 3}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {proj.featured ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-900/50">Featured</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => setEditingProject(proj)}
                              className="px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-900 text-indigo-300 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(proj.id)}
                              className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-900 text-red-300 hover:text-white transition-colors"
                            >
                              Purge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SKILLS CRUD RADAR */}
        {activeTab === "skills" && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Skills Matrix Radar</h2>
                <p className="text-xs text-slate-400">Add or manage technologies and proficiency indicators shown on the portfolio.</p>
              </div>
              <button
                onClick={() => setEditingSkill({ name: "", category: "Languages", icon: "Code2", proficiency: 85, order: dbState.skills.length + 1 })}
                className="bg-indigo-650 hover:bg-indigo-600 text-white text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <LucideIcon name="Plus" size={14} /> Add Skill Entry
              </button>
            </div>

            {/* Mini Add/Edit Widget Form */}
            {editingSkill && (
              <form onSubmit={handleSaveSkill} className="mb-6 p-4 rounded-xl bg-slate-900 border-2 border-indigo-500/30 grid grid-cols-1 md:grid-cols-5 gap-3 items-end animate-fade-in">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Technology Name</label>
                  <input 
                    type="text" 
                    value={editingSkill.name || ""} 
                    onChange={e => setEditingSkill(v => ({ ...v, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Category Group</label>
                  <select
                    value={editingSkill.category || "Languages"}
                    onChange={e => setEditingSkill(v => ({ ...v, category: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    <option value="Languages">Programming Languages</option>
                    <option value="Frameworks">Frameworks & Libraries</option>
                    <option value="Databases">Databases & Caches</option>
                    <option value="Tools">Developer Tools / Workspaces</option>
                    <option value="Cloud">Cloud Native Architecture</option>
                    <option value="Soft Skills">Professional Attributes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Lucide Icon name</label>
                  <input 
                    type="text" 
                    placeholder="Atom, Cpu, Database..."
                    value={editingSkill.icon || ""} 
                    onChange={e => setEditingSkill(v => ({ ...v, icon: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Proficiency ({editingSkill.proficiency || 50}%)</label>
                  <input 
                    type="range" 
                    min={1} 
                    max={100}
                    value={editingSkill.proficiency || 50} 
                    onChange={e => setEditingSkill(v => ({ ...v, proficiency: Number(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditingSkill(null)} className="px-3 py-1.5 rounded bg-slate-800 text-xs">Dismiss</button>
                  <button type="submit" style={{ backgroundColor: accentColor }} className="px-4 py-1.5 text-white font-bold rounded text-xs">Sync</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Languages", "Frameworks", "Databases", "Cloud", "Tools", "Soft Skills"].map(cat => {
                const filtered = dbState.skills.filter(s => s.category === cat);
                return (
                  <div key={cat} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <h3 className="text-white font-bold text-xs font-mono uppercase tracking-widest border-b border-slate-850 pb-2 mb-3 text-indigo-400">
                      {cat} ({filtered.length})
                    </h3>
                    <div className="space-y-2.5">
                      {filtered.map(skill => (
                        <div key={skill.id} className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-850">
                          <div className="flex items-center gap-2">
                            <LucideIcon name={skill.icon} className="text-slate-400" size={14} />
                            <div>
                              <p className="text-xs font-semibold text-white">{skill.name}</p>
                              <p className="text-[10px] font-mono text-slate-500">Proficiency: {skill.proficiency}%</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => {
                                setEditingSkill(skill);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-slate-400 hover:text-white p-1"
                              title="Edit"
                            >
                              <LucideIcon name="PenTool" size={12} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-red-400 hover:text-red-200 p-1"
                              title="Delete"
                            >
                              <LucideIcon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: HISTORY MANAGERS (EXPERIENCES & EDUCATION) */}
        {activeTab === "history" && (
          <div className="space-y-10">
            
            {/* WORK EXPERIENCE */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LucideIcon name="Briefcase" size={20} className="text-indigo-400" />
                  Work Experience History
                </h2>
                <button 
                  onClick={() => setExpForm({ company: "", role: "", startDate: "2026-01", endDate: "Present", description: [""], technologies: [] })}
                  className="bg-indigo-650 text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <LucideIcon name="Plus" size={13} /> Add Work
                </button>
              </div>

              {/* Exp Edit block */}
              {expForm && (
                <form onSubmit={handleSaveExp} className="mb-6 p-4 rounded-xl bg-slate-900 border-2 border-indigo-500/20 space-y-3.5 animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input 
                      type="text" placeholder="Company" value={expForm.company || ""} 
                      onChange={e => setExpForm(v => ({ ...v, company: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white" required
                    />
                    <input 
                      type="text" placeholder="Designation Role" value={expForm.role || ""} 
                      onChange={e => setExpForm(v => ({ ...v, role: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white" required
                    />
                    <input 
                      type="text" placeholder="Start Date" value={expForm.startDate || ""} 
                      onChange={e => setExpForm(v => ({ ...v, startDate: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white"
                    />
                    <input 
                      type="text" placeholder="End Date" value={expForm.endDate || ""} 
                      onChange={e => setExpForm(v => ({ ...v, endDate: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setExpForm(null)} className="px-3 py-1 bg-slate-800 text-xs text-white rounded">Dismiss</button>
                    <button type="submit" className="px-4 py-1 bg-indigo-600 text-white text-xs rounded font-bold">Sync</button>
                  </div>
                </form>
              )}

              {/* Exp List */}
              <div className="space-y-3">
                {dbState.experience.map(exp => (
                  <div key={exp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-bold text-sm">{exp.role} @ <span className="text-indigo-400">{exp.company}</span></h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{exp.startDate} - {exp.endDate} ({exp.location})</p>
                      <ul className="list-disc list-inside mt-2 text-slate-300 text-xs space-y-1.5 pl-2 max-w-2xl">
                        {exp.description.map((bullet, k) => <li key={k}>{bullet}</li>)}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setExpForm(exp)} className="p-1 px-2.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 text-[11px]">Edit</button>
                      <button 
                        onClick={async () => {
                          if (!confirm("Are you sure?")) return;
                          await adminFetch(`/api/experience/${exp.id}`, { method: "DELETE" });
                          await onRefreshData();
                          notify("Purged experience");
                        }} 
                        className="p-1 px-2.5 rounded bg-red-950 hover:bg-red-900 border border-red-900 text-red-300 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EDUCATION SERVICES */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LucideIcon name="GraduationCap" size={20} className="text-indigo-400" />
                  Education Credentials
                </h2>
                <button 
                  onClick={() => setEduForm({ institution: "", degree: "", field: "", startYear: "2016", endYear: "2020", grade: "GPA: 4.0" })}
                  className="bg-indigo-650 text-white text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <LucideIcon name="Plus" size={13} /> Add College
                </button>
              </div>

              {/* Edu edit widget */}
              {eduForm && (
                <form onSubmit={handleSaveEdu} className="mb-6 p-4 rounded-xl bg-slate-900 border-2 border-indigo-500/20 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input 
                      type="text" placeholder="Institution" value={eduForm.institution || ""} 
                      onChange={e => setEduForm(v => ({ ...v, institution: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white" required
                    />
                    <input 
                      type="text" placeholder="Degree" value={eduForm.degree || ""} 
                      onChange={e => setEduForm(v => ({ ...v, degree: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white" required
                    />
                    <input 
                      type="text" placeholder="Field of study" value={eduForm.field || ""} 
                      onChange={e => setEduForm(v => ({ ...v, field: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white"
                    />
                    <input 
                      type="text" placeholder="GPA grade" value={eduForm.grade || ""} 
                      onChange={e => setEduForm(v => ({ ...v, grade: e.target.value }))}
                      className="bg-slate-950 border border-slate-800 text-xs rounded p-2 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEduForm(null)} className="px-3 py-1 bg-slate-800 text-xs rounded">Dismiss</button>
                    <button type="submit" className="px-4 py-1 bg-indigo-600 text-white text-xs rounded font-bold">Sync</button>
                  </div>
                </form>
              )}

              {/* Edu list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbState.education.map(edu => (
                  <div key={edu.id} className="p-4 rounded-xl bg-slate-900 border border-slate-850 relative">
                    <h4 className="text-white font-bold text-sm">{edu.degree} inside <span className="text-indigo-400">{edu.institution}</span></h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{edu.startYear} - {edu.endYear} | {edu.field}</p>
                    <p className="text-xs font-semibold text-emerald-450 mt-1 font-mono">{edu.grade}</p>
                    
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setEduForm(edu)} className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono">Edit</button>
                      <button 
                        onClick={async () => {
                          if (!confirm("Are you sure?")) return;
                          await adminFetch(`/api/education/${edu.id}`, { method: "DELETE" });
                          await onRefreshData();
                          notify("Purged college");
                        }}
                        className="text-[11px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-900/40 font-mono"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: BLOG ARTICLES */}
        {activeTab === "blogs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Technical Insights & Articles ({dbState.blogs.length})</h2>
                <p className="text-xs text-slate-400 mt-1">Write insights using fully highlighted Markdown syntax</p>
              </div>
              <button 
                onClick={() => setEditingBlog({ title: "", excerpt: "", content: "", coverImage: "https://images.unsplash.com/photo-1541462608141-2ff030de4a2a?auto=format&fit=crop&q=80&w=800&h=400", tags: ["TypeScript"] })}
                className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1"
              >
                <LucideIcon name="Plus" size={14} /> Write Article
              </button>
            </div>

            {/* Blog Editing / Creating block */}
            {editingBlog && (
              <form onSubmit={handleSaveBlog} className="mb-8 p-5 bg-slate-900 border-2 border-indigo-500/20 rounded-2xl space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Article Title</label>
                    <input 
                      type="text" value={editingBlog.title || ""} 
                      onChange={e => setEditingBlog(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-2.5 text-white" required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Cover Image Source</label>
                    <input 
                      type="text" value={editingBlog.coverImage || ""} 
                      onChange={e => setEditingBlog(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Short Excerpt Summary</label>
                  <input 
                    type="text" value={editingBlog.excerpt || ""} 
                    onChange={e => setEditingBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Full Article content (Support header ## blocks, bullet list - items)</label>
                  <textarea 
                    rows={8} value={editingBlog.content || ""} 
                    onChange={e => setEditingBlog(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg p-3 text-white font-mono" required
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setEditingBlog(null)} className="px-4 py-2 rounded bg-slate-800 text-xs">Dismiss</button>
                  <button type="submit" style={{ backgroundColor: accentColor }} className="px-5 py-2 rounded text-xs text-white font-bold">Publish Draft</button>
                </div>
              </form>
            )}

            {/* Blogs List */}
            <div className="space-y-4">
              {dbState.blogs.map(blog => (
                <div key={blog.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-bold text-sm">{blog.title}</h4>
                    <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[500px]">{blog.excerpt}</p>
                    <div className="flex gap-2 mt-2">
                      {blog.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingBlog(blog)} className="px-2.5 py-1 text-xs rounded bg-slate-950 hover:bg-slate-800 border border-slate-800">Edit</button>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="px-2.5 py-1 text-xs rounded bg-red-950 hover:bg-red-900 border border-red-900 text-red-200">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MESSAGES INBOX */}
        {activeTab === "messages" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Contact Inbox Messages ({dbState.messages.length})</h2>
              <p className="text-xs text-slate-400 mt-1">View recruitment inquiries or direct message logs</p>
            </div>

            <div className="space-y-4">
              {dbState.messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-5 rounded-xl border ${
                    msg.read ? 'bg-slate-900/60 border-slate-855' : 'bg-[#151c30] border-indigo-900/60 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-white text-base">{msg.name}</span>
                      <code className="text-[11px] text-indigo-300 ml-2 font-mono">({msg.email})</code>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Subject: {msg.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                      {!msg.read ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-805 text-indigo-300 text-[9px] uppercase font-bold tracking-widest leading-none">Unread</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-850 text-slate-500 text-[9px] uppercase tracking-widest leading-none">Opened</span>
                      )}
                    </div>
                  </div>

                  <p className="p-3.5 rounded-lg bg-slate-950 text-slate-300 text-sm whitespace-pre-line leading-relaxed mb-4 font-mono">
                    {msg.message}
                  </p>

                  <div className="flex justify-end gap-3.5">
                    {!msg.read && (
                      <button 
                        onClick={() => handleMarkMessageRead(msg.id)}
                        className="px-3.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-900 text-indigo-300 hover:text-white transition-all text-xs font-semibold"
                      >
                        ✔ Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="px-3.5 py-1 rounded bg-red-950/50 hover:bg-red-950 border border-red-900/50 text-red-300 hover:text-white transition-all text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {dbState.messages.length === 0 && (
                <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  Inbox empty. No inquiries logged on the CMS backend yet!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SITE SETTINGS */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Global Site Settings</h2>
            <p className="text-slate-400 text-xs mb-6 font-mono">Accent picker, section toggles, DB utilities, and database seed parameters</p>

            <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Site Title for SEO / Tab Headers</label>
                <input 
                  type="text" 
                  value={settingsForm.siteTitle}
                  onChange={e => setSettingsForm(prev => ({ ...prev, siteTitle: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Meta Description SEO Meta Tags</label>
                <input 
                  type="text" 
                  value={settingsForm.metaDescription}
                  onChange={e => setSettingsForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Github Profile Username (Traffic auto indicators)</label>
                  <input 
                    type="text" 
                    value={settingsForm.githubUsername}
                    onChange={e => setSettingsForm(prev => ({ ...prev, githubUsername: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono"
                  />
                </div>
                
                {/* Accent Color picker */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5 font-bold">Accent Theme Picker</label>
                  <div className="flex gap-2 items-center">
                    <div style={{ backgroundColor: settingsForm.accentColor }} className="w-8 h-8 rounded-full border border-slate-700 flex-shrink-0" />
                    <select 
                      value={settingsForm.accentColor}
                      onChange={e => setSettingsForm(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500"
                    >
                      <option value="#6366f1">Indigo Velvet</option>
                      <option value="#3b82f6">Oceanic Blue</option>
                      <option value="#10b981">Emerald Clean</option>
                      <option value="#f59e0b">Amber Gold</option>
                      <option value="#ec4899">Sweet Fuchsia</option>
                      <option value="#8b5cf6">Regal Purple</option>
                      <option value="#f97316">Deep Orange</option>
                      <option value="#ef4444">Scarlet Crimson</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Toggleable sections checkboxes */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 space-y-3">
                <label className="block text-xs font-mono text-slate-400 uppercase font-bold">Homepage Active Segments Config</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: "hero", label: "Hero Intro" },
                    { id: "about", label: "About Me block" },
                    { id: "skills", label: "Skills Radar" },
                    { id: "projects", label: "Featured Projects" },
                    { id: "experience", label: "Work Timeline" },
                    { id: "education", label: "Education histories" },
                    { id: "testimonials", label: "Recommendations" },
                    { id: "github", label: "Github contribution graph" },
                    { id: "blog", label: "Blogs & Markdown drafts" }
                  ].map(sec => (
                    <label key={sec.id} className="flex items-center gap-2 text-xs text-slate-350 select-none cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={!!(settingsForm.visibleSections as any)[sec.id]}
                        onChange={e => {
                          const sections = { ...settingsForm.visibleSections, [sec.id]: e.target.checked };
                          setSettingsForm(prev => ({ ...prev, visibleSections: sections as any }));
                        }}
                        className="accent-indigo-500 cursor-pointer"
                      />
                      {sec.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-red-350 select-none cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={settingsForm.maintenanceMode}
                    onChange={e => setSettingsForm(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="accent-red-500 cursor-pointer w-4 h-4"
                  />
                  <span>Activate Site Maintenance Lock (Show alert to guests)</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  style={{ backgroundColor: accentColor }}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs hover:brightness-110 flex-1 transition-all"
                >
                  Save Global Configuration
                </button>
              </div>
            </form>

            {/* DANGER PURSUE UTILITIES */}
            <div className="border-t border-slate-850 mt-10 pt-6 max-w-2xl space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-mono text-red-400 font-bold">Maintenance Database Utilities</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export full site JSON content as backup to keep files safe, or reconstruct the initial developers seed if you need a pristine playground.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5"
                >
                  <LucideIcon name="DownloadCloud" size={13} /> Export Database backup JSON
                </button>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-4 py-2 rounded-xl bg-red-950/30 hover:bg-red-950 border border-red-900/40 text-red-400 hover:text-red-200 transition-colors text-xs font-bold flex items-center gap-1.5"
                >
                  <LucideIcon name="RotateCcw" size={13} /> Hard Reset Database State
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
