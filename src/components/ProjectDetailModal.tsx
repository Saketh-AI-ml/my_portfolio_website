import { useState } from "react";
import { Project } from "../types.js";
import { LucideIcon } from "./LucideIcon.js";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  accentColor: string;
}

export function ProjectDetailModal({ project, onClose, accentColor }: ProjectDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const imagesList = project.images && project.images.length > 0 ? project.images : [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&h=500"
  ];

  // Simulated code snippet for a realistic recruiter experience
  const fallbackCodeSnippet = `// ${project.title} Solution Architecture
import { Vector2, WebGLRenderer } from "nova-graphics";

export class WorkspaceManager {
  private renderEngine: WebGLRenderer;
  private elementsMap: Map<string, any> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.renderEngine = new WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    console.log("🚀 Initialized performance matrix layer...");
  }

  public syncPayload(payload: any[]) {
    payload.forEach(item => {
      this.elementsMap.set(item.id, item);
    });
    this.requestFrameRender();
  }

  private requestFrameRender() {
    requestAnimationFrame(() => this.repaintWorld());
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-6 md:p-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Close details"
        >
          <LucideIcon name="X" size={24} />
        </button>

        {/* Category Badge */}
        <span 
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
        >
          <LucideIcon name="FolderOpen" size={14} />
          {project.category}
        </span>

        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 pr-10">{project.title}</h3>

        {/* Visual Showcase (Multiple image gallery layout) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[16/10] relative">
            <img 
              src={imagesList[activeImageIdx]} 
              alt={project.title}
              className="w-full h-full object-cover animate-fade-in"
            />
            {imagesList.length > 1 && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {imagesList.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIdx ? 'bg-white scale-125' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Thumbnails list */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[350px]">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative flex-shrink-0 w-20 md:w-full aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeImageIdx ? 'border-indigo-500 scale-95' : 'border-transparent hover:border-slate-700'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Description & Challenges */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-2 border-b border-slate-800 pb-1">Course & Core Description</h4>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {project.fullDescription || project.description}
              </p>
            </div>

            {/* Challenges faced simulation */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-2 border-b border-slate-800 pb-1">Technical Challenges & Solutions</h4>
              <ul className="space-y-2.5 text-slate-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-500 flex-shrink-0 animate-pulse">●</span>
                  <span><strong>Latency Controls:</strong> Solved visual frame lag during zooms by compiling complex structures to matrices and offloading canvas repaints dynamically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-500 flex-shrink-0">●</span>
                  <span><strong>Data Coherence:</strong> Restructured serialization of live nodes using relative coordinates instead of absolute ones.</span>
                </li>
              </ul>
            </div>

            {/* Source Code Explorer Simulation */}
            <div>
              <h4 className="text-lg font-semibold text-slate-100 mb-2 border-b border-slate-800 pb-1">Code Snippet Preview</h4>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[250px]">
                <pre>{fallbackCodeSnippet}</pre>
              </div>
            </div>
          </div>

          {/* Metadata & Actions Panel */}
          <div className="space-y-6">
            {/* Tech stack */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span 
                    key={tech}
                    className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Live CTA links */}
            <div className="flex flex-col gap-3">
              {project.liveUrl && (
                <a 
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ backgroundColor: accentColor }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium hover:brightness-110 active:scale-[0.98] transition-all text-sm"
                >
                  <LucideIcon name="ExternalLink" size={16} />
                  Launch Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-[0.98] border border-slate-700 transition-all text-sm"
                >
                  <LucideIcon name="Github" size={16} />
                  Browse GitHub Repository
                </a>
              )}
            </div>
            
            {/* Project Created Date */}
            {project.createdAt && (
              <p className="text-xs text-slate-500 text-center font-mono">
                Published on: {new Date(project.createdAt).toLocaleDateString()}
              </p>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
