import { useEffect, useRef, useState } from "react";
import { fetchAlbumArt } from "@/lib/music-api";
import {
    clearMusicAddDraft,
    readMusicAddDraft,
    writeMusicAddDraft,
    type MusicAddFormData,
} from "@/lib/music-add-draft";
import { motion } from "motion/react";
import { sectionProps } from "@/components/layouts/client-shell";

const emptyForm: MusicAddFormData = {
    title: "",
    author: "",
    type: "single",
    unreleased: false,
    album: "",
};

export default function MusicAddPage() {
    const [formData, setFormData] = useState(emptyForm);

    const [preview, setPreview] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [addedCode, setAddedCode] = useState<string>("");
    const [addMessage, setAddMessage] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [multiAdd, setMultiAdd] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const draftRestoredRef = useRef(false);

    useEffect(() => {
        if (draftRestoredRef.current) return;
        draftRestoredRef.current = true;

        const draft = readMusicAddDraft();
        if (!draft?.multiAdd) return;

        setFormData({
            title: draft.title,
            author: draft.author,
            type: draft.type,
            unreleased: draft.unreleased,
            album: draft.album,
        });
        setMultiAdd(true);

        if (!draft.title) {
            requestAnimationFrame(() => titleInputRef.current?.focus());
        }
    }, []);

    useEffect(() => {
        if (!multiAdd) return;
        writeMusicAddDraft({ ...formData, multiAdd: true });
    }, [formData, multiAdd]);

    const handlePreview = async () => {
        if (!formData.title || !formData.author) {
            alert("Please fill in title and author");
            return;
        }

        setLoading(true);
        setPreviewError(null);
        setPreview(null);

        const imageUrl = await fetchAlbumArt(
            formData.author,
            formData.title,
            formData.type,
            formData.type === "single" && formData.album ? formData.album : undefined
        );

        if (imageUrl) {
            setPreview(imageUrl);
        } else {
            setPreviewError("No album art found. You can still generate the code snippet below.");
        }

        setLoading(false);
    };

    const handleAdd = async () => {
        if (!formData.title || !formData.author) {
            alert("Please fill in title and artist");
            return;
        }

        setAdding(true);
        setAddMessage(null);
        setAddError(null);
        setIsDuplicate(false);
        setAddedCode("");

        if (multiAdd) {
            writeMusicAddDraft({
                ...formData,
                title: "",
                multiAdd: true,
            });
        }

        try {
            const response = await fetch("/api/music/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    author: formData.author,
                    type: formData.type,
                    album: formData.type === "single" && formData.album ? formData.album : undefined,
                    unreleased: formData.unreleased,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsDuplicate(Boolean(data.duplicate));
                setAddError(data.error ?? "Failed to add track");
                if (data.code) setAddedCode(data.code);
                return;
            }

            setAddedCode(data.code);
            setAddMessage(data.message);

            if (multiAdd) {
                setFormData((current) => ({ ...current, title: "" }));
                setPreview(null);
                setPreviewError(null);
                titleInputRef.current?.focus();
            }
        } catch {
            setAddError("Failed to add track");
        } finally {
            setAdding(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(addedCode);
        alert("Copied to clipboard.");
    };

    if (!import.meta.env.DEV) {
        return null;
    }

    return (
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
                        ref={titleInputRef}
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

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="multi-add"
                            checked={multiAdd}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setMultiAdd(checked);
                                if (checked) {
                                    writeMusicAddDraft({ ...formData, multiAdd: true });
                                } else {
                                    clearMusicAddDraft();
                                }
                            }}
                            className="w-4 h-4 accent-black dark:accent-white"
                        />
                        <label htmlFor="multi-add" className="text-sm">
                            Multi add
                        </label>
                    </div>
                    <p className="text-xs text-black/40 dark:text-white/40 -mt-1">
                        Keep artist, album, and type after adding — only clears the title
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={loading || !formData.title || !formData.author}
                        className="w-full px-4 py-2.5 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Fetching..." : "Preview Album Art"}
                    </button>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={adding || !formData.title || !formData.author}
                        className="w-full px-4 py-2.5 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {adding ? "Adding..." : "Add to music"}
                    </button>
                </div>
                {previewError ? (
                    <p className="text-sm text-amber-700 dark:text-amber-300">{previewError}</p>
                ) : null}
                {addError ? (
                    <p
                        className={
                            isDuplicate
                                ? "text-sm text-amber-700 dark:text-amber-300"
                                : "text-sm text-red-600 dark:text-red-400"
                        }
                    >
                        {addError}
                    </p>
                ) : null}
                {addMessage ? (
                    <p className="text-sm text-green-700 dark:text-green-300">{addMessage}</p>
                ) : null}
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
                        <img
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
                </motion.section>
            )}

            {addedCode ? (
                <motion.section
                    {...sectionProps}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...sectionProps.transition, delay: 0.2 }}
                >
                    <div className="flex justify-between items-center">
                        <h2>Added entry</h2>
                        <button
                            type="button"
                            onClick={copyToClipboard}
                            className="px-3 py-1.5 text-sm border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                    <pre className="mt-2 p-4 bg-black/5 dark:bg-white/5 rounded-md overflow-x-auto text-sm">
                        <code>{addedCode}</code>
                    </pre>
                </motion.section>
            ) : null}

            <motion.section
                {...sectionProps}
                initial="hidden"
                animate="visible"
                transition={{ ...sectionProps.transition, delay: 0.25 }}
            >
                <h2>How it works</h2>
                <ul className="mt-2 space-y-1 text-black/60 dark:text-white/60">
                    <li>Fill in the song/album title and artist name</li>
                    <li>Optionally preview album art from iTunes</li>
                    <li>Click "Add to music" to append it to <code className="bg-black/5 dark:bg-white/5 px-1 rounded">music-data.ts</code></li>
                    <li>Run <code className="bg-black/5 dark:bg-white/5 px-1 rounded">bun run sync:music</code> to download all covers to <code className="bg-black/5 dark:bg-white/5 px-1 rounded">public/music/covers/</code></li>
                </ul>
            </motion.section>
        </>
    );
}

