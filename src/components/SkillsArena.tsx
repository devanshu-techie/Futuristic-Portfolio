import React, { useEffect, useRef, useState } from "react";
import { SkillNode } from "../types";
import { 
  Sparkles, 
  HelpCircle, 
  Code2, 
  Cpu, 
  Smartphone, 
  Layers, 
  Database, 
  Workflow, 
  Flame, 
  Network, 
  GitBranch, 
  Figma 
} from "lucide-react";

interface SkillsArenaProps {
  onSelectSkill: (skillName: string) => void;
}

export default function SkillsArena({ onSelectSkill }: SkillsArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);
  
  // Angle rotation state
  const angleXRef = useRef(0.003);
  const angleYRef = useRef(0.005);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<SkillNode | null>(null);

  // Initialize skills list matching Devanshu's profile
  const nodesRef = useRef<SkillNode[]>([
    { name: "Kotlin", category: "language", level: 5, color: "#7F52FF", x: -120, y: -60, z: 40, vx: 0, vy: 0, vz: 0, radius: 45 },
    { name: "Java", category: "language", level: 4, color: "#ED8B00", x: 120, y: 80, z: -40, vx: 0, vy: 0, vz: 0, radius: 40 },
    { name: "Jetpack Compose", category: "framework", level: 5, color: "#4285F4", x: -40, y: 120, z: -80, vx: 0, vy: 0, vz: 0, radius: 48 },
    { name: "KMP (Multiplatform)", category: "framework", level: 4, color: "#31A8FF", x: 60, y: -110, z: 80, vx: 0, vy: 0, vz: 0, radius: 46 },
    { name: "Android SDK", category: "framework", level: 5, color: "#3DDC84", x: -100, y: 40, z: -100, vx: 0, vy: 0, vz: 0, radius: 46 },
    { name: "Firebase", category: "backend", level: 5, color: "#FFCA28", x: 110, y: -40, z: -120, vx: 0, vy: 0, vz: 0, radius: 44 },
    { name: "Room Database", category: "framework", level: 4, color: "#2B579A", x: -60, y: -130, z: -30, vx: 0, vy: 0, vz: 0, radius: 40 },
    { name: "Cloud APIs", category: "backend", level: 4, color: "#8E75FF", x: 140, y: -100, z: 10, vx: 0, vy: 0, vz: 0, radius: 42 },
    { name: "REST APIs", category: "backend", level: 5, color: "#00B0FF", x: -130, y: 130, z: 90, vx: 0, vy: 0, vz: 0, radius: 42 },
    { name: "Git & GitHub", category: "tool", level: 5, color: "#F05032", x: 80, y: 110, z: 130, vx: 0, vy: 0, vz: 0, radius: 38 },
    { name: "Figma", category: "design", level: 4, color: "#F24E1E", x: -10, y: -20, z: 140, vx: 0, vy: 0, vz: 0, radius: 38 },
    { name: "Coroutines", category: "framework", level: 5, color: "#1565C0", x: -150, y: -120, z: -110, vx: 0, vy: 0, vz: 0, radius: 40 },
  ]);

  // Skill descriptive texts for tooltips
  const skillDetails: Record<string, { desc: string; exp: string }> = {
    "Kotlin": { desc: "Primary language for Android & multiplatform.", exp: "Deeply experienced in syntax, safety, scoping, and extensions." },
    "Java": { desc: "Classic backend and legacy Android core.", exp: "Solid command over JVM structures, concurrency, and OOP principles." },
    "Jetpack Compose": { desc: "Modern declarative Android UI toolkit.", exp: "Expertise in State Management, custom canvas, animations, and custom styling." },
    "KMP (Multiplatform)": { desc: "Sharing core Kotlin logic across platforms.", exp: "Architected Shared Business Logic modules for Android/iOS with expected/actual." },
    "Android SDK": { desc: "Comprehensive system services framework.", exp: "Proficient in Services, Broadcast Receivers, WorkManager, and system components." },
    "Firebase": { desc: "Cloud infrastructure for mobile applications.", exp: "Integrated real-time Firestore, FCM push updates, Auth, and Storage." },
    "Room Database": { desc: "Reactive local SQL database wrapper.", exp: "Designed SQLite database schemas, migrations, relations, and Flow bindings." },
    "Cloud APIs": { desc: "Intelligent backend integration services.", exp: "Built reliable, scalable API connections for mobile and web platforms." },
    "REST APIs": { desc: "Hypermedia client-server connectivity.", exp: "Built high-performance connections using Retrofit, OkHttp, and serialization." },
    "Git & GitHub": { desc: "Comprehensive collaborative workflow.", exp: "Fluent in CI/CD pipelines, multi-developer branch strategies, and reviews." },
    "Figma": { desc: "High-fidelity vector graphic & UI designer.", exp: "Created mobile mockups, vector illustrations, and developer specifications." },
    "Coroutines": { desc: "Asynchronous, non-blocking flow model.", exp: "Designed multithreaded pipelines with StateFlow, SharedFlow, and dispatchers." },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Handle Resize
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight || 500;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    // Scale details based on viewport
    const getViewportRadiusMultiplier = () => {
      if (width < 640) return 0.7; // smaller nodes on mobile
      if (width < 1024) return 0.85;
      return 1;
    };

    // Game loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const perspective = 400;
      const radiusMult = getViewportRadiusMultiplier();

      // Current rotation matrices values
      const cosX = Math.cos(angleXRef.current);
      const sinX = Math.sin(angleXRef.current);
      const cosY = Math.cos(angleYRef.current);
      const sinY = Math.sin(angleYRef.current);

      // 1. Physics update & 3D rotation
      nodesRef.current.forEach((node) => {
        // If not being dragged, apply natural rotation
        if (draggedNodeRef.current !== node) {
          // Rotate around Y axis (horizontal)
          const x1 = node.x * cosY - node.z * sinY;
          const z1 = node.z * cosY + node.x * sinY;

          // Rotate around X axis (vertical)
          const y2 = node.y * cosX - z1 * sinX;
          const z2 = z1 * cosX + node.y * sinX;

          node.x = x1;
          node.y = y2;
          node.z = z2;
        }

        // Apply visual drift bound checks to keep inside reasonable sphere boundary
        const dist = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
        if (dist > 180) {
          const ratio = 180 / dist;
          node.x *= ratio;
          node.y *= ratio;
          node.z *= ratio;
        }
      });

      // 2. Sort nodes by depth (Z index) so back nodes are drawn first
      const sortedNodes = [...nodesRef.current].sort((a, b) => b.z - a.z);

      // 3. Draw connection fibers (tech web aura)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < sortedNodes.length; i++) {
        for (let j = i + 1; j < sortedNodes.length; j++) {
          const nodeA = sortedNodes[i];
          const nodeB = sortedNodes[j];

          // Compute distance
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const dz = nodeA.z - nodeB.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist < 190) {
            // Projected screen coordinates
            const scaleA = perspective / (perspective + nodeA.z);
            const screenXA = centerX + nodeA.x * scaleA;
            const screenYA = centerY + nodeA.y * scaleA;

            const scaleB = perspective / (perspective + nodeB.z);
            const screenXB = centerX + nodeB.x * scaleB;
            const screenYB = centerY + nodeB.y * scaleB;

            // Opacity is higher for closer connections, and lower if further
            const avgZ = (nodeA.z + nodeB.z) / 2;
            const depthFactor = (perspective - avgZ) / (2 * perspective);
            const alpha = Math.max(0.02, Math.min(0.2, (1 - dist / 190) * depthFactor));

            ctx.strokeStyle = `rgba(138, 180, 248, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(screenXA, screenYA);
            ctx.lineTo(screenXB, screenYB);
            ctx.stroke();
          }
        }
      }

      // 4. Draw node bubbles
      sortedNodes.forEach((node) => {
        const scale = perspective / (perspective + node.z);
        const screenX = centerX + node.x * scale;
        const screenY = centerY + node.y * scale;

        // Visual properties based on depth and hover
        const isHovered = hoveredNode?.name === node.name;
        const sizeMult = isHovered ? 1.3 : 1.0;
        const drawRadius = node.radius * scale * sizeMult * radiusMult;

        // Depth dimming factor
        const alpha = Math.max(0.15, Math.min(1.0, (perspective - node.z) / (perspective + 150)));

        // Glow ring if hovered
        if (isHovered) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = node.color;
        } else {
          ctx.shadowBlur = 5;
          ctx.shadowColor = "rgba(0,0,0,0.3)";
        }

        // Draw outer bubble circle gradient
        const grad = ctx.createRadialGradient(
          screenX - drawRadius * 0.3, 
          screenY - drawRadius * 0.3, 
          drawRadius * 0.1, 
          screenX, 
          screenY, 
          drawRadius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.45 * alpha})`);
        grad.addColorStop(0.3, `${node.color}cc`);
        grad.addColorStop(1, `rgba(10, 15, 30, ${0.85 * alpha})`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, drawRadius, 0, Math.PI * 2);
        ctx.fill();

        // White border ring with adaptive depth opacity
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * alpha})`;
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, drawRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Clear shadow effects for clean text rendering
        ctx.shadowBlur = 0;

        // Text labels inside node
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
        
        // Dynamic font size
        const fontSize = Math.max(8, Math.round(11 * scale * (isHovered ? 1.15 : 1) * radiusMult));
        ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw Logo Icon or initials inside circle
        const iconOffset = drawRadius * 0.2;
        ctx.fillText(node.name, screenX, screenY + iconOffset);

        // Category indicator or rating dots
        if (drawRadius > 25) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * alpha})`;
          ctx.font = `${Math.round(fontSize * 0.7)}px "JetBrains Mono", monospace`;
          ctx.fillText(node.category.toUpperCase(), screenX, screenY - drawRadius * 0.35);

          // Star level indicators
          const dotsCount = node.level;
          const dotRadius = Math.max(1, 2 * scale * radiusMult);
          const dotSpacing = Math.max(4, 6 * scale * radiusMult);
          const startX = screenX - ((dotsCount - 1) * dotSpacing) / 2;
          
          for (let d = 0; d < dotsCount; d++) {
            ctx.fillStyle = d < node.level ? `rgba(255, 202, 40, ${0.8 * alpha})` : `rgba(255,255,255, ${0.2 * alpha})`;
            ctx.beginPath();
            ctx.arc(startX + d * dotSpacing, screenY - drawRadius * 0.05, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Slowly damp down interactive rotation velocity back to natural drift
      angleXRef.current *= 0.98;
      angleYRef.current *= 0.98;
      
      // Maintain base drift velocity
      if (Math.abs(angleXRef.current) < 0.002) angleXRef.current = 0.001 * Math.sign(angleXRef.current || 1);
      if (Math.abs(angleYRef.current) < 0.003) angleYRef.current = 0.002 * Math.sign(angleYRef.current || 1);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [hoveredNode]);

  // Handle Interactive Mouse/Touch movements on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const perspective = 400;

    // Is dragging?
    if (isDraggingRef.current && draggedNodeRef.current) {
      const node = draggedNodeRef.current;
      const dx = mouseX - lastMousePosRef.current.x;
      const dy = mouseY - lastMousePosRef.current.y;

      const scale = perspective / (perspective + node.z);
      node.x += dx / scale;
      node.y += dy / scale;

      lastMousePosRef.current = { x: mouseX, y: mouseY };
      return;
    }

    // Rotational momentum on mouse swipe
    if (isDraggingRef.current) {
      const dx = mouseX - lastMousePosRef.current.x;
      const dy = mouseY - lastMousePosRef.current.y;
      
      angleYRef.current = dx * 0.0003;
      angleXRef.current = -dy * 0.0003;

      lastMousePosRef.current = { x: mouseX, y: mouseY };
      return;
    }

    // Hover detection
    let foundNode: SkillNode | null = null;
    let closestZ = Infinity;

    // Check if mouse hits any node (prioritizing closer Z nodes)
    nodesRef.current.forEach((node) => {
      const scale = perspective / (perspective + node.z);
      const screenX = centerX + node.x * scale;
      const screenY = centerY + node.y * scale;
      const drawRadius = node.radius * scale;

      const dist = Math.sqrt((mouseX - screenX)**2 + (mouseY - screenY)**2);
      if (dist < drawRadius + 5) {
        if (node.z < closestZ) {
          closestZ = node.z;
          foundNode = node;
        }
      }
    });

    if (foundNode !== hoveredNode) {
      setHoveredNode(foundNode);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    lastMousePosRef.current = { x: mouseX, y: mouseY };

    // Select node if clicked
    if (hoveredNode) {
      draggedNodeRef.current = hoveredNode;
      setSelectedNode(hoveredNode);
      onSelectSkill(hoveredNode.name);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    lastMousePosRef.current = { x: touchX, y: touchY };
    isDraggingRef.current = true;

    // Touch hover detection & select
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const perspective = 400;

    let foundNode: SkillNode | null = null;
    nodesRef.current.forEach((node) => {
      const scale = perspective / (perspective + node.z);
      const screenX = centerX + node.x * scale;
      const screenY = centerY + node.y * scale;
      const drawRadius = node.radius * scale;

      const dist = Math.sqrt((touchX - screenX)**2 + (touchY - screenY)**2);
      if (dist < drawRadius + 15) {
        foundNode = node;
      }
    });

    if (foundNode) {
      setHoveredNode(foundNode);
      draggedNodeRef.current = foundNode;
      setSelectedNode(foundNode);
      onSelectSkill(foundNode.name);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const perspective = 400;

    if (draggedNodeRef.current) {
      const node = draggedNodeRef.current;
      const dx = touchX - lastMousePosRef.current.x;
      const dy = touchY - lastMousePosRef.current.y;

      const scale = perspective / (perspective + node.z);
      node.x += dx / scale;
      node.y += dy / scale;

      lastMousePosRef.current = { x: touchX, y: touchY };
    } else {
      const dx = touchX - lastMousePosRef.current.x;
      const dy = touchY - lastMousePosRef.current.y;
      
      angleYRef.current = dx * 0.0003;
      angleXRef.current = -dy * 0.0003;

      lastMousePosRef.current = { x: touchX, y: touchY };
    }
  };

  return (
    <div id="skills-interactive-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#080808] p-6 md:p-8 rounded-none border border-white/10 shadow-xl">
      {/* Visual Arena Sphere */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
        <div 
          ref={containerRef} 
          className="w-full h-[320px] sm:h-[400px] md:h-[450px] relative rounded-none overflow-hidden cursor-grab active:cursor-grabbing border border-white/5 bg-[#030303]"
        >
          {/* Subtle background tech matrix grids */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
          
          <canvas
            id="skills-3d-canvas"
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="block w-full h-full relative z-10"
          />

          {/* Compass/Interface Indicator */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-[9px] font-mono tracking-widest text-white/50 bg-[#0A0A0A] py-1.5 px-3.5 rounded-none border border-white/10 backdrop-blur-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>3D INTERACTIVE SYSTEM</span>
          </div>
          <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-white/40 select-none hidden sm:block">
            SWIPE TO ROTATE • DRAG TO ORBIT
          </div>
        </div>
      </div>

      {/* Narrative & Active details */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#111] border border-white/10 rounded-none text-white text-[10px] tracking-widest font-mono uppercase font-bold">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>01 // PROFESSIONAL CAPABILITIES</span>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
            3D Skills Arena
          </h3>
          <p className="text-sm text-white/60 leading-relaxed font-sans">
            A fully interactive spatial web where you can drag, spin, and expand Devanshu's professional toolkit. Click or hover on any logo to review depth of expertise and production context.
          </p>
        </div>

        {/* Dynamic Tooltip Details */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-none p-5 min-h-[160px] flex flex-col justify-center backdrop-blur-sm relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-white/5 pointer-events-none">
            <Sparkles className="w-16 h-16 opacity-10" />
          </div>

          {hoveredNode || selectedNode ? (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3.5 h-3.5 rounded-none" 
                    style={{ backgroundColor: (hoveredNode || selectedNode)?.color }} 
                  />
                  <h4 className="text-lg font-black uppercase text-white font-sans tracking-tight">
                    {(hoveredNode || selectedNode)?.name}
                  </h4>
                </div>
                <span className="text-[9px] font-mono tracking-widest bg-white/5 text-gray-300 px-2 py-0.5 rounded-none border border-white/10 uppercase">
                  {(hoveredNode || selectedNode)?.category}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-white/40">Competence Level:</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`w-2.5 h-2.5 rounded-none rotate-45 ${
                          i < ((hoveredNode || selectedNode)?.level || 0) 
                            ? "bg-amber-400" 
                            : "bg-white/10"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs text-indigo-200 font-medium leading-relaxed font-sans">
                  {skillDetails[(hoveredNode || selectedNode)?.name || ""]?.desc}
                </p>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  {skillDetails[(hoveredNode || selectedNode)?.name || ""]?.exp}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
              <HelpCircle className="w-8 h-8 text-white/20 animate-pulse" />
              <p className="text-xs font-mono tracking-widest uppercase text-white/60">
                AWAITING NODE SELECTION
              </p>
              <p className="text-xs text-white/40 max-w-[280px]">
                Click or hover over any rotating skill bubble in the interactive arena to reveal project metrics.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Category Summary */}
        <div className="grid grid-cols-2 gap-3 text-[9px] font-mono tracking-widest uppercase text-white/40">
          <div className="bg-[#0A0A0A] p-3 rounded-none border border-white/15 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none rotate-45"></span>
            <span>Android: 5+ Yrs Combined</span>
          </div>
          <div className="bg-[#0A0A0A] p-3 rounded-none border border-white/15 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-none rotate-45"></span>
            <span>Kotlin & Compose Expert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
