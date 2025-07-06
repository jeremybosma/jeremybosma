"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { motion } from 'motion/react'

import zerosystem from "../../public/projects/0system.png";
import vesselspro from "../../public/projects/vesselspro.png";
import outfitsbio from "../../public/projects/outfitsbio.png";
import fulldev from "../../public/projects/fulldev.png";
import mythic from "../../public/projects/mythic.png";
import calcalc from "../../public/projects/calcalc.png";
import internetengineering from "../../public/projects/internet-engineering.png";

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

// Define the blog post metadata structure 
interface PostMetadata {
  title: string
  date: string
  description: string
  image?: string
}

// Define the blog post structure
interface Post {
  slug: string
  metadata: PostMetadata
}

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchRecentPosts() {
      try {
        const response = await fetch('/api/recent-posts');
        if (response.ok) {
          const posts = await response.json();
          setRecentPosts(posts);
        }
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
      }
    }

    fetchRecentPosts();
  }, []);

  return (
    <motion.main
      className="flex flex-col min-h-screen p-8 gap-8 max-w-3xl mx-auto"
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
          I'm a software engineer with eye for design and micro-interactions and I aim to create memorable digital experiences.
        </p>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="bg-white border rounded-md p-4"
      >
        <h2>Open to freelance work (Fixed or hourly rate)</h2>
        <p className="text-black/60 dark:text-white/60">I'm currently looking for a new challenge. If you have any opportunities, please don't hesitate to contact me on <Link className="underline" href="mailto:prive@jeremybosma.nl">prive@jeremybosma.nl</Link> or contact me on <Link className="underline" href="https://x.com/jeremybosma_">X</Link> for all your programming and or design needs.</p>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2>What I'm working on</h2>
        <ProjectCard name="Internet Engineering™" description="Software agency focused on development and design of agentic experiences with modern user interfaces." image={internetengineering} link="https://internet-engineering.com" />
        <ProjectCard name="0system" description="One OS to run your entire digital life. We integrate with the applications you use everyday so you can work smarter, not harder. Just type and get things done." image={zerosystem} link="https://0system.com" />
        <ProjectCard name="vesselspro" description="A better solution to fleet management, ship maintenance, and more for privates and major shipping companies" image={vesselspro} link="https://vessels.pro" />
        <ProjectCard name="outfitsbio" description="Social platform to keep track of your clothing, share, and find outfit inspiration" image={outfitsbio} link="https://outfitsbio.com" />
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h2>Work experience</h2>
        <ProjectCard name="Internship at full.dev" description="web development agency that's also building development tools." image={fulldev} link="https://full.dev" />
      </motion.section>


      {false && (
        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2>Writing</h2>
          {recentPosts.length > 0 ? (
            <>
              {recentPosts.map(post => (
                <BlogPostCard
                  key={post.slug}
                  title={post.metadata.title}
                  description={post.metadata.description}
                  image={post.metadata.image}
                  link={`/writing/${post.slug}`}
                />
              ))}
              {recentPosts.length > 3 && (
                <Link href="/writing" className="text-sm text-black/60 hover:text-black/80 mt-2 inline-block">
                  View all posts →
                </Link>
              )}
            </>
          ) : (
            <p className="text-black/60">Loading posts...</p>
          )}
        </motion.section>
      )}

      {false && (
        <motion.section
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
        >
          <h2>Gallery</h2>
          <motion.div
            className="columns-2 sm:columns-3 gap-3 mt-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            {[
              { src: zerosystem, alt: "0system project" },
              { src: mythic, alt: "Mythic project" },
              { src: vesselspro, alt: "VesselsPro project" },
              { src: calcalc, alt: "Calcalc project" },
              { src: outfitsbio, alt: "OutfitsBio project" },
              { src: fulldev, alt: "Full.dev project" },
            ].map((image, index) => (
              <motion.div
                key={index}
                className="break-inside-avoid mb-3"
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.4 }
                  },
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="w-full rounded-md border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-colors"
                  placeholder="blur"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

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

type BlogPostProps = {
  title: string;
  description: string;
  image?: string;
  link: string;
}

function BlogPostCard({ title, description, image, link }: BlogPostProps) {
  return (
    <Link href={link}>
      <div className="flex gap-3 my-2 items-center">
        {image ? (
          <Image
            src={image}
            alt={title}
            className="w-[30px] h-[30px] rounded-md border-black/10 dark:border-white/10 border-[0.5px] object-cover"
            width={30}
            height={30}
          />
        ) : (
          <div className="w-[30px] h-[30px] bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border-black/10 dark:border-white/10 border-[0.5px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
        )}
        <div className="flex flex-col">
          <h3>{title}</h3>
          <p className="text-black/60 dark:text-white/60">{description}</p>
        </div>
      </div>
    </Link>
  );
}