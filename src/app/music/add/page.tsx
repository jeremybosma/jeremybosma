"use client";

import { useState } from "react";
import { fetchAlbumArt } from "@/lib/music-api";
import Image from "next/image";

export default function AddMusicPage() {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        type: "single" as "single" | "album",
        unreleased: false,
        album: "", // Optional album name for singles
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
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Add Music</h1>

            <div className="space-y-6">
                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                            placeholder="e.g., HUMBLE."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Artist *
                        </label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                            placeholder="e.g., Kendrick Lamar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Type
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as "single" | "album" })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                        >
                            <option value="single">Single</option>
                            <option value="album">Album</option>
                        </select>
                    </div>

                    {formData.type === "single" && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Album (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.album}
                                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                                placeholder="e.g., Scorpion (if single is from an album)"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
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
                            className="w-4 h-4"
                        />
                        <label htmlFor="unreleased" className="text-sm font-medium">
                            Unreleased
                        </label>
                    </div>
                </div>

                {/* Preview Button */}
                <button
                    onClick={handlePreview}
                    disabled={loading || !formData.title || !formData.author}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Fetching Album Art..." : "Preview Album Art"}
                </button>

                {/* Preview */}
                {preview && (
                    <div className="border rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Preview</h3>
                        <div className="flex gap-4 items-center">
                            <Image
                                src={preview}
                                alt={formData.title}
                                width={80}
                                height={80}
                                className="object-cover rounded"
                            />
                            <div>
                                <h4 className="font-medium">{formData.title}</h4>
                                <p className="text-sm text-muted-foreground">{formData.author}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formData.unreleased ? "Unreleased " : ""}
                                    {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generate Code Button */}
                {preview && (
                    <button
                        onClick={handleGenerate}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Generate Code
                    </button>
                )}

                {/* Generated Code */}
                {generatedCode && (
                    <div className="border rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Generated Code</h3>
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                        <pre className="bg-muted p-4 rounded overflow-x-auto">
                            <code>{generatedCode}</code>
                        </pre>
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-2">Next steps:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Copy the code above</li>
                                <li>Open <code className="bg-muted px-1 rounded">src/app/music/page.tsx</code></li>
                                <li>Add the code to the <code className="bg-muted px-1 rounded">musicData</code> array</li>
                                <li>Save the file - the album art will be fetched automatically!</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-12 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold mb-3">How it works</h3>
                <ul className="space-y-2 text-sm">
                    <li>• Fill in the song/album title and artist name</li>
                    <li>• Click "Preview Album Art" to see the album cover that will be fetched</li>
                    <li>• Click "Generate Code" to get the code snippet</li>
                    <li>• Copy and paste it into your <code className="bg-background px-1 rounded">musicData</code> array</li>
                    <li>• Album art is automatically fetched from iTunes API - no manual URLs needed!</li>
                </ul>
            </div>
        </div>
    );
}

