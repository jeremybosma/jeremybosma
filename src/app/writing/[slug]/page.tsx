import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { IconChevronLeft } from "symbols-react";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    const slugs = getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    try {
        const post = await getPostBySlug(slug);
        return {
            title: post.title,
            description: post.description,
        };
    } catch {
        return {
            title: "Post Not Found",
        };
    }
}

export default async function PostPage({ params }: Props) {
    const { slug } = await params;

    let post;
    try {
        post = await getPostBySlug(slug);
    } catch {
        notFound();
    }

    return (
        <article className="text-[17px]">
            <Link
                href="/writing"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
                <IconChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Writing
            </Link>

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
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted markdown files
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
        </article>
    );
}

function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
