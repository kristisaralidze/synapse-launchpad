import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Instance = {
  size: number;
  right: number;
  duration: number;
  initialDelay: number;
};

const INSTANCES: Instance[] = [
  { size: 44, right: 16, duration: 6.5, initialDelay: 0.0 },
  { size: 38, right: 56, duration: 7.2, initialDelay: 1.4 },
  { size: 50, right: 32, duration: 5.8, initialDelay: 3.0 },
  { size: 36, right: 80, duration: 8.0, initialDelay: 4.5 },
  { size: 46, right: 12, duration: 6.0, initialDelay: 6.2 },
];

const TRAIL_COPIES = 5;

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

function SpiderInstance({ size, right, duration, initialDelay }: Instance) {
  const [viewportH, setViewportH] = useState(
    typeof window === "undefined" ? 1000 : window.innerHeight
  );
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startDelay = cycle === 0 ? initialDelay : 3 + Math.random() * 3;
    const totalMs = (startDelay + duration) * 1000;
    const t = setTimeout(() => {
      if (!cancelled) setCycle((c) => c + 1);
    }, totalMs);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [cycle, duration, initialDelay]);

  const startDelay = cycle === 0 ? initialDelay : 3 + Math.random() * 3;

  return (
    <motion.div
      key={cycle}
      initial={{ y: 0 }}
      animate={{ y: viewportH + 120 }}
      transition={{ duration, ease: "linear", delay: startDelay }}
      style={{
        position: "fixed",
        top: -60,
        right,
        zIndex: 50,
        pointerEvents: "none",
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          transform: "perspective(500px) rotateX(15deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* underglow */}
        <div
          style={{
            position: "absolute",
            inset: -12,
            background:
              "radial-gradient(circle, rgba(185,28,28,0.18) 0%, transparent 70%)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
        {/* trail copies */}
        {Array.from({ length: TRAIL_COPIES }).map((_, n) => (
          <div
            key={n}
            style={{
              position: "absolute",
              top: -6 * (n + 1),
              left: 0,
              width: size,
              height: size,
              opacity: 0.18 / (n + 1),
              pointerEvents: "none",
            }}
          >
            <SpiderSVG size={size} animate={false} />
          </div>
        ))}
        {/* leading spider */}
        <div style={{ position: "absolute", inset: 0 }}>
          <SpiderSVG size={size} animate />
        </div>
      </div>
    </motion.div>
  );
}

type Leg = {
  hip: [number, number];
  knee: [number, number];
  tip: [number, number];
  group: "A" | "B";
};

const LEGS: Leg[] = [
  { hip: [28, 24], knee: [18, 18], tip: [10, 22], group: "A" }, // L1
  { hip: [27, 27], knee: [15, 26], tip: [8, 32], group: "B" }, // L2
  { hip: [27, 30], knee: [15, 34], tip: [8, 42], group: "A" }, // L3
  { hip: [28, 33], knee: [18, 40], tip: [10, 48], group: "B" }, // L4
  { hip: [32, 24], knee: [42, 18], tip: [50, 22], group: "B" }, // R1
  { hip: [33, 27], knee: [45, 26], tip: [52, 32], group: "A" }, // R2
  { hip: [33, 30], knee: [45, 34], tip: [52, 42], group: "B" }, // R3
  { hip: [32, 33], knee: [42, 40], tip: [50, 48], group: "A" }, // R4
];

function SpiderSVG({ size, animate }: { size: number; animate: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden="true"
      style={{ overflow: "visible", display: "block" }}
    >
      {/* body first so legs overlap on top */}
      <ellipse cx="30" cy="24" rx="6" ry="5" fill="#0A0A0A" />
      <ellipse cx="30" cy="36" rx="8" ry="10" fill="#0A0A0A" />
      <line x1="30" y1="29" x2="30" y2="31" stroke="#0A0A0A" strokeWidth="1.5" />
      <circle cx="30" cy="37" r="2" fill="#B91C1C" />

      {LEGS.map((leg, i) => (
        <LegGroup key={i} leg={leg} animate={animate} />
      ))}
    </svg>
  );
}

function LegGroup({ leg, animate }: { leg: Leg; animate: boolean }) {
  const [hx, hy] = leg.hip;
  const [kx, ky] = leg.knee;
  const [tx, ty] = leg.tip;
  const delay = leg.group === "B" ? 0.25 : 0;

  // Translate so hip is at (0,0), then rotation pivots around hip naturally.
  const k = [kx - hx, ky - hy] as const;
  const t = [tx - hx, ty - hy] as const;

  const content = (
    <>
      <line x1={0} y1={0} x2={k[0]} y2={k[1]} stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={k[0]} y1={k[1]} x2={t[0]} y2={t[1]} stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" />
    </>
  );

  if (!animate) {
    return <g transform={`translate(${hx} ${hy})`}>{content}</g>;
  }

  return (
    <motion.g
      transform={`translate(${hx} ${hy})`}
      animate={{ rotate: [-6, 6, -6] }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {content}
    </motion.g>
  );
}
