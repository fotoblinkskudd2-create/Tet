# Tet - Make Hard Stuff Fun

A joyful productivity platform that turns difficult tasks into epic quests! Tet combines a command-line problem solver with a gamified web task manager to make tackling hard challenges actually enjoyable.

## Features

### 🎮 Quest Board (Web App)
Turn your hardest tasks into a fun game! The Quest Board is a gamified task management system that makes difficult work rewarding:

- **Level Up System**: Earn XP points for completing tasks and level up your character
- **Difficulty-Based Rewards**: Harder tasks = more points (1-5 star difficulty rating)
- **Daily Streaks**: Build momentum with streak tracking and special achievements
- **Achievement Badges**: Unlock achievements like "7-Day Warrior", "Task Master", and "Challenge Accepted"
- **Visual Progress**: See your progress with beautiful progress bars and celebration animations
- **Task Categories**: Organize by Work, Health, Learning, Creative, Personal, or Social
- **Real-time Celebrations**: Get instant gratification with fun animations and messages when you complete tasks

### 🧠 CLI Problem Solver
A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

## Getting Started

### Web App Setup

1. **Backend Setup**:
```bash
cd backend
npm install
npm run dev  # Starts server on port 3001
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev  # Starts Next.js on port 3000
```

3. **Database Setup**:
Run the migrations in order:
```bash
psql -U your_user -d your_database -f migrations/001_create_users.sql
psql -U your_user -d your_database -f migrations/002_create_tasks.sql
```

4. **Visit the Quest Board**:
Open `http://localhost:3000/tasks` and start turning your hard tasks into epic wins!

### How to Use the Quest Board

1. **Create an Account**: Sign up at `/auth/signup`
2. **Start a New Quest**: Click "+ New Quest" to add a task
3. **Set Difficulty**: Rate how hard the task is (1-5 stars)
   - 1 star = 100 points
   - 2 stars = 200 points
   - 3 stars = 300 points
   - 4 stars = 400 points
   - 5 stars = 500 points
4. **Track Progress**: Move tasks through To Do → In Progress → Completed
5. **Level Up**: Every 500 points = 1 level
6. **Build Streaks**: Complete tasks daily to maintain your streak
7. **Unlock Achievements**:
   - First task completed
   - 10 tasks completed
   - Level 5 reached
   - Complete a 5-star task
   - 7-day streak

## CLI Usage

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

## Technology Stack

### Backend
- Express.js with TypeScript
- JWT authentication with bcrypt password hashing
- RESTful API architecture
- In-memory data storage (easily adaptable to PostgreSQL)

### Frontend
- Next.js (React framework)
- TypeScript for type safety
- CSS with gradient animations
- Responsive design for mobile and desktop

### Database Schema
- Users table with authentication and game stats
- Tasks table with difficulty ratings and status tracking
- Achievements table for unlockable badges
- User progress tracking (points, levels, streaks)

## What Makes This Fun?

Unlike traditional task managers that feel like chores themselves, Tet's Quest Board transforms your to-do list into an adventure:

1. **Instant Gratification**: Every completed task triggers celebration animations with encouraging messages
2. **Visible Progress**: Watch your XP bar fill up and see yourself level up in real-time
3. **Challenge Selection**: You choose how hard each task is, giving you control over your rewards
4. **Streak Building**: Daily completion creates positive momentum and habit formation
5. **Achievement Hunting**: Unlock badges that celebrate your accomplishments
6. **Beautiful Design**: Colorful gradients and smooth animations make the experience delightful

The psychology is simple: hard tasks become easier when you're motivated by progress, rewards, and a sense of accomplishment. Tet turns boring productivity into an engaging game you'll actually want to play!

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/progress` - Get user progress and achievements
- `GET /api/tasks/achievements` - Get all achievements

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to make hard stuff even more fun.
