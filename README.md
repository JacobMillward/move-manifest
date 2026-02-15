# Moving Helper

Small Vite + React app to track moving boxes and their contents.

## Features

- Track boxes by Number and Room
- Add items grouped under each box
- Number input auto-increments to the next available box number, but stays editable
- Persist all data in localStorage
- Export all data to CSV
- Import CSV back into the app

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- DaisyUI 5

## Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
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
