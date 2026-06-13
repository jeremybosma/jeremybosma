import { DraftBadge } from "@/components/draft-badge";
import { ProseContent } from "@/components/prose-content";
import type { Post } from "@/lib/blog";
import type React from "react";
import { writingTitleVtName } from "@/lib/page-view-transition";
import { IconChevronLeft } from "@/lib/symbols-react";

type WritingPostPageProps = {
  post: Post;
};

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function WritingPostPage({ post }: WritingPostPageProps) {
  return (
    <article className="page-panel-vt text-[17px] flex gap-4">
      <a
        href="/writing"
        className="shrink-0 mt-0.5 flex size-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground group"
        aria-label="Back to Writing"
      >
        <IconChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      </a>

      <div className="min-w-0 flex-1">
        <header className="mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1
              className="page-title-vt text-2xl font-semibold"
              style={
                {
                  "--page-title-vt": writingTitleVtName(post.slug),
                } as React.CSSProperties
              }
            >
              {post.title}
            </h1>
            {post.draft ? <DraftBadge /> : null}
          </div>
          {post.description && (
            <p className="text-muted-foreground text-sm mb-2">{post.description}</p>
          )}
          <time className="text-muted-foreground text-sm">
            Updated {formatDate(post.date)}
          </time>
        </header>

        <ProseContent client:load html={post.contentHtml} />
      </div>
    </article>
  );
}
