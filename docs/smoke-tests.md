# YDB Capacity Calculator - Smoke Tests

## Overview

The YDB Capacity Calculator includes a comprehensive browser-based smoke test suite that validates core functionality without requiring any external dependencies or build tools.

## Running the Tests

### Quick Start

1. Open `test-runner.html` in your web browser
2. Click the "▶ Run All Tests" button
3. View the results in real-time

### Opening the Test Runner

You can open the test runner in several ways:

**Option 1: Direct File Access**
```bash
# macOS
open test-runner.html

# Linux
xdg-open test-runner.html

# Windows
start test-runner.html
```

**Option 2: Local Web Server**
```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then navigate to: `http://localhost:8000/test-runner.html`

**Option 3: VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `test-runner.html`
- Select "Open with Live Server"

## Test Coverage

The smoke test suite covers the following areas:

### 1. Core Calculation Functions (9 tests)
- Storage server calculations (HDD and NVMe)
- CPU cores server calculations
- RAM server calculations
- Dominant resource identification
- Minimum server count enforcement
- Provided capacity calculations

### 2. Mode Switching (2 tests)
- Initial mode verification
- Button text updates on mode change

### 3. Input Validation (4 tests)
- Positive cores per server validation
- Positive RAM per server validation
- VDisks per PDisk range validation (HDD and NVMe)

### 4. Reserved Resources Calculation (6 tests)
- System core reservation (2 cores)
- NVMe core reservation (6 cores per device)
- HDD core reservation (0.5 cores per device)
- System RAM reservation (4 GB)
- NVMe RAM reservation (6 GB per device)
- HDD RAM reservation (2 GB per device)

### 5. Storage Group Calculations (5 tests)
- Storage group size (9 VDisks)
- Minimum reserve (18 VDisks)
- Reserve percentage (1%)
- Reserve calculation for various cluster sizes

### 6. Edge Cases and Boundary Conditions (4 tests)
- Zero storage requirements
- Zero compute requirements
- Minimum server count (9 servers)
- Large server counts
- Insufficient resources per server

### 7. Integration Tests (2 tests)
- Complete servers-needed calculation flow
- Complete resources-provided calculation flow

## Test Results

### Understanding the Results

The test runner displays:

- **Total Tests**: Number of tests executed
- **Passed**: Number of successful tests (green)
- **Failed**: Number of failed tests (red)
- **Duration**: Total execution time in milliseconds

### Test Status Indicators

- ✓ **Passed** (green): Test completed successfully
- ✗ **Failed** (red): Test failed with error details
- **Running** (yellow): Test is currently executing

### Viewing Details

- Click on a test suite header to expand/collapse test details
- Failed tests show error messages with expected vs. actual values
- Use "Expand/Collapse All" to toggle all suites at once

## Test Framework

The test runner includes a lightweight testing framework with the following utilities:

### Assertion Functions

```javascript
// Basic assertion
assert(condition, message)

// Equality assertion
assertEqual(actual, expected, message)

// Approximate equality (for floating-point comparisons)
assertApproxEqual(actual, expected, tolerance, message)

// Greater than assertion
assertGreaterThan(actual, expected, message)
```

### Example Test

```javascript
runner.suite('My Test Suite', [
    {
        name: 'Test description',
        fn: () => {
            const result = myFunction(input);
            assertEqual(result, expectedValue, 'Should return expected value');
        }
    }
]);
```

## Adding New Tests

To add new tests to the suite:

1. Open `test-runner.html` in a text editor
2. Locate the test suites section (search for `runner.suite`)
3. Add a new suite or add tests to an existing suite:

```javascript
runner.suite('New Test Suite', [
    {
        name: 'New test case',
        fn: () => {
            // Your test code here
            const result = someFunction();
            assertEqual(result, expectedValue);
        }
    }
]);
```

4. Save the file and refresh the browser
5. Run the tests to verify your new tests work

## Continuous Testing

### After Code Changes

After making changes to the calculator code:

1. Save your changes to `js/calculator.js` or `js/core.js`
2. Refresh the test runner page in your browser
3. Click "Run All Tests" to verify nothing broke
4. Review any failed tests and fix issues

### Best Practices

- Run tests after every significant code change
- Add new tests when adding new features
- Update tests when changing existing functionality
- Keep the test runner open in a separate browser tab during development

## Troubleshooting

### Tests Not Running

**Problem**: Clicking "Run All Tests" does nothing

**Solutions**:
- Check browser console for JavaScript errors (F12 → Console)
- Ensure `js/core.js` is loaded correctly
- Verify the file path is correct relative to the test runner

### All Tests Failing

**Problem**: Every test shows as failed

**Solutions**:
- Verify `js/core.js` contains the calculation functions
- Check that functions are properly exported
- Ensure no syntax errors in the core JavaScript files

### Specific Test Failures

**Problem**: One or more specific tests fail

**Solutions**:
- Read the error message carefully
- Check if the expected values in the test match the business rules
- Verify the calculation logic in `js/core.js`
- Update test expectations if business rules have changed

### Browser Compatibility

The test runner works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

**Note**: Internet Explorer is not supported.

## Integration with Development Workflow

### Pre-Commit Testing

Before committing code changes:

```bash
# 1. Make your changes
# 2. Open test-runner.html in browser
# 3. Run all tests
# 4. Verify all tests pass
# 5. Commit your changes
git add .
git commit -m "Your commit message"
```

### Code Review

When reviewing pull requests:
1. Check out the branch
2. Run the smoke tests
3. Verify all tests pass
4. Review any new tests added

## Performance

The test suite is designed to run quickly:
- **Typical execution time**: 50-200ms
- **Number of tests**: 32 tests across 7 suites
- **No external dependencies**: Runs entirely in the browser

## Limitations

The smoke tests focus on:
- ✅ Core calculation logic
- ✅ Business rule validation
- ✅ Edge case handling
- ✅ Integration between components

The smoke tests do NOT cover:
- ❌ UI interactions (clicking buttons, filling forms)
- ❌ Visual appearance and styling
- ❌ Browser-specific behavior
- ❌ Performance under load
- ❌ Network requests or API calls

For comprehensive UI testing, consider using tools like Selenium, Playwright, or Cypress.

## Future Enhancements

Potential improvements to the test suite:

1. **UI Testing**: Add tests that interact with the actual DOM
2. **localStorage Testing**: Verify data persistence
3. **Visual Regression**: Screenshot comparison tests
4. **Performance Testing**: Measure calculation speed
5. **Accessibility Testing**: ARIA and keyboard navigation
6. **Cross-browser Testing**: Automated testing across browsers

## Support

If you encounter issues with the test suite:

1. Check this documentation first
2. Review the browser console for errors
3. Verify your changes didn't break the core functions
4. Create an issue with:
   - Browser and version
   - Test failure details
   - Steps to reproduce

## Summary

The smoke test suite provides:
- ✅ Fast feedback on code changes
- ✅ No setup or dependencies required
- ✅ Easy to run and understand
- ✅ Comprehensive coverage of core functionality
- ✅ Clear pass/fail indicators
- ✅ Detailed error messages

Run the tests frequently to catch issues early and maintain code quality!