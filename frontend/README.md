# Snake Arena Frontend

The visual interface for Snake Arena, built with modern React standards.

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/)
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Testing**: Vitest + React Testing Library

## Project Structure

```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React Hooks (Game Logic)
│   ├── pages/        # Route Pages (Index, Auth, etc.)
│   ├── services/     # API Client (auth, leaderboard)
│   └── types/        # TypeScript Interfaces
├── public/           # Static Assets
└── vite.config.ts    # Bundler Config
```

## Setup & Development

1.  **Install Dependencies**:
    ```bash
    cd frontend
    npm install
    ```

2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:8080` (or the port shown in terminal).

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    Output is generated in `dist/`.

## Testing

Run the Vitest suite (including mocked API tests):

```bash
npm test
```

## Configuration

- **API Proxy**: The Vite config (`vite.config.ts`) proxies `/api` requests to the backend (default `http://localhost:8000`).
- **Styling**: Global styles are in `src/index.css`. Tailwind config in `tailwind.config.ts`.
