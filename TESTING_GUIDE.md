# Testing & Code Quality Implementation Guide

## Installation

### Frontend (Dreamxstore)
```bash
cd Dreamxstore
npm install
```

### Backend (API-Backend)
```bash
cd API-Backend
npm install
```

---

## Available Commands

### Frontend

```bash
# Linting
npm run lint              # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues

# Formatting
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted

# Testing
npm test                 # Run Jest tests
npm run test:watch      # Watch mode for tests
npm run test:coverage   # Generate coverage report

# Type checking
npm run type-check      # TypeScript type checking

# Development
npm run dev             # Start dev server on port 3001
npm run build          # Build for production
npm start              # Start production server
```

### Backend

```bash
# Linting
npm run lint            # Run ESLint
npm run lint:fix       # Auto-fix ESLint issues

# Formatting
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted

# Testing
npm test              # Run Jest tests
npm run test:watch   # Watch mode for tests
npm run test:coverage # Generate coverage report

# Development
npm run dev           # Start dev server with nodemon
npm start            # Start production server
```

---

## Code Quality Standards

### 1. TypeScript (✅ Strict Mode)
- **Status**: Enabled globally
- **Configuration**: `tsconfig.json` with `strict: true`
- **Benefits**: Catches bugs at compile time, better IDE support

### 2. ESLint
- **Frontend**: Next.js recommended rules
- **Backend**: Standard Node.js rules
- **Enforces**:
  - No unused variables
  - Proper error handling
  - Consistent code style
  - React hooks best practices (frontend)

### 3. Prettier
- **Configuration**: `.prettierrc.json`
- **Enforces**:
  - Consistent indentation (2 spaces)
  - Single quotes
  - Semicolons
  - Trailing commas
  - Line width limit (100 characters)

### 4. Jest Testing

#### Frontend Test Structure
```typescript
// src/components/__tests__/ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

#### Backend Test Structure
```javascript
// controllers/__tests__/controllerName.test.js
describe('ControllerName', () => {
  it('should do something', () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
```

---

## Testing Coverage Goals

### Frontend
- **Target**: 50%+ coverage
- **Priority**: Critical UI components, API client
- **Tools**: Jest + React Testing Library

### Backend
- **Target**: 40%+ coverage
- **Priority**: Controllers, middleware, helpers
- **Tools**: Jest + Supertest

---

## Recommended Development Workflow

### Before Committing Code
```bash
# 1. Format code
npm run format

# 2. Run linter
npm run lint:fix

# 3. Type check (TypeScript projects)
npm run type-check

# 4. Run tests
npm test

# 5. Check coverage
npm run test:coverage
```

### Full Quality Check (CI/CD)
```bash
# Format check (no auto-fix)
npm run format:check

# Lint check (no auto-fix)
npm run lint

# Type check
npm run type-check

# Run all tests
npm test

# Generate coverage
npm run test:coverage
```

---

## Writing Tests

### Frontend Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  // Setup
  beforeEach(() => {
    // Setup code here
  });

  // Test cases
  it('renders with correct text', () => {
    render(<ComponentName text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  // Cleanup
  afterEach(() => {
    // Cleanup code here
  });
});
```

### Backend API Tests
```javascript
const request = require('supertest');
const app = require('../../app');

describe('API Endpoint', () => {
  it('returns 200 on successful request', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Authorization', 'Bearer token');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('returns 401 when unauthorized', async () => {
    const res = await request(app)
      .get('/api/endpoint');

    expect(res.statusCode).toBe(401);
  });
});
```

---

## Next Steps

### Phase 2: E2E Testing (Optional)
Add Playwright for user flow testing:
```bash
npm install --save-dev @playwright/test
```

### Phase 3: CI/CD Pipeline
Set up GitHub Actions to run tests on every commit/PR.

### Phase 4: Coverage Reports
Integrate coverage reports with code quality tools like Codecov.

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Documentation](https://prettier.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
