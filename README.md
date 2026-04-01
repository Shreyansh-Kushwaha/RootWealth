# Mutual Fund Tracker

A privacy-first mutual fund dashboard for Indian investors built with Next.js App Router, Tailwind CSS, and MongoDB.

## Features

- Add SIP or Lumpsum investments manually
- Fetch historical NAV data from `mfapi.in`
- Simulate exact SIP unit accumulation with business-day handling
- Calculate FIFO-style LTCG / STCG exposure
- Detect portfolio overlap between two funds using mocked holdings
- High-contrast, accessible dashboard UI for older users

## Setup

1. Copy `.env.local.example` to `.env.local`
2. Set `MONGODB_URI` to your MongoDB connection string
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

- `GET /api/search?q=...` — search mutual funds by name
- `GET /api/portfolios` — list saved portfolios with simulation
- `POST /api/portfolios` — create an investment entry
- `DELETE /api/portfolios/:id` — remove an investment
- `POST /api/overlap` — compare holdings overlap between two funds

## Notes

- The app uses `mfapi.in` for historical NAV data.
- Overlap detection uses mocked holdings for MVP results.

