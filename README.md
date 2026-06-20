# Solum — Native Desktop Moodboard

A minimalist, local-first moodboard application that organizes visual inspiration.

Solum runs on Obsidian's vault pattern: select any local folder to use as a workspace. Subfolders represent **Vaults**, and image or PDF files within them serve as **Photos**. The application writes all operations directly to your filesystem without cloud synchronization, accounts, or proprietary locks.

Built with React, TypeScript, Tailwind CSS v4, and Electron.

## Features

- **Local Workspaces**: Open any local directory as a creative canvas.
- **Direct Filesystem Access**: Write create, rename, and delete actions directly to disk.
- **Drag-and-Drop Import**: Move images from your desktop or file explorer into a vault.
- **Lightbox Navigation**: Cycle through full-screen previews using the `←` / `→` arrow keys or the overlay buttons. Press `Esc` to exit.
- **Multi-Format Support**: Render PNG, JPG, JPEG, GIF, SVG, WebP, and PDF files.
- **Thumbnail Fit Toggle**: Toggle between `cover` (fill) and `contain` (fit) modes for thumbnails.
- **Adjustable Interface**: Customize font sizes, grid density, and thumbnail sizes.
- **Theming**: Zinc color scheme with automatic light and dark mode toggles.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
git clone https://github.com/David-bit986/solum-app.git
cd solum-app
npm install
```

### Run in Development

```bash
npm run dev
```

This command starts the Vite development server and launches Electron.

## Project Structure

```
solum-app/
├── electron/
│   ├── main.ts                # Main process (dialogs, file systems, protocols)
│   ├── main.test.ts           # IPC handlers and protocol tests
│   ├── preload.ts             # Safe context bridge definitions
│   └── path-utils.ts          # Safe file URL utilities
│
├── src/
│   ├── main.tsx               # Entrypoint
│   ├── App.tsx                # App router and drag-and-drop state
│   ├── index.css              # Custom variables and design tokens
│   │
│   ├── types/
│   │   ├── solum.ts           # Data models (Vault, Photo)
│   │   └── electron.d.ts      # IPC bridge types
│   │
│   └── components/
│       ├── shell/
│       │   └── AppShell.tsx   # Header and settings menu
│       └── sections/
│           ├── VaultsDashboard.tsx       # Vault catalog grid
│           ├── VaultsDashboard.test.tsx  # Dashboard unit tests
│           ├── MoodboardGrid.tsx        # Photos grid and lightbox
│           └── MoodboardGrid.test.tsx   # Moodboard unit tests
│
└── package.json
```

## Build & Package

### Production Compilation

```bash
npm run build
```

This compiles frontend code into `dist/` and Electron files into `dist-electron/`.

### Package Executable

Package the application for specific operating systems:

```bash
# Windows (.exe)
npm run package:win

# macOS (.app)
npm run package:mac

# Linux
npm run package:linux

# All Platforms
npm run package:all
```

The build output displays in the `release/` directory.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `←` | Previous photo (in lightbox) |
| `→` | Next photo (in lightbox) |
| `Esc` | Close lightbox |

## Technical Stack

- **Framework**: React 19 and TypeScript
- **Styling**: Tailwind CSS v4
- **Desktop Wrapper**: Electron 34
- **Bundler**: Vite
- **Testing**: Vitest

## License

MIT
