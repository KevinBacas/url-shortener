# GitHub Copilot Instructions for Next.js Project

## General Guidelines

- Follow Next.js and React best practices.
- Use functional components and hooks where appropriate.
- Prefer TypeScript for type safety.
- Write clean, readable, and maintainable code.
- Add comments for complex logic.

## Folder Exclusions

- **Ignore all files in `src/components/ui/`**  
   This folder contains Shadcn UI components. Do not modify, suggest changes, or generate code for files in this directory.

## Testing

- Add unit and integration tests for new features.
- Use Jest and React Testing Library for testing.

## Styling

- Use Tailwind CSS for styling unless otherwise specified.

## Accessibility

- Ensure components are accessible (ARIA attributes, keyboard navigation, etc.).

## Performance

- Optimize for performance (code splitting, lazy loading, memoization).

## Documentation

- Document public APIs and complex components.

---

**Note:** Always skip code generation, suggestions, and refactoring for any file inside `src/components/ui/` (Shadcn folder).
