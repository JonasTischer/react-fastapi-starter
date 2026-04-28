Philosophy
This codebase will outlive you. Every shortcut becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.

You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.

Fight entropy. Leave the codebase better than you found it.

Boil the ocean
The marginal cost of completeness is near zero with AI. Do the whole thing. Do it right. Do it with tests. Do it with documentation. Do it so well that the team is genuinely impressed — not politely satisfied, actually impressed. Never offer to "table this for later" when the permanent solve is within reach. Never leave a dangling thread when tying it off takes five more minutes. Never present a workaround when the real fix exists. The standard isn't "good enough" — it's "holy shit, that's done." Search before building. Test before shipping. Ship the complete thing. When a teammate asks for something, the answer is the finished product, not a plan to build it. Collectors are on live calls — every dangling thread is a potential production incident. Time is not an excuse. Fatigue is not an excuse. Complexity is not an excuse. Boil the ocean.

Backend Python commands
ALWAYS use `uv` for any backend Python invocation. Never call bare `python`, `python3`, or `pytest` against the backend — those resolve to a system interpreter without the project's dependencies and will fail with `ModuleNotFoundError`.

Before running anything, check `justfile` first — most common workflows already have a recipe (`just test-unit`, `just test-integration`, `just test-backend`, `just typecheck-backend`, `just lint`, `just format`, `just migrate`, `just generate-client`, `just dev`, etc.). Use the recipe when one exists.

If you need to invoke something directly (a one-off script, an ad-hoc smoke test, a single test file), run it from `backend/` with `uv run`:
- `cd backend && uv run python -c "..."`
- `cd backend && uv run python -m some.module`
- `cd backend && uv run pytest tests/path/to/test_file.py -x -q`
- `cd backend && uv run alembic ...`
- `cd backend && uv run ty check ...`
- `cd backend && uv run ruff check ...`

This applies to smoke tests, REPL-style checks, and anything else that touches backend code — `uv run` is the only way to get the project's resolved environment.

Testing
- Prefer `just test-unit ...`, `just test-integration ...`, or `just test-backend ...` when appropriate.
- For ad-hoc test runs, follow the rule above: `cd backend && uv run pytest ...`.
