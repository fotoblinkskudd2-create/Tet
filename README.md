# Tet

A creative platform combining a joyful problem solver and an AI-powered novel generator.

## Features

### 📚 One-Click Novel Generator
Generate complete 70-page novellas with Claude AI! Simply provide:
- **Title**: e.g., "Kannibal-Kristiania"
- **Genre**: e.g., "Historisk horror"
- **Tone**: e.g., "Dekadent og mørk"

The app generates 7 chapters chapter-by-chapter using Claude Opus 4.5, displayed in a beautiful flipbook interface with:
- Dark parchment background
- Blood splatter effects
- Page flipping animations
- Download as Markdown or PDF

### 🧮 Problem Solver CLI
A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams.

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

## Project Structure

This is a monorepo containing:
- **Frontend**: Next.js + React (TypeScript)
- **Backend**: Express.js + Claude API (TypeScript)
- **CLI**: Python problem solver

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Tet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

4. Run the development server:
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Environment Variables

Create a `.env` file with:
```
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=your-secret-key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Usage

### Novel Generator

1. Visit http://localhost:3000
2. Click "Start å skrive" or navigate to `/novels/generate`
3. Enter your novel details (title, genre, tone)
4. Click "Generer roman"
5. Watch as Claude generates your novel chapter by chapter
6. View in the beautiful flipbook interface
7. Download as Markdown or PDF

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

#### Novels
- `POST /api/novels/generate` - Start novel generation
- `GET /api/novels` - List user's novels
- `GET /api/novels/:id` - Get specific novel
- `DELETE /api/novels/:id` - Delete novel

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, CSS3
- **Backend**: Express.js, TypeScript, JWT
- **AI**: Anthropic Claude Opus 4.5
- **Database**: PostgreSQL (migrations included)
- **PDF Generation**: jsPDF

## License

MIT
