import React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  IconHouse,
  IconHouseFill,
  IconPhotoStack,
  IconPhotoStackFill,
  IconAirpodsProLeft,
  IconXLogo,
  IconLine3Horizontal,
  IconXmark,
  IconLinkedinLogo,
  IconInstagramLogo,
  IconBriefcase,
  IconBriefcaseFill,
  IconPencilLine,
  IconFilm,
  IconFilmFill,
  IconTshirt,
  IconTshirtFill,
  IconEnvelope,
  IconGithubLogo,
} from "@/lib/symbols-react";
import { PATHNAME_SYNC_EVENT } from "@/lib/pathname-sync";

type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ElementType;
  iconActive?: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: IconHouse, iconActive: IconHouseFill },
  {
    label: "Agency",
    href: "https://internet-engineering.com",
    external: true,
    icon: IconBriefcase,
    iconActive: IconBriefcaseFill,
  },
  { label: "Supply", href: "/supply", icon: IconTshirt, iconActive: IconTshirtFill },
  { label: "Writing", href: "/writing", icon: IconPencilLine, iconActive: IconPencilLine },
  {
    label: "Gallery",
    href: "/gallery",
    icon: IconPhotoStack,
    iconActive: IconPhotoStackFill,
  },
  { label: "Videos", href: "/videos", icon: IconFilm, iconActive: IconFilmFill },
  { label: "Music", href: "/music", icon: IconAirpodsProLeft, iconActive: IconAirpodsProLeft },
];

const SOCIAL_ITEMS: NavItem[] = [
  { label: "Email", href: "mailto:prive@jeremybosma.nl", external: true, icon: IconEnvelope },
  { label: "GitHub", href: "https://github.com/jeremybosma", external: true, icon: IconGithubLogo },
  { label: "X", href: "https://x.com/jeremybosma_", external: true, icon: IconXLogo },
  {
    label: "Instagram",
    href: "https://instagram.com/jeremybosma_",
    external: true,
    icon: IconInstagramLogo,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/jeremybosma",
    external: true,
    icon: IconLinkedinLogo,
  },
];

function subscribeToPathname(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  window.addEventListener(PATHNAME_SYNC_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
    window.removeEventListener(PATHNAME_SYNC_EVENT, onStoreChange);
  };
}

function usePathname(pathnameProp?: string) {
  return React.useSyncExternalStore(
    subscribeToPathname,
    () => window.location.pathname,
    () => pathnameProp ?? "/"
  );
}

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const linkClasses = `flex items-center gap-3 py-2 text-base font-medium transition-all active:scale-98 duration-100  ${
    isActive
      ? "text-black dark:text-white"
      : "text-muted-foreground hover:text-black dark:hover:text-white"
  }`;

  const content = (
    <>
      {item.icon && (
        <span className="inline-flex">
          {isActive && item.iconActive ? (
            <item.iconActive className="w-5 h-5" />
          ) : (
            <item.icon className="w-5 h-5" />
          )}
        </span>
      )}
      {item.label}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <a
      href={item.href}
      className={linkClasses}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      {content}
    </a>
  );
}

type NavigationProps = {
  pathname?: string;
};

export default function Navigation({ pathname: pathnameProp }: NavigationProps) {
  const pathname = usePathname(pathnameProp);
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (item: NavItem) => {
    if (item.external) return false;
    return pathname === item.href;
  };

  return (
    <>
      <nav className="hidden md:flex flex-col justify-between h-full">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item)} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {SOCIAL_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} isActive={false} />
          ))}
        </div>
      </nav>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-2 text-base font-medium text-black dark:text-white"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? (
            <IconXmark className="w-5 h-5" />
          ) : (
            <IconLine3Horizontal className="w-5 h-5" />
          )}
          Menu
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 pt-2 pl-2">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActive(item)}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
                <div className="h-px bg-black/10 dark:bg-white/10 my-2" />
                {SOCIAL_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={false}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
