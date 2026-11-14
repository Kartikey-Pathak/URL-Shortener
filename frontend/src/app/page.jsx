"use client";

import { useState, useEffect } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Copy, Check, ExternalLink, Trash2, Link as LinkIcon } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import { LoaderFive } from "@/components/ui/loader";
import { motion } from "motion/react";
import { useSession, signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CometCard } from "@/components/ui/comet-card";

const BACKEND_REDIRECT_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://url-shortener-1-backend.onrender.com"
).replace(/\/$/, "");

export default function Home() {
  const { data: session } = useSession();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // User's shortened URLs list from backend
  const [userLinks, setUserLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  // Sync token from localStorage or NextAuth session
  useEffect(() => {
    const localToken = localStorage.getItem("token");
    const localUser = localStorage.getItem("user");

    if (localToken) {
      setToken(localToken);
      if (localUser) {
        try {
          setUser(JSON.parse(localUser));
        } catch (e) { }
      }
    } else if (session?.backendToken) {
      setToken(session.backendToken);
      setUser(session.user);
      localStorage.setItem("token", session.backendToken);
      if (session.user) {
        localStorage.setItem("user", JSON.stringify(session.user));
      }
    }
  }, [session]);

  // Fetch user's shortened codes whenever token is available
  const fetchUserLinks = async (authToken) => {
    const activeToken = authToken || token || (typeof window !== "undefined" && localStorage.getItem("token"));
    if (!activeToken) return;

    try {
      setLoadingLinks(true);
      const resp = await axios.get("/api/codes", {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (resp.data && resp.data.codes) {
        setUserLinks(resp.data.codes);
      }
    } catch (error) {
      console.error("Failed to load user codes:", error);
    } finally {
      setLoadingLinks(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserLinks(token);
    }
  }, [token]);

  // Handle Logout
  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    setUserLinks([]);
    if (session) {
      await signOut({ callbackUrl: "/" });
    } else {
      toast.success("Logged Out.");
    }
  };

  const placeholders = [
    "Paste your long URL here...",
    "https://example.com/your-very-long-url",
    "Enter a URL to shorten...",
    "Paste a link you want to make shorter...",
    "https://yourwebsite.com/blog/article/this-is-a-long-url",
  ];

  const words = [
    "Short Links",
    "Smart Links",
    "Powerful Links",
    "Branded Links",
    "Trackable Links",
  ];

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  // Submit Shorten URL to backend API
  const onSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }

    const activeToken = token || (typeof window !== "undefined" && localStorage.getItem("token"));
    if (!activeToken) {
      toast.error("Please log in to shorten URLs");
      return;
    }

    try {
      setLoading(true);

      const payload = { url };

      if (customCode.trim()) {
        payload.code = customCode.trim();   // Added the Customcode in the payload...
      }

      const resp = await axios.post("/api/shorten", payload, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const generatedLink = `${BACKEND_REDIRECT_BASE}/${resp.data.shortCode}`;
      setShortUrl(generatedLink);
      setCustomCode("");
      toast.success("Short URL created!");

      // Refresh list of links
      fetchUserLinks(activeToken);
    } catch (error) {
      const msg = error?.response?.data?.error || "Error shortening URL";
      toast.error(typeof msg === "string" ? msg : "Invalid URL format (include http:// or https://)");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a shortened link using backend DELETE /:id
  const handleDelete = async (id) => {
    const activeToken = token || (typeof window !== "undefined" && localStorage.getItem("token"));
    if (!activeToken) return;

    try {
      await axios.delete(`/api/urls/${id}`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      toast.success("Link deleted");
      setUserLinks((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Failed to delete link");
      console.error(error);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text, id = "main") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans">
      <Toaster />

      {/* Background Video with Blur Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          className="w-full h-full object-cover scale-105"
          src="hero2.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl z-10" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto border-b border-white/10">
        <div className="flex items-center gap-3">
          <a href="/"><span className=" hover:text-white/80 transition-all font-bold text-xl tracking-tight">URL Shortener</span></a>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#links" className="hover:text-white transition-colors">My Links</a>
          <a href="https://github.com/Kartikey-Pathak/URL-Shortener/blob/main/backend/README.md" className="hover:text-white transition-colors">API Docs</a>
        </nav>

        <div className="flex items-center gap-3">
          {token || session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-300 inline-block">
                {user?.name || session?.user?.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium cursor-pointer px-4 py-2 rounded-lg text-zinc-300 active:text-white active:bg-white/5 hover:text-white hover:bg-white/5 transition-all"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <a href="/login"><button className="text-sm font-medium cursor-pointer px-4 py-2 rounded-lg text-zinc-300 active:text-white active:bg-white/5 hover:text-white hover:bg-white/5 transition-all">
                Log In
              </button></a>
              <a href="/signup"><button className="text-sm font-medium cursor-pointer px-4 py-2 rounded-lg bg-white active:bg-zinc-200 text-black hover:bg-zinc-200 transition-all font-semibold shadow-md">
                Get Started
              </button></a>
            </>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 py-12 max-w-5xl mx-auto w-full">
        <h1 className="font-extrabold mt-10 text-white text-4xl sm:text-6xl md:text-7xl tracking-tight max-w-4xl leading-[1.1]">
          Turn Long URLs Into <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"><FlipWords words={words} /></span>
        </h1>

        <p className="font-normal text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mt-4 leading-relaxed">
          Create, manage, and share clean short URLs with a fast, secure URL shortening platform built for developers.
        </p>

        {/* Input Card with CometCard 3D Effect */}
        <CometCard className="w-full max-w-2xl mt-8">
          <div className="w-full p-6 md:p-8 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl transition-all">
            <h3 className="font-medium text-zinc-200 text-lg mb-4 text-left">
              Paste your long URL
            </h3>

            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />

            {/* Optional Custom Short Code Field */}
            <div className="mt-4 flex flex-col sm:flex-row items-end gap-3 text-left">
              <div className="flex-1 w-full">
                <LabelInputContainer>
                  <Label htmlFor="customCode"><span className="text-white">Custom Alias (Optional)</span></Label>
                  <Input
                    id="customCode"
                    type="text"
                    placeholder="e.g. my-cool-link"
                    className="bg-black/30 rounded-xl text-white"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                </LabelInputContainer>
              </div>
              {/* Apple-Style Fluid Color-Changing Gradient Button with Blur Effect */}
              <div className="relative group/apple-btn w-full sm:w-auto shrink-0 h-10 flex items-center justify-center">
                {/* Fluid Color-Changing Glowing Blur (Apple Aura) */}
                <motion.div
                  className="absolute -inset-[3px] rounded-xl opacity-75 blur-md group-hover/apple-btn:opacity-100 group-hover/apple-btn:blur-lg transition-all duration-500 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f59e0b, #ec4899)",
                    backgroundSize: "300% 300%",
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Crisp Fluid Gradient Border */}
                <motion.div
                  className="absolute -inset-[1px] rounded-xl opacity-90 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f59e0b, #ec4899)",
                    backgroundSize: "300% 300%",
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Apple Glassmorphic Button */}
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={loading}
                  className="relative h-full w-full sm:w-auto px-6 rounded-xl bg-black/85 hover:bg-black/65 backdrop-blur-2xl text-white font-semibold text-xs sm:text-sm tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_20px_rgba(0,0,0,0.5)] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer z-10"
                >
                  <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 font-semibold bg-clip-text text-transparent">
                    {loading ? "Shortening..." : "Shorten URL"}
                  </span>
                </button>
              </div>
            </div>

            {/* Newly Generated URL Banner */}
            {shortUrl && (
              <div className="mt-6 p-4 bg-white/5 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="text-left overflow-hidden w-full">
                  <span className="text-xs text-zinc-400 block mb-1">Generated Short Link</span>
                  <a href={shortUrl} target="_blank" rel="noreferrer" className="text-purple-400 font-semibold hover:underline text-base flex items-center gap-1.5 truncate">
                    {shortUrl}
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleCopy(shortUrl, "main")}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 cursor-pointer text-white transition-all w-full sm:w-auto justify-center"
                  >
                    {copiedId === "main" ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === "main" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </CometCard>

        {/* User's Created Links Section (GET /codes) */}
        {
          (token || session) && (
            <section id="links" className="w-full max-w-2xl mt-12 text-left">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LinkIcon size={18} className="text-purple-400" />
                  Your Shortened Links
                </h2>
                <span className="text-xs text-zinc-400">
                  {userLinks.length} {userLinks.length === 1 ? "link" : "links"}
                </span>
              </div>

              {loadingLinks ? (
                <div className="p-8 flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl">
                  <LoaderFive text="Loading your links..." />
                </div>
              ) : userLinks.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-400 bg-white/[0.02] border border-white/5 rounded-2xl">
                  You haven't shortened any links yet. Paste a link above to get started!
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {userLinks.map((item) => {
                    const fullShortUrl = `${BACKEND_REDIRECT_BASE}/${item.shortCode}`;
                    return (
                      <CometCard key={item.id} className="w-full" cardClassName="rounded-2xl">
                        <div
                          className="w-full p-4 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-500/30 transition-all"
                        >
                          <div className="overflow-hidden w-full">
                            <div className="flex items-center gap-2">
                              <a
                                href={fullShortUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-400 font-semibold text-sm hover:underline flex items-center gap-1 truncate"
                              >
                                {fullShortUrl}
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            <p className="text-xs text-zinc-400 truncate mt-1 max-w-md" title={item.targetURL}>
                              {item.targetURL}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleCopy(fullShortUrl, item.id)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                            >
                              {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                              {copiedId === item.id ? "Copied" : "Copy"}
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Delete link"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </CometCard>
                    );
                  })}
                </div>
              )}
            </section>
          )
        }
      </main >

      {/* Footer */}
      < footer className="relative z-20 w-full py-6 text-center text-xs text-zinc-500 border-t border-white/5" >
        {new Date().getFullYear()} Kartikey Pathak.All rights reserved.
      </footer >
    </div >
  );
}

const LabelInputContainer = ({ children, className }) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};

