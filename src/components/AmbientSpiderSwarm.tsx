import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Instance = {
  size: number;
  duration: number;
  initialDelay: number;
  laneOffset: number;
};

const INSTANCES: Instance[] = [
  { size: 22, duration: 10, initialDelay: 0.0, laneOffset: 0 },
  { size: 18, duration: 11, initialDelay: 1.6, laneOffset: 40 },
  { size: 26, duration: 9, initialDelay: 3.2, laneOffset: -30 },
  { size: 16, duration: 13, initialDelay: 4.8, laneOffset: 70 },
  { size: 20, duration: 9.5, initialDelay: 6.4, laneOffset: -55 },
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
  const dx = -vp.w - 120;
  const dy = vp.h + 120;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const startX = vp.w + 60 + laneOffset * px;
  const startY = -60 + laneOffset * py;
  const endX = -120 + laneOffset * px;
  const endY = vp.h + 120 + laneOffset * py;

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
          position: "relative",
          width: size,
          height: size,
          transform: `rotate(${angleDeg}deg)`,
        }}
      >
        {/* underglow */}
        <div
          style={{
            position: "absolute",
            inset: -size * 0.6,
            background:
              "radial-gradient(circle, rgba(185,28,28,0.18) 0%, transparent 70%)",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: size,
            height: size,
            transform: "perspective(500px) rotateX(15deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <SpiderSVG size={size} />
        </div>
      </div>
    </motion.div>
  );
}

type Leg = {
  hip: [number, number];
  knee: [number, number];
  tip: [number, number];
  phase: 0 | 1 | 2 | 3;
};

// Order: L1 L2 L3 L4 R1 R2 R3 R4
// Phase 0: L1, R3 | Phase 1: L2, R4 | Phase 2: R1, L3 | Phase 3: R2, L4
const LEGS: Leg[] = [
  { hip: [26, 26], knee: [14, 14], tip: [4, 18], phase: 0 }, // L1
  { hip: [25, 30], knee: [10, 28], tip: [2, 32], phase: 1 }, // L2
  { hip: [25, 33], knee: [10, 36], tip: [2, 42], phase: 2 }, // L3
  { hip: [26, 36], knee: [14, 46], tip: [4, 52], phase: 3 }, // L4
  { hip: [34, 26], knee: [46, 14], tip: [56, 18], phase: 2 }, // R1
  { hip: [35, 30], knee: [50, 28], tip: [58, 32], phase: 3 }, // R2
  { hip: [35, 33], knee: [50, 36], tip: [58, 42], phase: 0 }, // R3
  { hip: [34, 36], knee: [46, 46], tip: [56, 52], phase: 1 }, // R4
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
      {LEGS.map((leg, i) => (
        <LegGroup key={i} leg={leg} />
      ))}
      <motion.g
        animate={{ x: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="30" cy="26" rx="5" ry="4.5" fill="#0A0A0A" />
        <ellipse cx="30" cy="35" rx="6.5" ry="7.5" fill="#0A0A0A" />
        <circle cx="30" cy="36" r="1.6" fill="#B91C1C" />
      </motion.g>
    </svg>
  );
}

function LegGroup({ leg }: { leg: Leg }) {
  const [hx, hy] = leg.hip;
  const [kx, ky] = leg.knee;
  const [tx, ty] = leg.tip;
  const delay = leg.phase * 0.1;

  const k = [kx - hx, ky - hy];
  const t = [tx - hx, ty - hy];

  return (
    <motion.g
      transform={`translate(${hx} ${hy})`}
      animate={{ rotate: [-18, 18, -18] }}
      transition={{
        duration: 0.4,
        times: [0, 0.7, 1],
        ease: ["easeOut", "easeIn"],
        repeat: Infinity,
        delay,
      }}
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
