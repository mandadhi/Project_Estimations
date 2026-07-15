---
name: frontend-agent
description: Guidelines for AI agents working on the Project Estimation Tool frontend
version: 1.0.0
---

# Project Estimation Tool - Frontend Agent Guidelines

## 1. Project Overview

A **Project Estimation Tool** that allows users to create and manage project estimates. The application provides:

- **Authentication flow**: Login, Signup, and Forgot Password screens
- **Project management**: Create projects with name, client, and description
- **Sidebar navigation**: Hierarchical project tree with expandable sections (Modules, Assumptions, Risks, Review Document, Export)
- **AI-powered input**: Text area with file drag-and-drop for client requirements
- **Document uploads**: Support for PDF, DOC, and DOCX attachments

The app is currently a frontend-only SPA with no backend integration; authentication flows navigate between routes without server calls.

---

## 2. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.7 | UI framework |
| React DOM | ^19.2.7 | DOM rendering |
| React Router DOM | ^7.18.1 | Client-side routing |
| Vite | ^8.1.1 | Build tool and dev server |
| Tailwind CSS | ^4.3.2 | Utility-first CSS framework |
| @tailwindcss/vite | ^4.3.2 | Tailwind Vite plugin |
| Lucide React | ^1.24.0 | Icon library |
| ESLint | ^10.6.0 | Linting |
| eslint-plugin-react-hooks | ^7.1.1 | React hooks lint rules |
| eslint-plugin-react-refresh | ^0.5.3 | Fast refresh lint rules |
| @vitejs/plugin-react | ^6.0.3 | React support for Vite |
| babel-plugin-react-compiler | ^1.0.0 | React Compiler (automatic memoization) |
| @rolldown/plugin-babel | ^0.2.3 | Babel integration via Rolldown |

**Language**: JavaScript (JSX) - no TypeScript configured  
**Module system**: ES Modules (`"type": "module"`)  
**Node package manager**: npm (package-lock.json present)

---

## 3. Build Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

> **Note**: No test runner is currently configured. If adding tests, use Vitest (recommended for Vite projects).

---

## 4. Coding Style

### 4.1 File & Naming Conventions

- **Components directory**: `src/Components/` (PascalCase folder name)
- **Component files**: PascalCase (e.g., `CreateProjectDialog.jsx`, `HomeContent.jsx`)
- **Non-component files**: camelCase (e.g., `main.jsx`, `index.css`)
- **File extension**: `.jsx` for all React components
- **Exports**: Each component file has a single default export matching the component name

### 4.2 Component Structure

- **Function declarations** preferred over arrow function components:
  ```jsx
  function ComponentName({ prop1, prop2 }) {
    // hooks first
    // handler functions
    // early returns for conditional rendering
    // main return
  }
  export default ComponentName;
  ```
- **Props**: Destructured in function parameters
- **State management**: React `useState` hooks only (no external state library)
- **Routing**: React Router v7 with `BrowserRouter`, `Routes`, `Route`
- **Multiple components per file**: Allowed for small helper components (e.g., `ProjectItem` and `SidebarItem` in `Sidebar.jsx`), but primary component is the default export

### 4.3 Styling

- **Tailwind CSS v4** exclusively via utility classes in `className`
- **No CSS modules or styled-components**
- Multi-line `className` strings using template literals for complex layouts:
  ```jsx
  className="
    flex
    items-center
    gap-2
    w-full
    px-2
    py-1.5
  "
  ```
- **Color palette**: Slate (text/borders), Blue (primary/accent), White (backgrounds)
- Global CSS imports only `@import "tailwindcss"` in `index.css`

### 4.4 Event Handling

- Inline arrow functions for simple handlers: `onClick={() => setShowCreate(false)}`
- Named handler functions for form submissions: `handleLogin`, `handleSignup`, `handleSubmit`
- `e.preventDefault()` for form submit handlers

### 4.5 Icons

- Use `lucide-react` exclusively for icons
- Import individual icons: `import { Plus, X, Folder } from "lucide-react"`
- Size prop for consistent sizing: `<Plus size={18} />`

### 4.6 Error Handling

- No error boundaries or try/catch blocks currently implemented
- When adding error handling, use:
  - React Error Boundaries for component-level failures
  - Try/catch in async functions
  - User-friendly error messages displayed inline (not `alert()`)

### 4.7 Code Formatting

- 2-space indentation
- Double quotes for JSX string attributes and imports
- Semicolons at end of statements
- Generous vertical whitespace between logical sections
- JSX comments using `{/* ... */}`

---

## 5. Boundaries

### Allowed to write

| Path | Purpose |
|---|---|
| `src/` | All application source code |
| `src/Components/` | React components |
| `src/hooks/` | Custom React hooks (create if needed) |
| `src/utils/` | Utility/helper functions (create if needed) |
| `src/services/` | API service layers (create if needed) |
| `src/context/` | React Context providers (create if needed) |
| `src/assets/` | Static assets like images/fonts (create if needed) |
| `public/` | Static public assets (favicon, icons) |
| `index.html` | Entry HTML file |
| `vite.config.js` | Vite configuration |
| `eslint.config.js` | ESLint configuration |
| `package.json` | Dependencies and scripts |
| `tests/` or `__tests__/` | Test files (create if needed) |

### Never touch

| Path | Reason |
|---|---|
| `node_modules/` | Auto-generated by npm |
| `package-lock.json` | Auto-generated; only modify via `npm install` |
| `dist/` | Build output; regenerated on `npm run build` |
| `.env` / `.env.*` | Secrets and environment variables |
| `.git/` | Git internals |
| `.vscode/` | Editor-specific settings |

### Rules

1. Never commit secrets, API keys, or credentials into source code
2. Never modify `node_modules/` or `dist/` directly
3. Always run `npm run lint` after making changes to verify no lint errors
4. Prefer creating new component files over making existing components overly complex
5. Keep components focused on a single responsibility
6. When adding new routes, register them in `src/App.jsx`
7. When adding new dependencies, use `npm install <package>` (not yarn or pnpm)
