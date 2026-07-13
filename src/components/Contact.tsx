import React, { useState } from "react";
import { 
  Send, 
  Sparkles, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  CheckCircle2, 
  Terminal, 
  Briefcase 
} from "lucide-react";

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "Senior Android Developer",
    email: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please enter both your name and email to proceed.");
      return;
    }

    setFormSubmitted(true);
  };

  return (
    <div id="contact-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#080808] border border-white/10 rounded-none p-6 md:p-8 shadow-xl">
      
      {/* Narrative & Direct Connections panel (lg:col-span-5) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#111] border border-white/10 rounded-none text-white text-[10px] tracking-widest font-mono uppercase font-bold">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>05 // INITIATE TRANSMISSION</span>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
            Establish Connection
          </h3>
          <p className="text-sm text-white/60 leading-relaxed font-sans">
            Ready to bring senior Android architectural expertise, Compose declarative wizardry, and robust Kotlin Multiplatform (KMP) logic into your stack? Initiate direct communication pipelines or send an inquiry dispatch.
          </p>
        </div>

        {/* Direct Connections List */}
        <div className="space-y-3.5">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Core Directory Links</p>
          <div className="space-y-2">
            
            {/* Email link */}
            <a 
              href="mailto:devanshugulati1322@gmail.com"
              className="flex items-center justify-between p-3.5 rounded-none bg-black/40 hover:bg-[#111] border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-white/80">
                <Mail className="w-4 h-4 text-sky-400" />
                <span className="font-sans font-medium">devanshugulati1322@gmail.com</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-white/30 group-hover:text-white transition-colors uppercase tracking-widest">SEND EMAIL</span>
            </a>

            {/* Phone link */}
            <a 
              href="tel:7056697860"
              className="flex items-center justify-between p-3.5 rounded-none bg-black/40 hover:bg-[#111] border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-white/80">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="font-sans font-medium">+91 7056697860</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-white/30 group-hover:text-white transition-colors uppercase tracking-widest">CALL DIRECT</span>
            </a>

            {/* LinkedIn link */}
            <a 
              href="https://www.linkedin.com/in/devanshu-gulati-9b93932a3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-none bg-black/40 hover:bg-[#111] border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-white/80">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span className="font-sans font-medium truncate max-w-[200px] sm:max-w-none">devanshu-gulati-9b93932a3</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-white/30 group-hover:text-white transition-colors uppercase tracking-widest">CONNECT</span>
            </a>

            {/* GitHub link */}
            <a 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-none bg-black/40 hover:bg-[#111] border border-white/5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-white/80">
                <Github className="w-4 h-4 text-white/50" />
                <span className="font-sans font-medium">github.com/devanshugulati1322</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-white/30 group-hover:text-white transition-colors uppercase tracking-widest">REPOS</span>
            </a>

          </div>
        </div>

        <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
          DESIGNED FOR DESKTOP PRECISION & MOBILE RESPONSIVENESS • Gurugram, India UTC+5.5
        </div>
      </div>

      {/* Recruiter Submission inquiry form (lg:col-span-7) */}
      <div className="lg:col-span-7 bg-[#030303] border border-white/10 rounded-none p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />

        {formSubmitted ? (
          <div className="space-y-6 text-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-none bg-[#111] border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-black uppercase tracking-tight text-white font-sans">Pipeline Dispatch Successful!</h4>
              <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed font-sans">
                Thank you, {formData.name}. Your recruitment inquiry has been logged into my server network. Devanshu has received your notice and will respond to <strong className="text-white">{formData.email}</strong> shortly.
              </p>
            </div>

            {/* Fun terminal details */}
            <div className="bg-black/80 border border-white/10 p-3.5 rounded-none text-left max-w-sm mx-auto font-mono text-[9px] text-white/40 space-y-1 select-none">
              <div className="flex items-center space-x-1.5 text-white/60 border-b border-white/5 pb-1 mb-1 font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>TERMINAL RECRUIT_LOGS</span>
              </div>
              <p className="text-emerald-500 font-bold">&gt; PIPELINE INQUIRY REGISTERED SUCCESSFULLY</p>
              <p>&gt; COMPANY: {formData.company || "N/A"}</p>
              <p>&gt; ASSIGNED ROLE: {formData.role}</p>
              <p>&gt; DISPATCH_STATUS: SENT</p>
            </div>

            <button
              onClick={() => setFormSubmitted(false)}
              className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold hover:text-white transition-colors underline cursor-pointer"
            >
              DISPATCH NEW OFFER FORM
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <h4 className="text-lg font-black uppercase tracking-tight text-white font-sans flex items-center">
                <Sparkles className="w-4 h-4 text-indigo-400 mr-2" />
                <span>Recruiter Dispatch Panel</span>
              </h4>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest font-bold">Inquire for immediate developer availability</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">Your Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 focus:bg-black transition-colors font-sans"
                />
              </div>

              {/* Company name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. OpenAI"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 focus:bg-black transition-colors font-sans"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Target Role selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">Target Job Position</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-4 py-3 text-xs sm:text-sm text-gray-300 outline-none focus:border-indigo-500 focus:bg-black transition-colors cursor-pointer font-sans"
                >
                  <option>Senior Android Developer</option>
                  <option>Kotlin Multiplatform (KMP) Engineer</option>
                  <option>Full-Stack Mobile Developer</option>
                  <option>Android / Compose Contract Developer</option>
                  <option>Other / Tech Discussion</option>
                </select>
              </div>

              {/* Recruiter email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">Your Business Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. recruiter@company.com"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-none px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 focus:bg-black transition-colors font-sans"
                />
              </div>

            </div>

            {/* Offer details message text area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">Offer Details / Inquiry Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                placeholder="e.g. We loved your ChatSpark app and KMP IDE presentation! We would love to discuss an interview for our engineering team..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-none p-4 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 focus:bg-black transition-colors resize-none scrollbar-thin font-sans"
              />
            </div>

            {/* Submit Dispatch Button */}
            <button
              type="submit"
              className="w-full bg-white hover:bg-indigo-600 hover:text-white active:scale-[0.98] text-black font-bold uppercase text-xs tracking-widest px-6 py-4 rounded-none transition-all flex items-center justify-center space-x-2 font-mono"
            >
              <span>DISPATCH INQUIRY TO DEVANSHU</span>
              <Send className="w-4 h-4 fill-current" />
            </button>

          </form>
        )}

      </div>

    </div>
  );
}
