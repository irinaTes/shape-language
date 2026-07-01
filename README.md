# Shape Language

The website for **[Shape Language](https://shapelanguage.studio)** — a design studio site built with Next.js and Prismic CMS.

## Stack

- **[Next.js](https://nextjs.org/)** (App Router, Turbopack) — framework
- **[Prismic](https://prismic.io/)** — headless CMS and content modeling (Slice Machine)
- **[Three.js](https://threejs.org/)** / [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — particle and grid background visuals
- **[Framer Motion](https://www.framer.com/motion/)** — animations and page transitions
- **Tailwind CSS** — styling
- **Nodemailer** — the contact form's email delivery

## Getting started

Install dependencies:

```sh
npm install
```

Copy `.env.example` to `.env` and fill in the values (Prismic repository name and SMTP credentials for the contact form):

```sh
cp .env.example .env
```

Run the dev server (this also starts Slice Machine for content modeling):

```sh
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Slice Machine: [http://localhost:9999](http://localhost:9999)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server and Slice Machine together |
| `npm run build` | Generate the sitemap and build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the codebase with Prettier |
| `npm run generate-sitemap` | Regenerate `public/sitemap.xml` from Prismic content |

## Project structure

- `src/app` — routes, layouts, and API endpoints (contact form, Prismic preview)
- `src/components` — shared visual components (particle background, grid background, cursor trail, loading screen)
- `src/slices` — Prismic Slice components, generated and edited via Slice Machine
- `customtypes/` — Prismic custom type models
- `generate-sitemap.js` — build-time sitemap generator

## License

All rights reserved. See [LICENSE](./LICENSE).
