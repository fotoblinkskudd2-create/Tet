"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Music } from "lucide-react";
import { useVibe } from "@/context/vibe-context";

const TRACKS: Record<string, { label: string; url: string }> = {
  lofi: {
    label: "Lo-Fi Chill",
    url: "https://cdn.pixabay.com/audio/2024/11/01/audio_4956b4edd1.mp3",
  },
  synth: {
    label: "Synthwave",
    url: "https://cdn.pixabay.com/audio/2023/07/19/audio_e09985eab5.mp3",
  },
  ambient: {
    label: "Ambient",
    url: "https://cdn.pixabay.com/audio/2024/09/10/audio_6e1f6b3e17.mp3",
  },
};

export function AmbientSound() {
  const { currentVibe } = useVibe();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTrack, setActiveTrack] = useState(currentVibe.soundTrack);
  const howlRef = useRef<import("howler").Howl | null>(null);
  const [loaded, setLoaded] = useState(false);

  const stopCurrent = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.fade(howlRef.current.volume(), 0, 500);
      setTimeout(() => {
        howlRef.current?.stop();
        howlRef.current?.unload();
        howlRef.current = null;
      }, 500);
    }
  }, []);

  const playTrack = useCallback(
    async (trackId: string) => {
      stopCurrent();
      const track = TRACKS[trackId];
      if (!track) return;

      const { Howl } = await import("howler");
      const howl = new Howl({
        src: [track.url],
        loop: true,
        volume: 0,
        html5: true,
        onload: () => setLoaded(true),
        onloaderror: () => setLoaded(false),
      });
      howlRef.current = howl;
      howl.play();
      howl.fade(0, 0.3, 1000);
      setActiveTrack(trackId);
      setIsPlaying(true);
    },
    [stopCurrent]
  );

  const toggle = useCallback(async () => {
    if (isPlaying) {
      stopCurrent();
      setIsPlaying(false);
    } else {
      await playTrack(activeTrack);
    }
  }, [isPlaying, activeTrack, playTrack, stopCurrent]);

  useEffect(() => {
    return () => {
      howlRef.current?.stop();
      howlRef.current?.unload();
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={{
            color: isPlaying ? "var(--vf-primary)" : "var(--vf-muted-fg)",
            background: isPlaying
              ? `color-mix(in srgb, var(--vf-primary) 15%, transparent)`
              : "transparent",
          }}
          title={isPlaying ? "Mute ambient sound" : "Play ambient sound"}
        >
          {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--vf-muted-fg)" }}
        >
          <Music className="h-4 w-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border backdrop-blur-xl"
            style={{
              borderColor: "var(--vf-border)",
              background: `color-mix(in srgb, var(--vf-card) 90%, transparent)`,
            }}
          >
            <div className="p-1">
              {Object.entries(TRACKS).map(([id, track]) => (
                <button
                  key={id}
                  onClick={() => {
                    playTrack(id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors"
                  style={{
                    background: activeTrack === id
                      ? `color-mix(in srgb, var(--vf-primary) 15%, transparent)`
                      : "transparent",
                    color: activeTrack === id ? "var(--vf-primary)" : "var(--vf-fg)",
                  }}
                >
                  <span>{track.label}</span>
                  {activeTrack === id && isPlaying && (
                    <span className="ml-auto flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ height: [4, 12, 4] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          className="w-0.5 rounded-full"
                          style={{ background: "var(--vf-primary)" }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
