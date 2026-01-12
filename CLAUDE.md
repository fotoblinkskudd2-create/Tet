# CLAUDE.md - AI Assistant Development Guide

## Project Overview

**Tet** is a hybrid application consisting of:
1. **Python CLI Tool** (`app.py`) - A joyful problem-solving command-line assistant that handles arithmetic, anagrams, and creative prompt generation for iOS web
2. **Backend API** (TypeScript/Express) - Authentication and user management services
3. **Frontend** (Next.js/React/TypeScript) - User interface with authentication pages and profile management
4. **Database** (PostgreSQL) - User data storage with migration support

## Repository Structure

```
/home/user/Tet/
├── app.py                          # Main Python CLI application (primary entry point)
├── README.md                       # Project documentation
├── backend/
│   └── src/
│       └── routes/
│           └── auth.ts            # Express authentication routes (signup, login, /me)
├── frontend/
│   └── src/
│       └── pages/
│           ├── auth/
│           │   ├── signup.tsx     # User signup page (Norwegian UI)
│           │   └── login.tsx      # User login page (Norwegian UI)
│           └── profile/
│               └── [id].tsx       # Dynamic user profile pages
├── migrations/
│   └── 001_create_users.sql      # PostgreSQL user table schema
└── tests/
    ├── conftest.py               # pytest configuration
    └── test_app.py               # Python CLI tests
```

## Core Components

### 1. Python CLI Application (app.py)

**Purpose**: Joyful problem-solving CLI with three primary functions:
- Math expression evaluation (safe AST-based parsing)
- Anagram solving using predefined library
- Creative prompt generation for iOS web (photo, video, music, art, poem)

**Key Classes & Functions**:
- `Solution` dataclass - Wraps answers with kind, answer, and optional details
- `solve_problem(problem: str)` - Main entry point for problem solving
- `build_creative_prompt(seed: str, medium_hint: Optional[str])` - Generates structured creative briefs
- `_safe_math_eval(expr: str)` - AST-based safe math evaluation (no eval/exec)
- `_solve_anagram(problem: str)` - Pattern matching for anagram queries
- `main(argv)` - CLI argument parsing and execution

**Usage Examples**:
```bash
python app.py "2 + 3 * 4"                                           # Math solver
python app.py "Unscramble an anagram of listen"                     # Anagram solver
python app.py --prompt --medium photo "misty forest at dawn"        # Creative prompt
```

**Conventions**:
- Playful, encouraging tone in all outputs
- Uses emojis sparingly in banners (✨)
- Returns structured `Solution` objects with `kind`, `answer`, and optional `details`
- Safe evaluation patterns - never uses `eval()` or `exec()`

### 2. Backend API (TypeScript/Express)

**Location**: `backend/src/routes/auth.ts`

**Technology Stack**:
- Express.js for routing
- JWT for authentication (7-day expiry)
- bcrypt for password hashing (10 rounds)
- In-memory Map storage (note: production should use PostgreSQL)

**Endpoints**:
- `POST /signup` - Create new user account
- `POST /login` - Authenticate user and set session cookie
- `GET /me` - Get current user info (requires auth)

**Authentication Flow**:
- JWT tokens stored in httpOnly cookies (`session` cookie name)
- Fallback to Authorization header (`Bearer <token>`)
- Cookie settings: httpOnly, sameSite=lax, secure in production, 7-day maxAge
- Middleware: `authMiddleware` validates tokens and attaches `userId` to request

**User Schema**:
```typescript
interface User {
  id: string;              // UUID
  email: string;           // Lowercase, unique
  username: string;        // Unique
  passwordHash: string;    // bcrypt hashed
  rating: number;          // Default: 1200
  stats: UserStats;        // Game statistics
}
```

**Security Notes**:
- JWT_SECRET defaults to 'dev-secret' (override with env var in production)
- Passwords hashed with bcrypt rounds=10
- Email normalization to lowercase
- HTTP-only cookies prevent XSS attacks

### 3. Frontend (Next.js/React/TypeScript)

**Location**: `frontend/src/pages/`

**Pages**:
- `auth/signup.tsx` - User registration form
- `auth/login.tsx` - User login form
- `profile/[id].tsx` - Dynamic user profile display

**Language**: Norwegian (Norsk) - UI text in Norwegian
- "Opprett konto" = Create account
- "Logg inn" = Log in
- "E-post" = Email
- "Brukernavn" = Username
- "Passord" = Password

**State Management**:
- React hooks (useState, useEffect)
- Fetch API for backend communication
- Loading states and error handling

**API Integration**:
- Calls `/api/auth/signup`, `/api/auth/login`, `/api/users/{id}`
- JSON content-type headers
- Error messages from backend displayed to users

**UI Patterns**:
- Form validation using HTML5 required attributes
- Loading states during async operations
- Status messages for feedback
- Link navigation between auth pages

### 4. Database Schema (PostgreSQL)

**Location**: `migrations/001_create_users.sql`

**Users Table**:
```sql
- id: UUID (primary key, auto-generated)
- email: TEXT (unique, not null)
- username: TEXT (unique, not null)
- password_hash: TEXT (not null)
- rating: INTEGER (default 1200)
- games_played: INTEGER (default 0)
- wins: INTEGER (default 0)
- losses: INTEGER (default 0)
- draws: INTEGER (default 0)
- created_at: TIMESTAMPTZ (default NOW())
- updated_at: TIMESTAMPTZ (auto-updated via trigger)
```

**Database Features**:
- UUID generation via `gen_random_uuid()`
- Automatic timestamp updates via `trigger_set_timestamp()` trigger
- Indexes on unique constraints (email, username)

## Testing Strategy

### Python Tests (pytest)

**Location**: `tests/test_app.py`

**Test Coverage**:
- `test_math_solver_handles_basic_expression()` - Validates arithmetic evaluation
- `test_anagram_solver_finds_known_match()` - Checks anagram matching
- `test_brainstorm_fallback_is_upbeat()` - Ensures fallback messaging is encouraging
- `test_creative_prompt_handles_photo_medium()` - Tests prompt generation
- `test_creative_prompt_auto_detects_poem()` - Validates medium auto-detection

**Running Tests**:
```bash
pytest tests/
pytest tests/test_app.py -v
```

**Test Conventions**:
- Use descriptive test names (test_<feature>_<behavior>)
- Assert on solution.kind to verify correct solver used
- Check for expected keywords in answers
- Validate encouraging tone in details/brainstorming

## Development Workflows

### Python CLI Development

1. **Making Changes**:
   - Edit `app.py` directly
   - Follow existing patterns (dataclasses, type hints)
   - Add new solvers by creating `_solve_<name>()` functions
   - Register solvers in `solve_problem()` function

2. **Testing Changes**:
   ```bash
   # Manual testing
   python app.py "test input"

   # Automated testing
   pytest tests/test_app.py
   ```

3. **Adding New Solvers**:
   - Create `_solve_<name>(problem: str) -> Optional[Solution]`
   - Return `None` if pattern doesn't match
   - Return `Solution` with appropriate kind/answer/details
   - Add to solver list in `solve_problem()`
   - Add corresponding test in `test_app.py`

### Backend Development

1. **Adding New Routes**:
   - Create new route files in `backend/src/routes/`
   - Follow Express Router pattern
   - Use `authMiddleware` for protected routes
   - Export default router

2. **Authentication Required Routes**:
   ```typescript
   router.get('/protected', authMiddleware, (req, res) => {
     const userId = (req as any).userId;
     // ... implementation
   });
   ```

3. **Error Handling**:
   - Return appropriate HTTP status codes (400, 401, 404, 409, 500)
   - Include descriptive error messages in JSON: `{ error: "message" }`

### Frontend Development

1. **Adding New Pages**:
   - Create `.tsx` files in `frontend/src/pages/`
   - Use Next.js file-based routing conventions
   - Dynamic routes use `[param].tsx` syntax

2. **State Management Pattern**:
   ```typescript
   const [data, setData] = useState(initialValue);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   ```

3. **API Calls**:
   ```typescript
   const response = await fetch('/api/endpoint', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(payload),
   });
   const data = await response.json();
   ```

4. **Language Convention**:
   - All user-facing text should be in Norwegian
   - Use Norwegian translations for common terms:
     - "Laster..." = "Loading..."
     - "Feil" = "Error"
     - "Kunne ikke" = "Could not"

## Git Branching Strategy

### Branch Naming Convention

**CRITICAL**: All feature branches must follow this pattern:
```
claude/<descriptive-name>-<session-id>
```

**Current Branch**: `claude/add-claude-documentation-nCiOb`

**Examples**:
- `claude/add-user-authentication-xY7zK`
- `claude/fix-anagram-solver-bug-aB3cD`
- `claude/create-prompt-generator-eFgHi`

### Git Workflow

1. **Starting Work**:
   ```bash
   git checkout -b claude/<feature-name>-<session-id>
   ```

2. **Committing Changes**:
   ```bash
   git add <files>
   git commit -m "Clear, descriptive commit message"
   ```
   - Focus on "why" rather than "what"
   - Reference issue numbers if applicable
   - Keep commits atomic and focused

3. **Pushing Changes**:
   ```bash
   git push -u origin claude/<branch-name>
   ```
   - CRITICAL: Branch must start with 'claude/' and end with session ID
   - Push will fail with 403 if naming convention not followed
   - Retry up to 4 times with exponential backoff on network errors (2s, 4s, 8s, 16s)

4. **Fetching/Pulling**:
   ```bash
   git fetch origin <branch-name>
   git pull origin <branch-name>
   ```
   - Prefer fetching specific branches
   - Retry up to 4 times on network failures with exponential backoff

### Recent Commits (as of 2026-01-12)

```
2766919 - Merge pull request #7 (create-prompt-generator-for-ios-web)
1c9398b - Add creative prompt builder for iOS web
02453eb - Merge pull request #3 (add-authentication-pages-and-endpoints)
f283cec - Merge pull request #4 (create-app-to-solve-problems-joyfully)
00d4470 - Add joyful problem-solving CLI
```

## Key Conventions for AI Assistants

### Code Style

**Python**:
- Use type hints for all function signatures
- Follow dataclass patterns for structured data
- Prefer explicit over implicit (no magic)
- Use `Optional[T]` for nullable returns
- Descriptive variable names (no abbreviations)
- Docstrings for public functions using triple quotes

**TypeScript**:
- Explicit interface definitions
- Use `async/await` over raw promises
- Type all function parameters and returns
- Prefer `const` over `let`
- Use Express middleware pattern for reusable logic

**React/Next.js**:
- Functional components with hooks
- TypeScript interfaces for props and state
- Meaningful component names (PascalCase)
- Extract reusable logic into custom hooks
- Keep components focused (single responsibility)

### Security Practices

1. **Never use eval/exec** - Use AST parsing for code evaluation
2. **Hash passwords** - Always use bcrypt (10+ rounds)
3. **Validate input** - Check all user inputs before processing
4. **HTTP-only cookies** - Store auth tokens securely
5. **Parameterized queries** - Prevent SQL injection (when using DB)
6. **Environment variables** - Never commit secrets (use .env)

### Error Handling

**Python**:
```python
try:
    result = risky_operation()
except SpecificException:
    return None  # Or return Solution with error details
```

**TypeScript/Express**:
```typescript
try {
  // ... operation
} catch (err) {
  res.status(400).json({ error: (err as Error).message });
}
```

**React**:
```typescript
catch (error) {
  setError((error as Error).message);
}
```

### Tone and Messaging

**Python CLI**:
- Playful and encouraging
- Use phrases like "win together", "joyful", "momentum is magic"
- Celebrate successes with enthusiasm
- Provide actionable brainstorming steps when stumped

**Backend/API**:
- Professional and clear error messages
- No jargon in user-facing errors
- Appropriate HTTP status codes

**Frontend**:
- Norwegian language for user-facing text
- Friendly but professional tone
- Clear loading and error states

## Common Development Tasks

### Adding a New Math Operation

1. Update `_safe_math_eval()` in `app.py`
2. Add operator to `allowed_bin_ops` or `allowed_unary_ops`
3. Update AST evaluation logic in `_evaluate()`
4. Add test case in `test_app.py`

### Adding a New Creative Medium

1. Add medium to `_MEDIUM_SYNONYMS` dict
2. Add recipe to `_CREATIVE_RECIPES` dict with:
   - title, style, structure, platform, delivery, details
3. Update CLI choices in `_build_parser()`
4. Add test case for medium auto-detection

### Adding New Anagrams

1. Update `_ANAGRAM_LIBRARY` dict in `app.py`
2. Add base word and tuple of anagram solutions
3. Sorting-based matching handles case insensitivity

### Creating New API Endpoints

1. Create/update route file in `backend/src/routes/`
2. Import and register router in main app (not visible in current structure)
3. Add TypeScript interfaces for request/response types
4. Implement error handling and validation
5. Add authentication middleware if needed

### Adding New Frontend Pages

1. Create `.tsx` file in `frontend/src/pages/`
2. Import React hooks and Next.js utilities
3. Define TypeScript interfaces for data shapes
4. Implement loading/error states
5. Use Norwegian translations for UI text
6. Link to/from related pages with Next.js `<Link>`

## Environment Variables

**Backend** (not explicitly configured yet, but recommended):
```
JWT_SECRET=<strong-secret-key>
NODE_ENV=production|development
DATABASE_URL=<postgresql-connection-string>
PORT=<api-port>
```

## Important Notes

### Current Limitations

1. **In-Memory Storage**: Backend currently uses `Map<string, User>` instead of PostgreSQL
   - Data lost on restart
   - Not production-ready
   - Migration exists but not yet integrated

2. **No Build Configuration Visible**:
   - No package.json found in repository scan
   - TypeScript/Next.js config not visible
   - May exist outside scanned directories

3. **No CI/CD**: No GitHub Actions, GitLab CI, or other automation detected

4. **No Docker**: No containerization setup found

### Production Readiness Checklist

Before deploying to production:

- [ ] Replace in-memory storage with PostgreSQL connection
- [ ] Set strong JWT_SECRET environment variable
- [ ] Enable HTTPS and secure cookies
- [ ] Add rate limiting to API endpoints
- [ ] Implement proper logging and monitoring
- [ ] Add input validation middleware
- [ ] Configure CORS policies
- [ ] Set up database backups
- [ ] Add error tracking (e.g., Sentry)
- [ ] Implement comprehensive test coverage
- [ ] Add API documentation (e.g., OpenAPI/Swagger)
- [ ] Configure production build optimizations
- [ ] Set up CI/CD pipelines
- [ ] Add health check endpoints

## File References

When discussing code, use this format for easy navigation:
- `app.py:32` - The `_safe_math_eval` function
- `backend/src/routes/auth.ts:69` - Signup endpoint
- `frontend/src/pages/auth/login.tsx:10` - Login form submit handler
- `migrations/001_create_users.sql:1` - Users table schema
- `tests/test_app.py:6` - Math solver test

## Getting Help

For questions or issues:
1. Check this CLAUDE.md file first
2. Review README.md for user-facing documentation
3. Examine existing code for patterns
4. Run tests to understand expected behavior
5. Check git history for context on previous changes

## Last Updated

This document reflects the repository state as of:
- **Date**: 2026-01-12
- **Branch**: `claude/add-claude-documentation-nCiOb`
- **Latest Commit**: 2766919 (Merge PR #7 - creative prompt generator)

---

**Remember**: This codebase values joy, clarity, and safety. Write code that's easy to understand, secure by default, and delightful to use.
