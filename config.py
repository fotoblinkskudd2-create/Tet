"""
System configuration for the multi-agent research orchestrator.
"""
from __future__ import annotations

import os

# --- Claude API ---
ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL: str = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

# --- Timing (seconds) ---
TOTAL_DURATION_HOURS: float = float(os.environ.get("TOTAL_DURATION_HOURS", "11"))
TOTAL_DURATION_SEC: float = TOTAL_DURATION_HOURS * 3600

SUPERVISOR_CHECK_INTERVAL_SEC: int = int(os.environ.get("SUPERVISOR_CHECK_INTERVAL_SEC", "1800"))  # 30 min

CHECKPOINT_HOURS: tuple[float, ...] = (5.0, 8.0, 11.0)
CHECKPOINT_SECONDS: tuple[float, ...] = tuple(h * 3600 for h in CHECKPOINT_HOURS)

WORKER_CYCLE_INTERVAL_SEC: int = int(os.environ.get("WORKER_CYCLE_INTERVAL_SEC", "600"))  # 10 min per research cycle

# --- Paths ---
MEMORY_DIR: str = os.environ.get("MEMORY_DIR", "memory")
PROGRESS_FILE: str = os.path.join(MEMORY_DIR, "11-hour-progress.md")
WORKER_LOG_DIR: str = os.path.join(MEMORY_DIR, "workers")
CHECKPOINT_DIR: str = os.path.join(MEMORY_DIR, "checkpoints")

# --- Topics assigned to agents ---
AGENT_TOPICS: dict[str, list[str]] = {
    "agent_kunst": [
        "kunst",           # art
        "nye_produkter",   # new products
    ],
    "agent_musikk": [
        "musikk",          # music
        "vibe_code",       # vibe/mood coding
    ],
    "agent_video": [
        "video",
        "trender",         # trends to profit from
    ],
    "agent_forfatter": [
        "forfatter",       # writer/author
        "nye_oppfinnelser",# new inventions
    ],
    "agent_generalist": [
        "kunst",
        "musikk",
        "video",
        "forfatter",
        "vibe_code",
        "nye_oppfinnelser",
        "trender",
        "nye_produkter",
    ],
}

# Research instructions per topic (English, for Claude prompts)
TOPIC_INSTRUCTIONS: dict[str, str] = {
    "kunst": (
        "Research monetizable opportunities in digital and physical art for 2025-2026. "
        "Focus on: AI-generated art licensing, NFT revival niches, print-on-demand, "
        "commissioned digital portraits, art education online, gallery tech tools. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "musikk": (
        "Research monetizable opportunities in music for 2025-2026. "
        "Focus on: AI music licensing, sync deals, micro-licensing platforms, "
        "beat selling, music for ads/games/AI training data, podcast jingles, Spotify niche playlists. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "video": (
        "Research monetizable opportunities in short and long-form video for 2025-2026. "
        "Focus on: YouTube automation, faceless channels, AI video tools, "
        "TikTok monetization, stock footage licensing, corporate explainer videos, "
        "UGC creator deals. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "forfatter": (
        "Research monetizable opportunities for writers in 2025-2026. "
        "Focus on: AI-assisted ghostwriting, Kindle publishing, newsletter monetization, "
        "content agency, technical writing, prompt engineering services, "
        "substack niche blogs, script writing for AI video. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "vibe_code": (
        "Research monetizable opportunities in vibe coding and low-code/no-code for 2025-2026. "
        "Focus on: selling Cursor/Claude templates, AI-built SaaS micro-tools, "
        "browser extensions, automation scripts for businesses, Bubble/Webflow builds, "
        "prompt packs, agent-as-a-service. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "nye_oppfinnelser": (
        "Research emerging inventions and tech niches with fast monetization potential in 2025-2026. "
        "Focus on: wearables, health-tech gadgets, AI hardware accessories, "
        "home automation add-ons, sustainable tech products, 3D-printed items, "
        "robotics kits, AR/VR accessories. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "trender": (
        "Research the fastest-moving profit trends for 2025-2026. "
        "Focus on: AI agent marketplaces, longevity/biohacking products, "
        "digital nomad services, creator economy tools, B2B AI consulting, "
        "sustainability branding, micro-SaaS, community monetization. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
    "nye_produkter": (
        "Research new physical and digital products with fast-to-market potential in 2025-2026. "
        "Focus on: white-label AI tools, Etsy digital downloads, "
        "Shopify dropshipping niches, subscription box concepts, "
        "mobile apps under 2 weeks to build, browser-based SaaS tools, "
        "info-products and online courses. "
        "Output: 3 concrete opportunities with speed-to-money score (1-10), effort level, and exact first action."
    ),
}
