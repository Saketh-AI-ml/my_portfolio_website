export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  leetcode?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  resumeUrl: string;
  socialLinks: SocialLinks;
  location: string;
  availableForWork: boolean;
  tagline: string;
  typingRoles: string[];
  experienceYears: number;
  projectsCount: number;
  clientsServed: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  images: string[];
  techStack: string[];
  category: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: "Languages" | "Frameworks" | "Tools" | "Databases" | "Cloud" | "Soft Skills" | string;
  icon: string;
  proficiency: number; // 0 - 100
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  logo: string; // Dynamic icon name or base64 or URL
  role: string;
  startDate: string;
  endDate: string;
  description: string[]; // Bullet points
  technologies: string[];
  location: string;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade: string;
  courses: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  photo: string;
  message: string;
  linkedIn?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown supported
  coverImage: string;
  tags: string[];
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface VisibleSections {
  hero: boolean;
  about: boolean;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  education: boolean;
  certifications: boolean;
  testimonials: boolean;
  github: boolean;
  blog: boolean;
  contact: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  ogImage: string;
  accentColor: string; // e.g., "#3b82f6" (indigo)
  visibleSections: VisibleSections;
  analyticsId: string;
  maintenanceMode: boolean;
  githubUsername: string;
}

export interface VisitorStats {
  pageViews: number;
  profileVisits: number;
  resumeDownloads: number;
  contactSubmissions: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  countryBreakdown: Record<string, number>;
}

export interface DBState {
  profile: UserProfile;
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  testimonials: Testimonial[];
  blogs: BlogPost[];
  messages: Message[];
  settings: SiteSettings;
  stats: VisitorStats;
}
