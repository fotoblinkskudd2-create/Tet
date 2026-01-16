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

## Idea Generator with Affiliate Integration

Generate rich, detailed ideas from simple keywords with built-in affiliate monetization strategies.

### Features

- **Web Interface**: iOS-optimized React frontend (Next.js)
- **Rich Ideas**: Comprehensive idea generation with implementation plans
- **Affiliate System**: Track referrals, clicks, and commissions
- **Multi-tier Commissions**: Bronze, Silver, Gold, and Platinum tiers

### API Endpoints

#### Ideas
```bash
POST /api/ideas/generate
Body: { "keywords": ["react", "ios", "app"] }

GET /api/ideas/:id
GET /api/ideas
```

#### Affiliates
```bash
POST /api/affiliates/profile       # Create affiliate profile
GET /api/affiliates/profile        # Get your profile
POST /api/affiliates/clicks        # Track affiliate clicks
POST /api/affiliates/conversions   # Record conversions
GET /api/affiliates/stats          # Get your stats
GET /api/affiliates/leaderboard    # View top affiliates
```

### Frontend Pages

- `/ideas` - Idea generator interface
- `/affiliate/dashboard` - Affiliate stats and tracking

### Database Setup

Run migrations in order:
```bash
psql your_database < migrations/001_create_users.sql
psql your_database < migrations/002_create_affiliates_and_ideas.sql
```

### Example Usage

1. **Generate an idea**:
   Visit `/ideas` and enter keywords like "React, iOS, innovasjon"

2. **Become an affiliate**:
   Visit `/affiliate/dashboard` and create your profile

3. **Share your referral code**:
   Copy your unique referral link and start earning commissions

### Commission Tiers

- **Bronze** (0-9 referrals): 5% commission
- **Silver** (10-49 referrals): 10% commission
- **Gold** (50-99 referrals): 15% commission
- **Platinum** (100+ referrals): 20% commission
