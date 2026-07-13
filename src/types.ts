export interface Project {
  id: string;
  title: string;
  duration: string;
  description: string;
  details: string[];
  tech: string[];
  mockupType: "chat" | "reminder" | "hackathon";
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  details: string[];
  tech: string[];
}

export interface SkillNode {
  name: string;
  category: "language" | "framework" | "tool" | "backend" | "design";
  level: number; // 1-5
  color: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
}

export interface IdeFile {
  name: string;
  path: string;
  language: "kotlin" | "gradle" | "xml" | "json";
  content: string;
}
