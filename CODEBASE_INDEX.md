# CheckMe Codebase Index

## Project Overview
**CheckMe** - Smart Hostel & Mess Management System
A real-time hostel and mess management system built with Next.js 16, React 19, and TypeScript.

## Technology Stack
- **Framework**: Next.js 16.1.6
- **React**: 19.2.4
- **Language**: TypeScript 5.7.3
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context + Custom Hooks
- **Animations**: Tailwind CSS animations
- **Analytics**: Vercel Analytics

## Project Structure

```
checkme/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components (50+ components)
│   └── theme-provider.tsx # Theme provider component
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection hook
│   └── use-toast.ts      # Toast notification hook
├── lib/                  # Utility functions
│   └── utils.ts          # cn() utility function
└── styles/               # Additional styles
    └── globals.css       # Duplicate global styles
```

## Core Configuration Files

### package.json
- **Name**: my-project
- **Scripts**: dev, build, start, lint
- **Key Dependencies**:
  - `@radix-ui/*` - 30+ Radix UI primitives
  - `lucide-react` - Icon library
  - `class-variance-authority` - Component variants
  - `tailwind-merge` - Class merging utility
  - `react-hook-form` - Form handling
  - `zod` - Schema validation
  - `next-themes` - Theme management
  - `sonner` - Toast notifications
  - `recharts` - Data visualization

### tsconfig.json
- Target: ES6
- Module resolution: bundler
- Strict mode enabled
- Path aliases: `@/*` maps to project root

### next.config.mjs
- TypeScript build errors ignored
- Images unoptimized

### components.json
- Style: New York
- RSC: Enabled
- Tailwind CSS configuration
- Path aliases configured

## Main Application Files

### app/layout.tsx
- Root layout component
- Metadata configuration:
  - Title: "CheckMe - Smart Hostel & Mess Management System"
  - Description: Real-time hostel management system
  - Icons: Light/dark mode support
- Vercel Analytics integration
- Geist font family

### app/page.tsx
- Main landing page component (Client Component)
- Features a vibrant yellow/black design
- Key sections:
  - Header with logo and navigation
  - Getting Started card with stylus illustration
  - Feature cards (Real-Time Menu, Digital Attendance)
  - Project cards (Smart Analytics, Notice & Alerts)
  - Bottom navigation bar
- Uses Lucide React icons
- Responsive grid layout

### app/globals.css
- Tailwind CSS v4 configuration
- Custom color variables (OKLCH color space)
- Light/dark theme support
- Custom variants and theme configuration
- Base styles for border and outline

## Core Components

### Utility Components
- **Button** (`components/ui/button.tsx`) - Variants: default, destructive, outline, secondary, ghost, link
- **Card** (`components/ui/card.tsx`) - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Input** (`components/ui/input.tsx`) - Styled input field with validation states
- **Label** (`components/ui/label.tsx`) - Form labels with accessibility
- **Textarea** (`components/ui/textarea.tsx`) - Multi-line text input

### Form Components
- **Form** (`components/ui/form.tsx`) - React Hook Form integration with Zod validation
- **Select** (`components/ui/select.tsx`) - Dropdown selection component
- **Checkbox** (`components/ui/checkbox.tsx`) - Styled checkbox with check icon
- **Switch** (`components/ui/switch.tsx`) - Toggle switch component

### Data Display
- **Table** (`components/ui/table.tsx`) - Data table with header, body, rows, cells
- **Badge** (`components/ui/badge.tsx`) - Status badges with variants
- **Alert** (`components/ui/alert.tsx`) - Alert messages with title/description
- **Progress** (`components/ui/progress.tsx`) - Progress bar component

### Feedback & Interaction
- **Dialog** (`components/ui/dialog.tsx`) - Modal dialogs with overlay
- **Tooltip** (`components/ui/tooltip.tsx`) - Hover tooltips
- **Toast** (`components/ui/toast.tsx`) - Notification toasts
- **Toaster** (`components/ui/toaster.tsx`) - Toast container
- **Sonner** (`components/ui/sonner.tsx`) - Alternative toast system
- **Spinner** (`components/ui/spinner.tsx`) - Loading spinner

### Layout & Navigation
- **Tabs** (`components/ui/tabs.tsx`) - Tabbed interface
- **Accordion** (`components/ui/accordion.tsx`) - Collapsible sections
- **Navigation Menu** (`components/ui/navigation-menu.tsx`) - Navigation menus
- **Breadcrumb** (`components/ui/breadcrumb.tsx`) - Breadcrumb navigation
- **Pagination** (`components/ui/pagination.tsx`) - Pagination controls

### Advanced Components
- **Calendar** (`components/ui/calendar.tsx`) - Date picker
- **Chart** (`components/ui/chart.tsx`) - Data visualization wrapper
- **Carousel** (`components/ui/carousel.tsx`) - Image/content carousel
- **Command** (`components/ui/command.tsx`) - Command palette
- **Drawer** (`components/ui/drawer.tsx`) - Slide-out panels
- **Sheet** (`components/ui/sheet.tsx`) - Side panels
- **Popover** (`components/ui/popover.tsx`) - Popover dialogs
- **Dropdown Menu** (`components/ui/dropdown-menu.tsx`) - Dropdown menus

## Utility Functions

### lib/utils.ts
- `cn(...inputs: ClassValue[])` - Class name merging utility using `clsx` and `tailwind-merge`

## Custom Hooks

### hooks/use-mobile.ts
- `useIsMobile()` - Detects mobile viewport (768px breakpoint)

### hooks/use-toast.ts
- `useToast()` - Toast notification management
- `toast()` - Toast creation function
- State management for toast notifications

## Theme System

### components/theme-provider.tsx
- Wrapper for `next-themes` ThemeProvider
- Enables light/dark theme switching

## Styling System

### Design Tokens
- **Colors**: OKLCH color space with light/dark variants
- **Typography**: Geist font family
- **Spacing**: Consistent padding/margin system
- **Radius**: Configurable border radius
- **Shadows**: Custom shadow system

### Component Styling
- Data attributes for styling (`data-slot`)
- CSS variables for theming
- Responsive design patterns
- Accessibility-focused styling

## Key Features Implemented

1. **Responsive Design** - Mobile-first approach with mobile detection
2. **Dark Mode** - Complete light/dark theme support
3. **Component Library** - 50+ production-ready UI components
4. **Form Validation** - Zod schema validation with React Hook Form
5. **Toast Notifications** - Multiple notification systems (Radix UI + Sonner)
6. **Accessibility** - Proper ARIA labels and keyboard navigation
7. **Type Safety** - Full TypeScript support throughout
8. **Performance** - Optimized with Next.js 16 features

## Development Setup

1. Install dependencies: `pnpm install`
2. Run development server: `pnpm dev`
3. Build for production: `pnpm build`
4. Start production server: `pnpm start`

## Notable Patterns

- **Component Composition** - Reusable component patterns
- **Props Spreading** - Consistent prop handling
- **Forward Refs** - Proper ref forwarding for DOM access
- **Conditional Rendering** - Clean conditional logic
- **State Management** - Custom hooks for business logic
- **Error Handling** - Proper error boundaries and validation

## Future Considerations

- API integration points
- Database schema design
- Authentication system
- Real-time features with WebSockets
- Mobile app development
- Admin dashboard
- Student/warden role-based access

---
*Last indexed: February 17, 2026*