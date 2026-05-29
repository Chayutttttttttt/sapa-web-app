import { useState, useRef, useEffect, useCallback, forwardRef,lazy,Suspense } from "react";
import "../app.css";

// ── Constants ──────────────────────────────────────────────────────────────────

const NAV_BTN_WIDTH = 200;
const NAV_PADDING = 2;
const PILL_MARGIN = 2;
const PILL_ANIM_DURATION = 500;
const RIPPLE_ANIM_DURATION = 500;

const Vote = lazy(() => import("./Vote"));
const Parties = lazy(() => import("./Parties"));

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ElectionNavBar({
  activeTab: controlledTab,
  onTabChange,
  defaultTab = "party",
}) {
  const isControlled = controlledTab !== undefined;
  const [internalTab, setInternalTab] = useState(defaultTab);
  const current = isControlled ? controlledTab : internalTab;

  const navRef = useRef(null);
  const pillRef = useRef(null);
  const rippleRef = useRef(null);
  const btnPartyRef = useRef(null);
  const btnResultRef = useRef(null);
  const pillAnim = useRef(null);
  const rippleAnim = useRef(null);

  

  const getBtnMetrics = useCallback((id) => {
    const navbar = navRef.current;
    const btn = id === "party" ? btnPartyRef.current : btnResultRef.current;
    if (!navbar || !btn) return { x: 0, w: 0 };
    const navRect = navbar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    return { 
      x: btnRect.left - navRect.left + PILL_MARGIN, 
      w: btnRect.width - PILL_MARGIN * 2 
    };
  }, []);

  const setPillInstant = useCallback(
    (tab) => {
      const pill = pillRef.current;
      if (!pill) return;
      const { x, w } = getBtnMetrics(tab);
      pill.style.transition = "none";
      pill.style.width = `${w}px`;
      pill.style.transform = `translateX(${x}px)`;
      // Force reflow to flush the style change before re-enabling transition
      void pill.offsetHeight;
      pill.style.transition = "";
    },
    [getBtnMetrics]
  );

  const animatePill = useCallback(
    (fromTab, toTab) => {
      const pill = pillRef.current;
      if (!pill) return;
      pillAnim.current?.cancel();
      const from = getBtnMetrics(fromTab);
      const to = getBtnMetrics(toTab);
      pillAnim.current = pill.animate(
        [
          { transform: `translateX(${from.x}px)`, width: `${from.w}px` },
          { transform: `translateX(${to.x}px)`, width: `${to.w}px` },
        ],
        {
          duration: PILL_ANIM_DURATION,
          easing: "cubic-bezier(0.4,0,0.2,1)",
          fill: "forwards",
        }
      );
    },
    [getBtnMetrics]
  );

  const animateRipple = useCallback(
    (toTab) => {
      const el = rippleRef.current;
      if (!el) return;
      rippleAnim.current?.cancel();
      const { x, w } = getBtnMetrics(toTab);
      el.style.width = `${w}px`;
      rippleAnim.current = el.animate(
        [
          { transform: `translateX(${x}px) scaleX(0.8)`, opacity: 0.6 },
          { transform: `translateX(${x}px) scaleX(1.18)`, opacity: 0 },
        ],
        { duration: RIPPLE_ANIM_DURATION, easing: "ease-out", fill: "forwards" }
      );
    },
    [getBtnMetrics]
  );

  const switchTab = useCallback(
    (tab) => {
      if (tab === current) return;
      const prev = current;
      if (!isControlled) setInternalTab(tab);
      onTabChange?.(tab);
      animateRipple(tab);
      animatePill(prev, tab);
    },
    [current, isControlled, onTabChange, animateRipple, animatePill]
  );

  // Set pill position on first render
  useEffect(() => {
    setPillInstant(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync pill position when controlled tab changes externally
  useEffect(() => {
    if (isControlled) setPillInstant(controlledTab);
  }, [controlledTab, isControlled, setPillInstant]);

  // Re-position pill on window resize
  useEffect(() => {
    const handleResize = () => setPillInstant(current);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [current, setPillInstant]);

  return (
    <div style={styles.wrapper} className="animate-fade-up  flex-col gap-8">
      <nav ref={navRef} style={styles.navbar} role="navigation" aria-label="เมนูหลัก">
        {/* Sliding white pill (active indicator) */}
        <div ref={pillRef} style={styles.pill} />

        {/* Ripple overlay */}
        <div ref={rippleRef} style={styles.ripple} />

        <NavBtn
          ref={btnPartyRef}
          active={current === "party"}
          onClick={() => switchTab("party")}
          label="พรรค"
          icon={<LayersIcon />}
        />

        <NavBtn
          ref={btnResultRef}
          active={current === "result"}
          onClick={() => switchTab("result")}
          label="ผลการเลือกตั้ง"
          icon={<VoteIcon />}
        />

      </nav>

      <div className="">
        {current === "party" && (
          <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
            <Parties />
          </Suspense>
        )}
        {current === "result" && (
          <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
            <Vote />
          </Suspense>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const NavBtn = forwardRef(function NavBtn({ active, onClick, label, icon, ...rest }, ref) {
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      aria-pressed={active}
      style={styles.navBtn}
      {...rest}
    >
      <span style={{ ...styles.iconWrap, ...(active ? styles.iconActive : styles.iconInactive) }}>
        {icon}
      </span>
      <span style={{ ...styles.label, ...(active ? styles.labelActive : styles.labelInactive) }}>
        {label}
      </span>
    </div>
  );
});

// ── Icons ──────────────────────────────────────────────────────────────────────

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#1e3faa",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: { display: "block", pointerEvents: "none" },
};

function LayersIcon() {
  return (
    <svg {...ICON_PROPS}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function VoteIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
      <path d="M9 7h6M9 17h4" />
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  navbar: {
    background: "#dde6ff",
    borderRadius: "999px",
    padding: `${NAV_PADDING}px`,
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(41,82,217,0.18)",
  },
  pill: {
    position: "absolute",
    top: `${NAV_PADDING + PILL_MARGIN}px`,
    left: `${NAV_PADDING}px`,
    height: `calc(100% - ${(NAV_PADDING + PILL_MARGIN) * 2}px)`,
    background: "#ffffff",
    borderRadius: "999px",
    border: "1px solid rgba(41,82,217,0.15)",
    pointerEvents: "none",
    zIndex: 0,
  },
  ripple: {
    position: "absolute",
    top: `${NAV_PADDING + PILL_MARGIN}px`,
    left: `${NAV_PADDING}px`,
    height: `calc(100% - ${(NAV_PADDING + PILL_MARGIN) * 2}px)`,
    width: `${NAV_BTN_WIDTH - PILL_MARGIN * 2}px`,
    borderRadius: "999px",
    background: "rgba(41,82,217,0.12)",
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0,
  },
  navBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "10px 0",
    cursor: "pointer",
    borderRadius: "999px",
    position: "relative",
    zIndex: 1,
    width: `${NAV_BTN_WIDTH}px`,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    outline: "none",
    border: "none",
    background: "transparent",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease",
  },
  iconActive: {
    transform: "translateY(-1px) scale(1.12)",
    opacity: 1,
  },
  iconInactive: {
    transform: "translateY(1px) scale(0.9)",
    opacity: 0.22,
  },
  label: {
    fontSize: "12px",
    whiteSpace: "nowrap",
    color: "#1e3faa",
    display: "inline-block",
    pointerEvents: "none",
    transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  },
  labelActive: {
    opacity: 1,
    transform: "translateY(0px)",
    fontWeight: 600,
  },
  labelInactive: {
    opacity: 0.4,
    transform: "translateY(1px)",
    fontWeight: 500,
  },
};