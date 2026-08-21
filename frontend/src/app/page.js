"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import Image from "next/image";
import { Copy, Check, QrCode, BarChart3, Globe, Shield, ExternalLink, ArrowRight } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const onSubmit = (e) => {
    e.preventDefault();
    if (!url) return;

    //shortened URL output
    setShortUrl(`https://kartikeypathak.com/`);
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-between relative overflow-x-hidden font-sans">

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

          <a href="/"><span className="font-bold text-xl tracking-tight">URL Shortener</span></a>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          <a href="#api" className="hover:text-white transition-colors">API Docs</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="text-sm font-medium cursor-pointer px-4 py-2 rounded-lg text-zinc-300 active:text-white active:bg-white/5 hover:text-white hover:bg-white/5 transition-all">
            Log In
          </button>
          <button className="text-sm font-medium cursor-pointer px-4 py-2 rounded-lg bg-white active:bg-zinc-200 text-black hover:bg-zinc-200 transition-all font-semibold shadow-md">
            Get Started
          </button>
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


        <div className="w-full max-w-2xl mt-8 p-6 md:p-8 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl transition-all">
          <h3 className="font-medium text-zinc-200 text-lg mb-4 text-left">
            Paste your long URL
          </h3>

          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />


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
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 cursor-pointer text-white transition-all w-full sm:w-auto justify-center"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>



      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full py-6 text-center text-xs text-zinc-500 border-t border-white/5">
        {new Date().getFullYear()} Kartikey Pathak. All rights reserved.
      </footer>
    </div>
  );
}