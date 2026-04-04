"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Project {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  demoUrl?: string; // Frontend: Link to Storybook / CodeSandbox
  articleUrl?: string; // Frontend: Link to Dev.to / Medium / Case Study
  designUrl?: string; // Frontend: Link to Figma / FigJam
  image?: string;
  role?: string;
  tags?: string;
  date?: string;
}

interface Profile {
  greeting?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  resumeUrl?: string;
  portraitImage?: string;
  skills?: string;
  tools?: string;
  portfolioHeading?: string;
  portfolioTitle?: string;
  portfolioSubtitle?: string;
}

const DEFAULT_IMAGES = ["https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"];

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [adminTab, setAdminTab] = useState<"profile" | "project">("project");

  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile>({
    greeting: "👋 Hello, I'm",
    name: "Sanni Opeyemi",
    title: "FRONTEND",
    subtitle: "ENGINEER",
    description: "Specializing in building exceptional digital experiences. I craft responsive, accessible, and performant web applications using modern web technologies.",
    phone: "+234-XXX-XXXX",
    email: "sanni@alpharithminv.com",
    portraitImage: "",
    skills: "React, Next.js, TypeScript, JavaScript, Tailwind CSS, Redux, Zustand",
    tools: "Node.js, Git, Figma, Vercel, Postman",
    portfolioHeading: "Selected Work",
    portfolioTitle: "RECENT",
    portfolioSubtitle: "PROJECTS",
  });

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formDemoUrl, setFormDemoUrl] = useState("");
  const [formArticleUrl, setFormArticleUrl] = useState("");
  const [formDesignUrl, setFormDesignUrl] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formDate, setFormDate] = useState("");
  const [projectImageMode, setProjectImageMode] = useState<"url" | "upload">("url");

  const [editProfile, setEditProfile] = useState<Profile>(profile);
  const [profileImageMode, setProfileImageMode] = useState<"url" | "upload">("url");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, profileRes] = await Promise.all([fetch("/api/projects"), fetch("/api/profile")]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          if (Array.isArray(data)) {
            setProjects(data);
          } else {
            setProjects([]);
          }
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data && Object.keys(data).length > 0) {
            setProfile(data);
            setEditProfile(data);
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please keep images under 2MB.");
        return;
      }
      const base64 = await convertToBase64(file);
      setter(base64);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "LAZARUS") {
      setIsAdmin(true);
      setShowLogin(false);
      setPasswordInput("");
    } else {
      setShowLogin(false);
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    cancelEdit();
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = formImage.trim() !== "" ? formImage : DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];

    const projectData = {
      title: formTitle,
      description: formDesc,
      url: formUrl,
      githubUrl: formGithubUrl,
      demoUrl: formDemoUrl,
      articleUrl: formArticleUrl,
      designUrl: formDesignUrl,
      image: finalImage,
      role: formRole,
      tags: formTags,
      date: formDate,
    };

    try {
      const method = editingProjectId ? "PUT" : "POST";
      const body = editingProjectId ? { id: editingProjectId, ...projectData } : projectData;

      const response = await fetch("/api/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingProjectId) {
          setProjects(projects.map((p) => (p.id === editingProjectId ? data.project : p)));
        } else {
          setProjects([...projects, data.project]);
        }
        cancelEdit();
        alert("Project deployed successfully!");
      } else {
        alert("Failed to save project.");
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const startEditProject = (project: Project) => {
    setAdminTab("project");
    setEditingProjectId(project.id);
    setFormTitle(project.title || "");
    setFormDesc(project.description || "");
    setFormUrl(project.url || "");
    setFormGithubUrl(project.githubUrl || "");
    setFormDemoUrl(project.demoUrl || "");
    setFormArticleUrl(project.articleUrl || "");
    setFormDesignUrl(project.designUrl || "");
    setFormImage(project.image || "");
    setFormRole(project.role || "");
    setFormTags(project.tags || "");
    setFormDate(project.date || "");
    setProjectImageMode(project.image?.startsWith("data:image") ? "upload" : "url");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setFormTitle("");
    setFormDesc("");
    setFormUrl("");
    setFormGithubUrl("");
    setFormDemoUrl("");
    setFormArticleUrl("");
    setFormDesignUrl("");
    setFormImage("");
    setFormRole("");
    setFormTags("");
    setFormDate("");
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this project?")) return;
    try {
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfile),
      });

      if (response.ok) {
        setProfile(editProfile);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 pb-24 overflow-x-hidden">
      <header className="flex justify-between items-center p-6 border-b border-gray-800/50 backdrop-blur-md sticky top-0 z-50 bg-[#050505]/80">
        <div className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-1 select-none text-white">
          <span className="text-cyan-400">&lt;</span>
          {profile.name?.split(" ")[0] || "Dev"}
          <span className="text-cyan-400">/&gt;</span>
        </div>

        <div className="flex items-center gap-4">
          {!isAdmin ? (
            <div className="flex items-center gap-2">
              {showLogin && (
                <form onSubmit={handleLogin} className="flex">
                  <input type="password" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="bg-gray-900 border border-gray-800 text-sm px-3 py-1.5 rounded-l-md focus:outline-none focus:border-cyan-500 transition w-32" placeholder="" />
                  <button type="submit" className="bg-gray-800 border-y border-r border-gray-700 text-gray-400 hover:text-cyan-400 px-3 rounded-r-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </form>
              )}
              <button onClick={() => setShowLogin(!showLogin)} className="text-gray-600 hover:text-cyan-400 transition cursor-pointer p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black text-xs font-bold px-4 py-2 rounded-md transition-all">
              Log Out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <section className="flex flex-col md:flex-row items-center justify-between mb-32 gap-12">
          {isLoading ? (
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-20 w-3/4 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="w-full md:w-1/2 space-y-6">
              <p className="text-cyan-400 font-mono text-sm md:text-base">
                {profile.greeting} <span className="text-white font-bold">{profile.name}</span>
              </p>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight text-white">
                {profile.title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{profile.subtitle}</span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed">{profile.description}</p>

              <div className="pt-4 space-y-6">
                {profile.skills && (
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Frontend Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.split(",").map(
                        (skill, i) =>
                          skill.trim() && (
                            <span key={i} className="text-xs bg-gray-900 border border-gray-800 text-gray-300 px-3 py-1.5 rounded-full hover:border-cyan-500/50 transition-colors">
                              {skill.trim()}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}
                {profile.tools && (
                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Tools & Platform</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.tools.split(",").map(
                        (tool, i) =>
                          tool.trim() && (
                            <span key={i} className="text-xs bg-blue-900/10 text-blue-400 border border-blue-900/30 px-3 py-1.5 rounded-full">
                              {tool.trim()}
                            </span>
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-8">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="bg-white hover:bg-gray-200 text-black px-6 py-3 text-sm font-bold rounded-full transition-all">
                    Get in Touch
                  </a>
                )}

                <div className="flex items-center gap-4">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-900 rounded-full border border-gray-800">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                      </svg>
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 bg-gray-900 rounded-full border border-gray-800">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                      </svg>
                    </a>
                  )}
                  {profile.resumeUrl && (
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors ml-2 border-b border-gray-700 hover:border-white pb-1">
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px] z-0"></div>
            {isLoading ? (
              <div className="w-full max-w-[380px] aspect-[4/5] bg-gray-900 rounded-2xl animate-pulse"></div>
            ) : (
              <div className="w-full max-w-[380px] aspect-[4/5] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden z-10 relative shadow-2xl group">
                {profile.portraitImage ? (
                  <Image src={profile.portraitImage} alt="Portrait" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 400px" priority />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-xs tracking-widest uppercase">Add Portrait in Admin</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mb-24">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="text-cyan-400 text-xs font-bold mb-3 uppercase tracking-widest">{profile.portfolioHeading || "Selected Work"}</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white">
              {profile.portfolioTitle || "RECENT"} <span className="text-gray-500 font-light">{profile.portfolioSubtitle || "PROJECTS"}</span>
            </h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[450px] bg-gray-900 border border-gray-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-24 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-500 bg-gray-900/20">
              <span className="text-sm">No projects deployed yet.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(projects) &&
                projects.map((project) => (
                  <div key={project.id} className="group relative bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all flex flex-col h-full">
                    <div className="w-full h-56 relative bg-gray-950 shrink-0 border-b border-gray-800/50 overflow-hidden">
                      <Image src={project.image || "https://via.placeholder.com/600x400?text=App"} alt={project.title || "Project"} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-white">{project.title || "Untitled App"}</h4>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {project.role && <span className="text-cyan-400 bg-cyan-400/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">{project.role}</span>}
                        {project.date && <span className="text-gray-500 text-[10px] font-mono">{project.date}</span>}
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">{project.description}</p>

                      <div className="mt-auto border-t border-gray-800 pt-4 flex flex-col gap-4">
                        <div className="text-[10px] text-gray-500 flex flex-wrap gap-1 font-mono">
                          {project.tags?.split(",").map((t, i) => (
                            <span key={i} className="bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                              {t.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4">
                          {project.githubUrl && (
                            <a href={project.githubUrl} target="_blank" rel="noreferrer" title="Source Code" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
                              </svg>
                              Code
                            </a>
                          )}
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noreferrer" title="Live Site" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                              Live
                            </a>
                          )}
                          {project.demoUrl && (
                            <a href={project.demoUrl} target="_blank" rel="noreferrer" title="Interactive Demo / Storybook" className="text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-1.5 text-xs font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Demo
                            </a>
                          )}
                          {project.designUrl && (
                            <a href={project.designUrl} target="_blank" rel="noreferrer" title="Figma / Design" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5 text-xs font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                              </svg>
                              Design
                            </a>
                          )}
                          {project.articleUrl && (
                            <a href={project.articleUrl} target="_blank" rel="noreferrer" title="Case Study / Article" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1.5 text-xs font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                              </svg>
                              Read
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditProject(project)} className="bg-white hover:bg-gray-200 text-black p-2 rounded-full shadow-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>

        {isAdmin && (
          <div className="mt-32 relative border-t border-gray-800 pt-16">
            <div className="flex items-center justify-center mb-10">
              <div className="bg-gray-900 border border-gray-800 rounded-full p-1 flex gap-1">
                <button onClick={() => setAdminTab("profile")} className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${adminTab === "profile" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"}`}>
                  Edit Profile
                </button>
                <button onClick={() => setAdminTab("project")} className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${adminTab === "project" ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white"}`}>
                  Manage Projects
                </button>
              </div>
            </div>

            {adminTab === "profile" && (
              <section className="bg-[#0a0a0a] border border-gray-800 p-6 md:p-10 rounded-3xl shadow-2xl relative">
                <h2 className="text-2xl font-bold mb-8 text-white">Profile Configuration</h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Greeting</label>
                      <input type="text" value={editProfile.greeting || ""} onChange={(e) => setEditProfile({ ...editProfile, greeting: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Full Name</label>
                      <input type="text" value={editProfile.name || ""} onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Main Title</label>
                      <input type="text" value={editProfile.title || ""} onChange={(e) => setEditProfile({ ...editProfile, title: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Subtitle</label>
                      <input type="text" value={editProfile.subtitle || ""} onChange={(e) => setEditProfile({ ...editProfile, subtitle: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                  </div>

                  <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-gray-400">Portfolio Section Text</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Small Label</label>
                        <input type="text" value={editProfile.portfolioHeading || ""} onChange={(e) => setEditProfile({ ...editProfile, portfolioHeading: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Main Title</label>
                        <input type="text" value={editProfile.portfolioTitle || ""} onChange={(e) => setEditProfile({ ...editProfile, portfolioTitle: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Subtitle</label>
                        <input type="text" value={editProfile.portfolioSubtitle || ""} onChange={(e) => setEditProfile({ ...editProfile, portfolioSubtitle: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Tech Stack (Comma Separated)</label>
                      <input type="text" value={editProfile.skills || ""} onChange={(e) => setEditProfile({ ...editProfile, skills: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Tools & Platforms (Comma Separated)</label>
                      <input type="text" value={editProfile.tools || ""} onChange={(e) => setEditProfile({ ...editProfile, tools: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Email</label>
                      <input type="email" value={editProfile.email || ""} onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Phone</label>
                      <input type="text" value={editProfile.phone || ""} onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">GitHub URL</label>
                      <input type="url" value={editProfile.github || ""} onChange={(e) => setEditProfile({ ...editProfile, github: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">LinkedIn URL</label>
                      <input type="url" value={editProfile.linkedin || ""} onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Twitter URL</label>
                      <input type="url" value={editProfile.twitter || ""} onChange={(e) => setEditProfile({ ...editProfile, twitter: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Resume Link</label>
                      <input type="url" value={editProfile.resumeUrl || ""} onChange={(e) => setEditProfile({ ...editProfile, resumeUrl: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Avatar Image</label>
                      <button type="button" onClick={() => setProfileImageMode(profileImageMode === "url" ? "upload" : "url")} className="text-xs text-cyan-400 hover:underline">
                        {profileImageMode === "url" ? "Switch to Upload" : "Switch to URL"}
                      </button>
                    </div>
                    {profileImageMode === "url" ? <input type="url" value={editProfile.portraitImage || ""} onChange={(e) => setEditProfile({ ...editProfile, portraitImage: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" placeholder="https://..." /> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (val) => setEditProfile({ ...editProfile, portraitImage: val }))} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 text-gray-400 cursor-pointer" />}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Bio / About</label>
                    <textarea rows={4} value={editProfile.description || ""} onChange={(e) => setEditProfile({ ...editProfile, description: e.target.value })} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white resize-none"></textarea>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full md:w-auto px-8 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition shadow-lg">
                      Save Profile
                    </button>
                  </div>
                </form>
              </section>
            )}

            {adminTab === "project" && (
              <section className="bg-[#0a0a0a] border border-gray-800 p-6 md:p-10 rounded-3xl shadow-2xl relative">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">{editingProjectId ? "Edit Project" : "Add New Project"}</h2>
                  {editingProjectId && (
                    <button type="button" onClick={cancelEdit} className="text-sm bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition">
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProject} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Project Title</label>
                      <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Your Role</label>
                      <input type="text" value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" placeholder="Frontend Dev, UI Engineer..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Date / Year</label>
                      <input type="text" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" />
                    </div>
                  </div>

                  <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-gray-400">Project Links & Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Live Site URL</label>
                        <input type="url" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">GitHub Repo</label>
                        <input type="url" value={formGithubUrl} onChange={(e) => setFormGithubUrl(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Interactive Demo (Storybook)</label>
                        <input type="url" value={formDemoUrl} onChange={(e) => setFormDemoUrl(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Case Study / Article</label>
                        <input type="url" value={formArticleUrl} onChange={(e) => setFormArticleUrl(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Figma / Design URL</label>
                        <input type="url" value={formDesignUrl} onChange={(e) => setFormDesignUrl(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Tech Stack (Tags, Comma Separated)</label>
                    <input type="text" value={formTags} onChange={(e) => setFormTags(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" placeholder="React, Next.js, Framer Motion..." />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Cover Image</label>
                      <button type="button" onClick={() => setProjectImageMode(projectImageMode === "url" ? "upload" : "url")} className="text-xs text-cyan-400 hover:underline">
                        {projectImageMode === "url" ? "Switch to Upload" : "Switch to URL"}
                      </button>
                    </div>
                    {projectImageMode === "url" ? <input type="url" value={formImage} onChange={(e) => setFormImage(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white" placeholder="Leave empty for default" /> : <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="w-full bg-gray-950 border border-gray-800 p-2 rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 text-gray-400 cursor-pointer" />}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Description</label>
                    <textarea rows={4} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl focus:border-cyan-500 focus:outline-none transition text-white resize-none"></textarea>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full md:w-auto px-8 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition shadow-lg">
                      {editingProjectId ? "Update Project" : "Publish Project"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
