# AI Context Constraints

- The project runs with Docker Compose as the primary runtime (`docker compose up --build`).
- Gunicorn is the production WSGI server; Flask dev server is for local-only use.
- Keep HTTP handlers thin and side-effect free except request/response mapping.
- Place domain behavior in app/services modules.
- Preserve deterministic app composition in app/__init__.py.
- Prefer explicit imports and stable module boundaries.
- Avoid hidden global state outside extension initialization.
