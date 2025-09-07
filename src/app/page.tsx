"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { motion } from 'motion/react'

import zerosystem from "../../public/projects/0system.png";
import outfitsbio from "../../public/projects/outfitsbio.png";
import fulldev from "../../public/projects/fulldev.png";
import internetengineering from "../../public/projects/internet-engineering.png";
import { sectionProps } from "./ui/ClientLayout";
import profile from "../../public/profile.png";
import { IconArrowUpRight } from "symbols-react";

export default function Home() {
  return (
    <>
      <motion.section
        {...sectionProps}
        className="text-[17px] flex gap-2 items-center"
      >
        <Image src={profile} alt="Jeremy Bosma" className="w-12 h-12 rounded-xl object-cover" width={100} height={100} />
        <div>
          <h1>Jeremy Bosma</h1>
          <p className="text-black/60 dark:text-white/60">Software Engineer &amp; Designer</p>
        </div>
      </motion.section>

      <motion.section
        {...sectionProps}
      >
        <p>
          I'm a software engineer with eye for design and micro-interactions and I aim to create memorable digital experiences.
        </p>
      </motion.section>

      {false && (
        <motion.section
          {...sectionProps}
          className="bg-white border rounded-md p-4"
        >
          <h2>Open to freelance work (Fixed or hourly rate)</h2>
          <p className="text-black/60 dark:text-white/60">I'm currently looking for a new challenge. If you have any opportunities, please don't hesitate to contact me on <Link className="underline" href="mailto:prive@jeremybosma.nl">prive@jeremybosma.nl</Link> or contact me on <Link className="underline" href="https://x.com/jeremybosma_">X</Link> for all your programming and or design needs.</p>
        </motion.section>
      )}

      <motion.section
        {...sectionProps}
      >
        <h2>What I'm working on</h2>
        <div className="flex flex-col">
          <ProjectCard name="Internet Engineering" description="Software agency focused on implementing agentic AI experiences software with human-like user interfaces." image={internetengineering} link="https://internet-engineering.com" />
          <ProjectCard name="0system" description="One OS to run your entire digital life. We integrate with the applications you use everyday so you can work smarter, not harder. Just type and get things done." image={zerosystem} link="https://0system.com" />
          {/* <ProjectCard name="seavan" description="AI Automated container planning" image={seavan} link="https://seavan.app" /> */}
          {/* <ProjectCard name="vesselspro" description="A better solution to fleet management, ship maintenance, and more for privates and major shipping companies" image={vesselspro} link="https://vessels.pro" /> */}
          <ProjectCard name="outfitsbio" description="Social platform to keep track of your clothing, go shopping, share, and find outfit inspiration" image={outfitsbio} link="https://outfitsbio.com" />
        </div>
      </motion.section>

      <motion.section
        {...sectionProps}
      >
        <h2>Work experience</h2>
        <div className="flex flex-col">
          <ProjectCard name="Internship at full.dev" description="web development agency that's also building development tools." image={fulldev} link="https://full.dev" />
        </div>
      </motion.section>

      <motion.section
        {...sectionProps}
      >
        <h2>Contact</h2>
        <p className="text-black/60 dark:text-white/60">
          I'm always looking for new opportunities and collaborations. If you have any questions or would like to get in touch, please don't hesitate to contact me on <Link className="underline" href="mailto:prive@jeremybosma.nl">prive@jeremybosma.nl</Link> or contact me on <Link className="underline" href="https://x.com/jeremybosma_">X</Link>.
        </p>
      </motion.section>
    </>
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
    <Link href={link} className="group">
      <div className="flex gap-3 my-2 items-center">
        <Image src={image} alt={name} className="w-fit h-fit rounded-md border-black/10 dark:border-white/10 border-[0.5px]" width={30} height={30} />
        <div className="flex flex-col">
          <span className="flex gap-2 items-center">
            <h3>{name}</h3>
            <IconArrowUpRight className="w-2 h-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </span>
          <p className="text-black/60 dark:text-white/60">{description}</p>
        </div>
      </div>
    </Link>
  );
}