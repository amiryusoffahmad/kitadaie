
# Project Overview

This is a Next.js web application called "Kita Daie". It's a Progressive Web App (PWA) built with React, Tailwind CSS, and a variety of other modern web technologies. The application uses a MySQL database for its backend, with `knex` as the query builder.

## Key Technologies

*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui, Radix UI
*   **Database:** MySQL with `knex`
*   **State Management:** React Query, Zustand
*   **Forms:** React Hook Form
*   **Authentication:** `better-auth`
*   **PWA:** `next-pwa`

## Architecture

The project follows a standard Next.js `app` directory structure.

*   `src/app`: Contains the main application routes and layouts.
    *   `src/app/(admin)`: Admin-only routes.
    *   `src/app/(auth)`: Authentication-related routes (e.g., sign-in).
    *   `src/app/(user)`: User-facing routes.
    *   `src/app/api`: API routes for server-side logic.
*   `src/components`: Reusable React components.
*   `src/lib`: Core libraries and utilities, including database connection (`db.js`) and authentication (`auth.js`).
*   `src/providers`: Application-wide context providers (Theme, React Query, etc.).
*   `src/server`: Server-side actions and logic.

# Building and Running

## Prerequisites

*   Node.js
*   npm, yarn, pnpm, or bun
*   A running MySQL database instance.

## Configuration

1.  Create a `.env.local` file in the root of the project.
2.  Add the following environment variables to the `.env.local` file, replacing the placeholder values with your actual database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kitadaie
```

## Installation

```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
npm run build
```

## Starting the Production Server

```bash
npm run start
```

# Development Conventions

*   **Styling:** Use Tailwind CSS utility classes for styling.
*   **Components:** Create reusable components in the `src/components` directory.
*   **State Management:** Use React Query for server state and Zustand for client state.
*   **Server-Side Logic:** Place server-side logic in the `src/server` directory and API routes in `src/app/api`.
*   **Linting:** Run `npm run lint` to check for code quality issues.
