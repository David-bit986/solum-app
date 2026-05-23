# Solum - Native Desktop Moodboard Application

Solum is a minimalist, local-first moodboard application designed to organize visual inspiration without distraction. It is inspired by Obsidian and built on top of **React**, **TypeScript**, **Tailwind CSS v4**, and **Electron**.

Like Obsidian, Solum loads a local directory workspace on your computer. Subfolders within that workspace are recognized as **Vaults**, and image files (PNG, JPG, JPEG, GIF, WEBP, SVG) inside those subfolders are rendered as **Photos**.

---

## Features

- **Obsidian-Style Workspace Picker**: Pick any directory on your computer to open as your active moodboard canvas.
- **Direct Filesystem Operations**: Creating, deleting, or renaming vaults and photos in the app writes those operations physically and instantly to your hard drive.
- **Drag and Drop Upload**: Drag images from your desktop or folder explorer directly into the app. They are copied straight into your chosen vault directory.
- **Dynamic settings panel**: Customize text font sizing via a slider and adjust folder/photo preview column dimensions dynamically.
- **Apple Aesthetics**: Sleek, warm zinc palettes, fine lines, macOS-style folder graphics, and distraction-free dark/light interfaces.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or copy the `solum-app` directory.
2. Open your terminal in the `solum-app` folder and run:
   ```bash
   npm install
   ```

### Running in Development

To start the Vite dev server and launch the Electron application together, run:
   ```bash
   npm run dev
   ```

---

## Codebase Architecture

```
solum-app/
├── package.json               # Scripts, Electron & dependencies
├── tsconfig.json              # App TypeScript specifications
├── tsconfig.electron.json     # Electron process TS specifications
├── vite.config.ts             # Vite configuration with Tailwind v4 & base settings
│
├── electron/
│   ├── main.ts                # Main process: secure OS filesystem dialogs & file copying
│   └── preload.ts             # Preload script: safe window.electronAPI bridge
│
└── src/
    ├── main.tsx               # Renderer application entrypoint
    ├── App.tsx                # Client router, landing portal, and state synchronization
    ├── index.css              # Tailwind CSS v4 entrypoint and visual variables
    │
    ├── types/
    │   ├── solum.ts           # Shared TypeScript models (Vault, Photo, props)
    │   └── electron.d.ts      # Window IPC bridge type declarations
    │
    └── components/
        ├── shell/             # App navigation header and appearance dropdown controls
        └── sections/          # VaultsDashboard and MoodboardGrid views
```

---

## Build and Package

To compile both the React frontend and the Electron main process, run:
```bash
npm run build
```

This compiles your frontend into `dist/` and your Electron processes into `dist-electron/`.

### Packaging as an Executable

To package the application as a standalone executable (`.exe` for Windows, `.app` for macOS), you can install `electron-builder` and run packaging scripts:

1. Install builder:
   ```bash
   npm install --save-dev electron-builder
   ```
2. Add build configuration to `package.json` and run:
   ```bash
   npx electron-builder
   ```
