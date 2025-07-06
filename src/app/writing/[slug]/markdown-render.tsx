"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn, slugify } from "@/lib/utils"

interface MarkdownRendererProps {
    content: string
}

interface TOCItem {
    id: string
    text: string
    level: number
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    const [toc, setToc] = useState<TOCItem[]>([])
    const [processedContent, setProcessedContent] = useState(content)

    // Extract headings for TOC and process content
    useEffect(() => {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm
        const matches = [...content.matchAll(headingRegex)]

        const tocItems = matches.map((match) => {
            const level = match[1].length
            const text = match[2]
            const id = slugify(text)
            return { id, text, level }
        })

        setToc(tocItems)

        // Replace [[TOC]] with the actual table of contents
        if (content.includes("[[TOC]]")) {
            const tocHtml = `
<div class="my-8 p-4 border rounded-lg">
  <h2 class="text-xl font-bold mb-4">Table Of Contents</h2>
  <ul class="space-y-1">
    ${tocItems
                    .map(
                        (item) => `
    <li class="${item.level === 1 ? "font-semibold" : item.level === 2 ? "ml-4" : item.level === 3 ? "ml-8" : ""
                            } hover:text-black">
      <a href="#${item.id}">${item.text}</a>
    </li>`,
                    )
                    .join("")}
  </ul>
</div>
      `

            // We need to use a placeholder that won't be processed by markdown
            // and replace it later in the DOM
            setProcessedContent(content.replace("[[TOC]]", "[[TOC_PLACEHOLDER]]"))
        } else {
            setProcessedContent(content)
        }
    }, [content])

    // Custom components for markdown rendering
    const components = {
        h1: ({ node, ...props }: any) => {
            let text = ""
            if (Array.isArray(props.children)) {
                text = props.children.map((c: any) => (typeof c === "string" ? c : "")).join("")
            } else {
                text = props.children?.toString() || ""
            }
            const id = slugify(text)
            return <h1 id={id} className="text-3xl font-bold mt-8 mb-4" {...props
            } />
        },
        h2: ({ node, ...props }: any) => {
            let text = ""
            if (Array.isArray(props.children)) {
                text = props.children.map((c: any) => (typeof c === "string" ? c : "")).join("")
            } else {
                text = props.children?.toString() || ""
            }
            const id = slugify(text)
            return <h2 id={id} className="text-2xl font-bold mt-6 mb-3" {...props} />
        },
        h3: ({ node, ...props }: any) => {
            let text = ""
            if (Array.isArray(props.children)) {
                text = props.children.map((c: any) => (typeof c === "string" ? c : "")).join("")
            } else {
                text = props.children?.toString() || ""
            }
            const id = slugify(text)
            return <h3 id={id} className="text-xl font-semibold mt-5 mb-2" {...props} />
        },
        p: ({ node, ...props }: any) => {
            // Check if this paragraph contains our TOC placeholder
            if (props.children && props.children.toString() === "[[TOC_PLACEHOLDER]]") {
                return (
                    <div className="my-8 p-4 border rounded-lg" >
                        <h2 className="text-xl font-bold mb-4" > Table Of Contents </h2>
                        < ul className="space-y-1" >
                            {
                                toc.map((item) => (
                                    <li
                                        key={item.id}
                                        className={
                                            cn(
                                                "hover:text-black",
                                                item.level === 1 ? "font-semibold" : "",
                                                item.level === 2 ? "ml-4" : "",
                                                item.level === 3 ? "ml-8" : "",
                                            )
                                        }
                                    >
                                        <a href={`#${item.id}`}> {item.text} </a>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                )
            }

            // If the only child is a <pre> (code block), render it directly to avoid <p><pre/></p>
            if (
                Array.isArray(props.children) &&
                props.children.length === 1 &&
                props.children[0]?.type === "pre"
            ) {
                return props.children;
            }

            return <p className="mb-4" {...props} />
        },
        ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 mb-4" {...props} />,
        ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 mb-4" {...props} />,
        li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline" {...props} />,
        blockquote: ({ node, ...props }: any) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
                return (
                    <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>
                        {children}
                    </code>
                )
            }

            // Check for accordion syntax using the language identifier
            const language = className?.replace('language-', '');

            if (language === 'accordion') {
                const content = children.toString();
                const lines = content.split("\n");
                const title = lines[0].trim();
                const body = lines.slice(1).join("\n").trim();

                return (
                    <div className="w-full overflow-x-hidden text-wrap" >
                        <Accordion type="single" collapsible className="my-4 w-full" >
                            <AccordionItem className="font-sans" value="item-1" >
                                <AccordionTrigger>{title}</AccordionTrigger>
                                <AccordionContent>
                                    <ReactMarkdown components={components}>{body}</ReactMarkdown>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )
            }

            return (
                <pre className="bg-gray-100 p-4 rounded overflow-x-hidden my-4" >
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            )
        },
    }

    return (
        <div className="markdown-content w-full overflow-x-hidden">
            <ReactMarkdown components={components}>{processedContent}</ReactMarkdown>
        </div>
    )
}
