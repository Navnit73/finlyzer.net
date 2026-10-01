# Finlyzer (Next.js + DaisyUI)

A modern web application built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, and **DaisyUI v5**.

## Features

- ⚡ **Next.js 16 App Router** with React 19 & Turbopack
- 🎨 **DaisyUI v5 & Tailwind CSS v4** for clean, utility-first component styling
- 🌈 **Theme Switching Support** with multiple pre-configured themes (`light`, `dark`, `emerald`, `synthwave`, `dracula`, `luxury`, `night`, etc.)
- 🛡️ **TypeScript** & **ESLint** configured
- 🧩 **Lucide React Icons**

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## DaisyUI Configuration

DaisyUI is loaded via `@plugin "daisyui"` in `src/app/globals.css`.

To customize themes or add new ones, update `src/app/globals.css`:

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, emerald, synthwave, dracula, luxury, night;
}
```

# finlyzer.net
