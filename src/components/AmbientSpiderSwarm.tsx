import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Instance = {
  size: number;
  duration: number;
  initialDelay: number;
};

const INSTANCES: Instance[] = [
  { size: 160, duration: 14, initialDelay: 0 },
  { size: 140, duration: 16, initialDelay: 3 },
  { size: 175, duration: 13, initialDelay: 6.5 },
  { size: 130, duration: 17, initialDelay: 10 },
  { size: 155, duration: 15, initialDelay: 13.5 },
];

export function AmbientSpiderSwarm() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <>
      {INSTANCES.map((inst, i) => (
        <SpiderInstance key={i} {...inst} />
      ))}
    </>
  );
}

function SpiderInstance({ size, duration, initialDelay }: Instance) {
  const repeatDelay = useMemo(() => 2 + Math.random() * 3, []);

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: 50,
      }}
      initial={{ x: `calc(100vw + 100px)`, y: `-${size + 100}px` }}
      animate={{
        x: [`calc(100vw + 100px)`, `-${size + 100}px`],
        y: [`-${size + 100}px`, `calc(100vh + 100px)`],
      }}
      transition={{
        duration,
        delay: initialDelay,
        repeat: Infinity,
        repeatDelay,
        ease: "linear",
      }}
      aria-hidden="true"
    >
      <div style={{ width: size, height: size, transform: "rotate(45deg)" }}>
        <SpiderSVG size={size} />
      </div>
    </motion.div>
  );
}

// Each leg: hip is at (0,0) after translation; remaining points are deltas.
// Hip values place the anchor on the body so there is zero gap.
type LegDef = { hip: [number, number]; rest: [number, number][] };
const LEGS: LegDef[] = [
  { hip: [100, 90], rest: [[70, 55], [40, 30], [10, 15]] },   // L1
  { hip: [100, 96], rest: [[55, 80], [25, 75], [5, 72]] },    // L2
  { hip: [100, 102], rest: [[55, 122], [25, 130], [5, 138]] },// L3
  { hip: [100, 108], rest: [[70, 142], [40, 168], [10, 185]] },// L4
  { hip: [100, 90], rest: [[130, 55], [160, 30], [190, 15]] }, // R1
  { hip: [100, 96], rest: [[145, 80], [175, 75], [195, 72]] }, // R2
  { hip: [100, 102], rest: [[145, 122], [175, 130], [195, 138]] }, // R3
  { hip: [100, 108], rest: [[130, 142], [160, 168], [190, 185]] }, // R4
];

function SpiderSVG({ size }: { size: number }) {
  // Each leg gets its own clock — computed once at mount.
  const legConfigs = useMemo(
    () =>
      LEGS.map(() => ({
        duration: 0.38 + Math.random() * 0.1,
        delay: Math.random() * 0.45,
        amplitude: 12 + Math.random() * 6,
      })),
    []
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Whole spider sways together so legs stay anchored to the body */}
      <motion.g
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Body — drawn first, behind legs */}
        <ellipse cx="100" cy="86" rx="14" ry="12" fill="#0A0A0A" />
        <ellipse cx="100" cy="112" rx="18" ry="22" fill="#0A0A0A" />
        <line x1="100" y1="96" x2="100" y2="92" stroke="#0A0A0A" strokeWidth="2" />
        <circle cx="95" cy="80" r="1.5" fill="#525252" />
        <circle cx="105" cy="80" r="1.5" fill="#525252" />

        {/* Legs — each rotates around its hip via SVG translate→rotate trick */}
        {LEGS.map((leg, i) => {
          const cfg = legConfigs[i];
          const [hx, hy] = leg.hip;
          // Convert points to deltas relative to hip (which is at 0,0 after translate)
          const deltaPoints = [
            "0,0",
            ...leg.rest.map(([x, y]) => `${x - hx},${y - hy}`),
          ].join(" ");
          return (
            <g key={i} transform={`translate(${hx} ${hy})`}>
              <motion.g
                animate={{ rotate: [-cfg.amplitude, cfg.amplitude, -cfg.amplitude] }}
                transition={{
                  duration: cfg.duration,
                  delay: cfg.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <polyline
                  points={deltaPoints}
                  stroke="#0A0A0A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.g>
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}
