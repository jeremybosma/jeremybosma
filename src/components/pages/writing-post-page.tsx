import type { Post } from "@/lib/blog";
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
    <article className="text-[17px]">
      <a
        href="/writing"
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <IconChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Writing
      </a>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">{post.title}</h1>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-2">{post.description}</p>
        )}
        <time className="text-muted-foreground text-sm">
          {formatDate(post.date)}
        </time>
      </header>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
