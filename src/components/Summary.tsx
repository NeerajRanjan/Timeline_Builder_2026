import React, { useRef, useState } from 'react';
import type { PlacedGoal } from '../types/types';
import { Download, Calendar, Rocket, Instagram, Mail, CheckCircle, Smartphone as SmartphoneIcon, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { generateICS } from '../services/icsService';

interface SummaryProps {
  userName: string;
  goals: PlacedGoal[];
  onBack: () => void;
}

const Summary: React.FC<SummaryProps> = ({ userName, goals, onBack }) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownloadPNG = async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: null, // Transparent to pick up CSS bg
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `2026-Plan-${userName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleDownloadWallpaper = async () => {
    if (wallpaperRef.current) {
        // Temporarily reveal to capture
        wallpaperRef.current.style.display = 'block';
        const canvas = await html2canvas(wallpaperRef.current, {
            scale: 2,
            useCORS: true,
            width: 1080,
            height: 1920,
            windowWidth: 1080,
            windowHeight: 1920
        });
        wallpaperRef.current.style.display = 'none';
        
        const link = document.createElement('a');
        link.download = `2026-Wallpaper-${userName}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
  };

  const handleDownloadICS = () => {
    generateICS(goals, userName);
  };

const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;

  setIsSubmitting(true);

  // Ensure these match your .env.local keys exactly
  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GSHEET_URL;
  const API_TOKEN = import.meta.env.VITE_GSHEET_TOKEN;

  try {
    if (!GOOGLE_SCRIPT_URL) {
      console.warn("Missing VITE_GSHEET_URL in .env.local");
      alert("Setup error: Missing Script URL.");
      return;
    }

    // Using mode: 'no-cors' allows the request to bypass the CORS check.
    // However, you won't be able to read the response body.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // CRITICAL: Bypasses CORS preflight
      cache: "no-cache",
      headers: {
        "Content-Type": "text/plain", // CRITICAL: Prevents preflight request
      },
      body: JSON.stringify({
        Name: userName,
        Email: email,
        Token: API_TOKEN,
      }),
    });

    // Since 'no-cors' returns an opaque response, we assume success 
    // if the fetch doesn't throw a network error.
    setIsEmailSent(true);
    
  } catch (error) {
    console.error("Error submitting email:", error);
    alert("Network error. Please check your connection.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-y-auto pb-20 scroll-smooth transition-colors">
      <div className="max-w-4xl mx-auto pt-10 md:pt-20 px-6">
        
        <div className="mb-12 text-center animate-in slide-in-from-bottom duration-700">
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400">
                Here’s your 2026 timeline, {userName}.
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Stay in control. Stay intentional. <br />
                <span className="text-black dark:text-white font-semibold">Happy New Year 2026.</span> 🚀🌍
            </p>
        </div>

        {/* Capture Area (Main Summary) */}
        <div ref={summaryRef} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-12 shadow-2xl mb-12 animate-in zoom-in duration-500">
          <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div>
                <h2 className="text-2xl font-bold">2026 Master Plan</h2>
                <p className="text-zinc-500 text-sm mt-1">{goals.length} Strategic Goals set</p>
            </div>
            <div className="text-right">
                <p className="text-4xl font-bold text-zinc-200 dark:text-zinc-800">2026</p>
            </div>
          </div>

          <div className="space-y-4">
            {goals.sort((a, b) => a.monthIndex - b.monthIndex).map((goal, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 md:items-center bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <div className={`w-2 h-2 md:h-12 rounded-full ${goal.color}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{goal.title}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-1">{goal.suggestion}</p>
                </div>
                <div className="text-left md:text-right min-w-[150px]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        <Calendar size={12} />
                        Starts in {new Date(2026, goal.monthIndex).toLocaleString('default', { month: 'long' })}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1">
                        Freq: {goal.frequency}
                    </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-zinc-400 dark:text-zinc-600 text-sm flex items-center justify-center gap-2">
            Built with 2026 Timeline Builder <Rocket size={14} />
          </div>
        </div>

        {/* Accountability Section */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-8 mb-12 text-center animate-in fade-in delay-200">
            <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                <Mail className="text-blue-500" /> accountability Check
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto">
                Commit to your future self. Enter your email and we'll send you a personalized check-in on <span className="font-bold text-zinc-900 dark:text-white">December 31st, 2026</span> to see how far you've come.
            </p>
            
            {isEmailSent ? (
                <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-zinc-900/50 py-4 rounded-xl border border-emerald-200 dark:border-emerald-900/30 max-w-sm mx-auto animate-in zoom-in">
                    <CheckCircle size={32} />
                    <span>Locked in. Talk to you in 2026.</span>
                </div>
            ) : (
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input 
                        type="email" 
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center min-w-[120px]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Lock It In"}
                    </button>
                </form>
            )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-20 animate-in fade-in delay-300 duration-700">
          <button 
            onClick={handleDownloadPNG}
            className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-100 text-zinc-900 font-bold py-4 px-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-200 transition-transform active:scale-95 shadow-lg"
          >
            <Download size={18} />
            Summary PNG
          </button>
          
          <button 
            onClick={handleDownloadWallpaper}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-purple-500 transition-transform active:scale-95 shadow-lg shadow-purple-900/20"
          >
            <SmartphoneIcon size={18} />
            Mobile Wallpaper
          </button>
          
          <button 
            onClick={handleDownloadICS}
            className="flex items-center justify-center gap-2 bg-zinc-800 dark:bg-zinc-800 text-white font-bold py-4 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-transform active:scale-95 shadow-lg"
          >
            <Calendar size={18} />
            Export ICS
          </button>
        </div>

        {/* Footer Socials */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-32 text-center animate-in fade-in delay-500">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Connect & Build</h3>
            <p className="text-zinc-500 dark:text-zinc-500 mb-8 text-sm">Need a custom app like this? I build them.</p>
            
            <div className="flex flex-wrap justify-center gap-4">
                <a href="https://www.instagram.com/genzvitra/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors bg-zinc-100 dark:bg-zinc-900/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-5 py-3 rounded-full border border-zinc-200 dark:border-zinc-800">
                    <Instagram size={18} /> <span>Instagram</span>
                </a>
                
            </div>
            
             <button 
                onClick={onBack}
                className="mt-12 text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline text-sm transition-colors"
            >
                Back to Timeline Builder
            </button>
        </div>

        {/* Hidden Wallpaper Template (9:16 Aspect Ratio) */}
        <div 
            ref={wallpaperRef} 
            style={{ display: 'none', width: '1080px', height: '1920px' }} 
            className="bg-[#09090b] text-white p-16 relative overflow-hidden"
        >
            <div className="absolute inset-0 dots-pattern opacity-20" />
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent" />
            
            <div className="relative z-10 h-full flex flex-col">
                <div className="mb-16">
                    <div className="inline-block px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/50 text-xl font-medium text-zinc-400 mb-6">
                        2026 Timeline
                    </div>
                    <h1 className="text-8xl font-black tracking-tighter mb-4">
                        MAKE<br/>TIME<br/>VISIBLE.
                    </h1>
                    <p className="text-3xl text-zinc-400">Owner: {userName}</p>
                </div>

                <div className="flex-1 space-y-6">
                    {goals.sort((a, b) => a.monthIndex - b.monthIndex).slice(0, 10).map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-6">
                            <div className={`w-3 h-24 rounded-full ${goal.color}`} />
                            <div>
                                <h3 className="text-4xl font-bold">{goal.title}</h3>
                                <p className="text-2xl text-emerald-400 mt-1">{goal.suggestion}</p>
                                <p className="text-xl text-zinc-500 mt-1 uppercase tracking-widest">{new Date(2026, goal.monthIndex).toLocaleString('default', { month: 'short' })} • {goal.frequency}</p>
                            </div>
                        </div>
                    ))}
                    {goals.length > 10 && (
                        <p className="text-3xl text-zinc-500 italic mt-8">+ {goals.length - 10} more goals...</p>
                    )}
                </div>

                <div className="mt-auto pt-12 border-t border-zinc-800 flex justify-between items-end">
                    <div>
                         <p className="text-2xl font-bold text-white">2026 Goals</p>
                         <p className="text-xl text-zinc-500">Generated by 2026 Timeline Builder</p>
                    </div>
                    <div className="text-right">
                        <p className="text-6xl font-black text-zinc-800">2026</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Summary;