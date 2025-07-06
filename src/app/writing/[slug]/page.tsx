"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from 'motion/react';
import MarkdownRenderer from "./markdown-render";
import TableOfContents from "./table-of-contents";

// Define the blog post metadata structure 
interface PostMetadata {
    title: string;
    date: string;
    description: string;
    image?: string;
}

// Define the blog post structure
interface Post {
    slug: string;
    content: string;
    metadata: PostMetadata;
}

// Animation variants
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

export default function Page() {
    const params = useParams();
    const slug = params.slug as string;

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await fetch(`/api/posts/${slug}`);
                if (response.ok) {
                    const data = await response.json();
                    setPost(data);
                } else {
                    setError('Failed to fetch post');
                }
            } catch (error) {
                console.error(`Error fetching post ${slug}:`, error);
                setError('An error occurred while fetching the post');
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="container h-screen my-auto mx-auto px-4 py-12">
                <p className="text-center">Loading post...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container mx-auto px-4 py-12">
                <p className="text-center text-red-500">{error || 'Post not found'}</p>
                <div className="text-center mt-4">
                    <Link href="/writing" className="text-blue-600 hover:underline">
                        Back to posts
                    </Link>
                </div>
            </div>
        );
    }

    const { content, metadata } = post;

    return (
        <motion.div
            className="container mx-auto px-4 py-12"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
        >
            <motion.article
                className="max-w-4xl mx-auto"
                variants={VARIANTS_SECTION}
                transition={TRANSITION_SECTION}
            >
                <div className="mt-3">
                    <Link
                        href="/writing"
                        className="inline-flex items-center text-black/60 hover:text-black transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span className="ml-1">All Posts</span>
                    </Link>
                </div>

                {/* <motion.header
                    className="mb-10"
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                >
                    <h1 className="text-4xl font-bold mb-4">{metadata.title}</h1>
                    <p className="text-gray-600 mb-4">{new Date(metadata.date).toLocaleDateString()}</p>
                    {metadata.description && (
                        <p className="text-xl text-gray-700 mb-6">{metadata.description}</p>
                    )}
                    {metadata.image && (
                        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg mb-8">
                            <img
                                src={metadata.image}
                                alt={metadata.title}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                </motion.header> */}

                <motion.div
                    className="flex flex-col md:flex-row gap-8"
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                >
                    <div className="md:w-full">
                        <MarkdownRenderer content={content} />
                    </div>
                </motion.div>
            </motion.article>

            {/* TOC positioned outside article container */}
            <TableOfContents content={content} />
        </motion.div>
    );
} 