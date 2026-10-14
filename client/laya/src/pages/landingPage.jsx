import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';
import dreamscapeImg from '../assets/dreamscape.jpg';

/* ─────────────────────────────────────────────────────────────
   ROOM AUDIO ENGINE (Web Audio API)
   528Hz warm analog ambient tone + subtle vinyl crackle
───────────────────────────────────────────────────────────── */
class RoomAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.nodes = [];
  }

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.001, this.ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
      master.connect(this.ctx.destination);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.connect(master);

      const freqs = [73.42, 110.0, 146.83, 220.0, 261.63, 329.63];
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 5, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoG = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.05 + i * 0.02, this.ctx.currentTime);
        lfoG.gain.setValueAtTime(0.015, this.ctx.currentTime);
        lfo.connect(lfoG);
        lfoG.connect(g.gain);

        g.gain.setValueAtTime(0.035 / (i + 1), this.ctx.currentTime);
        osc.connect(g);
        g.connect(filter);

        osc.start();
        lfo.start();
        this.nodes.push(osc, lfo);
      });

      // Vinyl crackle simulation
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const r = Math.random();
        data[i] = r > 0.9988 ? (Math.random() * 2 - 1) * 0.4 : (Math.random() * 2 - 1) * 0.012;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(2.8, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.03, this.ctx.currentTime);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      this.nodes.push(noise, master, filter);
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext unavailable:', e);
    }
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    try {
      this.nodes.forEach(n => {
        try { n.stop && n.stop(); } catch(e){}
        try { n.disconnect && n.disconnect(); } catch(e){}
      });
      if (this.ctx.state !== 'closed') this.ctx.close();
    } catch(e) {}
    this.nodes = [];
    this.isPlaying = false;
  }
}

/* ─────────────────────────────────────────────────────────────
   EXACT VECTOR EMBLEMS (From Reference 152)
───────────────────────────────────────────────────────────── */

// 8-blade aperture pinwheel (Image 1 bottom-left)
const ApertureVortex = ({ className = '', isSpinning = false }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} ${isSpinning ? 'animate-spin-slow' : ''}`} 
    fill="currentColor"
  >
    <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <path
        key={i}
        transform={`rotate(${angle} 50 50)`}
        d="M50 50 C44 32, 46 15, 50 4 C58 14, 62 32, 50 50 Z"
      />
    ))}
    <circle cx="50" cy="50" r="16" fill="currentColor" />
  </svg>
);

// Wire swirl compass (Image 1 top)
const WireSwirl = ({ className = '' }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="40" cy="40" r="35" strokeDasharray="2 3" opacity="0.4" />
    <path d="M40 10 C56 10, 70 24, 70 40 C70 56, 56 70, 40 70 C24 70, 10 56, 10 40" opacity="0.7" />
    <path d="M40 18 C52 18, 62 28, 62 40 C62 52, 52 62, 40 62 C28 62, 18 52, 18 40" strokeDasharray="1 2" opacity="0.5" />
    <circle cx="40" cy="40" r="3" fill="currentColor" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT: SINGLE FULLSCREEN BRUTALIST POSTER
───────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPill, setSelectedPill] = useState('BLISS');

  useEffect(() => {
    audioRef.current = new RoomAudio();
    return () => {
      if (audioRef.current) audioRef.current.stop();
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.stop();
      setIsPlaying(false);
    } else {
      audioRef.current.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black text-zinc-900 p-2 sm:p-4 lg:p-5 flex flex-col justify-between overflow-hidden select-none">
      
      {/* ── Global Styles for Libron & Paper Texture ── */}
      <style>{`
        .font-libron {
          font-family: 'Libron', Georgia, serif;
        }
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: slowSpin 24s linear infinite;
        }
        .paper-grain {
          background-color: #e5ded2;
          background-image: radial-gradient(#d3c9ba 0.75px, transparent 0.75px);
          background-size: 6px 6px;
        }
      `}</style>

      {/* ── Architectural SVG Clip Paths (Concentric Crescent Gutter) ── */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* Div A: Top Olive Block with Concave Pure Arch Bottom */}
          <clipPath id="crescentTopDivA" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 1,0 L 1,0.44 C 0.78,0.16 0.22,0.16 0,0.44 Z" />
          </clipPath>

          {/* Div B: Dedicated Image Block with Convex Arch Dome Top (Concentric +0.025 Gap) */}
          <clipPath id="crescentArchDivB" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.465 C 0.22,0.185 0.78,0.185 1,0.465 L 1,1 L 0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── Tactile Noise Overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Top Minimalist Bar ── */}
      <div className="w-full flex items-center justify-between pb-2 px-1 text-white/50 text-[10px] font-mono tracking-widest uppercase shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold tracking-[0.25em]">LAYA</span>
          <span className="text-white/20">|</span>
          <span>A PERSONAL MUSIC ROOM</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-mono transition-all duration-300 ${
              isPlaying 
                ? 'border-emerald-400/50 bg-emerald-950/30 text-emerald-300' 
                : 'border-white/15 bg-white/[0.03] text-zinc-400 hover:text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-3 h-3 text-emerald-300 animate-pulse" />
                <span>528Hz ROOM ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-zinc-500" />
                <span>SOUND OFF</span>
              </>
            )}
          </button>

          <span className="text-white/20">|</span>
          <button
            onClick={() => navigate('/login')}
            className="text-white hover:text-emerald-300 transition-colors tracking-widest text-[9.5px]"
          >
            ENTER →
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ASYMMETRICAL 4-BLOCK BRUTALIST GRID
          - Left Column:
            * Part 1 (Top-Left): Flat left, top, bottom. ONLY rounded-tr-[52px].
            * [GAP: gap-3 sm:gap-4]
            * Part 2 (Bottom-Left): Flat left, top, bottom. ONLY rounded-br-[52px].
          
          - Right Column:
            * Div A (Top-Right): Concave crescent arch bottom.
            * [CRESCENT BLACK GUTTER: Concentric arch negative space]
            * Div B (Bottom-Right Image Block): Convex dome arch top nesting into the crescent.
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
        
        {/* ── LEFT COLUMN (Divided into Part 1 & Part 2 with thick black gap) ── */}
        <div className="w-full lg:w-[280px] xl:w-[320px] flex flex-col gap-3 sm:gap-4 h-full shrink-0">
          
          {/* ── PART 1: TOP-LEFT CREAM BLOCK ── */}
          {/* Ends flat on left, top, bottom — ONLY rounded on top-right */}
          <div className="h-[34%] paper-grain rounded-none rounded-tr-[44px] sm:rounded-tr-[52px] p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden border border-[#d6cebf]">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-6xl sm:text-7xl font-sans font-black tracking-tighter text-[#121613] leading-none">
                  152
                </span>
                <span className="text-[8.5px] font-mono tracking-[0.3em] uppercase text-[#616b64] font-semibold mt-1">
                  ROOM // VOL. 01
                </span>
              </div>

              {/* Thin Circle Outline from Image 1 */}
              <div className="w-12 h-12 rounded-full border border-[#141815]/35 flex items-center justify-center mr-2">
                <span className="w-2 h-2 rounded-full bg-[#141815]/40" />
              </div>
            </div>

            {/* Vertical Spine Tag 'HEAVEN' along the flat left border */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#5e6660] font-bold">
                HEAVEN
              </span>
              <div className="flex-1 h-px bg-[#141815]/15" />
            </div>
          </div>

          {/* ── PART 2: BOTTOM-LEFT CREAM BLOCK ── */}
          {/* Ends flat on left, top, bottom — ONLY rounded on bottom-right */}
          <div className="flex-1 paper-grain rounded-none rounded-br-[44px] sm:rounded-br-[52px] p-5 sm:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden border border-[#d6cebf]">
            
            {/* Top Spine Marker: circle on a line */}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-[#141815] bg-transparent" />
                <div className="w-12 h-px bg-[#141815]/25" />
                <span className="text-[9px] font-mono tracking-[0.25em] text-[#555d57] uppercase">
                  DREAMLAND • ○
                </span>
              </div>
            </div>

            {/* Inset Tactile Pills (BLISS, UTOPIA, WONDERLAND) */}
            <div className="my-auto flex flex-col items-end gap-2.5 pr-1">
              {['BLISS', 'UTOPIA', 'WONDERLAND'].map((pill) => {
                const isSelected = selectedPill === pill;
                return (
                  <button
                    key={pill}
                    onClick={() => setSelectedPill(pill)}
                    className={`px-5 py-2 rounded-full text-[10.5px] font-mono tracking-[0.25em] uppercase font-bold transition-all duration-300 border ${
                      isSelected
                        ? 'bg-[#141815] text-[#e5ded2] border-[#141815] shadow-md'
                        : 'bg-transparent text-[#222824] border-[#141815]/25 hover:border-[#141815]/60 hover:bg-[#141815]/5'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>

            {/* Bottom Row: Rotating Aperture Vortex & Vertical Caption */}
            <div className="pt-4 border-t border-[#141815]/15 flex items-end justify-between">
              
              {/* Rotating Aperture Vortex */}
              <button
                onClick={toggleSound}
                className="group flex items-center gap-3 text-left focus:outline-none"
                title="Click to toggle room sound"
              >
                <ApertureVortex 
                  className="w-12 h-12 text-[#121613] group-hover:scale-105 transition-transform" 
                  isSpinning={isPlaying} 
                />
                <div className="flex flex-col">
                  <span className="text-[8.5px] font-mono font-bold tracking-widest uppercase text-[#141815]">
                    {isPlaying ? 'SOUND ACTIVE' : 'NEEDLE READY'}
                  </span>
                  <span className="text-[7.5px] font-mono text-[#616b64]">
                    528Hz ROOM
                  </span>
                </div>
              </button>

              {/* Vertical micro-text along the corner */}
              <div className="text-[7.5px] font-mono tracking-[0.25em] uppercase text-[#616b64] text-right font-medium leading-tight">
                <div>AN IDEAL OR</div>
                <div>IDYLLIC STATE</div>
              </div>

            </div>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT COLUMN: DIV A & DIV B WITH CONCENTRIC CRESCENT BLACK GUTTER
            - Div A: Top Olive Block with Concave Crescent Arch Bottom
            - [CRESCENT BLACK GUTTER: Pure Negative Space Arch Reveal]
            - Div B: Dedicated Image Block with Matching Convex Dome Arch Top
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 h-full relative overflow-hidden rounded-[32px] sm:rounded-[44px] bg-black">
          
          {/* ── DIV A (TOP OLIVE BLOCK): Concave Crescent Bottom Curve ── */}
          <div 
            className="absolute inset-0 bg-[#243529] px-6 sm:px-8 pt-4 sm:pt-6 shadow-xl z-20 pointer-events-auto"
            style={{
              clipPath: 'url(#crescentTopDivA)',
              WebkitClipPath: 'url(#crescentTopDivA)',
            }}
          >
            <div className="w-full flex items-start justify-between">
              {/* Left indicator */}
              <div className="w-12 pt-2">
                <div className="w-2.5 h-2.5 rounded-full border border-white/30 flex items-center justify-center">
                  <span className="w-0.5 h-0.5 rounded-full bg-white/60" />
                </div>
              </div>

              {/* Center: Exact typography from Reference */}
              <div className="flex flex-col items-center">
                <WireSwirl className="w-7 h-7 sm:w-8 sm:h-8 text-white/50 mb-1" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">▸</span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal tracking-wide text-zinc-100 flex items-center gap-2">
                    <span className="font-sans font-normal">a walk in</span>
                    <span className="font-libron italic text-emerald-200 font-normal">
                      paradise
                    </span>
                  </h1>
                  <span className="text-xs text-white/40">◂</span>
                </div>
              </div>

              {/* Right: Enter button */}
              <div className="w-12 text-right pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-[10px] font-mono tracking-[0.2em] text-white/70 hover:text-white uppercase transition-colors"
                >
                  ENTER →
                </button>
              </div>
            </div>
          </div>

          {/* ── DIV B (BOTTOM IMAGE BLOCK): Convex Dome Arch Top ── */}
          <div 
            className="absolute inset-0 bg-[#162019] overflow-hidden shadow-2xl z-10"
            style={{
              clipPath: 'url(#crescentArchDivB)',
              WebkitClipPath: 'url(#crescentArchDivB)',
            }}
          >
            {/* The Full Dreamscape Image within the Arch Dome */}
            <div className="relative w-full h-full flex flex-col justify-between group overflow-hidden">
              
              <img
                src={dreamscapeImg}
                alt="Lavender meadow dreamscape with crystal orb"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-1000 group-hover:scale-[1.02]"
              />

              {/* Atmospheric Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

              {/* Floating Frosted Glass Capsule (Image 1) */}
              <div className="absolute bottom-10 right-6 sm:right-10 w-14 sm:w-16 h-56 sm:h-64 rounded-full backdrop-blur-xl bg-white/[0.12] border border-white/30 shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between py-5 z-20">
                <Sparkles className="w-4 h-4 text-white/80" />

                {/* Vertical Libron Italic text */}
                <div className="writing-vertical text-[9px] sm:text-[10px] font-libron italic tracking-[0.28em] text-white/95 uppercase select-none">
                  laya sound system x personal space
                </div>

                {/* Mini Audio Button */}
                <button
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/25 hover:bg-white/45 border border-white/40 flex items-center justify-center text-white transition-all shadow-md"
                  title="Toggle sound"
                >
                  {isPlaying ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-white/80" />
                  )}
                </button>
              </div>

              {/* Micro-annotation inside the arch */}
              <div className="absolute bottom-10 left-8 z-20 text-[9px] font-mono tracking-widest uppercase text-white/60">
                <span className="text-emerald-300">● A PERSONAL LISTENING ROOM</span>
              </div>

              {/* Margin Editorial Micro-text at the base of the image */}
              <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-between px-6 text-[8px] sm:text-[9px] font-mono tracking-[0.28em] uppercase text-white/40 font-medium">
                <span>A PLACE OR CONDITION OF GREAT HAPPINESS WHERE EVERYTHING IS EXACTLY AS YOU WOULD LIKE IT TO BE</span>
                <span className="hidden md:inline">NO PRESSURE • PURE TASTE</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LandingPage;
