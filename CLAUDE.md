# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational project teaching functional programming concepts in TypeScript. It consists of:
- Japanese documentation built with MkDocs
- TypeScript code examples demonstrating functional programming patterns
- Comprehensive test coverage using Jest

## Common Commands

### TypeScript Development (in `examples/` directory)
```bash
cd examples
npm install              # Install dependencies
npm run dev             # Run TypeScript files with ts-node
npm run build           # Compile TypeScript
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run lint            # Lint TypeScript files
npm run typecheck       # Type check without emitting files
```

### Documentation Development
```bash
pip install -r requirements.txt    # Install Python dependencies
mkdocs serve                       # Serve documentation locally at http://127.0.0.1:8000
mkdocs build                       # Build documentation for deployment
```

### Running Specific Tests
```bash
cd examples
npm test -- path/to/test.ts       # Run specific test file
npm test -- --coverage             # Run tests with coverage report
```

## Architecture

### Code Structure
- **examples/src/**: TypeScript implementation of functional programming concepts
  - Each chapter (chapter01-09) contains specific FP patterns and techniques
  - `index.ts` serves as the entry point with usage examples
  
### Documentation Structure  
- **docs/**: Japanese language documentation following a progressive learning path
  - Chapters 1-3: Basics (入門編)
  - Chapters 4-6: Fundamentals (基礎編)  
  - Chapters 7-9: Advanced (応用編)
  - appendix/: Reference materials and glossary

### Key Concepts Implemented
- Immutability and pure functions
- Higher-order functions
- Function composition and currying
- Functional data structures
- Error handling with Option/Result types
- Async programming in functional style

## TypeScript Configuration

This project uses very strict TypeScript settings:
- All strict mode flags enabled
- No implicit any
- Strict null checks
- Unused locals/parameters detection

When adding new code, ensure it passes these strict checks.

## Testing Approach

- Jest with ts-jest for TypeScript support
- Tests should be placed alongside source files as `*.test.ts` or `*.spec.ts`
- Focus on testing pure functions and functional transformations
- Coverage reports generated in text, lcov, and HTML formats

## Documentation Updates

When modifying code examples:
1. Update the corresponding TypeScript files in `examples/src/`
2. Run tests to ensure examples still work
3. Update documentation in `docs/` if the API or concepts change
4. Documentation uses MkDocs Material theme with code highlighting

## Important Notes

- This is an educational codebase - prioritize clarity over performance
- Code examples should demonstrate functional programming principles
- All documentation is in Japanese - maintain language consistency
- The project doesn't have ESLint configuration file despite having it in package.json