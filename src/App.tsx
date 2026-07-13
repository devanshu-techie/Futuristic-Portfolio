import React, { useState } from "react";
import Hero from "./components/Hero";
import SkillsArena from "./components/SkillsArena";
import KmpPlayground from "./components/KmpPlayground";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import { 
  Laptop, 
  Layers, 
  MessageCircle, 
  PhoneCall, 
  Menu, 
  X,
  Code2,
  Sparkles,
  Award
} from "lucide-react";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSkillFromArena, setActiveSkillFromArena] = useState<string | null>(null);

  const handleSelectSkillFromArena = (skillName: string) => {
    setActiveSkillFromArena(skillName);
  };

  const handleScrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#050505] text-[#F5F5F5] min-h-screen font-sans selection:bg-indigo-600 selection:text-white flex flex-col border-[12px] border-[#111] antialiased">
      
      {/* Futuristic Floating Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#080808]/90 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand / Human Literal Label */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleScrollToSection("hero-section")}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-mono font-black text-lg shadow-lg shadow-indigo-500/20">
              D
            </div>
            <div>
              <span className="font-display font-black tracking-tight text-white hover:text-indigo-400 transition-colors text-sm sm:text-base">DEVANSHU</span>
              <div className="flex items-center text-[8px] font-mono text-emerald-400 mt-0.5 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                <span>KMP PIPELINE ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav anchors */}
          <nav className="hidden md:flex items-center space-x-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
            <button 
              onClick={() => handleScrollToSection("skills-section")}
              className="hover:text-white transition-colors"
            >
              01 SKILLS ARENA
            </button>
            <button 
              onClick={() => handleScrollToSection("workspace-section")}
              className="hover:text-white transition-colors"
            >
              02 KMP WORKSPACE
            </button>
            <button 
              onClick={() => handleScrollToSection("experience-section")}
              className="hover:text-white transition-colors"
            >
              03 EXPERIENCE & PROJECTS
            </button>
          </nav>

          {/* Contact Direct Action button */}
          <div className="hidden md:block">
            <button 
              onClick={() => handleScrollToSection("contact-section")}
              className="bg-white text-black font-display font-bold text-xs px-6 py-3 tracking-widest hover:bg-indigo-600 hover:text-white transition-colors uppercase"
            >
              DIRECT INQUIRY
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white/60 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#080808] border-b border-white/10 px-6 py-6 space-y-4 flex flex-col text-xs font-mono tracking-widest text-white/60">
            <button 
              onClick={() => handleScrollToSection("skills-section")}
              className="text-left hover:text-white py-2 border-b border-white/5"
            >
              01 SKILLS ARENA
            </button>
            <button 
              onClick={() => handleScrollToSection("workspace-section")}
              className="text-left hover:text-white py-2 border-b border-white/5"
            >
              02 KMP WORKSPACE
            </button>
            <button 
              onClick={() => handleScrollToSection("experience-section")}
              className="text-left hover:text-white py-2 border-b border-white/5"
            >
              03 EXPERIENCE & PROJECTS
            </button>
            <button 
              onClick={() => handleScrollToSection("contact-section")}
              className="bg-white text-black font-bold text-center py-3 tracking-widest hover:bg-indigo-600 hover:text-white transition-colors"
            >
              DIRECT INQUIRY
            </button>
          </div>
        )}
      </header>

      {/* Main content sections stack */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-12 space-y-32">
        
        {/* HERO HEADER SECTION */}
        <section id="hero-section" className="scroll-mt-24">
          <Hero />
        </section>

        {/* INTERACTIVE 3D SKILLS ARENA */}
        <section id="skills-section" className="scroll-mt-24 space-y-6">
          <div className="border-t border-white/10 pt-20">
            <SkillsArena onSelectSkill={handleSelectSkillFromArena} />
          </div>
        </section>

        {/* KMP WORKSPACE PLAYGROUND SECTION */}
        <section id="workspace-section" className="scroll-mt-24 space-y-6">
          <div className="border-t border-white/10 pt-20">
            <KmpPlayground />
          </div>
        </section>

        {/* EXPERIENCE & PROJECT TIMELINE SECTION */}
        <section id="experience-section" className="scroll-mt-24 space-y-6">
          <div className="border-t border-white/10 pt-20">
            <Experience />
          </div>
        </section>

        {/* DIRECT PIPELINE CONTACT FORM SECTION */}
        <section id="contact-section" className="scroll-mt-24 space-y-6 pb-16">
          <div className="border-t border-white/10 pt-20">
            <Contact />
          </div>
        </section>

      </main>

      {/* Beautiful structural footer */}
      <footer className="bg-[#080808] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest font-bold text-white/40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            <span>© 2026 DEVANSHU • VERIFIED KOTLIN CORE</span>
          </div>
          
          <div className="flex items-center space-x-1 italic text-white/20">
            <span>PORTFOLIO VERSION 4.0 // 2026</span>
          </div>

          <div className="flex items-center space-x-4 text-white/60">
            <a href="mailto:devanshugulati1322@gmail.com" className="hover:text-indigo-400 transition-colors">EMAIL</a>
            <span>•</span>
            <a href="tel:7056697860" className="hover:text-indigo-400 transition-colors">PHONE</a>
            <span>•</span>
            <a href="https://www.linkedin.com/in/devanshu-gulati-9b93932a3" target="_blank" rel="noopener" className="hover:text-indigo-400 transition-colors">LINKEDIN</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
