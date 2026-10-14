// components/cards/VinylCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useAnimationFrame,
  useReducedMotion,
} from 'motion/react'; // `npm i motion`  (same API as framer-motion, which also works)
import { CardArt } from './CardArt.jsx';
import { formatTime } from '@/lib/time.js';

const EASE = [0.65, 0, 0.35, 1];
const OPEN_S = 1.1; // cover slides up and morphs into a circle
const CLOSE_S = 1.0; // cover slides back down

/**
 * VinylCard — animated card used by SongCard and AlbumCard.
 *
 * Controlled by `isPlaying` (no click handling here: <Card> owns click/drag/keys).
 *   isPlaying = false → square cover
 *   isPlaying = true  → cover slides up, morphs into a circle, then the vinyl spins
 *   isPaused  = true  → stays a vinyl, but the spin eases to a stop (and resumes later)
 *
 * How it stays smooth:
 *  - ONE progress value `p` (0 = cover, 1 = vinyl) drives the slide, the shape, the
 *    shadow, the player info and the spindle. Everything stays perfectly in sync and
 *    can be reversed at any moment, even halfway through.
 *  - The art only rotates while the shape is a full circle (p = 1), so the
 *    straight edges of the square image can never show during the morph.
 *  - Nothing here re-renders React per frame; motion writes straight to the DOM.
 *
 * Size comes only from `className` width (everything inside scales with cqw units).
 *
 * Optional props:
 *   duration     seconds. Missing → "/ 2:26" and the progress bar are hidden.
 *   currentTime  seconds. Missing → internal clock counts up from 0 while playing.
 *   finish       grooves, light sheen and rim on the vinyl (default true).
 */
export function VinylCard({
  card,
  isPlaying = false,
  isPaused = false, // true → vinyl stays open but stops spinning, equaliser and clock freeze
  duration,
  currentTime,
  rotationSpeed = 150, // degrees per second
  finish = true,
  className = 'w-[200px]',
}) {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  /* ---------- motion values ---------- */
  const p = useMotionValue(0); // 0 = cover, 1 = vinyl
  const angle = useMotionValue(0); // vinyl rotation in degrees
  const speed = useMotionValue(0); // degrees per second

  const y = useTransform(p, [0, 1], ['0%', '-50%']);
  const radius = useTransform(p, [0, 1], [22, 50]);
  const clip = useTransform(radius, (r) => `inset(0% round ${r}%)`);
  const bgOpacity = useTransform(p, [0, 0.12], [0, 1]);
  const infoOpacity = useTransform(p, [0.3, 0.75], [0, 1]);
  const shadowOpacity = useTransform(p, [0.35, 1], [0, 1]);
  const detailOpacity = useTransform(p, [0.92, 1], [0, 1]);
  const spindleScale = useTransform(p, [0.9, 1], [0.7, 1]);

  const spinning = useRef(false);
  const runId = useRef(0);
  const settleCtl = useRef(null);
  const speedCtl = useRef(null);
  const rotationSpeedRef = useRef(rotationSpeed);
  rotationSpeedRef.current = rotationSpeed;
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  // integrate rotation every frame (no React re-render)
  useAnimationFrame((_, delta) => {
    if (spinning.current) {
      angle.set(angle.get() + (speed.get() * Math.min(delta, 50)) / 1000);
    }
  });

  /* ---------- open / close sequence ---------- */
  useEffect(() => {
    const id = ++runId.current;
    const alive = () => runId.current === id;

    if (reduce) {
      spinning.current = false;
      speed.set(0);
      angle.set(0);
      p.set(isPlaying ? 1 : 0);
      return () => {
        runId.current++;
      };
    }

    (async () => {
      if (isPlaying) {
        settleCtl.current?.stop();
        const from = p.get();
        if (from < 0.999) {
          // interrupted (partly closed)? continue from where it is, no slow restart
          const resumed = from > 0.001;
          await animate(p, 1, {
            duration: resumed ? Math.max(0.35, OPEN_S * (1 - from)) : OPEN_S,
            ease: resumed ? 'easeOut' : EASE,
          });
          if (!alive()) return;
        }
        // spin only starts once the shape is a full circle
        spinning.current = true;
        speedCtl.current?.stop();
        speedCtl.current = animate(speed, pausedRef.current ? 0 : rotationSpeedRef.current, {
          duration: 1.8,
          ease: 'easeInOut',
        });
      } else {
        spinning.current = false;
        speedCtl.current?.stop();
        const current = speed.get();
        speed.set(0);

        // wind down: keep turning forward and land exactly upright (still a circle)
        const a = angle.get();
        const dist = Math.ceil(a / 360) * 360 - a;
        if (dist > 0.5) {
          const dur = Math.min(1.3, Math.max(0.7, (2 * dist) / Math.max(current, 60)));
          settleCtl.current = animate(angle, a + dist, { duration: dur, ease: 'easeOut' });
          await settleCtl.current;
          if (!alive()) return;
        }
        angle.set(0);

        const from = p.get();
        const partial = from < 0.999; // interrupted while opening: reverse right away
        await animate(p, 0, {
          duration: partial ? Math.max(0.35, CLOSE_S * from) : CLOSE_S,
          ease: partial ? 'easeOut' : EASE,
        });
      }
    })();

    return () => {
      runId.current++;
    };
  }, [isPlaying, reduce, p, angle, speed]);

  /* ---------- pause / resume: ease the spin down or back up (vinyl stays open) ---------- */
  useEffect(() => {
    if (reduce || !spinning.current) return;
    speedCtl.current?.stop();
    speedCtl.current = animate(speed, isPaused ? 0 : rotationSpeedRef.current, {
      duration: isPaused ? 0.9 : 1.2,
      ease: isPaused ? 'easeOut' : 'easeInOut',
    });
  }, [isPaused, reduce, speed]);

  /* ---------- internal clock (only used when currentTime isn't passed in) ---------- */
  useEffect(() => {
    if (!isPlaying || isPaused || currentTime != null) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying, isPaused, currentTime]);

  // restart the fallback clock each time a new track opens (not on resume)
  useEffect(() => {
    if (!isPlaying) setTick(0);
  }, [isPlaying]);

  const rawElapsed = currentTime ?? tick;
  const elapsed = Math.floor(duration ? Math.min(rawElapsed, duration) : rawElapsed);
  const progress = duration ? (elapsed / duration) * 100 : 0;

  return (
    <div
      className={`relative isolate aspect-square select-none overflow-hidden rounded-[22%] font-sans [container-type:inline-size] ${className}`}
      style={{ clipPath: 'inset(0% round 22%)' }}
    >
      <style>{`
        @keyframes vinyl-eq { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .vinyl-bar { animation: none !important; } }
      `}</style>

      {/* ------------ card background (invisible while closed → no edge fringe) ------------ */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,#f6f6f7_0%,#d9d9db_40%,#cfcfd2_100%)]"
        style={{ opacity: bgOpacity }}
      />

      {/* ------------ player info (sits underneath the cover) ------------ */}
      <motion.div className="absolute inset-0" style={{ opacity: infoOpacity }}>
        {/* equaliser */}
        <div className="absolute inset-x-0 top-[57.3%] flex h-[3.6cqw] -translate-y-1/2 items-center justify-center gap-[1.05cqw]">
          {[0.9, 1, 0.7, 1, 0.85].map((h, i) => (
            <span
              key={i}
              className="vinyl-bar block w-[0.45cqw] origin-center rounded-full bg-neutral-600"
              style={{
                height: `${h * 3.6}cqw`,
                animationName: isPlaying ? 'vinyl-eq' : 'none',
                animationDuration: `${0.9 + i * 0.17}s`,
                animationTimingFunction: 'ease-in-out',
                animationDelay: `${i * -0.23}s`,
                animationIterationCount: 'infinite',
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            />
          ))}
        </div>

        <p
          className="absolute inset-x-0 top-[67%] -translate-y-1/2 truncate px-[8cqw] text-center text-[4.6cqw] font-medium leading-none tracking-[-0.03em] text-neutral-500"
          title={card.subtitle}
        >
          {card.subtitle}
        </p>

        <h3
          className="absolute inset-x-0 top-[74.6%] -translate-y-1/2 truncate px-[8cqw] text-center text-[4.9cqw] font-semibold leading-none tracking-[-0.035em] text-neutral-950"
          title={card.title}
        >
          {card.title}
        </h3>

        {duration ? (
          <div className="absolute left-1/2 top-[79%] h-[0.9cqw] w-[9cqw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-neutral-400/40">
            <div
              className="h-full rounded-full bg-neutral-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        <p className="absolute inset-x-0 top-[84.2%] -translate-y-1/2 text-center text-[4.9cqw] font-semibold leading-none tracking-[-0.03em] tabular-nums text-neutral-950">
          {formatTime(elapsed, true)}
          {duration ? (
            <span className="font-normal text-neutral-400"> / {formatTime(duration)}</span>
          ) : null}
        </p>
      </motion.div>

      {/* ------------ vinyl shadow: static layer that only fades (cheap) ------------ */}
      <motion.div
        className="pointer-events-none absolute left-0 top-0 aspect-square w-full rounded-full"
        style={{
          y: '-50%',
          opacity: shadowOpacity,
          boxShadow: '0 4cqw 9cqw rgba(0,0,0,0.38)',
        }}
      />

      {/* ------------ cover → vinyl (clipped with clip-path: antialiased and Safari-safe) ------------ */}
      <motion.div
        className="absolute left-0 top-0 aspect-square w-full"
        style={{ y, clipPath: clip, willChange: 'transform, clip-path' }}
      >
        {/* rotating artwork: only turns while the shape is a full circle */}
        <motion.div
          className="absolute inset-0"
          style={{ rotate: angle, willChange: 'transform', backfaceVisibility: 'hidden' }}
        >
          <CardArt card={card} bare className="h-full w-full" />
        </motion.div>

        {/* vinyl finish: fixed light, so the art spins underneath it */}
        {finish && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              opacity: detailOpacity,
              backgroundImage: [
                'conic-gradient(from 20deg at 50% 50%, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.20) 26deg, rgba(255,255,255,0) 58deg, rgba(255,255,255,0) 180deg, rgba(255,255,255,0.14) 206deg, rgba(255,255,255,0) 238deg)',
                'repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0, rgba(0,0,0,0) 1.2cqw, rgba(0,0,0,0.09) 1.2cqw, rgba(0,0,0,0.09) 1.32cqw)',
              ].join(','),
              boxShadow:
                'inset 0 0 0 0.3cqw rgba(255,255,255,0.22), inset 0 0 0 0.9cqw rgba(0,0,0,0.18)',
            }}
          />
        )}

        {/* spindle */}
        <div className="absolute left-1/2 top-1/2 aspect-square w-[28.3cqw] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="flex h-full w-full items-center justify-center rounded-full bg-[#a9a9b4] shadow-[0_0_0_0.25cqw_rgba(255,255,255,0.55)]"
            style={{ opacity: detailOpacity, scale: spindleScale }}
          >
            <div className="aspect-square w-[70%] rounded-full bg-[radial-gradient(circle_at_50%_40%,#f1f1f3,#d8d8dc)] shadow-[inset_0_0_0_0.6cqw_rgba(255,255,255,0.7)]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}