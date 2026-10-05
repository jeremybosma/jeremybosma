import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconArrowUpRight, IconChevronLeft, IconChevronRight } from "@/lib/symbols-react";
import type { ProjectApp } from "@/lib/project-apps";
import { PATHNAME_SYNC_EVENT } from "@/lib/pathname-sync";

export function ProjectAppGrid({ projects, label }: { projects: ProjectApp[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <ul className="project-app-grid" aria-label={label}>
      {projects.filter((project) => !project.hidden).map((project) => (
        <li key={project.slug}>
          <ProjectAppIcon
            project={project}
            open={active === project.slug}
            onOpenChange={(open) => setActive((current) =>
              open ? project.slug : current === project.slug ? null : current
            )}
          />
        </li>
      ))}
    </ul>
  );
}

function ProjectAppIcon({ project, open, onOpenChange }: {
  project: ProjectApp;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  function cancelClose() {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      if (trigger.current === document.activeElement || card.current?.contains(document.activeElement)) return;
      onOpenChange(false);
    }, 180);
  }

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function placeCard(event?: Event) {
      if (event?.target instanceof Node && card.current?.contains(event.target)) return;
      if (!trigger.current || !card.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      if (!anchor.width || !anchor.height) {
        onOpenChange(false);
        return;
      }
      const popup = card.current.getBoundingClientRect();
      const left = Math.max(12, Math.min(anchor.left + anchor.width / 2 - popup.width / 2, window.innerWidth - popup.width - 12));
      const below = anchor.bottom + 12;
      const top = below + popup.height <= window.innerHeight - 12
        ? below
        : Math.max(12, anchor.top - popup.height - 12);
      setPosition({ left, top });
    }

    placeCard();
    window.addEventListener("resize", placeCard);
    window.addEventListener("scroll", placeCard, true);
    return () => {
      window.removeEventListener("resize", placeCard);
      window.removeEventListener("scroll", placeCard, true);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !trigger.current?.contains(event.target) && !card.current?.contains(event.target)) {
        onOpenChange(false);
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      trigger.current?.focus();
      onOpenChange(false);
    }

    function dismissOnNavigation() {
      onOpenChange(false);
    }

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    window.addEventListener(PATHNAME_SYNC_EVENT, dismissOnNavigation);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
      window.removeEventListener(PATHNAME_SYNC_EVENT, dismissOnNavigation);
    };
  }, [open, onOpenChange]);

  function handleBlur(event: React.FocusEvent) {
    const next = event.relatedTarget;
    if (next instanceof Node && (trigger.current?.contains(next) || card.current?.contains(next))) return;
    if (trigger.current?.matches(":hover") || card.current?.matches(":hover")) return;
    onOpenChange(false);
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="project-app-link"
        aria-label={`Preview ${project.name}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? id : undefined}
        onMouseEnter={() => { cancelClose(); onOpenChange(true); }}
        onMouseLeave={scheduleClose}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) { cancelClose(); onOpenChange(true); }
        }}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          cancelClose();
          onOpenChange(true);
          requestAnimationFrame(() => card.current?.querySelector("a")?.focus());
        }}
        onClick={(event) => {
          cancelClose();
          onOpenChange(true);
          if (event.detail === 0) requestAnimationFrame(() => card.current?.querySelector("a")?.focus());
        }}
      >
        <span className="project-app-icon" style={{ backgroundColor: project.backgroundColor }}>
          <img
            src={project.image}
            alt=""
            width={96}
            height={96}
            loading="lazy"
            style={project.logoScale ? { transform: `scale(${project.logoScale})` } : undefined}
          />
        </span>
      </button>
      {open ? createPortal(
        <div
          ref={card}
          id={id}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${id}-name`}
          aria-describedby={`${id}-description`}
          className="project-hover-card"
          style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? "visible" : "hidden" }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onFocusCapture={cancelClose}
          onBlur={handleBlur}
        >
          <div className="project-hover-copy">
            <a
              href={project.link}
              className="project-hover-title"
              onClick={() => onOpenChange(false)}
              {...(project.link.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <h3 id={`${id}-name`}>{project.name}</h3>
              <IconArrowUpRight className="size-3" aria-hidden="true" />
              {project.link.startsWith("https://") ? <span className="sr-only">(opens in new tab)</span> : null}
            </a>
            <p id={`${id}-description`}>{project.description}</p>
          </div>
          <ProjectCarousel project={project} />
        </div>,
        document.body
      ) : null}
    </>
  );
}

function ProjectCarousel({ project }: { project: ProjectApp }) {
  const viewport = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const resumeAt = useRef(0);

  useEffect(() => {
    const scroller = viewport.current;
    const group = firstGroup.current;
    if (!scroller || !group) return;
    const preferences = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let previous = 0;
    let offset = scroller.scrollLeft;
    const loopWidth = group.offsetWidth + 12;

    function animate(time: number) {
      if (scroller && !preferences.matches && !paused.current && time >= resumeAt.current && previous) {
        offset = (offset + Math.min(time - previous, 50) * 0.025) % loopWidth;
        scroller.scrollLeft = offset;
      } else if (scroller) {
        offset = scroller.scrollLeft;
      }
      previous = time;
      frame = requestAnimationFrame(animate);
    }

    function updateMotionPreference() {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!preferences.matches) frame = requestAnimationFrame(animate);
    }

    updateMotionPreference();
    preferences.addEventListener("change", updateMotionPreference);
    return () => {
      cancelAnimationFrame(frame);
      preferences.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  function scroll(direction: number) {
    resumeAt.current = performance.now() + 3000;
    viewport.current?.scrollBy({ left: direction * (project.portrait ? 116 : 244), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <div className="project-carousel" role="region" aria-label={`${project.name} previews`}>
      <div
        ref={viewport}
        className="project-carousel-viewport"
        tabIndex={0}
        aria-label="Scroll project previews"
        onPointerEnter={() => { paused.current = true; }}
        onPointerLeave={() => { paused.current = false; }}
        onFocus={() => { paused.current = true; }}
        onBlur={() => { paused.current = false; }}
        onTouchStart={() => { resumeAt.current = performance.now() + 5000; }}
      >
        <div className="project-carousel-track">
          {(project.portrait ? [0, 1, 2] : [0, 1]).map((copy) => (
            <div key={copy} ref={copy === 0 ? firstGroup : undefined} className="project-carousel-group" aria-hidden={copy > 0 ? true : undefined}>
              {project.previews.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={copy === 0 ? `${project.name} preview ${index + 1}` : ""}
                  className={`project-preview-shot${project.portrait ? " project-preview-shot--portrait" : ""}`}
                  width={project.portrait ? 104 : 232}
                  height={144}
                  draggable={false}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="project-carousel-controls">
        <button type="button" onClick={() => scroll(-1)} aria-label="Previous previews"><IconChevronLeft className="size-3" aria-hidden="true" /></button>
        <button type="button" onClick={() => scroll(1)} aria-label="Next previews"><IconChevronRight className="size-3" aria-hidden="true" /></button>
      </div>
    </div>
  );
}
