# Finn desktop (Tauri 2)

Wraps `web/` and talks to the FastAPI backend on `http://127.0.0.1:8766`.

```bash
cd web && npm install && npm run build
cd ../desktop && npm install
npm run tauri dev
```

## Windows: `PluginInitialization("notification", ... expected unit)`

`desktop/src-tauri/tauri.conf.json` must **not** contain a `"plugins"` key.

Delete this if you still have it:

```json
  "plugins": {
    "notification": {},
    "global-shortcut": {}
  }
```

Tauri 2 deserializes those plugin configs as unit (`()`). An empty object `{}` is a map, so the app panics before the window opens. Shortcuts are registered in `src-tauri/src/lib.rs`.
