# Tet Problem Solver

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

## Usage

Run the solver with your problem statement:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.

## OpenClaw – Smart Document Generator

OpenClaw generates professional documents from a single description. It supports seven document types out of the box, auto-detects what you need from keywords, and fills in sensible defaults so you can go from idea to draft in seconds.

### Supported document types

| Type       | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `contract` | Freelance service contract with parties, scope, and compensation   |
| `sow`      | Statement of work with deliverables, milestones, and acceptance    |
| `brief`    | Project brief with goals, stakeholders, and risk mitigations       |
| `nda`      | Non-disclosure agreement with obligations and exclusions           |
| `invoice`  | Professional invoice with line items and payment terms             |
| `workflow` | Workflow plan with stages, owners, SLAs, and automation notes      |
| `proposal` | Project proposal with approach, timeline, and pricing              |

### CLI usage

```bash
# Auto-detect type from description
python app.py --claw "Create a freelance contract for web development with Acme Corp"

# Specify type explicitly
python app.py --claw --doc-type invoice "Design work for $3,500"

# Pass custom parameters
python app.py --claw --claw-param client="Acme Corp" --claw-param amount="$5,000" \
  "contract for mobile app development"

# Output as JSON
python app.py --claw --claw-json "workflow for customer onboarding"

# List all available document types
python app.py --claw-list
```

### Python API

```python
import openclaw

# Generate a contract
doc = openclaw.generate(
    "contract for API integration with TechCo",
    params={"client": "TechCo", "amount": "$12,000"},
)
print(doc.render())          # Formatted text
print(doc.to_dict())         # JSON-serializable dict

# Auto-detect and generate
doc = openclaw.generate("NDA for partnership discussions")

# List available types
for dt in openclaw.list_doc_types():
    print(f"{dt['key']}: {dt['label']}")
```

### Web API

The backend exposes RESTful endpoints:

- `GET /api/openclaw/types` – List available document types
- `POST /api/openclaw/generate` – Generate a document (body: `{ description, docType?, params? }`)
- `GET /api/openclaw/documents` – List generated documents
- `GET /api/openclaw/documents/:id` – Retrieve a specific document

### Running tests

```bash
pytest tests/ -v
```
