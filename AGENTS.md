# Agent Guidelines
## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run check`
- Format: `npm run format`
- Lint: `npm run lint`
- Tests: none configured
- Single test: `npm run test -- -t '<pattern>'`
## Style
- Use biome format & lint (`biome format`, `biome lint`)
- Indent 2 spaces; semicolons required
- Single quotes for strings; double quotes for imports
- Group imports: external, blank line, internal
- File names: kebab-case modules; PascalCase components
- TS `type` imports for type-only imports
- Handle errors via try/catch or RxJS `catchError`
## Cursor & Copilot rules
- None detected
