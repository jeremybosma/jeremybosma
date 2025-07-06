import { NextResponse } from 'next/server';
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
    metadata: PostMetadata;
}

// Parse front matter from markdown content
function parseMarkdownWithFrontMatter(fileContent: string): { metadata: PostMetadata } {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = frontMatterRegex.exec(fileContent);

    if (!match) {
        return {
            metadata: {
                title: "Untitled",
                date: new Date().toISOString(),
                description: ""
            }
        };
    }

    const frontMatterString = match[1];

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
        }
    };
}

export async function GET() {
    try {
        const postsDirectory = path.join(process.cwd(), "content/posts");

        // Create directory if it doesn't exist
        if (!fs.existsSync(postsDirectory)) {
            fs.mkdirSync(postsDirectory, { recursive: true });
            return NextResponse.json([]);
        }

        const filenames = fs.readdirSync(postsDirectory);
        const posts = filenames
            .filter(filename => filename.endsWith(".md"))
            .map(filename => {
                const slug = filename.replace(/\.md$/, "");
                const fullPath = path.join(postsDirectory, filename);
                const fileContent = fs.readFileSync(fullPath, "utf8");
                const { metadata } = parseMarkdownWithFrontMatter(fileContent);

                return {
                    slug,
                    metadata
                };
            })
            .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
            .slice(0, 3); // Get only the 3 most recent posts

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching recent posts:", error);
        return NextResponse.json({ error: "Failed to fetch recent posts" }, { status: 500 });
    }
} 