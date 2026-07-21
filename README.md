# SOC Dashboard (Prototype)

A prototype Security Operations Center (SOC) dashboard built with **Vite + React + TypeScript**.

 **Status:** Work in progress. See [Known Limitations / Next Steps](#known-limitations--next-steps) below.

 App may end up not used for initial use, in which case it can easily be pivoted and customized for a wider range of use cases.

## Tech Stack

- **[Vite](https://vitejs.dev/)** - build tool / dev server
- **React** + **TypeScript**
- **[Tailwind CSS](https://tailwindcss.com/)** - styling, driven by CSS custom properties
- **[Recharts](https://recharts.org/)** - pie and bar charts
- **[@hello-pangea/dnd](https://dnd.hellopangea.com/)** - drag-and-drop ability
- **[Lucide](https://lucide.dev/)** - icons

## Features

- **Kanban board structure:** three columns of cards, reorderable and movable between columns via drag-and-drop.
- **Add Card menu:** a `+` menu lets you add cards featuring a plethora of security data to the board.
- **Resizable cards:** individual cards can be toggled into a resizable state and expanded horizontally.
- **Responsive metric grid:** the cards use a CSS Grid with `auto-fit`/`minmax(280px, 1fr)`, so its internal columns respond to the card's width when resized.
- **Profile editing:** users are able to customize their own display name and change their password in-app.
- **User role assigning and creation:** this admin-only feature allows admin users to change any user's role and create new roles with custom persmissions.

## Known Limitations / Next Steps

- Actually fetch data from specified APIs (SentinelOne and Aruba Networking Central)
