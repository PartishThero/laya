// components/cards/VinylCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CardArt } from './CardArt.jsx';

const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

/**
 * VinylCard — the animated card used by SongCard and AlbumCard.
 *
 * It is CONTROLLED by `isPlaying` (no click handling of its own, because the
 * <Card> wrapper already owns click / drag / keyboard):
 *   isPlaying = false → square cover
 *   isPlaying = true  → cover slides up, becomes a spinning vinyl, player info appears
 *
 * Everything inside scales with the card width (cqw units), so the size comes
 * only from the `className` width, e.g. "w-[200px]".
 *
 * Optional props:
 *   duration     seconds. If missing, the "/ 2:26" part and progress bar are hidden.
 *   currentTime  seconds. If missing, an internal clock counts up from 0 while playing.
 */
export function VinylCard({
  card,
  isPlaying = false,
  duration,
  currentTime,
  rotationSpeed = 150, // degrees per second
  className = 'w-[200px]',
}) {
  const [tick, setTick] = useState(0);
  // `open` lags `isPlaying` by two frames. That guarantees the closed state is
  // painted first, so the morph always plays, even if the card mounts already playing.
  const [open, setOpen] = useState(false);

  const spinRef = useRef(null);
  const angleRef = useRef(0);
  const rampRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setOpen(false);
      return;
    }
    let id2;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setOpen(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [isPlaying]);

  /* ---------- vinyl rotation: eases in, settles upright when stopped ---------- */
  useEffect(() => {
    const el = spinRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf;
    let last = performance.now();
    let angle = angleRef.current;
    let ramp = rampRef.current;
    let settle = null;

    if (!open) {
      settle = {
        from: angle,
        to: Math.ceil(angle / 360) * 360,
        t0: last,
        dur: 900,
      };
      ramp = 0;
    }

    const easeInOut = (t) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const frame = (now) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;

      if (open) {
        if (!reduce) {
          ramp = Math.min(1, ramp + dt / 1.4);
          angle += rotationSpeed * easeInOut(ramp) * dt;
        }
      } else if (settle) {
        const p = Math.min(1, (now - settle.t0) / settle.dur);
        angle = settle.from + (settle.to - settle.from) * easeOut(p);
        if (p === 1) {
          angleRef.current = 0;
          rampRef.current = 0;
          el.style.transform = 'rotate(0deg)';
          return;
        }
      }

      el.style.transform = `rotate(${angle}deg)`;
      angleRef.current = angle;
      rampRef.current = ramp;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [open, rotationSpeed]);

  /* ---------- internal clock (only used when currentTime isn't passed in) ---------- */
  useEffect(() => {
    if (!open || currentTime != null) return;
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [open, currentTime]);

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rawElapsed = currentTime ?? tick;
  const elapsed = Math.floor(duration ? Math.min(rawElapsed, duration) : rawElapsed);
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
  const progress = duration ? (elapsed / duration) * 100 : 0;

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[22%] select-none font-sans [container-type:inline-size] bg-[linear-gradient(180deg,#f6f6f7_0%,#d9d9db_40%,#cfcfd2_100%)] ${className}`}
    >
      <style>{`
        @keyframes vinyl-eq { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .vinyl-bar { animation: none !important; } }
      `}</style>

      {/* ------------ player info (sits underneath the cover) ------------ */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          open ? 'opacity-100 delay-300' : 'opacity-0 delay-0'
        }`}
      >
        {/* equaliser */}
        <div className="absolute inset-x-0 top-[57.3%] flex h-[3.6cqw] -translate-y-1/2 items-center justify-center gap-[1.05cqw]">
          {[0.9, 1, 0.7, 1, 0.85].map((h, i) => (
            <span
              key={i}
              className="vinyl-bar block w-[0.45cqw] origin-center rounded-full bg-neutral-600"
              style={{
                height: `${h * 3.6}cqw`,
                animation: open
                  ? `vinyl-eq ${0.9 + i * 0.17}s ease-in-out ${i * -0.23}s infinite`
                  : 'none',
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
          {Math.floor(elapsed / 60)} : {pad(elapsed % 60)}
          {duration ? (
            <span className="font-normal text-neutral-400"> / {fmt(duration)}</span>
          ) : null}
        </p>
      </div>

      {/* ------------ cover → vinyl ------------ */}
      <div
        className="absolute left-0 top-0 aspect-square w-full overflow-hidden will-change-transform"
        style={{
          transform: open ? 'translateY(-50%)' : 'translateY(0%)',
          borderRadius: open ? '50%' : '22%',
          boxShadow: open ? '0 4cqw 9cqw rgba(0,0,0,0.38)' : '0 0 0 rgba(0,0,0,0)',
          transition: reduceMotion
            ? 'none'
            : `transform 1100ms ${EASE}, border-radius 1100ms ${EASE}, box-shadow 1100ms ${EASE}`,
        }}
      >
        {/* rotating artwork */}
        <div ref={spinRef} className="absolute inset-0 will-change-transform">
          <CardArt card={card} bare className="h-full w-full" />
        </div>

        {/* spindle */}
        <div
          className={`absolute left-1/2 top-1/2 flex aspect-square w-[28.3cqw] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#a9a9b4] shadow-[0_0_0_0.25cqw_rgba(255,255,255,0.55)] transition-opacity duration-500 ${
            open ? 'opacity-100 delay-500' : 'opacity-0 delay-0'
          }`}
        >
          <div className="aspect-square w-[70%] rounded-full bg-[radial-gradient(circle_at_50%_40%,#f1f1f3,#d8d8dc)] shadow-[inset_0_0_0_0.6cqw_rgba(255,255,255,0.7)]" />
        </div>
      </div>
    </div>
  );
}