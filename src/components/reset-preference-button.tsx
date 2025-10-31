"use client";

import { useState, useEffect } from "react";

const PREFERENCE_KEY = "preferred-music-platform";

export function ResetPreferenceButton() {
    const [hasPreference, setHasPreference] = useState(false);

    // Check if preference exists on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            setHasPreference(!!localStorage.getItem(PREFERENCE_KEY));
        }
    }, []);

    const handleReset = () => {
        localStorage.removeItem(PREFERENCE_KEY);
        setHasPreference(false);
        alert("Platform preference reset. You'll be asked to choose next time.");
    };

    if (!hasPreference) return null;

    return (
        <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            title="Reset streaming platform preference"
        >
            Reset Platform Preference
        </button>
    );
}

