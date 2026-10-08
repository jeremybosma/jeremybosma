export type ProjectApp = {
  slug: string;
  name: string;
  description: string;
  image: string;
  link: string;
  previews: string[];
  logoScale?: number;
  backgroundColor?: string;
  portrait?: boolean;
  hidden?: boolean;
};

function previews(slug: string, extension = "webp") {
  return [1, 2, 3].map((index) => `/projects/previews/${slug}-${index}.${extension}`);
}

export const AGENCY_APPS: ProjectApp[] = [
  {
    slug: "individu",
    name: "Individu",
    description: "Let AI work in the apps you use everyday",
    image: "/projects/individu.png",
    link: "/site/individu",
    previews: previews("individu"),
  },
  {
    slug: "integrate",
    name: "Integrate",
    description: "Devtool to connect AI agents to services without shipping new backends",
    image: "/projects/integrate-app.png",
    backgroundColor: "#faf9f6",
    link: "/site/integrate",
    previews: previews("integrate", "jpg"),
  },
  {
    slug: "hedge-club",
    name: "Hedge Club",
    description: "An iPhone research desk for observing prediction markets and reviewing paper-trading decisions",
    image: "/projects/hedge-club.png",
    link: "/site/hedge-club",
    previews: previews("hedge-club"),
    portrait: true,
  },
  {
    slug: "forge",
    name: "Forge",
    description: "The AI-native operating system for software companies: docs, code, deploys, marketing, and revenue in one workspace",
    image: "/projects/forge-mark.svg",
    backgroundColor: "#925b2a",
    link: "/site/forge",
    previews: previews("forge"),
  },
  {
    slug: "restyle",
    name: "Restyle",
    description: "Turn a website URL into a visual redesign preview and a drop-in Next.js and Tailwind patch",
    image: "/projects/restyle.png",
    link: "/site/restyle",
    previews: previews("restyle"),
  },
  {
    slug: "viavia",
    name: "VIA VIA",
    description: "A referral marketplace that pays real cash for trusted introductions to talent, services, and customers",
    image: "/projects/viavia-mark.svg",
    link: "/site/viavia",
    previews: previews("viavia"),
  },
  {
    slug: "aiassure",
    name: "aiassure",
    description: "AI-assisted financial due diligence with source-linked analysis, quality of earnings, and CPA review",
    image: "/projects/aiassure-mark.png",
    link: "/site/aiassure",
    previews: previews("aiassure"),
  },
  {
    slug: "sfina",
    name: "Sfina",
    description: "Vessel operations for crews and fleet operators: maintenance, safety, schedules, and container planning",
    image: "/projects/sfina-mark.svg",
    backgroundColor: "#19293c",
    link: "/site/sfina",
    previews: previews("sfina"),
  },
  {
    slug: "forma",
    name: "Forma",
    description: "A new perspective on property: floor plans, interior concepts, and beautifully branded digital listings",
    image: "/projects/forma.png",
    link: "/site/forma",
    previews: previews("forma"),
  },
  {
    slug: "gluiss",
    name: "Gluiss",
    description: "A composable React interface system with adaptive layouts, accessible controls, liquid glass, and motion",
    image: "/projects/gluiss-mark.svg",
    link: "/site/gluiss",
    previews: previews("gluiss"),
  },
  {
    slug: "revyocollect",
    name: "Revyo Collect",
    description: "Connect QuickBooks, automate follow-ups, and manage customer email, payment promises, and disputes in one collections workspace",
    image: "/projects/revyocollect.svg",
    backgroundColor: "#9b4432",
    link: "/site/revyocollect",
    previews: previews("revyocollect"),
  },
  {
    slug: "yieldbuddy",
    name: "Yieldbuddy",
    description: "A desktop workspace for portfolio planning, investment research, and Treasury ladders",
    image: "/projects/yieldbuddy-mark.svg",
    link: "/site/yieldbuddy",
    previews: previews("yieldbuddy"),
  },
  {
    slug: "outfitsbio",
    name: "outfits.bio",
    description: "Share your outfits, discover clothing, get AI styling advice, and shop the looks you love",
    image: "/projects/outfitsbio.svg",
    link: "/site/outfitsbio",
    previews: previews("outfitsbio"),
  },
];

export const FULLDEV_APPS: ProjectApp[] = [
  {
    slug: "plantsome",
    hidden: true,
    name: "Plantsome",
    description: "An online plant shop with plant discovery, care advice, and delivery to your door",
    image: "/projects/plantsome.png",
    logoScale: 0.78,
    link: "/site/plantsome",
    previews: previews("plantsome"),
  },
  {
    slug: "fulldev-ui",
    name: "Fulldev UI",
    description: "A collection of Astro components and blocks for building websites",
    image: "/projects/fulldev-ui.png",
    link: "/site/fulldev-ui",
    previews: previews("fulldev-ui"),
  },
];
