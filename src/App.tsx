/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Ghost, 
  Search, 
  EyeOff, 
  Eye, 
  Shield, 
  Settings, 
  History, 
  Play, 
  Pause, 
  Maximize2, 
  Volume2, 
  ExternalLink,
  ChevronRight,
  MonitorOff,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Types
interface PlaylistItem {
  url: string;
  timestamp: number;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isBlackout, setIsBlackout] = useState(false);
  const [isStealth, setIsStealth] = useState(false);
  const [history, setHistory] = useState<PlaylistItem[]>([]);
  const [isAdBlockActive, setIsAdBlockActive] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentView, setCurrentView] = useState<'home' | 'player'>('home');

  // Media Session API Setup
  useEffect(() => {
    const nav = navigator as any;
    if ("mediaSession" in nav) {
      const metadataPayload = {
        title: "GhostPlayer Stream",
        artist: "Anonymous Viewer",
        album: "Stealth Mode",
        artwork: [
          {
            src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=512",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      };

      try {
        const metadataPayload = {
          title: "GhostPlayer Stream",
          artist: "Anonymous Viewer",
          album: "Stealth Mode",
          artwork: [
            {
              src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=512",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        };

        if ("MediaMetadata" in window) {
          nav.mediaSession.metadata = new (window as any).MediaMetadata(metadataPayload);
        } else {
          nav.mediaSession.metadata = metadataPayload;
        }
      } catch (e) {
        console.error("MediaSession error:", e);
      }

      nav.mediaSession.setActionHandler("play", () => {
        if (videoRef.current) videoRef.current.play();
      });
      nav.mediaSession.setActionHandler("pause", () => {
        if (videoRef.current) videoRef.current.pause();
      });
    }
  }, []);

  const getCleanUrl = (rawUrl: string) => {
    let clean = rawUrl.trim();
    if (!clean) return '';
    
    // YouTube cleanup
    if (clean.includes('youtube.com/watch?v=') || clean.includes('youtu.be/')) {
      const videoId = clean.includes('watch?v=') 
        ? new URL(clean).searchParams.get('v')
        : clean.split('/').pop()?.split('?')[0];
        
      if (videoId) {
        // use youtube-nocookie for better privacy and fewer cookies/ads
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
      }
    }
    
    // Generic URL: ensure protocol
    if (!clean.startsWith('http')) {
      clean = 'https://' + clean;
    }
    
    return clean;
  };

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = getCleanUrl(inputUrl);
    if (finalUrl) {
      setUrl(finalUrl);
      setCurrentView('player');
      setHistory(prev => [{ url: inputUrl, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    }
  };

  const toggleBlackout = () => {
    setIsBlackout(!isBlackout);
    // Request Wake Lock if possible to keep screen on even if dimmed
    if (!isBlackout && 'wakeLock' in navigator) {
      try {
        (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 font-sans selection:bg-cyan-500 selection:text-white overflow-hidden",
      isBlackout ? "bg-black" : "bg-[#0a0a0c] text-slate-200"
    )}>
      {/* Background Atmosphere */}
      <div className={cn(
        "fixed inset-0 pointer-events-none transition-opacity duration-1000",
        isBlackout ? "opacity-0" : "opacity-100"
      )}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'home' && !isBlackout && (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-12"
          >
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-8 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Ghost className="w-10 h-10 text-cyan-400 relative z-10" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4">
                Ghost<span className="text-cyan-500">Player</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold tracking-widest uppercase">
                  Engine Core v1.4
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-bold tracking-widest uppercase">
                  Anon Mode Active
                </span>
              </div>
              <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                Navega y reproduce videos sin rastros. Privacidad total, interfaz minimalista.
              </p>
            </div>

            {/* URL Input Bar */}
            <form onSubmit={handlePlay} className="relative mb-12">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition" />
              <div className="relative flex items-center bg-[#121216] border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
                <div className="pl-4 pr-3">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Pega la URL del video (YouTube, MP4 link, etc)..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none py-3 text-lg placeholder:text-slate-600"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Actions / Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: Shield, title: 'Modo Anónimo', desc: 'Sin cookies, sin historial de sesión.' },
                { icon: Zap, title: 'Filtro Smart', desc: 'Elimina interfaces intrusivas y anuncios.' },
                { icon: MonitorOff, title: 'Hidden Play', desc: 'Reproduce con el dispositivo en reposo.' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
                  <item.icon className="w-6 h-6 text-cyan-500 mb-4" />
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* History */}
            {history.length > 0 && (
              <section>
                <div className="flex items-center gap-2 text-slate-300 font-medium mb-6">
                  <History className="w-5 h-5" />
                  <h2>Recientes</h2>
                </div>
                <div className="space-y-3">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputUrl(item.url);
                        setUrl(getCleanUrl(item.url));
                        setCurrentView('player');
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                        <Play className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                      </div>
                      <span className="flex-1 text-left text-slate-300 truncate text-sm">
                        {item.url}
                      </span>
                      <span className="text-xs text-slate-600">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </motion.main>
        )}

        {currentView === 'player' && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 flex flex-col",
              isBlackout ? "bg-black" : "bg-[#0a0a0c]"
            )}
          >
            {/* Player Interface Overlay */}
            {!isBlackout && (
              <header className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
                >
                  <Ghost className="w-6 h-6 text-cyan-500" />
                  <span className="font-semibold tracking-tight">GhostPlayer</span>
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsStealth(!isStealth)}
                    className={cn(
                      "p-2 rounded-full border transition-all",
                      isStealth ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-900/50 border-slate-800 text-slate-400"
                    )}
                    title="Modo Stealth"
                  >
                    {isStealth ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleBlackout}
                    className="p-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white transition-all"
                    title="Hidden Screen"
                  >
                    <MonitorOff className="w-5 h-5" />
                  </button>
                </div>
              </header>
            )}

            {/* The Actual Player */}
            <div className={cn(
              "flex-1 relative overflow-hidden flex items-center justify-center transition-all duration-1000",
              isStealth ? "opacity-20 blur-sm" : "opacity-100"
            )}>
              {url.includes('embed') ? (
                <iframe
                  ref={iframeRef}
                  src={url}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={url}
                  className="max-w-full max-h-full"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>

            {/* Blackout Full Overlay (Specific buttons to escape) */}
            {isBlackout && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] cursor-none flex flex-col items-center justify-center bg-black overflow-hidden"
              >
                {/* Center Indicator (Very faint) */}
                <motion.div 
                    animate={{ opacity: [0.03, 0.08, 0.03] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="flex flex-col items-center gap-4 pointer-events-none"
                >
                    <Ghost className="w-16 h-16 text-slate-800" />
                    <div className="text-slate-900 text-[8px] uppercase font-bold tracking-[0.8em] select-none">
                      Stealth Engine Active
                    </div>
                </motion.div>

                {/* Simulated iPhone-style bottom controls to "Wake" */}
                <div className="absolute bottom-16 inset-x-0 px-10 flex justify-between items-center">
                  {/* Power/Flashlight Button Simulation */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleBlackout}
                    className="w-12 h-12 rounded-full bg-slate-900/10 border border-slate-900/20 flex items-center justify-center text-slate-900/30 hover:bg-slate-900/40 hover:text-slate-800 transition-all active:ring-2 active:ring-slate-800"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                  </motion.button>

                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <div className="w-32 h-1 bg-slate-900/20 rounded-full" />
                    <span className="text-[10px] text-slate-900/40 uppercase tracking-[0.2em]">Ghost Mode</span>
                  </div>

                  {/* Camera Button Simulation - Also acts as unlock */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleBlackout}
                    className="w-12 h-12 rounded-full bg-slate-900/10 border border-slate-900/20 flex items-center justify-center text-slate-900/30 hover:bg-slate-900/40 hover:text-slate-800 transition-all active:ring-2 active:ring-slate-800"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="absolute top-12 text-slate-900/20 text-[10px] font-mono select-none">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            )}

            {/* Bottom Controls Bar (only if not blackout) */}
            {!isBlackout && (
              <footer className="p-6 bg-[#0a0a0c] border-t border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Shield className={cn("w-4 h-4", isAdBlockActive ? "text-cyan-500" : "text-slate-700")} /> 
                    Secure View
                  </span>
                  <div className="h-4 w-px bg-slate-800" />
                  <span className="truncate max-w-[200px]">{url}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className="text-[10px] uppercase font-bold text-slate-700 tracking-[0.2em]">Ghost Engine v1.0</span>
                  <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: 'GhostPlayer Stream', url });
                        }
                    }}
                    className="text-slate-500 hover:text-white"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
