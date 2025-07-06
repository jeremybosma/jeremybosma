"use client";

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from 'motion/react'

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

function PostCard({ post }: { post: Post }) {
    return (
        <Link href={`/writing/${post.slug}`}>
            <div className="flex gap-3 my-4 items-center hover:bg-gray-50 p-2 rounded-md transition-colors">
                {post.metadata.image ? (
                    <div className="shrink-0">
                        <Image
                            src={post.metadata.image}
                            alt={post.metadata.title}
                            className="w-10 h-10 object-cover rounded-md border-black/10 border-[0.5px]"
                            width={40}
                            height={40}
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                )}
                <div className="flex flex-col">
                    <h3 className="font-medium">{post.metadata.title}</h3>
                    <p className="text-black/60 text-sm">{post.metadata.description}</p>
                    <p className="text-black/40 text-xs mt-1">{new Date(post.metadata.date).toLocaleDateString()}</p>
                </div>
            </div>
        </Link>
    )
}

export default function Page() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch('/api/posts');
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                } else {
                    console.error('Failed to fetch posts');
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    return (
        <motion.div
            className="max-w-3xl mx-auto p-8"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                variants={VARIANTS_SECTION}
                transition={TRANSITION_SECTION}
                className="mb-3 flex items-center"
            >
                <Link
                    href="/"
                    className="inline-flex items-center mr-4 text-black/60 hover:text-black transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span className="ml-1">Home</span>
                </Link>
                <h1 className="text-2xl font-medium">Writing</h1>
            </motion.div>

            <motion.section
                variants={VARIANTS_SECTION}
                transition={TRANSITION_SECTION}
            >
                <p className="text-black/60">My thoughts brought to words</p>

                {loading ? (
                    <p className="text-black/60">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-black/60">No posts found...</p>
                ) : (
                    <div className="flex flex-col">
                        {posts.map(post => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                )}
            </motion.section>
        </motion.div>
    )
} 