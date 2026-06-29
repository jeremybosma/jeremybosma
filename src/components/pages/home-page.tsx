import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ExpandablePhoto } from "@/components/expandable-photo";
import { HoverSlideItem, HoverSlideList } from "@/components/hover-slide-list";
import { useInstallHoverSlideLists } from "@/lib/hover-slide-list-dom";
import { sectionProps } from "@/components/layouts/client-shell";
import { CONTACT_EMAIL } from "@/lib/site";
import { IconArrowUpRight, IconEnvelope } from "@/lib/symbols-react";

const HOME_SHOWN_KEY = "portfolio-home-shown";
const ENTRANCE_DURATION_MS =
  (0.3 + sectionProps.transition.duration) * 1000;

function shouldSkipHomeEntrance() {
  if (typeof window === "undefined") return false;

  // View-transition navigation already animates the page panel in.
  if (window.history.state?.viewTransitionNavigation) return true;

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (nav?.type === "reload") return false;

  return sessionStorage.getItem(HOME_SHOWN_KEY) === "1";
}

function useSkipHomeEntrance(): boolean {
  const [skipEntrance, setSkipEntrance] = useState(false);

  useEffect(() => {
    setSkipEntrance(shouldSkipHomeEntrance());
  }, []);

  return skipEntrance;
}

function homeSectionProps(delay: number) {
  return {
    ...sectionProps,
    initial: "hidden" as const,
    animate: "visible" as const,
    transition: {
      ...sectionProps.transition,
      delay,
    },
  };
}

type HomeSectionProps = {
  delay: number;
  skipEntrance: boolean;
  className?: string;
  children: React.ReactNode;
};

function HomeSection({ delay, skipEntrance, className, children }: HomeSectionProps) {
  if (skipEntrance) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section {...homeSectionProps(delay)} className={className}>
      {children}
    </motion.section>
  );
}

const profile = "/profile.png";
const individu = "/projects/individu.png";
const fulldev = "/projects/fulldev.png";
const internetengineering = "/projects/internet-engineering.png";
const integrate = "/projects/integrate.png";
const alfacollege = "/alfa-college.png";

/** Which captured screenshot (1–3) shows in each hover slot: left, right, top. */
const PROJECT_PREVIEW_ORDER: readonly [number, number, number] = [2, 3, 1];

function projectPreviews(slug: string): string[] {
  return PROJECT_PREVIEW_ORDER.map((n) => `/projects/previews/${slug}-${n}.jpg`);
}

export default function HomePage() {
  useInstallHoverSlideLists();
  const [showMiddleName, setShowMiddleName] = useState(false);
  const skipEntrance = useSkipHomeEntrance();

  useEffect(() => {
    if (skipEntrance) return;

    const timer = window.setTimeout(() => {
      sessionStorage.setItem(HOME_SHOWN_KEY, "1");
    }, ENTRANCE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [skipEntrance]);

  return (
    <div className="page-panel-vt page-sections flex flex-col gap-8">
      <HomeSection
        delay={0}
        skipEntrance={skipEntrance}
        className="text-[17px] flex gap-2 items-center"
      >
        <ExpandablePhoto
          loading="eager"
          src={profile}
          alt="Jeremy Bosma"
          className="w-12 h-12 rounded-xl object-cover"
          width={100}
          height={100}
          fetchPriority="high"
        />
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setShowMiddleName((prev) => !prev)}
            className="cursor-pointer block w-fit p-0 m-0 bg-transparent border-0 text-left font-inherit outline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 rounded"
            aria-label={showMiddleName ? "Show short name" : "Show full name"}
          >
            <h1 className="inline leading-none">
              {"Jeremy "}
              <span className="inline-block align-baseline">
                <AnimatePresence initial={false}>
                  {showMiddleName ? (
                    <motion.span
                      key="with-middle"
                      initial={{ 
                        x: -20, 
                        opacity: 0,
                        filter: "blur(8px)",
                        width: 0
                      }}
                      animate={{ 
                        x: 0, 
                        opacity: 1,
                        filter: "blur(0px)",
                        width: "auto"
                      }}
                      exit={{ 
                        x: -20, 
                        opacity: 0,
                        filter: "blur(8px)",
                        width: 0
                      }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.32, 0.72, 0, 1]
                      }}
                      className="inline-block whitespace-pre  align-baseline"
                    >
                      Benjamin{" "}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </span>
              Bosma
            </h1>
          </button>
          <p className="text-black/60 dark:text-white/60">Software Engineer &amp; Designer</p>
        </div>
      </HomeSection>

      <HomeSection delay={0.1} skipEntrance={skipEntrance}>
        <p>
          I'm a software engineer with eye for design and micro-interactions and I aim to create memorable digital experiences.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group inline-flex items-center gap-2 rounded-full border border-black bg-black px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-black/85 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90 active:scale-[0.98]"
          >
            <IconEnvelope className="w-4 h-4 fill-current" aria-hidden="true" />
            Email
            <IconArrowUpRight
              className="w-3 h-3 fill-current transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </HomeSection>

      <HomeSection delay={0.2} skipEntrance={skipEntrance}>
        <h2>Highlighted work</h2>
        <HoverSlideList className="flex flex-col -mx-3 overflow-visible">
          <ProjectCard name="Individu" description="Let AI work in the apps you use everyday" image={individu} link="https://individu.ai" previewImages={projectPreviews("individu")} />  
          <ProjectCard name="Internet Engineering" description="Software agency building products your users want to come back to" image={internetengineering} link="https://internet-engineering.com" previewImages={projectPreviews("internet-engineering")} />
          <ProjectCard name="Integrate" description="Devtool to connect AI agents to services without shipping new backends" image={integrate} link="https://integrate.dev" previewImages={projectPreviews("integrate")} />
          <ProjectCard name="Internship at full.dev" description="Web development agency that's also building devtools" image={fulldev} link="https://full.dev" previewImages={projectPreviews("fulldev")} />
          {/* <ProjectCard name="Clipras" description="Get paid to post AI generated clips from creator and brand campaigns fairly by web3" image={clipras} link="https://clipras.com" /> */}
          {/* <ProjectCard name="seavan" description="AI Automated container planning" image={seavan} link="https://seavan.app" /> */}
          {/* <ProjectCard name="vesselspro" description="A better solution to fleet management, ship maintenance, and more for privates and major shipping companies" image={vesselspro} link="https://vessels.pro" /> */}
          {/* <ProjectCard name="explore.work" description="AI-assisted job finder with realtime resume suggestions and inquiry-tracker" image={explorework} link="https://explore.work" />
          <ProjectCard name="outfitsbio" description="Keep track of your clothing, go shopping, share, and find outfit inspiration" image={outfitsbio} link="https://outfitsbio.com" /> */}
        </HoverSlideList>
      </HomeSection>

      <HomeSection delay={0.3} skipEntrance={skipEntrance}>
        <h2>Education</h2>
        <HoverSlideList className="flex flex-col -mx-3 overflow-visible">
          <ProjectCard name="Alfa-college" description="MBO 4, Software Development • Sep 2023 – May 2026" image={alfacollege} link="https://www.alfa-college.nl/mbo-opleidingen/informatie-en-communicatietechnologie-ict/software-developer-groningen" previewImages={[]} />
        </HoverSlideList>
      </HomeSection>

      {false && <HomeSection delay={0.35} skipEntrance={skipEntrance}>
        <h2>Contact</h2>
        <p className="text-black/60 dark:text-white/60">
          I'm always looking for new opportunities and collaborations. If you have any questions or would like to get in touch, please don't hesitate to contact me on <a className="underline" href="mailto:prive@jeremybosma.nl">prive@jeremybosma.nl</a> or contact me on <a className="underline" href="https://x.com/jeremybosma_" target="_blank" rel="noopener noreferrer">X</a>.
        </p>
      </HomeSection>
      }

      {false && (
        <HomeSection
          delay={0.2}
          skipEntrance={skipEntrance}
          className="bg-white border rounded-md p-4"
        >
          <h2>Open to freelance work (Fixed or hourly rate)</h2>
          <p className="text-black/60 dark:text-white/60">I'm currently looking for a new challenge. If you have any opportunities, please don't hesitate to contact me on <a className="underline" href="mailto:prive@jeremybosma.nl">prive@jeremybosma.nl</a> or contact me on <a className="underline" href="https://x.com/jeremybosma_">X</a> for all your programming and or design needs.</p>
        </HomeSection>
      )}

      <HomeSection delay={0.3} skipEntrance={skipEntrance}>
        <footer className="text-xs text-black/60 dark:text-white/60">Updated Jun 2026</footer>
      </HomeSection>
    </div>
  );
}

const PROJECT_PREVIEW_SLOTS = [
  {
    position:
      "left-[4%] top-1/2 -translate-y-1/2 -rotate-[8deg] opacity-0 scale-90 group-hover/project:opacity-100 group-hover/project:scale-100 group-hover/project:-translate-x-2 group-hover/project:-rotate-[12deg]",
  },
  {
    position:
      "right-[4%] top-1/2 -translate-y-1/2 rotate-[8deg] opacity-0 scale-90 group-hover/project:opacity-100 group-hover/project:scale-100 group-hover/project:translate-x-2 group-hover/project:rotate-[12deg]",
  },
  {
    position:
      "left-1/2 top-[6%] -translate-x-1/2 -rotate-[3deg] opacity-0 scale-90 group-hover/project:opacity-100 group-hover/project:scale-100 group-hover/project:-translate-y-2 group-hover/project:-rotate-[8deg]",
  },
] as const;

const PROJECT_PREVIEW_HUES = [215, 265, 155] as const;

type ProjectProps = {
  name: string;
  description: string;
  image: string;
  link: string;
  /** Up to 3 landscape preview images (16:9). Omit for placeholders; pass [] to hide. */
  previewImages?: string[];
};

function ProjectPreviewMedia({ src, index }: { src?: string; index: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        width={160}
        height={90}
      />
    );
  }

  const hue = PROJECT_PREVIEW_HUES[index] ?? 215;

  return (
    <div
      className="h-full w-full"
      aria-hidden="true"
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 35% 32%), hsl(${hue} 28% 20%))`,
      }}
    />
  );
}

function ProjectCard({ name, description, image, link, previewImages }: ProjectProps) {
  const showPreviews = previewImages === undefined || previewImages.length > 0;
  const previews =
    previewImages === undefined
      ? [undefined, undefined, undefined]
      : previewImages.slice(0, PROJECT_PREVIEW_SLOTS.length);

  return (
    <HoverSlideItem
      href={link}
      className="group/project overflow-visible rounded-lg px-3 py-2"
      aria-label={`Visit ${name} website (opens in new tab)`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-[92px] shrink-0 overflow-visible pointer-events-none">
          {showPreviews
            ? previews.map((previewSrc, slotIndex) => {
                const slot = PROJECT_PREVIEW_SLOTS[slotIndex];
                if (!slot) return null;

                return (
                  <div
                    key={previewSrc ?? slotIndex}
                    className={`absolute w-[76px] aspect-video overflow-hidden rounded-md bg-secondary/60 shadow-md ring-1 ring-border/30 transition-all duration-300 ease-out ${slot.position}`}
                  >
                    <ProjectPreviewMedia src={previewSrc} index={slotIndex} />
                  </div>
                );
              })
            : null}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-black/10 bg-background shadow-sm transition-transform duration-300 ease-out group-hover/project:scale-[1.04] dark:border-white/10">
            <img
              src={image}
              alt={`${name} project logo`}
              className="size-[34px] object-cover"
              width={100}
              height={100}
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2">
            <h3 className="hover-slide-title">{name}</h3>
            <IconArrowUpRight
              className="h-2 w-2 text-muted-foreground transition-all duration-200 group-hover/project:text-foreground group-hover/project:translate-x-0.5 group-hover/project:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
          <p className="hover-slide-muted text-muted-foreground">{description}</p>
        </div>
      </div>
    </HoverSlideItem>
  );
}