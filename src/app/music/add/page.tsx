"use client";

import { useState } from "react";
import { fetchAlbumArt } from "@/lib/music-api";
import Image from "next/image";
import { motion } from "motion/react";
import { sectionProps } from "@/app/ui/client-layout";

export default function AddMusicPage() {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        type: "single" as "single" | "album",
        unreleased: false,
        album: "",
    });

    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string>("");

    const handlePreview = async () => {
        if (!formData.title || !formData.author) {
            alert("Please fill in title and author");
            return;
        }

        setLoading(true);
        const imageUrl = await fetchAlbumArt(
            formData.author,
            formData.title,
            formData.type,
            formData.type === "single" && formData.album ? formData.album : undefined
        );
        setPreview(imageUrl);
        setLoading(false);
    };

    const handleGenerate = () => {
        const albumPart = formData.type === "single" && formData.album ? `, album: "${formData.album}"` : "";
        const code = `    { title: "${formData.title}", author: "${formData.author}", type: "${formData.type}"${albumPart}${formData.unreleased ? ", unreleased: true" : ""} },`;
        setGeneratedCode(code);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        alert("Copied to clipboard! Now paste it into your musicData array.");
    };

    if (process.env.NODE_ENV === "development") return (
        <>
            <motion.section
                {...sectionProps}
                initial="hidden"
                animate="visible"
                transition={{ ...sectionProps.transition, delay: 0 }}
            >
                <h1>Add Music</h1>
                <p className="text-black/60 dark:text-white/60">
                    Add new tracks to your music collection
                </p>
            </motion.section>

            <motion.section
                {...sectionProps}
                initial="hidden"
                animate="visible"
                transition={{ ...sectionProps.transition, delay: 0.1 }}
                className="space-y-4"
            >
                <div>
                    <label className="block text-sm text-black/60 dark:text-white/60 mb-1.5">
                        Title
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-transparent focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
                        placeholder="e.g., HUMBLE."
                    />
                </div>

                <div>
                    <label className="block text-sm text-black/60 dark:text-white/60 mb-1.5">
                        Artist
                    </label>
                    <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-transparent focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
                        placeholder="e.g., Kendrick Lamar"
                    />
                </div>

                <div>
                    <label className="block text-sm text-black/60 dark:text-white/60 mb-1.5">
                        Type
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "single" | "album" })}
                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-transparent focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
                    >
                        <option value="single">Single</option>
                        <option value="album">Album</option>
                    </select>
                </div>

                {formData.type === "single" && (
                    <div>
                        <label className="block text-sm text-black/60 dark:text-white/60 mb-1.5">
                            Album (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.album}
                            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                            className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-transparent focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
                            placeholder="e.g., Scorpion (if single is from an album)"
                        />
                        <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                            Specify the album name to use its cover art
                        </p>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="unreleased"
                        checked={formData.unreleased}
                        onChange={(e) => setFormData({ ...formData, unreleased: e.target.checked })}
                        className="w-4 h-4 accent-black dark:accent-white"
                    />
                    <label htmlFor="unreleased" className="text-sm">
                        Unreleased
                    </label>
                </div>

                <button
                    type="button"
                    onClick={handlePreview}
                    disabled={loading || !formData.title || !formData.author}
                    className="w-full px-4 py-2.5 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Fetching..." : "Preview Album Art"}
                </button>
            </motion.section>

            {preview && (
                <motion.section
                    {...sectionProps}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...sectionProps.transition, delay: 0.15 }}
                >
                    <h2>Preview</h2>
                    <div className="flex gap-4 items-center mt-2">
                        <Image
                            src={preview}
                            alt={formData.title}
                            width={80}
                            height={80}
                            className="object-cover rounded-md"
                        />
                        <div>
                            <h3>{formData.title}</h3>
                            <p className="text-black/60 dark:text-white/60">{formData.author}</p>
                            <p className="text-sm text-black/40 dark:text-white/40">
                                {formData.unreleased ? "Unreleased " : ""}
                                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="w-full mt-4 px-4 py-2.5 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        Generate Code
                    </button>
                </motion.section>
            )}

            {generatedCode && (
                <motion.section
                    {...sectionProps}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...sectionProps.transition, delay: 0.2 }}
                >
                    <div className="flex justify-between items-center">
                        <h2>Generated Code</h2>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 text-sm border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                    <pre className="mt-2 p-4 bg-black/5 dark:bg-white/5 rounded-md overflow-x-auto text-sm">
                        <code>{generatedCode}</code>
                    </pre>
                    <div className="mt-4 text-sm text-black/60 dark:text-white/60">
                        <p className="font-medium mb-2">Next steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Copy the code above</li>
                            <li>Open <code className="bg-black/5 dark:bg-white/5 px-1 rounded">src/app/music/page.tsx</code></li>
                            <li>Add the code to the <code className="bg-black/5 dark:bg-white/5 px-1 rounded">musicData</code> array</li>
                            <li>Save the file</li>
                        </ol>
                    </div>
                </motion.section>
            )}

            <motion.section
                {...sectionProps}
                initial="hidden"
                animate="visible"
                transition={{ ...sectionProps.transition, delay: 0.25 }}
            >
                <h2>How it works</h2>
                <ul className="mt-2 space-y-1 text-black/60 dark:text-white/60">
                    <li>Fill in the song/album title and artist name</li>
                    <li>Click "Preview Album Art" to see the album cover</li>
                    <li>Click "Generate Code" to get the code snippet</li>
                    <li>Copy and paste it into your musicData array</li>
                    <li>Album art is fetched automatically from iTunes API</li>
                </ul>
            </motion.section>
        </>
    );

    return null;
}

