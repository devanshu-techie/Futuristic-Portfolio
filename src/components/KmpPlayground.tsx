import React, { useState, useEffect } from "react";
import { IdeFile } from "../types";
import { 
  Play, 
  Terminal, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileCode, 
  Smartphone, 
  Code, 
  RefreshCw, 
  CheckCircle, 
  MessageSquare, 
  Send, 
  Plus, 
  Check, 
  Trash2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

export default function KmpPlayground() {
  const [activeFile, setActiveFile] = useState<string>("App.kt");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "composeApp": true,
    "src": true,
    "commonMain": true,
    "kotlin": true,
    "ui": true,
    "androidMain": false,
    "iosMain": false,
  });
  
  // Interactive simulator states
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<"chat" | "reminder">("chat");
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isCompiled, setIsCompiled] = useState<boolean>(true);
  const [devicePlatform, setDevicePlatform] = useState<"android" | "ios">("android");

  // ChatSpark Mock States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "interviewer", text: "Hey Devanshu! I saw your amazing KMP Portfolio. Let's discuss a senior developer role!", time: "10:24 AM" },
    { id: 2, sender: "me", text: "Hello! Absolutely. Kotlin Multiplatform and Jetpack Compose is exactly my specialty. I'd love to chat!", time: "10:25 AM" },
    { id: 3, sender: "interviewer", text: "Fantastic. What is your experience with MVVM and local database synchronization?", time: "10:26 AM" },
  ]);

  // Shopping Reminder Mock States
  const [reminderInput, setReminderInput] = useState("");
  const [reminderPriority, setReminderPriority] = useState<"High" | "Medium" | "Low">("High");
  const [reminders, setReminders] = useState([
    { id: 1, text: "Review KMP App Architecture", priority: "High", completed: false, date: "Today" },
    { id: 2, text: "Set up Room migrations", priority: "Medium", completed: true, date: "Yesterday" },
    { id: 3, text: "Check ChatSpark notifications via FCM", priority: "High", completed: false, date: "Tomorrow" },
  ]);

  // IDE files definitions representing Kotlin code of this actual project and resume
  const ideFiles: Record<string, IdeFile> = {
    "App.kt": {
      name: "App.kt",
      path: "composeApp/src/commonMain/kotlin/org/devanshu/portfolio/App.kt",
      language: "kotlin",
      content: `package org.devanshu.portfolio

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
@Preview
fun App() {
    MaterialTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Welcome to KMP Portfolio",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Built on Android, iOS & Web with Kotlin Multiplatform",
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}`
    },
    "Platform.kt": {
      name: "Platform.kt",
      path: "composeApp/src/commonMain/kotlin/org/devanshu/portfolio/Platform.kt",
      language: "kotlin",
      content: `package org.devanshu.portfolio

interface Platform {
    val name: String
    val osVersion: String
    val isMobile: Boolean
}

expect fun getPlatform(): Platform`
    },
    "ChatSparkScreen.kt": {
      name: "ChatSparkScreen.kt",
      path: "composeApp/src/commonMain/kotlin/org/devanshu/portfolio/ui/ChatSparkScreen.kt",
      language: "kotlin",
      content: `package org.devanshu.portfolio.ui

import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import org.devanshu.portfolio.model.Message

@Composable
fun ChatSparkScreen(viewModel: ChatViewModel) {
    val messages by viewModel.messages.collectAsState()
    var inputtext by remember { mutableStateOf("") }

    Scaffold(
        topBar = { 
            TopAppBar(title = { Text("ChatSpark (KMP)") }) 
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier.padding(paddingValues).fillMaxSize()
        ) {
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(messages) { msg ->
                    ChatBubble(message = msg)
                }
            }
            Row(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                TextField(
                    value = inputtext,
                    onValueChange = { inputtext = it },
                    modifier = Modifier.weight(1f)
                )
                Button(onClick = {
                    if (inputtext.isNotBlank()) {
                        viewModel.sendMessage(inputtext)
                        inputtext = ""
                    }
                }) {
                    Text("Send")
                }
            }
        }
    }
}`
    },
    "ShoppingReminder.kt": {
      name: "ShoppingReminder.kt",
      path: "composeApp/src/commonMain/kotlin/org/devanshu/portfolio/ui/ShoppingReminder.kt",
      language: "kotlin",
      content: `package org.devanshu.portfolio.ui

import androidx.compose.material3.*
import androidx.compose.runtime.*
import org.devanshu.portfolio.db.ReminderDatabase

@Composable
fun ShoppingReminderScreen(database: ReminderDatabase) {
    var reminders by remember { mutableStateOf(database.getAll()) }
    var newTaskName by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize()) {
        Text("Shopping Reminder", style = MaterialTheme.typography.titleLarge)
        
        LazyColumn {
            items(reminders) { item ->
                ReminderRow(
                    reminder = item,
                    onToggle = { database.toggle(item.id) }
                )
            }
        }
        
        Row {
            TextField(value = newTaskName, onValueChange = { newTaskName = it })
            Button(onClick = { 
                database.insert(newTaskName)
                reminders = database.getAll()
            }) {
                Text("Add")
            }
        }
    }
}`
    },
    "Platform.android.kt": {
      name: "Platform.android.kt",
      path: "composeApp/src/androidMain/kotlin/org/devanshu/portfolio/Platform.android.kt",
      language: "kotlin",
      content: `package org.devanshu.portfolio

import android.os.Build

class AndroidPlatform : Platform {
    override val name: String = "Android SDK"
    override val osVersion: String = Build.VERSION.RELEASE
    override val isMobile: Boolean = true
}

actual fun getPlatform(): Platform = AndroidPlatform()`
    },
    "Platform.ios.kt": {
      name: "Platform.ios.kt",
      path: "composeApp/src/iosMain/kotlin/org/devanshu/portfolio/Platform.ios.kt",
      language: "kotlin",
      content: `package org.devanshu.portfolio

import platform.UIKit.UIDevice

class IOSPlatform : Platform {
    override val name: String = "iOS Native"
    override val osVersion: String = UIDevice.currentDevice.systemVersion
    override val isMobile: Boolean = true
}

actual fun getPlatform(): Platform = IOSPlatform()`
    },
    "build.gradle.kts": {
      name: "build.gradle.kts",
      path: "composeApp/build.gradle.kts",
      language: "gradle",
      content: `plugins {
    kotlin("multiplatform")
    id("com.android.application")
    id("org.jetbrains.compose")
}

kotlin {
    androidTarget()
    
    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "composeApp"
            isStatic = true
        }
    }
    
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
            }
        }
        val androidMain by getting {
            dependencies {
                implementation("androidx.appcompat:appcompat:1.6.1")
                implementation("androidx.activity:activity-compose:1.8.2")
            }
        }
    }
}`
    }
  };

  const handleToggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Compile Trigger Simulation
  const triggerCompilation = () => {
    setIsCompiling(true);
    setIsCompiled(false);
    setBuildLogs([
      "Fetching Kotlin Multiplatform configuration...",
      "Analyzing targets: [androidTarget, iosSimulatorArm64, iosArm64, webJS]...",
      "> Task :composeApp:compileKotlinCommonMain - Resolving dependencies...",
      "> Task :composeApp:generateComposeResourcesTask - Synthesizing vector assets...",
      "> Task :composeApp:compileKotlinAndroidTarget - Optimizing Dalvik byte-arrays...",
      "> Task :composeApp:linkPodDebugFrameworkIOS - Invoking LLVM platform tools...",
      "> Task :composeApp:linkDebugFrameworkIosSimulatorArm64",
      "Assembling application bundles...",
      "COMPILATION SUCCESSFUL. Transferring executable bytes to live emulator layer..."
    ]);

    setTimeout(() => {
      setIsCompiling(false);
      setIsCompiled(true);
    }, 1800);
  };

  // Chat Responses Auto Simulation
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput("");

    // Simulate interview answer
    setTimeout(() => {
      let responseText = "Excellent answer! Your projects look perfectly structured. I am passing this project directly to our lead engineering director for immediate review. When are you free for a call?";
      if (newMessage.text.toLowerCase().includes("kotlin") || newMessage.text.toLowerCase().includes("compose")) {
        responseText = "Yes, Compose Multiplatform is a huge asset. Your Kotlin clean architecture demonstrates superb coding discipline. When can we schedule a technical deeper dive?";
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "interviewer",
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Shopping list simulation functions
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderInput.trim()) return;

    const newReminder = {
      id: Date.now(),
      text: reminderInput,
      priority: reminderPriority,
      completed: false,
      date: "Today"
    };

    setReminders(prev => [newReminder, ...prev]);
    setReminderInput("");
  };

  const toggleReminderCompleted = (id: number) => {
    setReminders(prev => prev.map(rem => rem.id === id ? { ...rem, completed: !rem.completed } : rem));
  };

  const deleteReminder = (id: number) => {
    setReminders(prev => prev.filter(rem => rem.id !== id));
  };

  // Basic custom syntax highlighter for kotlin code displays
  const highlightCode = (code: string) => {
    const lines = code.split("\n");
    return lines.map((line, idx) => {
      // Escape HTML entities to prevent rendering bugs
      let escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Highlights keywords
      const keywords = ["package", "import", "class", "interface", "expect", "actual", "fun", "val", "var", "override", "listOf", "forEach", "val ", "var ", "return"];
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, "g");
        escaped = escaped.replace(regex, `<span class="text-pink-500 font-semibold">${kw}</span>`);
      });

      // Highlights annotations
      escaped = escaped.replace(/(@Composable|@Preview|@OptIn)/g, '<span class="text-indigo-400 font-medium">$1</span>');

      // Highlights strings
      escaped = escaped.replace(/("[^"]*")/g, '<span class="text-emerald-400 font-normal">$1</span>');

      // Highlights imports
      escaped = escaped.replace(/(\bimport\s+)([a-zA-Z0-9_.]+)/g, '$1<span class="text-gray-400 font-light">$2</span>');

      return (
        <div key={idx} className="flex font-mono text-[11px] sm:text-xs leading-relaxed py-0.5 hover:bg-gray-900/40 px-3">
          <span className="w-8 text-right pr-4 text-gray-700 select-none border-r border-gray-900/60 mr-4 font-mono text-[10px]">
            {idx + 1}
          </span>
          <span 
            className="text-gray-300 font-mono"
            dangerouslySetInnerHTML={{ __html: escaped || "&nbsp;" }} 
          />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#111] border border-white/10 rounded-none text-white text-[10px] tracking-widest font-mono uppercase font-bold">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>02 // KOTLIN MULTIPLATFORM IDE & RUNTIME EMULATOR</span>
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
            Compose Multiplatform Workspace
          </h3>
          <p className="text-sm text-white/60 max-w-2xl font-sans">
            Inspect actual shared Kotlin business logic structures and compile them instantly. Select a target file on the left, click <strong className="text-emerald-400">RUN PROJECT</strong>, and interact with the live compiled app inside the real mobile emulator.
          </p>
        </div>

        {/* Action Button Trigger */}
        <button
          onClick={triggerCompilation}
          disabled={isCompiling}
          className="self-start md:self-center bg-white text-black hover:bg-indigo-600 hover:text-white active:scale-95 disabled:bg-[#111] disabled:text-white/20 flex items-center space-x-2 font-bold uppercase text-xs tracking-widest px-6 py-3.5 rounded-none transition-all font-mono"
        >
          {isCompiling ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>COMPILING TARGETS...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-black" />
              <span>RUN PROJECT</span>
            </>
          )}
        </button>
      </div>

      {/* Main IDE grid layout */}
      <div id="kmp-ide-grid" className="grid grid-cols-1 xl:grid-cols-12 gap-6 bg-[#080808] rounded-none border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Left column: File Explorer & Code Editor (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col border-b xl:border-b-0 xl:border-r border-white/10 h-[500px] sm:h-[600px]">
          
          {/* Header IDE Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0c] border-b border-white/5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-none rotate-45 bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-none rotate-45 bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-none rotate-45 bg-emerald-500/80"></span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-white/40 pl-4">KMP Studio v2026.1</span>
            </div>
            
            <div className="flex items-center space-x-3 text-[9px] text-white/40 font-mono bg-black/40 px-3 py-1.5 rounded-none border border-white/10 tracking-wider">
              <span className="text-white/30 uppercase">Active File:</span>
              <span className="text-indigo-400 font-bold">{ideFiles[activeFile]?.path}</span>
            </div>
          </div>

          {/* IDE Content split screen */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* File tree sidebar */}
            <div className="w-56 sm:w-64 bg-[#050505] border-r border-white/5 flex flex-col text-xs text-white/60 select-none overflow-y-auto font-mono scrollbar-thin">
              <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-gray-600 border-b border-gray-900/30 uppercase">
                Project Structure
              </div>

              <div className="p-2 space-y-1">
                {/* composeApp folder */}
                <div>
                  <div 
                    onClick={() => handleToggleFolder("composeApp")}
                    className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-300 font-medium"
                  >
                    {expandedFolders["composeApp"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                    <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/10" />
                    <span className="truncate">composeApp</span>
                  </div>

                  {expandedFolders["composeApp"] && (
                    <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-1">
                      
                      {/* src */}
                      <div>
                        <div 
                          onClick={() => handleToggleFolder("src")}
                          className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-300"
                        >
                          {expandedFolders["src"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                          <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/10" />
                          <span>src</span>
                        </div>

                        {expandedFolders["src"] && (
                          <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-1">
                            
                            {/* commonMain */}
                            <div>
                              <div 
                                onClick={() => handleToggleFolder("commonMain")}
                                className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-300"
                              >
                                {expandedFolders["commonMain"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                <Folder className="w-3.5 h-3.5 text-sky-400 fill-sky-400/10" />
                                <span>commonMain</span>
                              </div>

                              {expandedFolders["commonMain"] && (
                                <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-1">
                                  
                                  {/* kotlin */}
                                  <div>
                                    <div 
                                      onClick={() => handleToggleFolder("kotlin")}
                                      className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-300"
                                    >
                                      {expandedFolders["kotlin"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                      <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                                      <span>kotlin</span>
                                    </div>

                                    {expandedFolders["kotlin"] && (
                                      <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-1">
                                        
                                        {/* App.kt */}
                                        <div 
                                          onClick={() => setActiveFile("App.kt")}
                                          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${activeFile === "App.kt" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/50" : "hover:bg-gray-900 text-gray-400"}`}
                                        >
                                          <FileCode className="w-3.5 h-3.5 text-purple-400" />
                                          <span className="truncate">App.kt</span>
                                        </div>

                                        {/* Platform.kt */}
                                        <div 
                                          onClick={() => setActiveFile("Platform.kt")}
                                          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${activeFile === "Platform.kt" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/50" : "hover:bg-gray-900 text-gray-400"}`}
                                        >
                                          <FileCode className="w-3.5 h-3.5 text-purple-400" />
                                          <span className="truncate">Platform.kt</span>
                                        </div>

                                        {/* ui folder */}
                                        <div>
                                          <div 
                                            onClick={() => handleToggleFolder("ui")}
                                            className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-300"
                                          >
                                            {expandedFolders["ui"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                            <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/10" />
                                            <span>ui</span>
                                          </div>

                                          {expandedFolders["ui"] && (
                                            <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-1">
                                              <div 
                                                onClick={() => setActiveFile("ChatSparkScreen.kt")}
                                                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${activeFile === "ChatSparkScreen.kt" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/50" : "hover:bg-gray-900 text-gray-400"}`}
                                              >
                                                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="truncate">ChatSparkScreen.kt</span>
                                              </div>
                                              <div 
                                                onClick={() => setActiveFile("ShoppingReminder.kt")}
                                                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${activeFile === "ShoppingReminder.kt" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/50" : "hover:bg-gray-900 text-gray-400"}`}
                                              >
                                                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                                                <span className="truncate">ShoppingReminder.kt</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                      </div>
                                    )}
                                  </div>

                                </div>
                              )}
                            </div>

                            {/* androidMain */}
                            <div>
                              <div 
                                onClick={() => handleToggleFolder("androidMain")}
                                className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-400"
                              >
                                {expandedFolders["androidMain"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                <Folder className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                                <span>androidMain</span>
                              </div>

                              {expandedFolders["androidMain"] && (
                                <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-0.5">
                                  <div 
                                    onClick={() => setActiveFile("Platform.android.kt")}
                                    className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${activeFile === "Platform.android.kt" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/50" : "hover:bg-gray-900 text-gray-400"}`}
                                  >
                                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="truncate">Platform.android.kt</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* iosMain */}
                            <div>
                              <div 
                                onClick={() => handleToggleFolder("iosMain")}
                                className="flex items-center space-x-1.5 px-1.5 py-1 hover:bg-gray-900 rounded cursor-pointer text-gray-400"
                              >
                                {expandedFolders["iosMain"] ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
                                <Folder className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                                <span>iosMain</span>
                              </div>

                              {expandedFolders["iosMain"] && (
                                <div className="pl-3.5 border-l border-gray-900 ml-3.5 space-y-0.5">
                                  <div 
                                    onClick={() => setActiveFile("Platform.ios.kt")}
                                    className={`flex items-center space-x-1.5 px-2 py-0.5 rounded cursor-pointer ${activeFile === "Platform.ios.kt" ? "bg-indigo-950 text-indigo-300 border border-indigo-900/50" : "hover:bg-gray-900 text-gray-400"}`}
                                  >
                                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="truncate">Platform.ios.kt</span>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* build.gradle.kts */}
                <div 
                  onClick={() => setActiveFile("build.gradle.kts")}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-none cursor-pointer ${activeFile === "build.gradle.kts" ? "bg-indigo-950/50 text-indigo-300 border border-indigo-900/40" : "hover:bg-white/5 text-white/50"}`}
                >
                  <FileCode className="w-3.5 h-3.5 text-orange-400" />
                  <span className="truncate">build.gradle.kts</span>
                </div>
              </div>
            </div>

            {/* Code Editor Code Panel */}
            <div className="flex-1 overflow-auto bg-[#030303] flex flex-col scrollbar-thin">
              {/* Tab Title */}
              <div className="flex items-center bg-[#0a0a0a] px-4 py-2 border-b border-white/5 text-[10px] tracking-wider font-mono uppercase text-white/40">
                <FileCode className="w-3 h-3 text-indigo-400 mr-2" />
                <span>{ideFiles[activeFile]?.name}</span>
              </div>
              <div className="py-4 flex-1">
                {highlightCode(ideFiles[activeFile]?.content || "")}
              </div>
            </div>

          </div>

          {/* Terminal Panel (Bottom of editor) */}
          <div className="h-28 bg-[#050505] border-t border-white/10 p-3 font-mono text-[10px] overflow-y-auto scrollbar-thin select-none">
            <div className="flex items-center space-x-2 text-white/40 mb-1 border-b border-white/5 pb-1">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold tracking-wider">BUILD OUTPUT CONSOLE</span>
            </div>
            {isCompiling ? (
              <div className="space-y-1">
                {buildLogs.map((log, lIdx) => (
                  <div key={lIdx} className="text-white/60 flex items-center space-x-2">
                     <span className="text-indigo-500 select-none">&gt;</span>
                     <span className="truncate">{log}</span>
                  </div>
                ))}
              </div>
            ) : isCompiled ? (
              <div className="text-emerald-400 flex items-center space-x-1.5 font-bold tracking-wide">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>DEVICE IS ACTIVE • COMMONMAIN BINARIES INJECTED SUCCESSFULLY</span>
              </div>
            ) : (
              <div className="text-white/20 uppercase tracking-widest text-[9px] text-center py-4">
                Console is idle. Click Run Project above to boot compilation and execute shared Compose layout.
              </div>
            )}
          </div>

        </div>

        {/* Right column: Interactive Emulator (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col items-center justify-center p-6 bg-black/40">
          
          {/* Target Emulator framework controls */}
          <div className="flex items-center space-x-2 mb-6 bg-[#030303] border border-white/10 p-1 rounded-none">
            <button
              onClick={() => setDevicePlatform("android")}
              className={`px-4 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-1.5 ${devicePlatform === "android" ? "bg-white text-black font-black" : "text-white/40 hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ANDROID (M3)</span>
            </button>
            <button
              onClick={() => setDevicePlatform("ios")}
              className={`px-4 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-1.5 ${devicePlatform === "ios" ? "bg-white text-black font-black" : "text-white/40 hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>IOS (NATIVE)</span>
            </button>
          </div>

          {/* Simulated Mobile Device container */}
          <div className="relative w-[300px] sm:w-[320px] h-[550px] bg-[#050505] rounded-[36px] p-3 shadow-2xl border-[4px] border-[#222] ring-1 ring-white/10 overflow-hidden flex flex-col">
            
            {/* Top camera notch bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#222] rounded-b-xl z-30 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-black mr-2"></span>
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-950"></span>
            </div>

            {/* Mobile screen */}
            <div className="flex-1 bg-[#0a0a0a] rounded-[28px] overflow-hidden flex flex-col relative z-10 pt-4 border border-white/5">
              
              {/* Build cover loading overlay if compiling */}
              {isCompiling && (
                <div className="absolute inset-0 bg-[#050505]/95 z-40 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Compiling JVM Native...</h4>
                    <p className="text-[9px] text-white/40 font-mono">assembleDebugTask executing on target device</p>
                  </div>
                </div>
              )}

              {/* Offline cover if not compiled */}
              {!isCompiled && !isCompiling && (
                <div className="absolute inset-0 bg-[#050505] z-40 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <Play className="w-10 h-10 text-white/20 animate-bounce cursor-pointer hover:text-indigo-400" onClick={triggerCompilation} />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-mono font-bold text-white/60 uppercase tracking-widest">Emulator Stale</h4>
                    <p className="text-[10px] text-white/40 font-sans leading-relaxed">
                      Shared code is uncompiled. Click RUN PROJECT to trigger the Multiplatform build pipelines.
                    </p>
                  </div>
                  <button 
                    onClick={triggerCompilation}
                    className="bg-white text-black font-mono font-bold text-[10px] px-4 py-2 uppercase tracking-widest rounded-none"
                  >
                    DEPLOY CODE
                  </button>
                </div>
              )}

              {/* Actual live simulated apps */}
              {isCompiled && !isCompiling && (
                <div className="flex-1 flex flex-col overflow-hidden bg-black select-text">
                  
                  {/* Internal App title header */}
                  <div className="bg-[#0c0c0c] border-b border-white/15 p-3.5 flex items-center justify-between text-white shadow-sm">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-none bg-indigo-600 flex items-center justify-center text-xs font-bold font-mono">
                        {activeSimulatorTab === "chat" ? "C" : "R"}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-tight">
                          {activeSimulatorTab === "chat" ? "ChatSpark (KMP)" : "Shopping Reminder"}
                        </h4>
                        <p className="text-[9px] text-white/40 font-mono flex items-center space-x-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1 inline-block animate-pulse"></span>
                          <span>{devicePlatform === "android" ? "Android 14 (API 34)" : "iOS 17 Native"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Switch layout tab directly in-screen */}
                    <div className="flex bg-[#050505] p-0.5 rounded-none border border-white/10">
                      <button
                        onClick={() => setActiveSimulatorTab("chat")}
                        className={`p-1 rounded-none text-[10px] font-mono transition-all ${activeSimulatorTab === "chat" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
                        title="ChatSpark"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveSimulatorTab("reminder")}
                        className={`p-1 rounded-none text-[10px] font-mono transition-all ${activeSimulatorTab === "reminder" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
                        title="Shopping Reminder"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: ChatSpark Simulator */}
                  {activeSimulatorTab === "chat" && (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gray-950 relative">
                      
                      {/* Messages scroll section */}
                      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
                        {chatMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[85%] ${msg.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <div 
                              className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                                msg.sender === "me" 
                                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                                  : "bg-gray-900 text-gray-200 rounded-tl-sm border border-gray-800/60"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <span className="text-[8px] text-white/30 font-mono mt-1">{msg.time}</span>
                          </div>
                        ))}
                      </div>

                      {/* Message Input form */}
                      <form onSubmit={handleSendChatMessage} className="p-2 border-t border-white/10 bg-black/80 flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type response to recruiter..."
                          className="flex-1 bg-[#050505] text-white rounded-none px-3 py-2 text-[10px] outline-none border border-white/10 focus:border-indigo-500 transition-all placeholder-white/30 font-sans"
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-none bg-white hover:bg-indigo-600 hover:text-white active:scale-95 text-black shadow font-bold"
                        >
                          <Send className="w-3 h-3 fill-current" />
                        </button>
                      </form>

                    </div>
                  )}

                  {/* TAB 2: Shopping Reminder Simulator */}
                  {activeSimulatorTab === "reminder" && (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden bg-black p-3.5">
                      
                      {/* Interactive Header & Input */}
                      <div className="space-y-3">
                        <form onSubmit={handleAddReminder} className="flex flex-col space-y-1.5">
                          <div className="flex space-x-1.5">
                            <input
                              type="text"
                              value={reminderInput}
                              onChange={(e) => setReminderInput(e.target.value)}
                              placeholder="New shopping reminder item..."
                              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-none px-3 py-2 text-[10px] text-white outline-none focus:border-indigo-500 font-sans"
                            />
                            <button
                              type="submit"
                              className="bg-white hover:bg-indigo-600 text-black hover:text-white px-2.5 rounded-none flex items-center justify-center active:scale-95 font-bold"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Priority tag toggles */}
                          <div className="flex items-center space-x-1.5 text-[8px] font-mono">
                            <span className="text-white/40 uppercase">Priority:</span>
                            {(["High", "Medium", "Low"] as const).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setReminderPriority(p)}
                                className={`px-2 py-0.5 rounded-none border uppercase tracking-wider transition-all ${
                                  reminderPriority === p 
                                    ? p === "High" ? "bg-rose-950 text-rose-400 border-rose-900" : p === "Medium" ? "bg-amber-950 text-amber-400 border-amber-900" : "bg-emerald-950 text-emerald-400 border-emerald-900"
                                    : "bg-black text-white/40 border-white/5 hover:text-white"
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </form>
                      </div>

                      {/* Reminders List scroll section */}
                      <div className="flex-1 overflow-y-auto my-3 space-y-2 scrollbar-thin">
                        {reminders.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Check className="w-8 h-8 text-emerald-500/30 mb-2" />
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">All alerts cleared!</p>
                          </div>
                        ) : (
                          reminders.map((rem) => (
                            <div 
                              key={rem.id} 
                              className={`p-2.5 rounded-none border flex items-center justify-between text-[11px] leading-relaxed transition-all ${
                                rem.completed 
                                  ? "bg-white/5 border-white/5 opacity-40" 
                                  : "bg-[#0a0a0a] border-white/10"
                              }`}
                            >
                              <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                                <button
                                  onClick={() => toggleReminderCompleted(rem.id)}
                                  className={`w-4 h-4 rounded-none border flex items-center justify-center mt-0.5 transition-all ${
                                    rem.completed 
                                      ? "bg-indigo-600 border-indigo-500 text-white" 
                                      : "border-white/10 hover:border-white"
                                  }`}
                                >
                                  {rem.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-white truncate ${rem.completed ? "line-through text-white/30" : ""}`}>
                                    {rem.text}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-0.5 text-[8px] font-mono uppercase tracking-wider">
                                    <span className={`${
                                      rem.priority === "High" ? "text-rose-400" : rem.priority === "Medium" ? "text-amber-400" : "text-emerald-400"
                                    }`}>
                                      {rem.priority}
                                    </span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-white/40 flex items-center">
                                      <Calendar className="w-2 h-2 mr-0.5 text-indigo-400" />
                                      {rem.date}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => deleteReminder(rem.id)}
                                className="p-1 hover:text-rose-400 text-white/30 active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom device home screen button bar */}
            <div className="w-full py-2.5 flex justify-center items-center z-20 relative">
              <div 
                className="w-24 h-1 bg-[#222] hover:bg-[#444] cursor-pointer"
                onClick={() => {
                  if (isCompiled) {
                    // Quick toggle between simulator tabs
                    setActiveSimulatorTab(prev => prev === "chat" ? "reminder" : "chat");
                  }
                }}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
