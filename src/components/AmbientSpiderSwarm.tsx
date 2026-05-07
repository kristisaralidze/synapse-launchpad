import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Instance = {
  size: number;
  duration: number;
  initialDelay: number;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  rotate: number;
};

const INSTANCES: Instance[] = [
  // Diagonal top-right -> bottom-left (classic)
  {
    size: 160, duration: 14, initialDelay: 0, rotate: 45,
    startX: "calc(100vw + 100px)", startY: "-260px",
    endX: "-260px", endY: "calc(100vh + 100px)",
  },
  // Diagonal top-left -> bottom-right
  {
    size: 140, duration: 17, initialDelay: 5, rotate: 135,
    startX: "-240px", startY: "-240px",
    endX: "calc(100vw + 100px)", endY: "calc(100vh + 100px)",
  },
  // Mostly downward with a slight rightward drift
  {
    size: 150, duration: 15, initialDelay: 9, rotate: 100,
    startX: "20vw", startY: "-250px",
    endX: "55vw", endY: "calc(100vh + 100px)",
  },
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

function SpiderInstance({ size, duration, initialDelay, startX, startY, endX, endY, rotate }: Instance) {
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
      initial={{ x: startX, y: startY }}
      animate={{ x: [startX, endX], y: [startY, endY] }}
      transition={{
        duration,
        delay: initialDelay,
        repeat: Infinity,
        repeatDelay,
        ease: "linear",
      }}
      aria-hidden="true"
    >
      <div style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}>
        <SpiderSVG size={size} />
      </div>
    </motion.div>
  );
}

type Point = [number, number];
type LegDef = { anchor: Point; joints: [Point, Point, Point]; side: -1 | 1 };
const LEGS: LegDef[] = [
  { anchor: [96, 94], joints: [[72, 58], [42, 30], [12, 14]], side: -1 },
  { anchor: [94, 99], joints: [[62, 84], [30, 76], [6, 72]], side: -1 },
  { anchor: [94, 104], joints: [[60, 122], [30, 132], [8, 140]], side: -1 },
  { anchor: [96, 109], joints: [[72, 144], [44, 170], [14, 186]], side: -1 },
  { anchor: [104, 94], joints: [[128, 58], [158, 30], [188, 14]], side: 1 },
  { anchor: [106, 99], joints: [[138, 84], [170, 76], [194, 72]], side: 1 },
  { anchor: [106, 104], joints: [[140, 122], [170, 132], [192, 140]], side: 1 },
  { anchor: [104, 109], joints: [[128, 144], [156, 170], [186, 186]], side: 1 },
];

function legPath(anchor: Point, joints: [Point, Point, Point], phase = 0, side: -1 | 1) {
  const moved = joints.map(([x, y], index) => {
    const strength = index + 1;
    const bend = Math.sin(phase + index * 1.7) * strength * 2.4;
    const lift = Math.cos(phase + index * 1.2) * strength * 1.15;
    return [x + bend * side, y + lift] as Point;
  });
  return `M ${anchor[0]} ${anchor[1]} L ${moved[0][0]} ${moved[0][1]} L ${moved[1][0]} ${moved[1][1]} L ${moved[2][0]} ${moved[2][1]}`;
}

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
        {/* Legs are drawn behind the body and start inside the cephalothorax, so the body masks every base seam. */}
        {LEGS.map((leg, i) => {
          const cfg = legConfigs[i];
          return (
            <motion.path
              key={i}
              d={legPath(leg.anchor, leg.joints, cfg.delay * 8, leg.side)}
              animate={{
                d: [
                  legPath(leg.anchor, leg.joints, cfg.delay * 8, leg.side),
                  legPath(leg.anchor, leg.joints, cfg.delay * 8 + cfg.amplitude * 0.18, leg.side),
                  legPath(leg.anchor, leg.joints, cfg.delay * 8 + cfg.amplitude * 0.36, leg.side),
                ],
              }}
              transition={{
                duration: cfg.duration,
                delay: cfg.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              stroke="#0A0A0A"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          );
        })}

        <ellipse cx="100" cy="87" rx="15" ry="13" fill="#0A0A0A" />
        <ellipse cx="100" cy="112" rx="18" ry="22" fill="#0A0A0A" />
        <ellipse cx="100" cy="99" rx="11" ry="9" fill="#0A0A0A" />
        <circle cx="96" cy="81" r="1.5" fill="#525252" />
        <circle cx="105" cy="82" r="1.5" fill="#525252" />
      </motion.g>
    </svg>
  );
}
