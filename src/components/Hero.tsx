import React from "react";
import { 
  ArrowUpRight, 
  Download, 
  Layers,
  MapPin,
  Mail,
  Smartphone
} from "lucide-react";

export default function Hero() {
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };


  return (
    <div className="relative py-12 md:py-20 flex flex-col items-center justify-center overflow-hidden border-b border-white/10">
      
      {/* Dynamic graphic backgrounds */}
      <div className="absolute -top-32 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero content cards stack */}
      <div className="w-full max-w-5xl px-4 flex flex-col items-center text-center space-y-10 z-10">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-950/40 border border-emerald-900/60 rounded-sm text-emerald-400 text-[10px] font-mono tracking-widest uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>AVAILABLE FOR IMMEDIATE HIRE & KMP CONTRACTS</span>
        </div>

        {/* Display Typography Header */}
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[105px] leading-[0.85] font-black uppercase tracking-tighter text-[#F5F5F5] font-sans">
            CREATING<br/>
            <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.8)" }}>FUTURISTIC</span><br/>
            ANDROID.
          </h1>
          <h2 className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold font-mono">
            Devanshu // Senior Android & Kotlin Multiplatform (KMP) Developer
          </h2>
        </div>

        {/* Core Credentials Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-wider font-bold text-white/60">
          <div className="flex items-center space-x-1.5 bg-[#080808] border border-white/10 px-4 py-2 rounded-sm">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Gurugram, India</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#080808] border border-white/10 px-4 py-2 rounded-sm">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <a href="mailto:devanshugulati1322@gmail.com" className="hover:text-indigo-400 transition-colors">devanshugulati1322@gmail.com</a>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#080808] border border-white/10 px-4 py-2 rounded-sm">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>+91 7056697860</span>
          </div>
        </div>

        {/* Narrative introduction paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-3xl leading-relaxed font-sans">
          Expert in <strong className="text-white">Kotlin Multiplatform</strong> and <strong className="text-white">Jetpack Compose</strong>. Building seamless cross-platform experiences with a focus on high-performance architectures, custom canvas 3D UI, and thread safety.
        </p>

        {/* Primary Action Buttons CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 w-full max-w-3xl">
          
          {/* Hire Me Scroll Action Button */}
          <button
            onClick={() => handleScrollToSection("contact-section")}
            className="w-full bg-white text-black text-center font-bold uppercase text-xs tracking-widest rounded-sm hover:bg-indigo-500 hover:text-white transition-all py-4.5"
          >
            HIRE ME IMMEDIATELY
          </button>

          {/* Code IDE Scroll button */}
          <button
            onClick={() => handleScrollToSection("workspace-section")}
            className="w-full border border-white/10 bg-[#0A0A0A] hover:border-indigo-500/50 hover:bg-[#080808] transition-all text-white text-xs uppercase tracking-widest font-bold rounded-sm py-4.5"
          >
            KMP WORKSPACE
          </button>

          {/* Resume Download Action */}
          <a
            href="https://drive.google.com/uc?export=download&id=1b_NyvgeyTTLX8dD1FzUweGhTP7i7HprH"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-white/10 bg-[#0A0A0A] hover:border-emerald-500/50 hover:bg-[#080808] transition-all text-emerald-400 text-xs uppercase tracking-widest font-bold rounded-sm py-4.5 flex items-center justify-center space-x-1.5"
            aria-label="Download CV Resume"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD CV RESUME</span>
          </a>
        </div>

        {/* Quick High-Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl pt-10 text-left">
          
          <div className="border border-white/10 bg-[#0A0A0A] p-6 rounded-sm flex flex-col justify-between hover:border-indigo-500/50 transition-all cursor-crosshair group">
            <h4 className="text-3xl font-black text-white">B.TECH</h4>
            <div>
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mt-2">Computer Science</p>
              <p className="text-[9px] text-white/40 mt-0.5">YMCA UST University</p>
            </div>
          </div>

          <div className="border border-white/10 bg-[#0A0A0A] p-6 rounded-sm flex flex-col justify-between hover:border-orange-500/50 transition-all cursor-crosshair group">
            <h4 className="text-3xl font-black text-white">99%</h4>
            <div>
              <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mt-2">Kotlin Crash-Free</p>
              <p className="text-[9px] text-white/40 mt-0.5">Clean Flow-State Setup</p>
            </div>
          </div>

          <div className="border border-white/10 bg-[#0A0A0A] p-6 rounded-sm flex flex-col justify-between hover:border-blue-500/50 transition-all cursor-crosshair group">
            <h4 className="text-3xl font-black text-white">MVVM</h4>
            <div>
              <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mt-2">Architecture Core</p>
              <p className="text-[9px] text-white/40 mt-0.5">Scalable Decoupled Logic</p>
            </div>
          </div>

          <div className="border border-white/10 bg-[#0A0A0A] p-6 rounded-sm flex flex-col justify-between hover:border-purple-500/50 transition-all cursor-crosshair group">
            <h4 className="text-3xl font-black text-indigo-400">RUNNER</h4>
            <div>
              <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mt-2">v0 Hackathon</p>
              <p className="text-[9px] text-white/40 mt-0.5">Electricity AI App</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}