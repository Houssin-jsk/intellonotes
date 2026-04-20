"use client";

import React, { useEffect, useState } from "react";

export function GlobalBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden isolate bg-slate-50/50">
      {/* Base soft background */}
      <div className="absolute inset-0 bg-[#f4f7fc] opacity-100 transition-opacity duration-1000" />
      
      {/* Moving gradient meshes (Highly Visible now) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Core Blue wave */}
        <div 
          className="absolute w-[120vw] h-[120vh] bg-blue-300 rounded-[100%] blur-[160px] opacity-40 animate-wave-slowest left-[-15%] top-[-20%] mix-blend-normal"
          style={{ animationDuration: '28s' }}
        />
        {/* Purple accent wave */}
        <div 
          className="absolute w-[90vw] h-[90vh] bg-indigo-300 rounded-[100%] blur-[160px] opacity-35 animate-wave-slow right-[-10%] top-[10%] mix-blend-normal"
          style={{ animationDuration: '35s', animationDelay: '-5s' }}
        />
        {/* Sky blue secondary wave */}
        <div 
          className="absolute w-[100vw] h-[80vh] bg-cyan-200 rounded-[100%] blur-[140px] opacity-40 animate-wave-medium bottom-[-20%] left-[5%] mix-blend-normal"
          style={{ animationDuration: '24s', animationDelay: '-12s' }}
        />
      </div>

      {/* Heavy Blur Layer to blend colors perfectly into a mesh */}
      <div className="absolute inset-0 backdrop-blur-[80px]"></div>

      {/* Extra Subtle 3D Glass Orbs visible globally */}
      <div className="absolute inset-0 pointer-events-none perspective-1000">
        <div className="absolute top-[20%] right-[10%] w-64 h-64 rounded-full glass bg-white/20 border border-white/40 shadow-[0_8px_32px_rgba(0,100,255,0.05),inset_0_4px_12px_rgba(255,255,255,0.8)] backdrop-blur-3xl animate-float-1 opacity-60" 
             style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full glass bg-white/10 border border-white/30 shadow-[0_8px_32px_rgba(0,100,255,0.05),inset_0_4px_12px_rgba(255,255,255,0.6)] backdrop-blur-3xl animate-float-2 opacity-50"
             style={{ animationDelay: '-4s' }} />
      </div>

      {/* Subtle grain texture overlay for premium print feel */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
    </div>
  );
}
export function AuthBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden isolate bg-[#0a0f1d]">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c142e] via-[var(--color-primary-900)] to-[#070b1a] opacity-95"></div>

      {/* Dynamic glowing orbs and waves inside the auth block (High Visibility) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen mix-blend-color-dodge">
        <div 
          className="absolute w-[140%] h-[120%] bg-blue-500 rounded-[100%] blur-[120px] opacity-30 animate-wave-slow"
          style={{ animationDuration: '24s' }}
        />
        <div 
          className="absolute right-[-10%] top-[-10%] w-[80%] h-[80%] bg-indigo-400 rounded-full blur-[140px] opacity-40 animate-wave-medium"
          style={{ animationDuration: '18s', animationDelay: '-4s' }}
        />
        <div 
          className="absolute left-[-20%] bottom-[-10%] w-[90%] h-[70%] bg-[var(--color-primary-400)] rounded-full blur-[120px] opacity-30 animate-wave-slowest"
          style={{ animationDuration: '28s', animationDelay: '-8s' }}
        />
      </div>

      {/* Heavy mesh blend layer for deep rich blue tech aesthetic */}
      <div className="absolute inset-0 backdrop-blur-[60px]"></div>

      {/* Premium 3D tech grid overlay */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none"></div>

      <Floating3DElements />
    </div>
  );
}

function Floating3DElements() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden perspective-[1200px]">
      {/* Orb 1: Top right capsule */}
      <div className="absolute top-[10%] right-[5%] w-48 h-64 rounded-[3rem] glass bg-white/10 border border-white/20 shadow-[0_10px_50px_rgba(255,255,255,0.05),inset_0_4px_30px_rgba(255,255,255,0.3)] backdrop-blur-2xl animate-float-capsule opacity-90" 
           style={{ animationDelay: '0s' }}>
        <div className="absolute top-2 left-2 right-2 h-1/2 rounded-t-[2.5rem] bg-gradient-to-b from-white/30 to-transparent blur-md"></div>
      </div>

      {/* Orb 2: Bottom left huge sphere */}
      <div className="absolute bottom-[5%] left-[0%] w-72 h-72 rounded-full glass bg-blue-300/10 border border-blue-200/20 shadow-[0_10px_80px_rgba(37,99,235,0.15),inset_0_4px_40px_rgba(255,255,255,0.2)] backdrop-blur-3xl animate-float-1 opacity-80"
           style={{ animationDelay: '-6s' }}>
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-tl from-blue-200/20 to-transparent blur-2xl"></div>
      </div>

      {/* Orb 3: Small floating sphere */}
      <div className="absolute top-[50%] left-[25%] w-24 h-24 rounded-full glass border border-white/30 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.15),inset_0_2px_10px_rgba(255,255,255,0.4)] backdrop-blur-md animate-float-3 opacity-90"
           style={{ animationDelay: '-2s' }}>
      </div>

      {/* Floating 3D Shell Layer for center depth */}
      <div className="absolute top-[35%] right-[25%] w-64 h-32 rounded-[2rem] glass border border-indigo-200/20 bg-indigo-400/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.8)] animate-float-shell opacity-80"
           style={{ animationDelay: '-8s', transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 rounded-[2rem] border border-white/10 translate-z-4"></div>
      </div>
    </div>
  );
}
