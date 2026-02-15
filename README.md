# Moving Helper

A Vite + React web app for organizing and tracking moving boxes with contents, generating printable labels and manifests.

🌐 **Live**: https://move.millward.dev

## Features

- **Box Management**: Track boxes by number and room assignment
- **Item Tracking**: Add items grouped under each box with auto-increment for box numbers
- **Packing Labels**: Generate and print customizable packing labels for each box
- **Moving Manifest**: Create a printable manifest listing all boxes and their contents
- **Data Persistence**: All data persists in localStorage
- **CSV Import/Export**: Export inventory as CSV or import from existing CSV files

## Privacy

✅ **Your data stays with you** - All information is stored locally in your browser's localStorage. Nothing is sent to a server or stored anywhere else. Your moving inventory is completely private.

## Routes

- `/` - Main dashboard with Add Box and Packing Labels tabs
- `/manifest` - Printable manifest of all boxes
- `/labels` - Packing labels generation and printing

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 + DaisyUI 5
- nuqs for URL-based state management
- Vitest for testing

## Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Lint code:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## CSV Format

The app exports in this format:

```csv
number,room,item
1,Kitchen,Plates
1,Kitchen,Cups
2,Bedroom,Lamp
```

- Header row is accepted but optional on import
- Rows are grouped by `number` on import
- Empty `item` values are allowed
