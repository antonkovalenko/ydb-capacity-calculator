# Testing Guide

## Quick Start

### Run Smoke Tests (Browser-based)
1. Open `test-runner.html` in your browser
2. Click "▶ Run All Tests"
3. View results instantly

### Run Unit Tests (Node.js)
```bash
npm test
```

## Test Coverage

### Smoke Tests (`test-runner.html`)
✅ **32 automated tests** covering:
- Core calculation functions (9 tests)
- Mode switching (2 tests)
- Input validation (4 tests)
- Reserved resources (6 tests)
- Storage groups (5 tests)
- Edge cases (4 tests)
- Integration tests (2 tests)

**Execution time**: ~50-200ms  
**Dependencies**: None (runs in browser)

### Unit Tests (`test/calculations.test.js`)
✅ Node.js-based unit tests for core functions

## When to Run Tests

### During Development
- After every code change
- Before committing code
- When adding new features

### Before Deployment
```bash
# 1. Run smoke tests
open test-runner.html

# 2. Run unit tests
npm test

# 3. Deploy if all pass
./deploy.sh
```

## Test Documentation

For detailed information, see:
- [Smoke Tests Documentation](docs/smoke-tests.md) - Complete guide
- [Test Results](docs/test-results.md) - Historical test results

## Troubleshooting

### Smoke Tests Not Running
- Check browser console (F12)
- Verify `js/core.js` is loaded
- Try a different browser

### Unit Tests Failing
```bash
# Reinstall dependencies
npm install

# Run tests with verbose output
npm test -- --verbose
```

## Adding New Tests

### Add to Smoke Tests
Edit `test-runner.html` and add to the appropriate suite:

```javascript
runner.suite('My Suite', [
    {
        name: 'My test',
        fn: () => {
            const result = myFunction();
            assertEqual(result, expected);
        }
    }
]);
```

### Add to Unit Tests
Edit `test/calculations.test.js` and add new test cases.

## CI/CD Integration

The smoke tests can be automated using headless browsers:

```bash
# Example with Puppeteer
npx puppeteer test-runner.html
```

For production CI/CD, consider:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

## Support

Issues with tests? Check:
1. Browser console for errors
2. [Smoke Tests Documentation](docs/smoke-tests.md)
3. Verify code changes didn't break core functions