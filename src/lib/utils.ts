import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared slugify function for generating consistent IDs from text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^ -\w\s]/g, "") // remove non-ascii and non-word
    .replace(/[\s]+/g, "-")
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}
