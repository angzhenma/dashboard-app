# SOC Dashboard (Prototype)

A prototype Security Operations Center (SOC) dashboard built with **Vite + React + TypeScript**.

 **Status:** Work in progress. See [Known Limitations / Next Steps](#known-limitations--next-steps) below. App may end up not used for initial use, in which case it can easily be pivoted for a wider range of use cases.

## Tech Stack

- **[Vite](https://vitejs.dev/)** - build tool / dev server
- **React** + **TypeScript**
- **[Tailwind CSS](https://tailwindcss.com/)** - styling, driven by CSS custom properties
- **[Recharts](https://recharts.org/)** - pie and bar charts
- **[@hello-pangea/dnd](https://dnd.hellopangea.com/)** - drag-and-drop Kanban board (maintained fork of `react-beautiful-dnd`)
- **[Lucide](https://lucide.dev/)** - icons

## Features

- **Kanban-style board:** three columns of cards, reorderable and movable between columns via drag-and-drop.
- **Add Card menu:** a `+` menu lets you add cards featuring a plethora of security data to the board.
- **Resizable cards:** individual cards can be toggled into a resizable state and expanded horizontally.
- **Responsive metric grid:** `MetricsCard` uses a CSS Grid with `auto-fit`/`minmax(280px, 1fr)`, so its internal columns respond to the card's width when resized.

## Data Layer

No backend yet. All data is served from an in-memory mock layer (`mockData.ts`) with simulated network delay via `setTimeout`.

`mockData.ts` exports a handful of functions (`fetchMockThreats`, `fetchDashboardMetrics`, `fetchThreatsTypeData`, etc.) that each return a `Promise` resolved after a short delay, simulating a real API. `useDashboardData.ts` calls all of them in parallel via `Promise.all` and exposes a single `loading` flag plus the resolved data to `Dashboard.tsx`.

Swapping in a real backend later should mostly mean rewriting `mockData.ts` to call actual endpoints. The hook and components shouldn't need to change since they already consume the data as if it were async.

## Known Limitations / Next Steps

- **No persistence:** board layout (which cards exist, their column/order) resets on page reload — it only lives in React state.
- **No backend:** all data is mocked; there's no real threat ingestion, auth, or API layer yet.
- **No tests:** no unit or integration tests currently exist for components or the data hook.
- **No user auth:** for a securirty dashboard application, it sure has no security itself — once this is added, different user roles and levels of administration can be added.
