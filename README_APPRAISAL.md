# Employee Performance Appraisal Portal

A complete, production-ready employee performance appraisal system built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🎯 Features

### Core Functionality
- ✅ **Multi-role System:** Admin, Manager, and Employee roles with role-based access control
- ✅ **Secure Authentication:** Email/password auth + optional Google OAuth via NextAuth
- ✅ **Customizable Appraisal Templates:** Admins can create templates with various question types
- ✅ **Self-Assessment:** Employees complete their own appraisals
- ✅ **Manager Review:** Managers review and provide feedback on employee appraisals
- ✅ **Multi-step Workflow:** Draft → Submitted → In Review → Completed
- ✅ **Email Notifications:** Automated emails for appraisal assignments, submissions, and completions
- ✅ **PDF Export:** Generate professional PDF reports with company branding
- ✅ **Responsive Design:** Mobile-friendly interface with Tailwind CSS
- ✅ **Real-time Updates:** Dynamic status tracking and notifications

### Question Types Supported
- **Text:** Open-ended text responses
- **Rating:** 1-5 star ratings
- **Multiple Choice:** Predefined options
- **Comment:** Long-form text areas

### User Roles

#### Admin
- Create and manage appraisal templates
- Assign appraisals to employees
- View all appraisals across organization
- Manage user accounts
- Track appraisal completion rates

#### Manager
- Review submitted employee appraisals
- Provide ratings and feedback
- Complete and finalize appraisals
- Download PDF reports
- Track team appraisal progress

#### Employee
- View assigned appraisals
- Complete self-assessments
- Submit appraisals for manager review
- View completed appraisals and feedback
- Download personal appraisal PDFs

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Radix UI components
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Email:** Resend
- **PDF Generation:** @react-pdf/renderer
- **Deployment:** Railway (recommended) or Vercel

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard layouts and pages
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── employee/      # Employee pages
│   │   │   └── manager/       # Manager pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── appraisals/    # Appraisal CRUD + PDF
│   │   │   ├── templates/     # Template management
│   │   │   └── users/         # User management
│   │   ├── auth/              # Auth pages (signin, signup)
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirects)
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── Providers.tsx      # Session provider
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── email.ts           # Email service
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── next-auth.d.ts     # TypeScript definitions
│   └── middleware.ts          # Auth middleware
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── DEPLOYMENT.md              # Deployment guide
└── SETUP.md                   # Setup instructions
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Railway account (for deployment)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo>
cd Tet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other settings

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

Visit http://localhost:3000

### 3. Create Admin User

```bash
# Open Prisma Studio
npx prisma studio

# Create a user via signup, then update their role to ADMIN in Prisma Studio
# Or use the direct database query method described in SETUP.md
```

## 📋 Environment Variables

Create a `.env` file with these required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/appraisal_db"

# NextAuth
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_your_api_key"
FROM_EMAIL="noreply@yourdomain.com"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

See `.env.example` for all available options.

## 📖 Usage Guide

### For Admins

1. **Create a Template:**
   - Navigate to Admin Dashboard → Templates
   - Click "Create Template"
   - Add questions (text, rating, multiple choice, or comment)
   - Organize questions into sections
   - Save template

2. **Assign Appraisal:**
   - Go to Admin Dashboard → Assign Appraisals
   - Select employee
   - Choose template
   - Assign manager
   - Set due date (optional)
   - Create assignment

### For Employees

1. **Complete Self-Assessment:**
   - View assigned appraisals on dashboard
   - Click "Continue" on draft appraisal
   - Answer all questions honestly
   - Save progress (can return later)
   - Submit when ready

### For Managers

1. **Review Appraisal:**
   - View pending reviews on dashboard
   - Click "Review" on submitted appraisal
   - Read employee responses
   - Provide feedback and ratings
   - Add overall assessment
   - Set final rating
   - Complete review

2. **Download PDF:**
   - View completed appraisal
   - Click "Download PDF"
   - Share with employee or HR

## 🔒 Security Features

- **Password hashing** with bcrypt
- **JWT-based sessions** via NextAuth
- **Role-based access control** via middleware
- **SQL injection protection** via Prisma
- **XSS protection** via React and Next.js
- **CSRF protection** via NextAuth
- **Environment variable validation**
- **Secure HTTP headers**

## 🎨 Customization

### Branding
- Update app name in environment variables
- Add company logo (future feature)
- Customize colors in `tailwind.config.ts`
- Modify email templates in `src/lib/email.ts`

### Question Types
Add new question types by:
1. Updating `QuestionType` enum in `prisma/schema.prisma`
2. Adding UI components in appraisal forms
3. Updating PDF generation logic

## 📊 Database Schema

Key models:
- **User:** Stores user accounts with roles
- **AppraisalTemplate:** Defines appraisal structures
- **TemplateQuestion:** Questions within templates
- **Appraisal:** Individual appraisal instances
- **Response:** Employee and manager responses
- **Notification:** System notifications

See `prisma/schema.prisma` for complete schema.

## 🚀 Deployment

Deploy to Railway (recommended):

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add --database postgresql
railway up
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📝 API Documentation

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create template (Admin only)
- `GET /api/templates/[id]` - Get template details
- `DELETE /api/templates/[id]` - Delete template (Admin only)

### Appraisals
- `GET /api/appraisals` - List appraisals (role-filtered)
- `POST /api/appraisals` - Create appraisal (Admin only)
- `GET /api/appraisals/[id]` - Get appraisal details
- `PATCH /api/appraisals/[id]` - Update appraisal
- `GET /api/appraisals/[id]/pdf` - Generate PDF

### Users
- `GET /api/users` - List users (with role filter)

## 🧪 Testing

Run the full workflow:
1. Create admin user
2. Create appraisal template
3. Create test employee and manager
4. Assign appraisal
5. Complete as employee
6. Review as manager
7. Download PDF

## 🐛 Troubleshooting

Common issues and solutions in [SETUP.md](./SETUP.md#troubleshooting)

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Local development setup
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Radix UI for accessible components
- Tailwind CSS for utility-first styling

## 📧 Support

For issues and questions:
- Review documentation in SETUP.md and DEPLOYMENT.md
- Check GitHub issues
- Contact your system administrator

---

**Built with ❤️ for efficient performance management**

Version: 1.0.0
Last Updated: 2024
