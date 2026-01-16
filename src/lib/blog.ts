import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostMeta = {
    slug: string;
    title: string;
    date: string;
    description: string;
};

export type Post = PostMeta & {
    contentHtml: string;
};

export function getAllPostSlugs(): string[] {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getAllPosts(): PostMeta[] {
    const slugs = getAllPostSlugs();
    const posts = slugs.map((slug) => getPostMeta(slug));

    // Sort posts by date (newest first)
    return posts.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });
}

export function getPostMeta(slug: string): PostMeta {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        description: data.description ?? "",
    };
}

export async function getPostBySlug(slug: string): Promise<Post> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Remove [[TOC]] from content as we won't render table of contents
    const cleanedContent = content.replace(/\[\[TOC\]\]/g, "");

    // Process accordion blocks
    const processedContent = processAccordionBlocks(cleanedContent);

    // Convert markdown to HTML
    const processedHtml = await remark().use(html).process(processedContent);
    const contentHtml = processedHtml.toString();

    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        description: data.description ?? "",
        contentHtml,
    };
}

function processAccordionBlocks(content: string): string {
    // Match accordion code blocks and convert them to a special format
    const accordionRegex = /```accordion\n([\s\S]*?)```/g;

    return content.replace(accordionRegex, (_match, accordionContent: string) => {
        const lines = accordionContent.trim().split("\n");
        const title = lines[0];
        const body = lines.slice(1).join("\n").trim();

        // Return a div structure that we'll style
        return `<details class="accordion">\n<summary>${title}</summary>\n\n${body}\n\n</details>`;
    });
}
