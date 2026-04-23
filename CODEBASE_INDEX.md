# CheckMe Codebase Index (Updated)

## Project Overview
**CheckMe** - Smart Hostel & Mess Management System
A real-time hostel and mess management system built with Next.js 16, React 19, and TypeScript.

**Last Indexed**: April 24, 2026

## Technology Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Frontend**: React 19.2.4, TypeScript 5.7.3
- **Styling**: Tailwind CSS v4.1.9, PostCSS
- **UI Components**: Radix UI (30+ primitives), shadcn/ui (New York style)
- **Icons**: Lucide React
- **Data Processing**: 
  - `Tesseract.js`: OCR for image-based menus
  - `xlsx`: Excel parsing
  - `pdf-parse-new`: PDF text extraction
- **Backend Services**:
  - `Firebase`: Authentication and Firestore database
  - `OpenAI`: AI-powered data processing (likely for menu parsing enrichment)
- **State Management**: React Context (`AuthContext`) + Custom Hooks
- **Analytics**: Vercel Analytics

## Directory Structure

```text
checkme/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes (Serverless Functions)
│   │   ├── foodFeedback/       # Feedback submission
│   │   ├── getFoodImage/       # AI/External image fetching
│   │   ├── mess/               # Mess menu data and uploads
│   │   ├── poll/               # Poll management
│   │   ├── survey/             # Survey management
│   │   ├── updateStock/        # Inventory/Stock updates
│   │   └── vote/               # Voting logic
│   ├── dashboard/              # Main application pages
│   │   └── student/            # Student-specific dashboard
│   ├── login/                  # Authentication pages
│   ├── seed/                   # Database seeding routes
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                 # React components
│   ├── ui/                     # shadcn/ui base components
│   └── theme-provider.tsx      # Next-themes wrapper
├── contexts/                   # Global React contexts
│   └── AuthContext.tsx         # Firebase auth state provider
├── lib/                        # Shared logic and utilities
│   ├── parsers/                # Data parsing logic (e.g., messMenuParser.ts)
│   ├── firebase.ts             # Firebase initialization
│   ├── pollController.ts       # Business logic for polls
│   ├── surveyController.ts     # Business logic for surveys
│   └── utils.ts                # Styling utilities (cn)
├── scripts/                    # Database automation scripts
│   ├── seedInventory.js        # Inventory data seeding
│   ├── seedPoll.ts             # Poll data seeding
│   └── seedStudents.js         # Student record seeding
├── public/                     # Static assets
└── styles/                     # Global CSS
```

## Core Features & Logic

### 1. Mess Menu Management
- **Upload**: `app/api/mess/upload/route.ts` handles PDF, Image, and Excel uploads.
- **Parsing**: `lib/parsers/messMenuParser.ts` converts extracted text into a structured JSON grid.
- **OCR**: Uses `Tesseract.js` for images and `pdf-parse-new` for PDFs.

### 2. Authentication
- **Provider**: Firebase Auth.
- **Implementation**: `contexts/AuthContext.tsx` provides `user` and `loading` states via the `useAuth` hook.

### 3. Dashboard
- **Student Dashboard**: `app/dashboard/student/page.tsx` (Complex page with 56KB+ of logic).
- **Redirection**: Main `/dashboard` redirects automatically based on role/status.

### 4. Interactive Features
- **Polls & Surveys**: Managed via `lib/pollController.ts` and `lib/surveyController.ts`.
- **Feedback**: Integrated food feedback system.

## Database Seeding
The project includes several seeding scripts to populate Firestore:
- `pnpm run seed:inventory` (via `scripts/seedInventory.js`)
- `pnpm run seed:poll` (via `scripts/seedPoll.ts`)
- `pnpm run seed:students` (via `scripts/seedStudents.js`)

## Notable Dependencies
- `cmdk`: Command palette logic.
- `embla-carousel-react`: For carousels (e.g., menu display).
- `recharts`: For analytics visualization.
- `sonner` / `radix-ui/react-toast`: Feedback notifications.
- `vaul`: Drawer components.
- `input-otp`: One-time password inputs.

## Development Scripts
- `pnpm dev`: Start development server.
- `pnpm build`: Production build.
- `pnpm lint`: Linting with ESLint.

---
*Index updated by Antigravity AI*