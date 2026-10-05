# HeavyMeta UI

Separate React + TypeScript + Vite + Tailwind frontend workspace. Backend: `/home/jc/Documents/HeavyMeta`; Web/BFF listens on port 5100.

Open `HeavyMeta.UI.code-workspace` in VS Code or another compatible editor.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Run `npm run build` for typechecking and static output in `dist/`; `npm run lint` for lint checks. Node 24 was used for setup. Commit the package lock; ignore node_modules, dist and local secrets.

The initial screen is an explicitly labeled preview, with no fake decks, login or save behavior. Development `/api` requests are configured to proxy to the BFF on localhost:5100; the screen does not call an API yet. The backend is not required to view it. Production hosting must route `/api` to the BFF separately; Vite’s development proxy is not deployed with dist.

Next: implement and verify a small BFF API contract, then build the reusable Catalog card picker. Keep tokens server-side in the BFF and business rules in the domain services.
