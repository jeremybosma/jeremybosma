import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { IconChevronRight } from "symbols-react";

export default function WritingPage() {
    const posts = getAllPosts();

    return (
        <section className="text-[17px]">
            <h1 className="text-2xl font-semibold mb-6">Writing</h1>
            <div className="flex flex-col gap-1">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/writing/${post.slug}`}
                        className="group flex items-center justify-between py-3 -mx-3 px-3 rounded-lg hover:bg-secondary/60 transition-colors"
                        aria-label={`Read ${post.title}`}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h2 className="font-medium truncate">{post.title}</h2>
                            <p className="text-muted-foreground text-sm truncate">
                                {post.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground shrink-0 ml-4">
                            <time className="text-sm hidden sm:block">
                                {formatDate(post.date)}
                            </time>
                            <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </div>
                    </Link>
                ))}
            </div>
            {posts.length === 0 && (
                <p className="text-muted-foreground text-center py-12">
                    No posts yet. Check back soon.
                </p>
            )}
        </section>
    );
}

function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
