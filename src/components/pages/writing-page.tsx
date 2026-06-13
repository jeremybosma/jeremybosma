import type React from "react";
import { DraftBadge } from "@/components/draft-badge";
import { HoverSlideItem, HoverSlideList } from "@/components/hover-slide-list";
import { useInstallHoverSlideLists } from "@/lib/hover-slide-list-dom";
import { getAllPosts } from "@/lib/blog";
import { writingTitleVtName } from "@/lib/page-view-transition";
import { IconChevronRight } from "@/lib/symbols-react";

export default function WritingPageContent() {
    useInstallHoverSlideLists();
    const posts = getAllPosts();

    return (
        <section className="text-[17px]">
            <h1 className="text-2xl font-semibold mb-6">Writing</h1>
            <HoverSlideList className="flex flex-col gap-1 -mx-3">
                {posts.map((post) => (
                    <HoverSlideItem
                        key={post.slug}
                        href={`/writing/${post.slug}`}
                        className="group flex items-center justify-between py-3 px-3 rounded-lg"
                        aria-label={`Read ${post.title}`}
                    >
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <h2
                                    className="page-title-vt hover-slide-title font-medium truncate"
                                    style={
                                        {
                                            "--page-title-vt": writingTitleVtName(post.slug),
                                        } as React.CSSProperties
                                    }
                                >
                                    {post.title}
                                </h2>
                                {post.draft ? <DraftBadge /> : null}
                            </div>
                            <p className="hover-slide-muted text-muted-foreground text-sm truncate">
                                {post.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 hover-slide-muted text-muted-foreground shrink-0 ml-4">
                            <time className="text-sm hidden sm:block">
                                {formatDate(post.date)}
                            </time>
                            <IconChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </div>
                    </HoverSlideItem>
                ))}
            </HoverSlideList>
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
