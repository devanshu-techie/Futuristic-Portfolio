import React, { useState } from "react";
import { Project, ExperienceItem } from "../types";
import { 
  Briefcase, 
  Calendar, 
  FolderGit, 
  Award, 
  Layers, 
  MessageCircle, 
  ShoppingCart,
  Zap,
  Check,
  Plus,
  Trash2,
  Send,
  Terminal,
  Database,
  Smartphone,
  Activity,
  Sparkles
} from "lucide-react";

export default function Experience() {
  const [activeProjectTab, setActiveProjectTab] = useState<string>("chat");

  // ChatSpark states
  const [chatSubTab, setChatSubTab] = useState<"live" | "schema">("live");
  const [chatMockMessages, setChatMockMessages] = useState([
    { id: 1, sender: "Sarah (Hiring Manager)", text: "Hey Devanshu! Checked your ChatSpark architecture. Outstanding MVVM structure!", time: "10:14 AM", isMe: false },
    { id: 2, sender: "You", text: "Thank you Sarah! It uses Flow-based streams and Firebase Firestore real-time listeners.", time: "10:15 AM", isMe: true },
    { id: 3, sender: "Sarah (Hiring Manager)", text: "Perfect. When are you available to join our team?", time: "10:15 AM", isMe: false },
  ]);
  const [chatMockInput, setChatMockInput] = useState("");
  const [chatIsTyping, setChatIsTyping] = useState(false);

  // Shopping Reminder states
  const [reminderSubTab, setReminderSubTab] = useState<"live" | "sqlite">("live");
  const [reminderMockItems, setReminderMockItems] = useState([
    { id: 1, name: "Kotlin Multiplatform Guide", qty: 2, priority: "High" as const, completed: false },
    { id: 2, name: "Premium Espresso Beans", qty: 1, priority: "Medium" as const, completed: true },
  ]);
  const [reminderMockInput, setReminderMockInput] = useState("");
  const [reminderMockPriority, setReminderMockPriority] = useState<"High" | "Medium" | "Low">("High");
  const [sqliteLogs, setSqliteLogs] = useState<string[]>([
    "// SQLite Database initial connection established successfully via Room ORM",
    "SELECT * FROM reminders WHERE completed = 0 ORDER BY priority_level DESC;",
    "Query Executed in 1.2ms. Loaded 2 rows."
  ]);

  // Hackathon tracker states
  const [hackathonMonth, setHackathonMonth] = useState<"June" | "July" | "August">("July");
  const [forecastActive, setForecastActive] = useState<boolean>(true);
  const [rateTier, setRateTier] = useState<"Standard" | "Municipal Saver">("Municipal Saver");

  const handleSendChatMockMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMockInput.trim()) return;
    const userMsg = {
      id: Date.now(),
      sender: "You",
      text: chatMockInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setChatMockMessages(prev => [...prev, userMsg]);
    setChatMockInput("");
    setChatIsTyping(true);

    setTimeout(() => {
      setChatMockMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "Sarah (Hiring Manager)",
        text: "That sounds excellent! Let's schedule a technical review. Please reach out to me at devanshugulati1322@gmail.com!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }]);
      setChatIsTyping(false);
    }, 1500);
  };

  const handleAddReminderMockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderMockInput.trim()) return;
    const newItem = {
      id: Date.now(),
      name: reminderMockInput,
      qty: 1,
      priority: reminderMockPriority,
      completed: false
    };
    setReminderMockItems(prev => [...prev, newItem]);
    setReminderMockInput("");

    // Log simulated SQLite statement
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setSqliteLogs(prev => [
      `[${timestamp}] INSERT INTO reminders (name, qty, priority, completed) VALUES ('${newItem.name}', 1, '${newItem.priority}', 0);`,
      `[${timestamp}] Query Executed in 0.8ms. Cache invalidated, Row ID: ${newItem.id}`,
      ...prev
    ]);
  };

  const handleToggleReminderCompleted = (id: number, name: string, currentStatus: boolean) => {
    setReminderMockItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setSqliteLogs(prev => [
      `[${timestamp}] UPDATE reminders SET completed = ${currentStatus ? 0 : 1} WHERE id = ${id};`,
      `[${timestamp}] Transaction committed. Live Flow<List<Reminder>> re-emitted with updated state.`,
      ...prev
    ]);
  };

  const handleDeleteReminderMockItem = (id: number, name: string) => {
    setReminderMockItems(prev => prev.filter(item => item.id !== id));
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setSqliteLogs(prev => [
      `[${timestamp}] DELETE FROM reminders WHERE id = ${id};`,
      `[${timestamp}] Database sync: Row deleted.`,
      ...prev
    ]);
  };

  const experience: ExperienceItem[] = [
    {
      company: "Helping Geeks",
      role: "Android Developer",
      duration: "Jan 2026 – Present",
      details: [
        "Developed and maintained full-stack Android applications using Kotlin and Jetpack Compose.",
        "Built scalable and responsive mobile applications following MVVM Architecture and modern Android development practices.",
        "Integrated REST APIs, Firebase services, and local databases to deliver production-ready features.",
        "Collaborated with senior developers in debugging, testing, code reviews, and feature implementation.",
        "Gained hands-on experience with the complete Software Development Life Cycle (SDLC), Git/GitHub workflows, and industry-standard development practices."
      ],
      tech: ["Kotlin", "Jetpack Compose", "MVVM", "Firebase", "Room DB", "REST APIs", "Git"]
    }
  ];

  const projects: Project[] = [
    {
      id: "chat",
      title: "ChatSpark",
      duration: "Feb 2025 – July 2026",
      description: "A complete, WhatsApp-style real-time chatting application designed with Kotlin, Jetpack Compose, and Firebase services.",
      details: [
        "Built a WhatsApp-style Android application using Kotlin and Jetpack Compose.",
        "Implemented secure Firebase Authentication, Firestore real-time synchronization, Cloud Storage for media assets, and Firebase Cloud Messaging (FCM) for push notifications.",
        "Developed custom messaging flows including media sharing (images/videos), user online status tracking, and active typing indicators.",
        "Followed MVVM Architecture and modern Android development guidelines with modularized packaging for maximum performance and test coverage."
      ],
      tech: ["Kotlin", "Jetpack Compose", "Firebase Auth", "Firestore", "Cloud Storage", "FCM", "Coroutines", "MVVM"],
      mockupType: "chat"
    },
    {
      id: "reminder",
      title: "Shopping Reminder App",
      duration: "Aug 2024 – Dec 2024",
      description: "A modern, responsive utility application ensuring efficient local storage caching, reminders, and user-centric list curation.",
      details: [
        "Developed a Shopping Reminder App using Kotlin and Jetpack Compose with a modern, responsive UI.",
        "Implemented Room Database with SQLite for robust offline persistence and instant synchronization upon reconnecting.",
        "Added advanced task scheduling and system-level alarms/notifications to improve user productivity and experience.",
        "Built the application using MVVM Architecture with a focus on clean code, SOLID principles, and optimal thread concurrency."
      ],
      tech: ["Kotlin", "Jetpack Compose", "Room Database", "Material 3", "Navigation Compose", "Alarms SDK"],
      mockupType: "reminder"
    },
    {
      id: "hackathon",
      title: "Electricity Bill Tracker",
      duration: "Vercel v0 Hackathon Runner-up",
      description: "A real-time energy consumption analytics and electricity bill tracking application that won runner-up honors.",
      details: [
        "Won Runner-up honors in the prestigious Vercel v0 AI Hackathon for developing an Electricity Bill Tracking web application.",
        "Coordinated the hackathon team and contributed to building the project using Vercel v0 AI, focusing on functionality, high-fidelity UI, and project delivery under strict constraints.",
        "Created beautiful data visualizers depicting cost trajectories, municipal energy rate thresholds, and smart saving alerts."
      ],
      tech: ["Vercel v0 AI", "React", "TypeScript", "Tailwind CSS", "Recharts", "AI Copilot"],
      mockupType: "hackathon"
    }
  ];

  return (
    <div className="space-y-16">
      
      {/* Experience Section */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#111] border border-white/10 rounded-none text-white text-[10px] tracking-widest font-mono uppercase font-bold">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>03 // PROFESSIONAL TIMELINE</span>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
            Work Experience
          </h3>
        </div>

        <div className="space-y-6">
          {experience.map((exp, idx) => (
            <div 
              key={idx} 
              className="bg-[#080808] border border-white/10 rounded-none p-6 md:p-8 space-y-6 hover:border-white/20 transition-all shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase text-white tracking-tight">{exp.role}</h4>
                  <p className="text-xs text-indigo-400 tracking-wider font-bold font-mono uppercase">{exp.company}</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-mono uppercase font-bold tracking-widest text-white/50 bg-[#111] px-3.5 py-2 rounded-none border border-white/10 self-start md:self-center">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{exp.duration}</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-white/60 leading-relaxed list-none pl-0">
                {exp.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start">
                    <span className="text-indigo-500 mr-3 select-none font-bold mt-0.5">//</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2 pt-2">
                {exp.tech.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="text-[9px] font-mono bg-[#111] text-white/60 border border-white/10 px-2.5 py-1 rounded-none uppercase font-bold tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Showcase section */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#111] border border-white/10 rounded-none text-white text-[10px] tracking-widest font-mono uppercase font-bold">
            <FolderGit className="w-3.5 h-3.5 text-indigo-500" />
            <span>04 // FEATURED PROJECTS</span>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
            Production-Ready Projects
          </h3>
          <p className="text-sm text-white/60 max-w-2xl font-sans">
            A deeper look into engineered mobile and web products. Toggle the project tabs to load statistics, design breakdowns, and accomplishments.
          </p>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex flex-wrap bg-[#050505] border border-white/10 p-1 rounded-none w-full max-w-lg">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setActiveProjectTab(proj.id)}
              className={`flex-1 min-w-[120px] py-3 rounded-none text-[10px] font-mono font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
                activeProjectTab === proj.id 
                  ? "bg-white text-black font-black" 
                  : "text-white/40 hover:text-white"
              }`}
            >
              {proj.id === "chat" && <MessageCircle className="w-3.5 h-3.5" />}
              {proj.id === "reminder" && <ShoppingCart className="w-3.5 h-3.5" />}
              {proj.id === "hackathon" && <Award className="w-3.5 h-3.5" />}
              <span>{proj.title}</span>
            </button>
          ))}
        </div>

        {/* Active Project Card details */}
        {projects.filter(p => p.id === activeProjectTab).map((proj) => (
          <div 
            key={proj.id} 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#080808] border border-white/10 rounded-none p-6 md:p-8 items-center shadow-xl hover:border-white/20 transition-all"
          >
            {/* Project textual narrative (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white font-sans">
                    {proj.title}
                  </h4>
                  {proj.id === "hackathon" && (
                    <span className="bg-[#111] border border-white/10 text-amber-400 text-[9px] font-mono px-3 py-1.5 rounded-none flex items-center uppercase font-bold tracking-widest">
                      <Award className="w-3.5 h-3.5 mr-1 text-amber-400 animate-pulse" />
                      RUNNER-UP AWARD
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{proj.duration}</span>
                </div>
              </div>

              <p className="text-sm text-indigo-200/80 font-medium leading-relaxed font-sans">
                {proj.description}
              </p>

              <div className="space-y-3.5 pt-4 border-t border-white/5">
                <h5 className="text-[10px] font-mono uppercase font-black tracking-widest text-white/50">Core Technical Accomplishments:</h5>
                <ul className="space-y-3 text-xs text-white/60 leading-relaxed list-none pl-0 font-sans">
                  {proj.details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start">
                      <span className="text-indigo-500 mr-2.5 font-bold select-none">//</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {proj.tech.map((tag, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="text-[9px] font-mono bg-[#111] text-white/50 border border-white/5 px-2.5 py-1 rounded-none uppercase font-bold tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* High fidelity dynamic mockup preview block (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col bg-black border border-white/10 rounded-none relative overflow-hidden h-[440px] shadow-inner select-none">
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none" />

              {/* ChatSpark Mockup display */}
              {proj.id === "chat" && (
                <div className="w-full flex flex-col h-full justify-between p-4">
                  {/* Tabs inside mock */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest font-bold">ChatSpark.apk</span>
                    </div>
                    <div className="flex bg-[#111] p-0.5 border border-white/5">
                      <button 
                        onClick={() => setChatSubTab("live")}
                        className={`px-2 py-1 text-[8px] font-mono font-black uppercase tracking-wider transition-all ${chatSubTab === "live" ? "bg-indigo-600 text-white" : "text-white/40"}`}
                      >
                        Live Simulator
                      </button>
                      <button 
                        onClick={() => setChatSubTab("schema")}
                        className={`px-2 py-1 text-[8px] font-mono font-black uppercase tracking-wider transition-all ${chatSubTab === "schema" ? "bg-indigo-600 text-white" : "text-white/40"}`}
                      >
                        MVVM Data
                      </button>
                    </div>
                  </div>

                  {chatSubTab === "live" ? (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      {/* Active conversation bubble stream */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-text scrollbar-thin max-h-[290px]">
                        {chatMockMessages.map((msg) => (
                          <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
                            <div className="text-[7px] text-white/30 font-mono mb-0.5">{msg.sender}</div>
                            <div className={`p-2 text-[10px] leading-snug max-w-[85%] border ${msg.isMe ? "bg-[#111] border-white/10 text-indigo-200" : "bg-zinc-900/60 border-white/5 text-white/90"}`}>
                              {msg.text}
                            </div>
                            <span className="text-[6px] text-white/20 mt-0.5 font-mono">{msg.time}</span>
                          </div>
                        ))}
                        {chatIsTyping && (
                          <div className="flex items-center space-x-1 text-[8px] font-mono text-indigo-400/60">
                            <span className="animate-bounce">●</span>
                            <span className="animate-bounce [animation-delay:0.2s]">●</span>
                            <span className="animate-bounce [animation-delay:0.4s]">●</span>
                            <span className="text-[7px] ml-1">Sarah is typing...</span>
                          </div>
                        )}
                      </div>

                      {/* Mini form to submit message */}
                      <form onSubmit={handleSendChatMockMessage} className="mt-2 pt-2 border-t border-white/10 flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={chatMockInput}
                          onChange={(e) => setChatMockInput(e.target.value)}
                          placeholder="Type simulated msg..."
                          className="flex-1 bg-[#0a0a0a] border border-white/10 px-2 py-1.5 text-[10px] text-white outline-none focus:border-indigo-500 font-sans"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 p-1.5 text-white">
                          <Send className="w-3 h-3 fill-current" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center space-y-2">
                      <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest text-center border-b border-white/5 pb-1 mb-1">
                        Jetpack Compose State Binding Model
                      </div>
                      
                      <div className="bg-[#080808] border border-white/10 p-2 text-center relative group">
                        <p className="text-[8px] font-mono text-indigo-400 font-black uppercase tracking-wider">UI VIEW (Jetpack Compose)</p>
                        <p className="text-[7px] text-white/40 font-mono mt-0.5">ChatSparkScreen.kt (Reactive Composable)</p>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-3 bg-indigo-500/30"></div>
                      </div>

                      <div className="bg-[#111] border border-white/10 p-2 text-center">
                        <p className="text-[8px] font-mono text-emerald-400 font-black uppercase tracking-wider">VIEWMODEL (Kotlin Flow)</p>
                        <p className="text-[7px] text-white/40 font-mono mt-0.5">ChatViewModel.kt (StateFlow state holder)</p>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-3 bg-indigo-500/30"></div>
                      </div>

                      <div className="bg-[#080808] border border-white/10 p-2 text-center">
                        <p className="text-[8px] font-mono text-white/60 font-black uppercase tracking-wider">REPOSITORY & FIREBASE CORE</p>
                        <p className="text-[7px] text-indigo-300 font-mono mt-0.5">ChatRepository.kt (Firestore real-time streams)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shopping Reminder App Mockup display */}
              {proj.id === "reminder" && (
                <div className="w-full flex flex-col h-full justify-between p-4">
                  {/* Tabs inside mock */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest font-bold">Room_Database.sqlite</span>
                    </div>
                    <div className="flex bg-[#111] p-0.5 border border-white/5">
                      <button 
                        onClick={() => setReminderSubTab("live")}
                        className={`px-2 py-1 text-[8px] font-mono font-black uppercase tracking-wider transition-all ${reminderSubTab === "live" ? "bg-indigo-600 text-white" : "text-white/40"}`}
                      >
                        Live Cache DB
                      </button>
                      <button 
                        onClick={() => setReminderSubTab("sqlite")}
                        className={`px-2 py-1 text-[8px] font-mono font-black uppercase tracking-wider transition-all ${reminderSubTab === "sqlite" ? "bg-indigo-600 text-white" : "text-white/40"}`}
                      >
                        SQLite Console
                      </button>
                    </div>
                  </div>

                  {reminderSubTab === "live" ? (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      {/* Interactive Shopping Items List */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[290px] scrollbar-thin">
                        {reminderMockItems.length === 0 ? (
                          <div className="text-center py-8 text-[10px] text-white/30 font-mono">
                            No cached SQLite items. Add below.
                          </div>
                        ) : (
                          reminderMockItems.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between p-2 bg-[#080808] border border-white/5 hover:border-white/10 group transition-all"
                            >
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleToggleReminderCompleted(item.id, item.name, item.completed)}
                                  className={`w-4 h-4 border flex items-center justify-center transition-all ${item.completed ? "bg-indigo-600 border-indigo-500 text-white" : "border-white/20 hover:border-white/40"}`}
                                >
                                  {item.completed && <Check className="w-3 h-3" />}
                                </button>
                                <span className={`text-[10px] font-sans ${item.completed ? "line-through text-white/30" : "text-white/80"}`}>
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[7px] font-mono uppercase px-1.5 py-0.5 border ${
                                  item.priority === "High" 
                                    ? "bg-red-950/20 text-red-400 border-red-900/40" 
                                    : item.priority === "Medium"
                                    ? "bg-amber-950/20 text-amber-400 border-amber-900/40"
                                    : "bg-emerald-950/20 text-emerald-400 border-emerald-900/40"
                                }`}>
                                  {item.priority}
                                </span>
                                <button 
                                  onClick={() => handleDeleteReminderMockItem(item.id, item.name)}
                                  className="text-white/30 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add item interactive inputs */}
                      <form onSubmit={handleAddReminderMockItem} className="mt-2 pt-2 border-t border-white/10 flex items-center space-x-1.5">
                        <input
                          type="text"
                          required
                          value={reminderMockInput}
                          onChange={(e) => setReminderMockInput(e.target.value)}
                          placeholder="Add list item cache..."
                          className="flex-1 bg-[#0a0a0a] border border-white/10 px-2 py-1.5 text-[10px] text-white outline-none focus:border-indigo-500 font-sans"
                        />
                        <select 
                          value={reminderMockPriority}
                          onChange={(e) => setReminderMockPriority(e.target.value as any)}
                          className="bg-[#111] border border-white/10 text-[9px] text-white/80 p-1.5 outline-none font-mono"
                        >
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 p-1.5 text-white">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="text-[7px] font-mono text-emerald-400 mb-1 flex items-center justify-between border-b border-white/5 pb-1">
                        <span>ROOM SQLITE TRANSACTION LOG STREAM</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      </div>
                      <div className="flex-1 bg-black/60 border border-white/5 p-2 font-mono text-[8px] text-emerald-500/70 overflow-y-auto space-y-1.5 select-text scrollbar-thin">
                        {sqliteLogs.map((log, idx) => (
                          <div key={idx} className={`${log.startsWith("//") ? "text-indigo-400/60" : "text-emerald-400"}`}>
                            &gt; {log}
                          </div>
                        ))}
                      </div>
                      <div className="text-[7px] font-mono text-white/20 mt-1 uppercase text-center">
                        Toggle or Add items in 'Live Cache DB' to stream SQLite commands.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hackathon tracker Mockup display */}
              {proj.id === "hackathon" && (
                <div className="w-full flex flex-col h-full justify-between p-4">
                  {/* Mock dashboard controls */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest font-bold">Electricity Bill Tracker</span>
                    </div>
                    {/* Month selector */}
                    <div className="flex bg-[#111] p-0.5 border border-white/5">
                      {(["June", "July", "August"] as const).map((m) => (
                        <button 
                          key={m}
                          onClick={() => setHackathonMonth(m)}
                          className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider transition-all ${hackathonMonth === m ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-white/30 hover:text-white"}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Energy Chart & Analytics visualization */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* SVG Interactive Chart representing power consumption */}
                    <div className="relative flex-1 bg-zinc-950/40 border border-white/5 p-3 flex flex-col justify-between">
                      {/* Metric summary numbers */}
                      <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[7px] font-mono text-white/30 block uppercase font-bold">Usage Cache</span>
                          <span className="text-xs font-mono font-black text-white">
                            {hackathonMonth === "June" ? "290 kWh" : hackathonMonth === "July" ? "410 kWh" : "330 kWh"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[7px] font-mono text-white/30 block uppercase font-bold">Standard Cost</span>
                          <span className="text-xs font-mono font-black text-red-400">
                            {hackathonMonth === "June" ? "$45.00" : hackathonMonth === "July" ? "$72.00" : "$58.00"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[7px] font-mono text-white/30 block uppercase font-bold">Saver Rate</span>
                          <span className="text-xs font-mono font-black text-emerald-400">
                            {hackathonMonth === "June" ? "$32.00" : hackathonMonth === "July" ? "$48.00" : "$38.00"}
                          </span>
                        </div>
                      </div>

                      {/* SVG Bar Graphs */}
                      <div className="flex-1 flex items-end justify-around h-[120px] pt-4 relative">
                        {/* Threshold ceiling alert line */}
                        <div className="absolute top-[30%] left-0 right-0 border-t border-dashed border-red-500/20 flex justify-between px-1 pointer-events-none">
                          <span className="text-[6px] font-mono text-red-500/40 uppercase font-bold">Alert Threshold (350 kWh)</span>
                        </div>

                        {/* Standard Rate Bar */}
                        <div className="flex flex-col items-center space-y-1.5 w-[30%]">
                          <span className="text-[8px] font-mono text-red-400 font-bold">
                            {hackathonMonth === "June" ? "340kWh" : hackathonMonth === "July" ? "480kWh" : "390kWh"}
                          </span>
                          <div 
                            className="w-full bg-gradient-to-t from-red-950/40 to-red-600/40 border border-red-500/20 transition-all duration-500"
                            style={{ 
                              height: `${hackathonMonth === "June" ? 70 : hackathonMonth === "July" ? 100 : 85}px` 
                            }}
                          />
                          <span className="text-[7px] font-mono text-white/40 uppercase font-bold">Standard</span>
                        </div>

                        {/* Municipal Saver Rate Bar */}
                        <div className="flex flex-col items-center space-y-1.5 w-[30%]">
                          <span className="text-[8px] font-mono text-emerald-400 font-bold">
                            {hackathonMonth === "June" ? "290kWh" : hackathonMonth === "July" ? "410kWh" : "330kWh"}
                          </span>
                          <div 
                            className="w-full bg-gradient-to-t from-emerald-950/40 to-emerald-500/40 border border-emerald-500/20 transition-all duration-500"
                            style={{ 
                              height: `${hackathonMonth === "June" ? 55 : hackathonMonth === "July" ? 85 : 70}px` 
                            }}
                          />
                          <span className="text-[7px] font-mono text-white/40 uppercase font-bold">Saver Rate</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive sliders or controls below chart */}
                    <div className="mt-2.5 p-2 bg-[#050505] border border-white/10 flex items-center justify-between text-[8px] font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        <span className="text-white/60 font-bold uppercase">HACKATHON CALCULATIONS ACTIVE</span>
                      </div>
                      <div className="text-amber-400 font-black">
                        SAVINGS DIFFERENTIAL: {hackathonMonth === "June" ? "$13.00 (28%)" : hackathonMonth === "July" ? "$24.00 (33%)" : "$20.00 (34%)"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
