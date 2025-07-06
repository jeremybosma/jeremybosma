import Link from "next/link"
import Image from "next/image"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <footer className="w-full bg-white text-black container mx-auto">
                <div className="flex flex-col">
                    {/* Links section - now with white background and black text */}
                    <div className="bg-white">
                        <div className="container mx-auto px-4 py-12">

                            {/* Bottom section with copyright */}
                            <div className="mt-12 pt-8 text-center text-sm text-gray-600">
                                <p>Written from Groningen, The Netherlands</p>
                            </div>
                        </div>
                    </div>

                    {/* Full-width image section - now below on desktop, above on mobile */}
                    <div className="w-full">
                        <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-O3wI4DVHizPAkyGYLTiXCyVoj1WTTa.png"
                            alt="European cityscape with canal and historic buildings"
                            width={1920}
                            height={640}
                            sizes="100vw"
                            priority
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>
            </footer>
        </>
    )
}
