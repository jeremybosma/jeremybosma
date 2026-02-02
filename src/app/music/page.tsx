import { fetchMultipleAlbumArtsServer } from "@/lib/music-api.server";
import type { MusicData } from "@/lib/music-api";
import { MusicList } from "./music-list";
import { ResetPreferenceButton } from "@/components/reset-preference-button";

// Static generation: revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

// Now you only need to provide: title, author, and type
// The album art will be fetched automatically on the server!
const musicData: MusicData[] = [
    { title: "2005", author: "Ian", type: "album" },
    { title: "100 Grams", author: "Eem Triplin", type: "single", album: "Coming Undone" },
    { title: "What Do You Mean?", author: "Justin Bieber", type: "single", album: "Purpose" },
    { title: "What Did I Miss?", author: "Drake", type: "single" },
    { title: "Donda (Deluxe)", author: "Kanye West", type: "album" },
    { title: "Man Of The Year", author: "plaqueboymax", type: "single", album: "Man Of The Year" },
    { title: "Wheels Fall Off", author: "Ty Dolla $ign", type: "single", album: "Wheels Fall Off" },
    { title: "scars", author: "Baby Keem", type: "single", album: "The Melodic Blue" },
    { title: "WHEN I THINK ABOUT IT", author: "Future", type: "single", album: "BEASTMODE 2" },
    { title: "WHERE DO YOU SLEEP?", author: "The Kid LAROI", type: "single", album: "THE FIRST TIME (DELUXE VERSION)" },
    { title: "Can You Stand the Rain", author: "New Edition", type: "single" },
    { title: "Forever on Some Fly Shit", author: "Nipsey Hussle", type: "single", album: "TMC" },
    { title: "Enjoy The Show", author: "The Weeknd", type: "single", album: "Hurry Up Tomorrow" },
    { title: "Peaches", author: "Justin Bieber", type: "single", album: "Justice" },
    { title: "Banking On Me", author: "Gunna", type: "single" },
    { title: "The College Dropout", author: "Kanye West", type: "album" },
    { title: "Uuugly", author: "Drake", type: "single" },
    { title: "Xscape", author: "Michael Jackson", type: "album" },
    { title: "act ii: date @ 8", author: "4batz", type: "single" },
    { title: "Jesus Is King", author: "Kanye West", type: "album" },
    { title: "Figure It Out", author: "Ian", type: "single" },
    { title: "NOKIA", author: "Drake", type: "single" },
    { title: "DONDA 2", author: "Kanye West", type: "album" },
    { title: "Draft Day", author: "Drake", type: "single", album: "Scorpion" },
    { title: "HIM ALL ALONG", author: "Gunna", type: "single" },
    { title: "Views", author: "Drake", type: "album" },
    { title: "back in the a", author: "Gunna", type: "single" },
    { title: "Scorpion", author: "Drake", type: "album" },
    { title: "All To Myself", author: "Future", type: "single" },
    { title: "Can't Tell Me Nothing", author: "Kanye West", type: "single" },
    { title: "today i did good", author: "Gunna", type: "single" },
    { title: "2 Mazza", author: "Smiley", type: "single", album: "Don't box me in" },
    { title: "Blue Green Red", author: "Drake", type: "single", album: "No Face", unreleased: true }
];

export default async function Music() {
    // Fetch all album art on the server
    const music = await fetchMultipleAlbumArtsServer(musicData);

    return (
        <>
            {/* <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                    Click any song to open in your preferred streaming service
                </p>
                <ResetPreferenceButton />
            </div> */}
            <MusicList music={music} />
        </>
    );
}