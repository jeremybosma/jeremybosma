import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define interfaces for blog post data
interface PostMetadata {
    title: string;
    date: string;
    description: string;
    image?: string;
}

interface Post {
    slug: string;
    content: string;
    metadata: PostMetadata;
}

// Parse front matter from markdown content
function parseMarkdownWithFrontMatter(fileContent: string): { metadata: PostMetadata; content: string } {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = frontMatterRegex.exec(fileContent);

    if (!match) {
        return {
            metadata: {
                title: "Untitled",
                date: new Date().toISOString(),
                description: ""
            },
            content: fileContent
        };
    }

    const frontMatterString = match[1];
    const content = match[2];

    // Parse front matter
    const metadata: Partial<PostMetadata> = {};
    const frontMatterLines = frontMatterString.split("\n");

    frontMatterLines.forEach(line => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length) {
            const value = valueParts.join(":").trim();
            metadata[key.trim() as keyof PostMetadata] = value;
        }
    });

    return {
        metadata: {
            title: metadata.title || "Untitled",
            date: metadata.date || new Date().toISOString(),
            description: metadata.description || "",
            image: metadata.image
        },
        content
    };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const postsDirectory = path.join(process.cwd(), "content/posts");
        const fullPath = path.join(postsDirectory, `${slug}.md`);

        if (!fs.existsSync(fullPath)) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const fileContent = fs.readFileSync(fullPath, "utf8");
        const { metadata, content } = parseMarkdownWithFrontMatter(fileContent);

        return NextResponse.json({
            slug,
            content,
            metadata
        });
    } catch (error) {
        console.error(`Error fetching post:`, error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
} 