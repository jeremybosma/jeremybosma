"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { motion } from 'motion/react'

import zerosystem from "../../public/projects/0system.png";
import vesselspro from "../../public/projects/vesselspro.png";
import outfitsbio from "../../public/projects/outfitsbio.png";
import fulldev from "../../public/projects/fulldev.png";

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

export default function Home() {
  return (
    <motion.main
      className="flex flex-col min-h-screen p-8 gap-8 max-w-3xl"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="text-[17px]"
      >
        <h1>Jeremy Bosma</h1>
        <p className="text-black/60 dark:text-white/60">Software Engineer &amp; Designer</p>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <p>
          I'm a software engineer with eye for design and micro-interactions and I aim to create memorable digital experiences and soon physical products like hardware and even clothing.
        </p>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2>What I'm working on</h2>
        <ProjectCard name="0system" description="context aware cloud-based OS with everything you need" image={zerosystem} link="https://0system.com" />
        <ProjectCard name="vesselspro" description="a better solution to fleet management, ship maintenance, and more for privates and major shipping companies." image={vesselspro} link="https://vessels.pro" />
        <ProjectCard name="outfitsbio" description="a platform to keep track of your clothing, share, and find outfit inspiration." image={outfitsbio} link="https://outfits.bio" />
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2>Work experience</h2>
        <ProjectCard name="Internship at full.dev" description="web development agency that's also building development tools." image={fulldev} link="https://full.dev" />
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2>Contact</h2>
        <p className="text-black/60 dark:text-white/60">
          I'm always looking for new opportunities and collaborations. If you have any questions or would like to get in touch, please don't hesitate to contact me on <Link className="underline" href="mailto:prive@jeremybosma.nl">prive@jeremybosma.nl</Link> or contact me on <Link className="underline" href="https://x.com/jeremybosma_">X</Link>.
        </p>
      </motion.section>
    </motion.main>
  );
}

type ProjectProps = {
  name: string;
  description: string;
  image: StaticImageData;
  link: string;
}

function ProjectCard({ name, description, image, link }: ProjectProps) {
  return (
    <Link href={link}>
      <div className="flex gap-3 my-2 items-center">

        <Image src={image} alt={name} className="w-fit h-fit rounded-md border-black/10 dark:border-white/10 border-[0.5px]" width={30} height={30} />

        <div className="flex flex-col">
          <h3>{name}</h3>
          <p className="text-black/60 dark:text-white/60">{description}</p>
        </div>

      </div>
    </Link>
  );
}