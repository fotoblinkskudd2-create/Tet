/**
 * Tet prompt engine — a faithful, typed port of the original Python
 * creative-prompt builder. Turns a short idea into a structured, paste-ready
 * brief for photo, video, music, art, or poetry on mobile web.
 *
 * Pure & deterministic: no network, no side effects. Runs identically on the
 * server (API routes) and in the browser (live preview).
 */

export const MEDIUMS = ["photo", "video", "music", "art", "poem"] as const;
export type Medium = (typeof MEDIUMS)[number];

type Recipe = {
  title: string;
  emoji: string;
  style: string;
  structure: string;
  platform: string;
  delivery: string;
  details: string[];
};

const MEDIUM_SYNONYMS: Record<Medium, string[]> = {
  photo: ["picture", "image", "shot", "photograph", "portrait"],
  video: ["film", "clip", "reel", "movie", "footage"],
  music: ["song", "track", "audio", "beat", "soundtrack"],
  art: ["illustration", "drawing", "painting", "concept art", "render"],
  poem: ["poetry", "verse", "haiku", "sonnet", "lyric"],
};

export const CREATIVE_RECIPES: Record<Medium, Recipe> = {
  photo: {
    title: "Photo prompt",
    emoji: "📷",
    style:
      "Cinematic but natural; prioritize authentic skin tones and tactile color.",
    structure:
      "Subject first, then context, then lighting and framing, plus a camera cue (lens or aperture).",
    platform:
      "Keep it in two short sentences so it pastes cleanly into iOS web fields.",
    delivery:
      "Ask for vertical orientation, high resolution, and gentle post-processing.",
    details: [
      "Mention time of day and light direction to control shadows.",
      "Call out focal length or depth of field for focus hierarchy.",
      "Use crisp nouns and verbs—avoid vague mood words unless they shape the shot.",
    ],
  },
  video: {
    title: "Video prompt",
    emoji: "🎬",
    style:
      "Story-driven and rhythmic; foreground motion with clear start, middle, and end beats.",
    structure:
      "Lead with subject and setting, add camera move, pacing, and audio texture cues.",
    platform:
      "Write in three sentences, ready for iOS Safari text areas with no markdown symbols.",
    delivery:
      "Request 16:9 landscape unless noted, with clean transitions and legible subtitles.",
    details: [
      "Specify the opening frame and the closing frame to anchor edits.",
      "Describe one signature movement (dolly in, glide across, or drone reveal).",
      "Note the tone of diegetic sound or soundtrack tempo for timing.",
    ],
  },
  music: {
    title: "Music prompt",
    emoji: "🎵",
    style:
      "Concise genre-plus-mood pairing with texture references (analog warmth, glassy synths).",
    structure:
      "State tempo and time signature, list 3–4 instruments, and define the hook or motif.",
    platform:
      "Compact sentences that stay readable in iOS share sheets; no special characters required.",
    delivery: "Request a clean intro, a 2-bar motif, and a tail for looping.",
    details: [
      "Include bpm and rhythm feel (swing, straight, halftime).",
      "Balance one lead voice with supporting harmony and a light percussive bed.",
      "Name a space for the mix (intimate studio, airy hall) to anchor reverb.",
    ],
  },
  art: {
    title: "Art prompt",
    emoji: "🎨",
    style:
      "Vivid but controlled; emphasize material choices (ink wash, vector, pastel, 3D render).",
    structure:
      "Subject + silhouette, palette direction, and a texture or brushwork note.",
    platform:
      "Two or three compact sentences that stay crisp when pasted into mobile web tools.",
    delivery:
      "Request balanced negative space and export-ready at print-safe resolution.",
    details: [
      "Describe lighting or shading style (rim light, chiaroscuro, subsurface glow).",
      "Mention perspective or lens feel for depth (isometric, 35mm, telephoto compression).",
      "State palette constraints (triadic brights, muted earth, monochrome accent).",
    ],
  },
  poem: {
    title: "Poem prompt",
    emoji: "✍️",
    style:
      "Clear voice with a single emotional color; choose a form to shape rhythm.",
    structure:
      "Name the subject, pick a form (haiku, sonnet, free verse), and specify imagery anchors.",
    platform:
      "Keep to a couple of sentences so it reads well in iOS web or chat inputs.",
    delivery:
      "Invite musicality through meter hints and one sensory detail per line.",
    details: [
      "State the form or line count to guide cadence.",
      "Offer two sensory images (sound + sight or touch) to keep it concrete.",
      "Suggest a closing turn or surprise to land the emotion.",
    ],
  },
};

export function normalizeMedium(label?: string | null): Medium | null {
  if (!label) return null;
  const lowered = label.toLowerCase().trim();
  for (const medium of MEDIUMS) {
    if (lowered === medium || MEDIUM_SYNONYMS[medium].includes(lowered)) {
      return medium;
    }
  }
  return null;
}

export function detectMedium(text: string): Medium | null {
  const lowered = text.toLowerCase();
  for (const medium of MEDIUMS) {
    if (
      lowered.includes(medium) ||
      MEDIUM_SYNONYMS[medium].some((alias) => lowered.includes(alias))
    ) {
      return medium;
    }
  }
  return null;
}

export type CreativePrompt = {
  medium: Medium;
  title: string;
  emoji: string;
  seed: string;
  body: string;
  details: string[];
};

/**
 * Turn a short idea into a structured creative prompt.
 * Mirrors `build_creative_prompt` from the original CLI.
 */
export function buildCreativePrompt(
  seed: string,
  mediumHint?: string | null,
): CreativePrompt {
  const trimmed = seed?.trim() ?? "";
  if (!trimmed) {
    throw new Error("Please provide a few words to shape into a prompt.");
  }

  const medium: Medium =
    normalizeMedium(mediumHint) ?? detectMedium(trimmed) ?? "art";
  const recipe = CREATIVE_RECIPES[medium];
  const cleanedSeed = trimmed.replace(/\.+$/, "");

  const body =
    `${recipe.title}: ${cleanedSeed}. ` +
    `Style: ${recipe.style} ` +
    `Structure: ${recipe.structure} ` +
    `Platform fit: ${recipe.platform} ` +
    `Delivery notes: ${recipe.delivery}`;

  const details = [
    ...recipe.details,
    "Mobile-first: short sentences, no markdown, ready for iOS web share sheets.",
  ];

  return {
    medium,
    title: recipe.title,
    emoji: recipe.emoji,
    seed: cleanedSeed,
    body,
    details,
  };
}
