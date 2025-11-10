# Quick Reference: Testing & Quality Commands

## Frontend (Dreamxstore)

### Setup
```bash
cd Dreamxstore
npm install
```

### Code Quality
| Command | Purpose |
|---------|---------|
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix style issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (no changes) |
| `npm run type-check` | TypeScript type checking |

### Testing
| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode (auto-rerun) |
| `npm run test:coverage` | Generate coverage report |

### Development
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (port 3001) |
| `npm run build` | Build for production |
| `npm start` | Start production server |

---

## Backend (API-Backend)

### Setup
```bash
cd API-Backend
npm install
```

### Code Quality
| Command | Purpose |
|---------|---------|
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix style issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (no changes) |

### Testing
| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode (auto-rerun) |
| `npm run test:coverage` | Generate coverage report |

### Development
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with nodemon |
| `npm start` | Start production server |

---

## Recommended Workflow

### Before Committing
```bash
# 1. Auto-fix everything
npm run lint:fix
npm run format

# 2. Run tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Type check (TS projects)
npm run type-check
```

### During Development
```bash
# Terminal 1: Watch tests
npm run test:watch

# Terminal 2: Dev server
npm run dev

# Terminal 3: Code editing (VSCode auto-format on save)
```

---

## Configuration Files

### Frontend
- `.eslintrc.json` - ESLint rules
- `.prettierrc.json` - Code formatting
- `jest.config.js` - Test runner
- `jest.setup.js` - Test setup
- `tsconfig.json` - TypeScript

### Backend
- `.eslintrc.json` - ESLint rules
- `.prettierrc.json` - Code formatting
- `jest.config.js` - Test runner

---

## File Locations for Tests

### Frontend
```
src/
├── components/
│   └── __tests__/
│       └── ComponentName.test.tsx
├── lib/
│   ├── api/
│   │   └── __tests__/
│   │       └── errorHandler.test.ts
│   └── ...
└── ...
```

### Backend
```
controllers/
├── __tests__/
│   ├── admin.test.js
│   └── auth.test.js
├── admin.js
└── auth.js
```

---

## Key ESLint Rules

### Enforced
- ✅ No unused variables
- ✅ Use `const`/`let` (no `var`)
- ✅ Always use semicolons
- ✅ Single quotes (not double)
- ✅ Trailing commas in multi-line
- ✅ No console.logs in production code
- ✅ Proper React hooks usage

### Warnings
- ⚠️ Console statements (except warn/error)
- ⚠️ Missing exhaustive dependencies in hooks

---

## Coverage Targets

### Frontend: 50%
- Statements: 50%
- Branches: 50%
- Functions: 50%
- Lines: 50%

### Backend: 40%
- Statements: 40%
- Branches: 40%
- Functions: 40%
- Lines: 40%

---

## Prettier Settings

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing commas**: ES5 style
- **Line width**: 100 characters
- **Line ending**: Unix (LF)

---

## Test Patterns

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### API Test
```javascript
describe('API', () => {
  it('returns data', async () => {
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

---

## Troubleshooting

### ESLint Errors
```bash
# Show all errors
npm run lint

# Auto-fix common issues
npm run lint:fix

# Check specific file
npx eslint path/to/file.ts
```

### Test Failures
```bash
# Run single test file
npm test -- ComponentName.test.tsx

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```

### Prettier Issues
```bash
# Check formatting
npm run format:check

# Fix all files
npm run format

# Format specific file
npx prettier --write path/to/file.ts
```

---

## Resources

- 📖 [Jest Docs](https://jestjs.io/)
- 📖 [Testing Library](https://testing-library.com/)
- 📖 [ESLint Docs](https://eslint.org/)
- 📖 [Prettier Docs](https://prettier.io/)
- 📖 [TypeScript Handbook](https://www.typescriptlang.org/)

---

**Last Updated**: 2024
**Status**: ✅ Ready to Use
