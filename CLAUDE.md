# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (default on port 3000)
- `npm run dev:turbo` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3001
- `npm run lint` - Run Next.js linting

## Architecture Overview

This is a Next.js 15 application using the App Router pattern with a multi-tenant architecture supporting both admin and user interfaces.

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **UI Library**: Shadcn UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Database**: MySQL with Knex.js query builder
- **Authentication**: Better Auth with Google OAuth support
- **State Management**: React hooks + Zustand for complex state
- **Data Fetching**: React Query (TanStack Query) for client-side data

### Application Structure

#### Route Groups
The application uses Next.js route groups to organize different user experiences:

- `(auth)` - Authentication pages (sign-in)
- `(admin)` - Admin dashboard with sidebar navigation
- `(user)` - Mobile-first user interface with bottom navigation
- `pentajmikan` - Standalone program management section

#### Key Directories

**Frontend Architecture:**
- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - Shadcn UI components (Button, Card, Dialog, etc.)
- `src/components/` - Custom reusable components
- `src/features/` - Feature-specific components and logic
- `src/hooks/` - Custom React hooks
- `src/providers/` - React context providers (auth, theme, notifications, etc.)

**Backend Architecture:**
- `src/server/actions/` - Server actions for data mutations
- `src/server/db/schema/` - Database schema definitions
- `src/lib/` - Utility functions and configuration
- `src/middleware.js` - Authentication and routing middleware

### Authentication & Authorization

The application uses Better Auth with the following configuration:
- Google OAuth integration
- Session-based authentication with secure cookies (prefix: "kitadaie")
- Role-based access control (admin/user roles)
- Automatic user role assignment on registration
- Protected routes via middleware

### Database Integration

- **ORM**: Knex.js with MySQL connection pooling
- **Connection**: Configured in `src/lib/db.js` with helper functions
- **Server Actions**: Database operations centralized in `src/server/actions/`
- **Migrations**: SQL schema in `kitadaie.sql`

### Mobile-First Design

The user interface (`(user)` route group) implements:
- Mobile-optimized layout with bottom navigation
- Screenshot prevention for security
- PWA capabilities with offline support
- Responsive design constrained to mobile viewport

### Key Features

**User Management:**
- Profile management with sections for personal info, education, family, certifications
- File upload system with PDF support
- Notification system with preferences

**Admin Dashboard:**
- Sidebar navigation with role-based access
- Program management (TPROG)
- User administration
- File upload management

**Programs & Training:**
- TPROG (Training Program) management
- Class and assignment tracking
- Student progress monitoring
- File submission and review system

### Development Patterns

**Component Conventions:**
- Use `.jsx` for React components, `.js` for utilities
- Named exports preferred over default exports
- Function declarations with explicit props destructuring
- "use client" directive for client components
- "use server" directive for server actions

**Code Organization:**
- Feature-based organization in `src/features/`
- Shared UI components in `src/components/ui/`
- Business logic in server actions
- Database queries centralized through Knex.js

**Error Handling:**
- Try/catch blocks in server actions
- Meaningful error messages returned to client
- Consistent error handling patterns

### Security Considerations

- Input validation on both client and server
- Prepared statements for database queries
- Session-based authentication with secure cookies
- Role-based route protection
- Screenshot prevention in sensitive areas

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot reloading
2. **Code Style**: Follow patterns in `.cursor/rules/kitadaie-rules.mdc`
3. **Database**: Ensure MySQL connection with environment variables
4. **Authentication**: Configure Google OAuth credentials for login
5. **Testing**: Run `npm run lint` before committing changes

This application serves as a comprehensive training and education management platform with distinct admin and user experiences, emphasizing mobile usability and secure data handling.