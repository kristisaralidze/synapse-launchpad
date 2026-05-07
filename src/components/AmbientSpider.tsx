import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useLocation } from "@tanstack/react-router";

const W = 56;
const H = 44;

export function AmbientSpider() {
  const [enabled, setEnabled] = useState(false);
  const controls = useAnimationControls();
  const location = useLocation();
  const paused = /^\/live\/[^/]+/.test(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const loop = async () => {
      while (!cancelled) {
        await sleep(45_000 + Math.random() * 25_000);
        if (cancelled || paused) continue;
        const h = window.innerHeight;
        await controls.start({ y: -H, opacity: 0, transition: { duration: 0 } });
        await controls.start({ opacity: 1, transition: { duration: 0.6 } });
        await controls.start({ y: h + H, transition: { duration: 16, ease: "linear" } });
        if (cancelled) return;
        await controls.start({ opacity: 0, transition: { duration: 0.5 } });
      }
    };

    loop();
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [enabled, controls, paused]);

  if (!enabled) return null;

  // 8 legs. Each rendered as two segments (femur + tibia) with its own pivot.
  // Stagger pairs: legs alternate phase to mimic a tetrapodal gait.
  const legs = [
    // left side: x mirrored
    { side: -1, baseAngle: -55, phase: 0.0 },
    { side: -1, baseAngle: -20, phase: 0.5 },
    { side: -1, baseAngle: 20, phase: 0.0 },
    { side: -1, baseAngle: 55, phase: 0.5 },
    // right side
    { side: 1, baseAngle: -55, phase: 0.5 },
    { side: 1, baseAngle: -20, phase: 0.0 },
    { side: 1, baseAngle: 20, phase: 0.5 },
    { side: 1, baseAngle: 55, phase: 0.0 },
  ];

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: -H }}
      style={{
        position: "fixed",
        top: 0,
        right: 24,
        zIndex: 50,
        pointerEvents: "none",
        width: W,
        height: H,
        perspective: 200,
      }}
      aria-hidden
    >
      <div className="ambient-spider-body">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="spider-body" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#3a0a0a" />
              <stop offset="60%" stopColor="#1a0303" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
            <radialGradient id="spider-head" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#7a1212" />
              <stop offset="100%" stopColor="#1a0303" />
            </radialGradient>
          </defs>

          {/* legs (rendered behind body) */}
          {legs.map((l, i) => (
            <g
              key={i}
              transform={`translate(${W / 2} ${H / 2})`}
              className="ambient-spider-leg"
              style={{
                transformOrigin: "0 0",
                animationDelay: `${-l.phase * 0.45}s`,
              }}
            >
              <g transform={`scale(${l.side} 1) rotate(${l.baseAngle})`}>
                <line
                  x1="0"
                  y1="0"
                  x2="14"
                  y2="-2"
                  stroke="#0a0a0a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="14"
                  y1="-2"
                  x2="24"
                  y2="6"
                  stroke="#1a0303"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </g>
            </g>
          ))}

          {/* abdomen */}
          <ellipse cx={W / 2} cy={H / 2 + 4} rx="9" ry="7" fill="url(#spider-body)" />
          {/* cephalothorax */}
          <ellipse cx={W / 2} cy={H / 2 - 4} rx="6" ry="5" fill="url(#spider-head)" />
          {/* red eyes */}
          <circle cx={W / 2 - 2} cy={H / 2 - 6} r="0.9" fill="#ff2a2a" />
          <circle cx={W / 2 + 2} cy={H / 2 - 6} r="0.9" fill="#ff2a2a" />
          {/* red hourglass mark */}
          <path
            d={`M ${W / 2 - 2} ${H / 2 + 2} L ${W / 2 + 2} ${H / 2 + 2} L ${W / 2} ${H / 2 + 4} Z M ${W / 2 - 2} ${H / 2 + 7} L ${W / 2 + 2} ${H / 2 + 7} L ${W / 2} ${H / 2 + 5} Z`}
            fill="#c81111"
          />
        </svg>
      </div>
    </motion.div>
  );
}
