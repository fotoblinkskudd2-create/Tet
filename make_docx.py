"""Generate a Word (.docx) summary of the Tet Problem Solver project."""
from __future__ import annotations

from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


def add_heading_bar(doc: Document, text: str) -> None:
    h = doc.add_heading(text, level=1)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)


def main() -> None:
    doc = Document()

    # Title
    title = doc.add_heading("Tet Problem Solver", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    sub = doc.add_paragraph("A joyful command-line companion for small puzzles, "
                            "creative prompts, and calm-in-a-crisis support.")
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in sub.runs:
        run.italic = True
        run.font.size = Pt(12)

    doc.add_paragraph()

    # Overview
    add_heading_bar(doc, "What it is")
    doc.add_paragraph(
        "Tet is a tiny, friendly CLI written in Python. You hand it a problem in plain "
        "language and it responds with a playful banner, a concise answer, and encouraging "
        "follow-up bullets. When it has no direct solver, it switches into upbeat brainstorming "
        "mode so momentum is never lost."
    )

    # Capabilities
    add_heading_bar(doc, "Capabilities")

    capabilities = [
        ("Math solver",
         "Safely evaluates arithmetic expressions using Python's AST (no eval). Supports "
         "+, -, *, /, //, %, ** and unary signs, returning clean integer or rounded results."),
        ("Anagram helper",
         "Recognises 'anagram of <word>' or 'unscramble <word>' and suggests matching words "
         "from a curated library, with a nudge to say the options out loud."),
        ("Creative prompt builder",
         "Prompt mode turns a few words into a ready-to-paste creative brief for photo, video, "
         "music, art, or poetry. Mediums auto-detect, and every brief is mobile-first and tuned "
         "for iOS web share sheets — short sentences, no markdown."),
        ("Panic support protocol",
         "Detects panic / anxiety language (English and Norwegian) and returns a structured, "
         "practical protocol: grounding, paced breathing, reality checks, body reset, attention "
         "engagement, medication reminder, emergency red-flags, and aftercare."),
        ("Brainstorm fallback",
         "For anything else, it breaks the challenge into bite-sized steps and encourages you to "
         "start with the easiest one."),
    ]
    for name, desc in capabilities:
        p = doc.add_paragraph(style="List Bullet")
        run = p.add_run(f"{name}: ")
        run.bold = True
        p.add_run(desc)

    # Usage
    add_heading_bar(doc, "How to use it")
    examples = [
        'python app.py "2 + 3 * 4"',
        'python app.py "Unscramble an anagram of listen"',
        'python app.py "How do I get motivated for chores?"',
        'python app.py --prompt --medium photo "misty forest boardwalk at dawn"',
        'python app.py --prompt --medium music "uplifting synthwave for launch video"',
        'python app.py --prompt "poem about late-summer rain in the city"',
    ]
    for ex in examples:
        p = doc.add_paragraph(ex)
        for run in p.runs:
            run.font.name = "Courier New"
            run.font.size = Pt(10)

    # Project structure
    add_heading_bar(doc, "Project structure")
    structure = [
        ("app.py", "The full CLI: solvers, creative prompt engine, and argument parsing."),
        ("backend/src/routes/auth.ts", "Authentication routes."),
        ("frontend/src/pages/auth", "Login and signup pages (login.tsx, signup.tsx)."),
        ("frontend/src/pages/profile/[id].tsx", "User profile page."),
        ("migrations/001_create_users.sql", "User table migration."),
        ("tests/", "Test suite (test_app.py, conftest.py)."),
    ]
    for path, desc in structure:
        p = doc.add_paragraph(style="List Bullet")
        run = p.add_run(f"{path} — ")
        run.bold = True
        p.add_run(desc)

    # Value
    add_heading_bar(doc, "Why it matters")
    doc.add_paragraph(
        "Tet bundles everyday usefulness with a warm, low-pressure tone. It does quick math and "
        "wordplay, scaffolds creative work for mobile-first tools, and — most importantly — offers "
        "a calm, evidence-aligned panic protocol when someone needs steady guidance. It is small, "
        "safe, and built to keep people moving forward."
    )

    note = doc.add_paragraph(
        "Note: The panic support feature offers general self-help steps and is not a substitute "
        "for professional or emergency medical care."
    )
    for run in note.runs:
        run.italic = True
        run.font.size = Pt(9)

    doc.save("Tet_Problem_Solver.docx")
    print("Saved Tet_Problem_Solver.docx")


if __name__ == "__main__":
    main()
