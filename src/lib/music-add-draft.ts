const STORAGE_KEY = "music-add-multi-draft";

export type MusicAddFormData = {
  title: string;
  author: string;
  type: "single" | "album";
  unreleased: boolean;
  album: string;
};

export type MusicAddDraft = MusicAddFormData & {
  multiAdd: boolean;
};

export function readMusicAddDraft(): MusicAddDraft | null {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const draft = JSON.parse(raw) as MusicAddDraft;
    if (!draft.multiAdd) return null;

    return draft;
  } catch {
    return null;
  }
}

export function writeMusicAddDraft(draft: MusicAddDraft): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearMusicAddDraft(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
