"use client"

import { useEffect, useState } from "react"
import { cn, slugify } from "@/lib/utils"
import { ChevronsDownUpIcon, ChevronsUpDown, ChevronsUpDownIcon } from "lucide-react"

interface TOCItem {
    id: string
    text: string
    level: number
}

export default function TableOfContents({ content }: { content: string }) {
    const [toc, setToc] = useState<TOCItem[]>([])
    const [activeId, setActiveId] = useState<string>("")
    const [readingProgress, setReadingProgress] = useState(0)
    const [menuOpen, setMenuOpen] = useState(false)

    // Extract headings for TOC
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
    }, [content])

    // Track active heading on scroll and reading progress
    useEffect(() => {
        const headingElements = toc.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[]

        const calculateReadingProgress = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            const scrollPercent = scrollTop / (docHeight - winHeight)
            setReadingProgress(Math.min(scrollPercent * 100, 100))
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: "0px 0px -70% 0px" },
        )

        headingElements.forEach((element) => {
            observer.observe(element)
        })

        window.addEventListener('scroll', calculateReadingProgress)
        calculateReadingProgress()

        return () => {
            headingElements.forEach((element) => {
                observer.unobserve(element)
            })
            window.removeEventListener('scroll', calculateReadingProgress)
        }
    }, [toc])

    const activeIndex = toc.findIndex(item => item.id === activeId)
    const effectiveActiveIndex = activeIndex === -1 && toc.length > 0 ? 0 : activeIndex
    const activeItem = toc[effectiveActiveIndex]

    // Generate the segments for the mobile progress circle (SVG, one arc per TOC item, stroked only)
    const generateSegmentedCircle = () => {
        const segments = toc.length;
        if (segments === 0) return null;
        const radius = 12;
        const strokeWidth = 3;
        const center = 14;
        const circumference = 2 * Math.PI * radius;
        const anglePer = 360 / segments;
        const gapAngle = 4; // degrees of gap between segments
        const arcAngle = anglePer - gapAngle;
        return (
            <svg width={28} height={28} className="block">
                {toc.map((item, idx) => {
                    const startAngle = (anglePer * idx - 90) * (Math.PI / 180);
                    const endAngle = (anglePer * idx + arcAngle - 90) * (Math.PI / 180);
                    const x1 = center + radius * Math.cos(startAngle);
                    const y1 = center + radius * Math.sin(startAngle);
                    const x2 = center + radius * Math.cos(endAngle);
                    const y2 = center + radius * Math.sin(endAngle);
                    const largeArc = arcAngle > 180 ? 1 : 0;
                    const isFilled = idx <= effectiveActiveIndex;
                    return (
                        <path
                            key={item.id}
                            d={`M${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}`}
                            fill="none"
                            stroke={isFilled ? '#000000' : '#e5e7eb'}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            style={{ transition: 'stroke 0.4s cubic-bezier(0.4,0,0.2,1)' }}
                        />
                    );
                })}
            </svg>
        );
    };

    // Get visible TOC items (current, 2 above, 2 below)
    const getVisibleTocItems = () => {
        if (toc.length === 0) return []

        // If no active item, show first few items
        if (effectiveActiveIndex === -1) return toc.slice(0, 5)

        const start = Math.max(0, effectiveActiveIndex - 2)
        const end = Math.min(toc.length, effectiveActiveIndex + 3)
        return toc.slice(start, end)
    }

    const visibleTocItems = getVisibleTocItems()

    return (
        <>
            {/* Mobile TOC */}
            <div className="fixed top-0 left-0 right-0 z-40 2xl:hidden transition-all duration-300">
                <div className="flex items-center justify-center py-3 bg-gradient-to-b backdrop-blur-xs from-gray-300/35 to-transparent">
                    <div className="flex items-center">
                        <div className="relative w-7 h-7 mr-3 flex-shrink-0">
                            {generateSegmentedCircle()}
                        </div>
                        <p className="truncate font-medium">
                            {activeItem?.text || toc[0]?.text || ""}
                        </p>
                    </div>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="ml-1 rounded-md hover:bg-gray-100 transition-transform"
                    >
                        <span className={cn("inline-block transition-transform duration-300", menuOpen ? "rotate-180" : "")}>
                            <ChevronsUpDownIcon className="w-4 h-4 text-gray-700" />
                        </span>
                    </button>
                </div>
                <div
                    className={cn(
                        "relative overflow-hidden transition-all duration-300 max-w-[500px] justify-self-center",
                        menuOpen ? "max-h-[60vh] overflow-y-scroll opacity-100 translate-y-0 border m-2 rounded-lg shadow-lg" : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
                    )}
                >
                    <div className="relative bg-white px-4 py-3 shadow-lg">
                        <ul className="space-y-2">
                            {toc.map((item) => (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        className={cn(
                                            "block py-1",
                                            item.level === 1 ? "font-semibold" : "",
                                            item.level === 2 ? "ml-3" : "",
                                            item.level === 3 ? "ml-6" : "",
                                            item.id === activeId ? "text-black" : "text-gray-700",
                                        )}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Desktop TOC - Fixed to right edge */}
            <div className="hidden 2xl:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
                <div className="relative h-[300px] flex items-center">
                    <div className="absolute right-0 top-0 bottom-0 flex flex-col items-end justify-center">

                        {(() => {
                            const activeVisibleIndex = visibleTocItems.findIndex(i => i.id === activeItem?.id)
                            return visibleTocItems.map((item, index) => {
                                const distance = activeVisibleIndex === -1 ? index : Math.abs(index - activeVisibleIndex)
                                let widthClass = "w-8"
                                let colorClass = ""
                                if (distance === 0) {
                                    widthClass = "w-20"
                                    colorClass = "bg-black"
                                } else if (distance === 1) {
                                    widthClass = "w-16"
                                } else if (distance === 2) {
                                    widthClass = "w-12"
                                }
                                // else keep w-8
                                const isActive = item.id === (activeItem?.id)

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "relative group my-4 transition-all duration-300"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "h-0.5 bg-gray-400 hover:bg-gray-600 transition-all duration-300",
                                                widthClass,
                                                colorClass
                                            )}
                                        />

                                        <a
                                            href={`#${item.id}`}
                                            className={cn(
                                                "absolute right-full mr-4 transform -translate-y-1/2 top-1/2 whitespace-nowrap text-sm text-gray-700 hover:text-black text-right transition-opacity",
                                                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                            )}
                                        >
                                            {item.text}
                                        </a>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                </div>
            </div>
        </>
    )
} 