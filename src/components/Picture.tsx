export type Scene = "dance" | "spin" | "music" | "people" | "book" | "star" | "calendar";

const EMOJI: Record<Scene, string> = {
  dance: "🕺",
  spin: "💫",
  music: "🎵",
  people: "👯",
  book: "📝",
  star: "⭐",
  calendar: "📅",
};

export function sceneForGroup(group: string): Scene {
  const key = group.toLowerCase();
  if (key.includes("musique") || key.includes("shine")) return "music";
  if (key.includes("partenaire")) return "people";
  if (key.includes("socle")) return "dance";
  if (key.includes("tour") || key.includes("figure") || key.includes("pas")) return "spin";
  return "book";
}

export function Picture({ scene = "star", size = 48 }: { scene?: Scene; size?: number }) {
  return (
    <span className="emoji" style={{ fontSize: Math.round(size * 0.85) }} aria-hidden="true">
      {EMOJI[scene]}
    </span>
  );
}
