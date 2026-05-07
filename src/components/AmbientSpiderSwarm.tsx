import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Instance = {
  size: number;
  duration: number;
  initialDelay: number;
  laneOffset: number; // perpendicular offset from the diagonal path, in px
};

const INSTANCES: Instance[] = [
  { size: 22, duration: 9.0, initialDelay: 0.0, laneOffset: 0 },
  { size: 18, duration: 10.5, initialDelay: 1.6, laneOffset: 40 },
  { size: 26, duration: 8.4, initialDelay: 3.2, laneOffset: -30 },
  { size: 16, duration: 11.2, initialDelay: 4.8, laneOffset: 70 },
  { size: 20, duration: 9.6, initialDelay: 6.4, laneOffset: -55 },
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

function SpiderInstance({ size, duration, initialDelay, laneOffset }: Instance) {
  const [vp, setVp] = useState(() =>
    typeof window === "undefined"
      ? { w: 1200, h: 800 }
      : { w: window.innerWidth, h: window.innerHeight }
  );
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const startDelay = cycle === 0 ? initialDelay : 1 + Math.random() * 3;
    const totalMs = (startDelay + duration) * 1000;
    const t = setTimeout(() => {
      if (!cancelled) setCycle((c) => c + 1);
    }, totalMs);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [cycle, duration, initialDelay]);

  const startDelay = cycle === 0 ? initialDelay : 1 + Math.random() * 3;

  // Diagonal: top-right -> bottom-left
  // Path direction unit vector
  const dx = -vp.w - 120;
  const dy = vp.h + 120;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular (for lane offset)
  const px = -uy;
  const py = ux;

  const startX = vp.w + 60 + laneOffset * px;
  const startY = -60 + laneOffset * py;
  const endX = -120 + laneOffset * px;
  const endY = vp.h + 120 + laneOffset * py;

  // Angle the spider so its "head" points along travel direction.
  // SVG default head-up; rotate so up (-y) aligns with (ux, uy).
  const angleDeg = (Math.atan2(uy, ux) * 180) / Math.PI + 90;

  return (
    <motion.div
      key={cycle}
      initial={{ x: startX, y: startY }}
      animate={{ x: endX, y: endY }}
      transition={{ duration, ease: "linear", delay: startDelay }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: size,
        height: size,
        zIndex: 50,
        pointerEvents: "none",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: size,
          height: size,
          transform: `rotate(${angleDeg}deg)`,
        }}
      >
        <SpiderSVG size={size} />
      </div>
    </motion.div>
  );
}

// Leg geometry in viewBox 60x60. Body centered at (30,30).
// Each leg has hip on body edge, knee outside, tip further out.
type Leg = {
  hip: [number, number];
  knee: [number, number];
  tip: [number, number];
  group: "A" | "B";
};

const LEGS: Leg[] = [
  // Left side, front to back
  { hip: [26, 26], knee: [14, 14], tip: [4, 18], group: "A" },
  { hip: [25, 30], knee: [10, 28], tip: [2, 32], group: "B" },
  { hip: [25, 33], knee: [10, 36], tip: [2, 42], group: "A" },
  { hip: [26, 36], knee: [14, 46], tip: [4, 52], group: "B" },
  // Right side
  { hip: [34, 26], knee: [46, 14], tip: [56, 18], group: "B" },
  { hip: [35, 30], knee: [50, 28], tip: [58, 32], group: "A" },
  { hip: [35, 33], knee: [50, 36], tip: [58, 42], group: "B" },
  { hip: [34, 36], knee: [46, 46], tip: [56, 52], group: "A" },
];

function SpiderSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden="true"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Legs first (behind body) */}
      {LEGS.map((leg, i) => (
        <LegGroup key={i} leg={leg} />
      ))}
      {/* Cephalothorax (front, smaller) */}
      <ellipse cx="30" cy="26" rx="5" ry="4.5" fill="#0A0A0A" />
      {/* Abdomen (rear, larger) */}
      <ellipse cx="30" cy="35" rx="6.5" ry="7.5" fill="#0A0A0A" />
      {/* Red dot marking */}
      <circle cx="30" cy="36" r="1.6" fill="#B91C1C" />
    </svg>
  );
}

function LegGroup({ leg }: { leg: Leg }) {
  const [hx, hy] = leg.hip;
  const [kx, ky] = leg.knee;
  const [tx, ty] = leg.tip;
  const delay = leg.group === "B" ? 0.3 : 0;

  // Translate origin to hip so rotation pivots around the body attachment.
  const k = [kx - hx, ky - hy];
  const t = [tx - hx, ty - hy];

  return (
    <motion.g
      transform={`translate(${hx} ${hy})`}
      animate={{ rotate: [-10, 10, -10] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <line
        x1={0}
        y1={0}
        x2={k[0]}
        y2={k[1]}
        stroke="#0A0A0A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1={k[0]}
        y1={k[1]}
        x2={t[0]}
        y2={t[1]}
        stroke="#0A0A0A"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </motion.g>
  );
}
