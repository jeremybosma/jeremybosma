import { IconFilm } from "symbols-react";

export default function VideosPage() {
    return (
        <section className="text-[17px] flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-center">
                <IconFilm className="w-24 h-24 text-muted-foreground/40" />
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Coming Soon</h1>
                    <p className="text-muted-foreground max-w-sm">
                        I'm working on bringing you some video content. Check back later.
                    </p>
                </div>
            </div>
        </section>
    );
}
