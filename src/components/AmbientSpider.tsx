import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useLocation } from "@tanstack/react-router";

export function AmbientSpider() {
  const [enabled, setEnabled] = useState(false);
  const controls = useAnimationControls();
  const location = useLocation();
  const pausedRef = isLivePath(location.pathname);
  const [width, setWidth] = useState(typeof window === "undefined" ? 1200 : window.innerWidth);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    setEnabled(true);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let direction: 1 | -1 = 1;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        if (cancelled) clearTimeout(id);
      });

    const loop = async () => {
      while (!cancelled) {
        await sleep(60_000 + Math.random() * 30_000);
        if (cancelled) return;
        if (pausedRef) {
          continue;
        }
        const w = window.innerWidth;
        const startX = direction === 1 ? -30 : w + 30;
        const endX = direction === 1 ? w + 30 : -30;
        await controls.start({ x: startX, opacity: 0, transition: { duration: 0 } });
        await controls.start({ opacity: 1, transition: { duration: 0.6 } });
        await controls.start({ x: endX, transition: { duration: 18, ease: "linear" } });
        if (cancelled) return;
        await controls.start({ opacity: 0, transition: { duration: 0.6 } });
        direction = direction === 1 ? -1 : 1;
      }
    };

    loop();
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [enabled, controls, pausedRef]);

  if (!enabled) return null;

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, x: -30 }}
      style={{
        position: "fixed",
        bottom: 12,
        left: 0,
        zIndex: 50,
        pointerEvents: "none",
        width: 22,
        height: 14,
      }}
      aria-hidden
    >
      <div className="ambient-spider-wobble" style={{ width: 22, height: 14 }}>
        <svg
          width="22"
          height="14"
          viewBox="0 0 22 14"
          fill="none"
          stroke="#A3A3A3"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <ellipse cx="11" cy="7" rx="3" ry="2" />
          {/* left legs */}
          <line x1="8" y1="6" x2="2" y2="2" />
          <line x1="8" y1="7" x2="1" y2="6" />
          <line x1="8" y1="7" x2="1" y2="9" />
          <line x1="8" y1="8" x2="3" y2="13" />
          {/* right legs */}
          <line x1="14" y1="6" x2="20" y2="2" />
          <line x1="14" y1="7" x2="21" y2="6" />
          <line x1="14" y1="7" x2="21" y2="9" />
          <line x1="14" y1="8" x2="19" y2="13" />
        </svg>
      </div>
    </motion.div>
  );
}

function isLivePath(pathname: string): boolean {
  return /^\/live\/[^/]+/.test(pathname);
}