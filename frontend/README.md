# JOE — Journal of Everything (Frontend)

React SPA for the JOE scientific publishing platform.

## Development

```bash
npm install
npm start        # dev server on http://localhost:3000
npm run build    # production build → ./build/
npm test         # run tests
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values before starting:

```
REACT_APP_API_URL=http://localhost:2000
```

## Project structure

```
src/
  components/     # React components (one directory per component)
  contexts/       # React Context providers
  utils/          # API client and auth helpers
  categories.js   # Research field taxonomy
```

## Notes

- Requires the JOE backend running on `REACT_APP_API_URL` (default: `http://localhost:2000`).
- Authentication uses HttpOnly cookies — no tokens in localStorage.
- TODO: Router migration from React Router v5 → v6 (see ROUTER_MIGRATION.md).
