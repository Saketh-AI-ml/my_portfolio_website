import { BlogPost } from "../types.js";
import { LucideIcon } from "./LucideIcon.js";

interface BlogReaderModalProps {
  blog: BlogPost;
  onClose: () => void;
  accentColor: string;
}

export function BlogReaderModal({ blog, onClose, accentColor }: BlogReaderModalProps) {
  // Simplified safe markdown processor mapping standard elements
  const renderSimpleMarkdown = (text: string) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-xl md:text-2xl font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-1">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-2xl md:text-3xl font-extrabold text-white mt-8 mb-4">{line.replace("# ", "")}</h2>;
      }
      // Bullet list items
      if (line.trim().startsWith("- ")) {
        return (
          <li key={idx} className="list-disc list-inside text-slate-300 pl-4 my-1.5 leading-relaxed text-sm">
            {line.trim().replace("- ", "")}
          </li>
        );
      }
      // Empty lines
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      // Simple code block lines or inline code formatting
      if (line.startsWith("```")) {
        return null; // Skip wrapper ticks markers
      }
      // Return standard line block
      return (
        <p key={idx} className="text-slate-300 my-2 leading-relaxed text-sm md:text-base">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-6 md:p-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors z-10"
        >
          <LucideIcon name="X" size={24} />
        </button>

        {/* Cover image banner */}
        {blog.coverImage && (
          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 border border-slate-800 relative">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.map(tag => (
            <span 
              key={tag}
              style={{ color: accentColor, borderColor: `${accentColor}40` }}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 border font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2">{blog.title}</h2>
        
        <p className="text-xs font-mono text-slate-500 mb-6 flex items-center gap-1.5">
          <LucideIcon name="Calendar" size={13} />
          {new Date(blog.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* Text Area Content Renderer */}
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
          {renderSimpleMarkdown(blog.content)}
        </div>

        {/* Footer info sharing */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-mono">
            Article hash: {blog.slug}-{blog.id}
          </span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href + `#blog-${blog.slug}`);
              alert("Copied shareable link to clipboard!");
            }}
            style={{ color: accentColor }}
            className="flex items-center gap-2 text-xs font-semibold hover:underline"
          >
            <LucideIcon name="Share2" size={14} />
            Copy Shareable Recruiter Link
          </button>
        </div>

      </div>
    </div>
  );
}
