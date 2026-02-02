export type Video = {
  id: string;
  user: string;
  caption: string;
  genre: string; // relaxed from literal union for flexibility
  src: string;
};

// Helper to format filename into a caption
export function formatCaption(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[_-]/g, " "); // replace underscores/dashes with spaces
}
