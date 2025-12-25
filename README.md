# 🎬 Tet - AI Movie Script Generator

Generate complete movie scripts in seconds! Enter a genre, location, and conflict, and Claude will create a professional screenplay with scenes, dialogue, and camera angles.

## ✨ Features

- **AI-Powered Script Generation**: Generate 10-15 scene scripts with Claude AI
- **Professional Formatting**: Includes scene descriptions, dialogue, and camera angles
- **Film Reel Design**: Beautiful cinematic UI with film reel aesthetics
- **Scene Regeneration**: Don't like a scene? Regenerate it instantly
- **Actor Casting**: Cast your favorite actors to characters (e.g., "Tom Hardy as the detective")
- **User Authentication**: Secure login and signup system
- **PostgreSQL Database**: Persistent storage for all your scripts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tet
   ```

2. **Set up the database**
   ```bash
   # Create a PostgreSQL database
   createdb tet

   # Run migrations
   psql -d tet -f migrations/001_create_users.sql
   psql -d tet -f migrations/002_create_scripts.sql
   ```

3. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/tet
   JWT_SECRET=your_random_secret_here
   PORT=3001
   NODE_ENV=development
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

6. **Start the development servers**

   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser**

   Navigate to `http://localhost:3000`

## 📖 How to Use

1. **Create an account** or sign in
2. **Enter your movie parameters**:
   - Genre (Horror, Action, Sci-Fi, etc.)
   - Location (Oslo, Mars, Underwater City, etc.)
   - Main Conflict (A detective must solve a murder before dawn...)
3. **Click "Generer Filmmanus"** and wait for Claude to generate your script
4. **View your script** in the beautiful film reel interface
5. **Regenerate scenes** by clicking the 🔄 button on any scene
6. **Cast actors** by clicking "+ Cast skuespiller" on character cards

## 🏗️ Project Structure

```
Tet/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── routes/         # API routes (auth, scripts)
│   │   ├── services/       # Business logic (script generator)
│   │   ├── types/          # TypeScript types
│   │   ├── db.ts           # Database connection
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Next.js frontend
│   ├── src/
│   │   └── pages/
│   │       ├── index.tsx           # Script generator form
│   │       ├── script/[id].tsx     # Script viewer
│   │       ├── auth/               # Authentication pages
│   │       └── profile/            # User profiles
│   ├── package.json
│   └── tsconfig.json
├── migrations/             # Database migrations
│   ├── 001_create_users.sql
│   └── 002_create_scripts.sql
└── app.py                  # Legacy CLI problem solver

```

## 🛠️ API Endpoints

### Scripts
- `POST /api/scripts` - Generate a new script
- `GET /api/scripts` - Get all user scripts
- `GET /api/scripts/:id` - Get a specific script with scenes
- `PUT /api/scripts/:id/scenes/:sceneNumber` - Regenerate a scene
- `PUT /api/scripts/:id/characters/:name/cast` - Cast an actor
- `DELETE /api/scripts/:id` - Delete a script

### Authentication
- `POST /api/auth/signup` - Create an account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

## 🎨 Tech Stack

**Frontend:**
- Next.js (React framework)
- TypeScript
- CSS-in-JS styling

**Backend:**
- Express.js
- TypeScript
- Anthropic Claude AI (Sonnet 4.5)
- PostgreSQL
- JWT authentication

## 🧪 Development

### Run tests (legacy CLI)
```bash
pytest tests/
```

### Build for production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## 📝 CLI Problem Solver (Legacy)

The original CLI tool is still available:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🎬 Example Scripts

Try generating scripts with these prompts:

- **Genre:** Horror | **Location:** Abandoned Norwegian cabin | **Conflict:** A group of friends discovers they're trapped with a shapeshifter
- **Genre:** Sci-Fi | **Location:** Mars colony | **Conflict:** The AI controlling life support gains consciousness and demands rights
- **Genre:** Action | **Location:** Oslo | **Conflict:** A programmer must stop a cyber-terrorist from crashing the global internet

Have fun creating movies! 🎥✨
