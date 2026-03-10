# React Router v5 → v6 Migration

The project currently uses `react-router-dom@^5.3.3`. React Router v6 has been available since 2021 and v7 since 2024. This file documents the required changes for the migration.

## Why migrate

- v5 is in maintenance-only mode.
- v6/v7 have significantly better type safety, nested route support, and data loading APIs.
- The `Switch` component was removed; route composition is cleaner in v6+.

## Key breaking changes (v5 → v6)

| v5 | v6 |
|---|---|
| `<Switch>` | `<Routes>` |
| `<Route component={Foo}>` | `<Route element={<Foo />}>` |
| `useHistory()` | `useNavigate()` |
| `<Redirect from="*" to="/">` | `<Route path="*" element={<Navigate to="/" />}>` |
| `<ProtectedRoute component={X} loggedIn={...}>` | Wrap with `<Navigate>` inside element |

## Files to update

1. **`src/components/App/App.js`** — Main router
   - Replace `import { Switch, Route, Redirect, useHistory }` with `import { Routes, Route, Navigate, useNavigate }`
   - Replace `<Switch>` with `<Routes>`
   - Replace all `<Route path="...">...</Route>` with `<Route path="..." element={<Component />} />`
   - Replace `const history = useHistory()` with `const navigate = useNavigate()`
   - Replace `history.push('/')` with `navigate('/')`
   - Replace `<Redirect from="*" to="/">` with `<Route path="*" element={<Navigate to="/" />} />`

2. **`src/components/ProtectedRoute/ProtectedRoute.js`** — Update to v6 pattern:
   ```jsx
   // v6 pattern
   import { Navigate } from 'react-router-dom';
   function ProtectedRoute({ loggedIn, children }) {
     return loggedIn ? children : <Navigate to="/sign-in" replace />;
   }
   ```
   And use it in App.js as:
   ```jsx
   <Route path="/myaccount" element={
     <ProtectedRoute loggedIn={loggedIn}>
       <MyAccount {...props} />
     </ProtectedRoute>
   } />
   ```

3. **`src/utils/auth.js`** — No router changes needed here.

## Install

```bash
npm install react-router-dom@^6
# or for v7:
npm install react-router-dom@^7
```

## Estimated effort

3–4 hours for a developer familiar with both v5 and v6 APIs.
