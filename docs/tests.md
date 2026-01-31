# YDB Capacity Calculator - Test Cases

## Overview
This document contains smoke test cases for the YDB Capacity Calculator application. Each user story has up to 3 test cases covering the most critical functionality.

**Test Execution**: These tests should be run manually through the web interface or automated using browser automation tools (see [Regression Testing Strategy](#regression-testing-strategy) below).

---

## Servers Needed Mode: Calculate Servers Needed

**User Story**: As a capacity planner, I want to define server configuration and capacity requirements so that I receive the number of servers required.

### Test Case 1.1: Basic Server Calculation with Storage Groups
**Objective**: Verify that the calculator correctly determines server count based on storage group requirements.

**Preconditions**: 
- Application is loaded
- "Calculate Servers Needed" mode is selected

**Test Steps**:
1. Enter server configuration:
   - Cores per server: `32`
   - RAM per server: `1024` GB
   - NVMe devices: `2`, size: `1` TB
   - HDD devices: `4`, size: `4` TB
   - VDisks per HDD PDisk: `8` (default)
   - VDisks per NVMe PDisk: `16` (default)
2. Enter capacity requirements:
   - HDD Storage Groups: `10`
   - NVMe Storage Groups: `5`
   - Database Cores: `100`
   - Database RAM: `5000` GB
3. Click "Calculate Servers"

**Expected Results**:
- Calculation completes without errors
- Results show servers required by each resource (storage, cores, RAM)
- Dominant resource is identified
- Final server count is displayed (minimum 12 servers)
- If calculated servers < 12, warning message appears: "Note: 12 is the minimum recommended cluster size."

---

### Test Case 1.2: Validation - At Least One Storage Type Required
**Objective**: Verify that validation prevents calculation when no storage is specified.

**Preconditions**: 
- Application is loaded
- "Calculate Servers Needed" mode is selected

**Test Steps**:
1. Enter server configuration:
   - Cores per server: `32`
   - RAM per server: `512` GB
   - NVMe devices: `0`
   - HDD devices: `0`
2. Enter capacity requirements:
   - HDD Storage Groups: `0`
   - NVMe Storage Groups: `0`
   - Database Cores: `50`
   - Database RAM: `250` GB
3. Click "Calculate Servers"

**Expected Results**:
- Error message appears: "At least one storage type (HDD or NVMe) must be specified."
- Calculation is blocked
- No results are displayed

---

### Test Case 1.3: Auto-fill RAM Based on Cores
**Objective**: Verify that RAM is automatically calculated when cores are entered.

**Preconditions**: 
- Application is loaded
- "Calculate Servers Needed" mode is selected

**Test Steps**:
1. Enter server configuration with valid values
2. In capacity requirements, enter Database Cores: `100`
3. Leave Database RAM field empty or `0`
4. Observe Database RAM field

**Expected Results**:
- Database RAM field is automatically filled with `500` GB (100 cores × 5 GB/core ratio)
- Auto-fill only occurs when RAM is empty or zero

---

## Resources Provided Mode: Calculate Capacity Provided

**User Story**: As a capacity planner, I want to specify server configuration and server count so that I receive the capacity provided.

### Test Case 2.1: Basic Capacity Calculation
**Objective**: Verify that the calculator correctly determines provided capacity for a given server configuration and count.

**Preconditions**: 
- Application is loaded
- "Calculate Capacity Provided" mode is selected

**Test Steps**:
1. Enter server configuration:
   - Cores per server: `32`
   - RAM per server: `1024` GB
   - NVMe devices: `2`, size: `1` TB
   - HDD devices: `4`, size: `4` TB
   - VDisks per HDD PDisk: `8`
   - VDisks per NVMe PDisk: `16`
2. Enter server count: `20`
3. Click "Calculate Capacity"

**Expected Results**:
- Results display two sections:
  - **Storage Capacity**: HDD Storage Groups and NVMe Storage Groups
  - **Database Capacity**: Database Cores and Database RAM
- All values are positive numbers
- Reserved resources breakdown is shown

---

### Test Case 2.2: Minimum Server Count Validation (9 servers)
**Objective**: Verify that calculation is blocked when server count is less than 9.

**Preconditions**: 
- Application is loaded
- "Calculate Capacity Provided" mode is selected

**Test Steps**:
1. Enter valid server configuration
2. Enter server count: `8`
3. Attempt to click "Calculate Capacity"

**Expected Results**:
- Calculate button is disabled
- Error message appears: "⚠️ Cannot calculate: Mirror-3dc configuration requires at least 9 servers to work. Please enter 9 or more servers."
- No calculation is performed

---

### Test Case 2.3: Warning for Server Count Between 9-11
**Objective**: Verify that a warning is shown for server counts between 9 and 11, but calculation proceeds.

**Preconditions**: 
- Application is loaded
- "Calculate Capacity Provided" mode is selected

**Test Steps**:
1. Enter valid server configuration
2. Enter server count: `10`
3. Click "Calculate Capacity"

**Expected Results**:
- Warning message appears: "Mirror-3dc configuration requires minimum 12 servers to work in production mode."
- Calculate button remains enabled
- Calculation proceeds and displays results
- Results are calculated using the entered server count (10)

---

## Config Summary Feature: Server Configuration Summary

**User Story**: As a capacity planner, I want to see a brief server configuration summary when the configuration form is hidden.

### Test Case 3.1: Configuration Summary Display
**Objective**: Verify that configuration summary appears when server configuration is hidden.

**Preconditions**: 
- Application is loaded
- Server configuration is entered

**Test Steps**:
1. Enter server configuration:
   - Cores per server: `32`
   - RAM per server: `1024` GB
   - NVMe devices: `2`, size: `1` TB
   - HDD devices: `4`, size: `4` TB
2. Click "Hide" button on server configuration section

**Expected Results**:
- Server configuration form is hidden
- Brief summary appears showing: "32 cores, 1024 GB RAM, 2x1TB NVMe, 4x4TB HDD"
- Summary is clickable to reopen configuration

---

### Test Case 3.2: Configuration Persistence
**Objective**: Verify that server configuration is saved to local storage and persists across page reloads.

**Preconditions**: 
- Application is loaded

**Test Steps**:
1. Enter server configuration with specific values
2. Reload the page (F5 or browser refresh)
3. Observe server configuration fields

**Expected Results**:
- All server configuration values are restored from local storage
- Values match what was entered before reload
- Configuration summary (if hidden) reflects saved values

---

### Test Case 3.3: Summary Updates on Configuration Change
**Objective**: Verify that the summary updates when configuration changes.

**Preconditions**: 
- Application is loaded
- Server configuration is hidden (summary visible)

**Test Steps**:
1. Click on the configuration summary to reopen the form
2. Change any configuration value (e.g., cores from 32 to 64)
3. Click "Hide" again

**Expected Results**:
- Summary updates to reflect new values
- New summary shows: "64 cores, ..." (with updated value)

---

## Reserved Resources Feature: Display

**User Story**: As a capacity planner, I want to see how many resources are reserved for system and storage processes.

### Test Case 4.1: Reserved Resources Calculation
**Objective**: Verify that reserved resources are correctly calculated and displayed.

**Preconditions**: 
- Application is loaded
- Server configuration section is visible

**Test Steps**:
1. Enter server configuration:
   - Cores per server: `32`
   - RAM per server: `128` GB
   - NVMe devices: `2`
   - HDD devices: `4`
2. Observe "Reserved Resources per Server" section

**Expected Results**:
- Section displays:
  - **CPU Cores**: Total reserved (2 for system + 12 for NVMe + 2 for HDD = 16 cores)
  - **RAM**: Total reserved (4 GB for system + 12 GB for NVMe + 8 GB for HDD = 24 GB)
  - **Available**: 16 cores, 104 GB RAM for database nodes
- Values update automatically when configuration changes

---

### Test Case 4.2: Reserved Resources in Resources Provided Mode Results
**Objective**: Verify that reserved resources breakdown appears in capacity calculation results.

**Preconditions**: 
- Application is loaded
- "Calculate Capacity Provided" mode is selected

**Test Steps**:
1. Enter server configuration with NVMe and HDD devices
2. Enter server count: `12`
3. Click "Calculate Capacity"
4. Scroll to results section

**Expected Results**:
- Results include "Reserved Resources per Server" breakdown
- Shows system cores, storage cores, system RAM, storage RAM
- Shows available cores and RAM per server
- Values match the calculation: 2 system cores + (6 × NVMe count) + (0.5 × HDD count)

---

### Test Case 4.3: Reserved Resources Update on Input Change
**Objective**: Verify that reserved resources update in real-time as configuration changes.

**Preconditions**: 
- Application is loaded
- Server configuration section is visible

**Test Steps**:
1. Enter initial configuration with 2 NVMe devices
2. Note the reserved storage cores value
3. Change NVMe devices to 4
4. Observe reserved resources section

**Expected Results**:
- Reserved storage cores updates immediately from 12 to 24 (6 cores × 4 devices)
- Total reserved cores updates accordingly
- Available cores for database decreases
- No page reload or button click required

---

## Reservation Settings Feature: Display

**User Story**: As a capacity planner, I want to see current settings for resource reservation.

### Test Case 5.1: View Settings Modal
**Objective**: Verify that resource reservation settings can be viewed.

**Preconditions**: 
- Application is loaded

**Test Steps**:
1. Locate "View current settings" link in server configuration section
2. Click the link

**Expected Results**:
- Modal dialog opens displaying resource reservation settings
- Settings include:
  - System cores reserve: 2
  - NVMe cores reserve: 6 per device
  - HDD cores reserve: 0.5 per device
  - System RAM reserve: 4 GB
  - NVMe RAM reserve: 6 GB per device
  - HDD RAM reserve: 2 GB per device
  - Storage group size: 9 VDisks
  - Minimum reserve: 18 VDisks or 1%
- Modal can be closed by clicking X or clicking outside

---

### Test Case 5.2: Settings Are Read-Only
**Objective**: Verify that settings are displayed but cannot be modified.

**Preconditions**: 
- Application is loaded
- Settings modal is open

**Test Steps**:
1. Open settings modal
2. Attempt to interact with displayed values

**Expected Results**:
- All settings are displayed as read-only text
- No input fields or edit controls are present
- Settings are for informational purposes only

---

### Test Case 5.3: Close Settings Modal
**Objective**: Verify that settings modal can be closed properly.

**Preconditions**: 
- Application is loaded
- Settings modal is open

**Test Steps**:
1. Open settings modal
2. Click the X button in top-right corner
3. Reopen settings modal
4. Click outside the modal (on the overlay)

**Expected Results**:
- Modal closes when X button is clicked
- Modal closes when clicking outside
- Application remains functional after closing modal
- Modal can be reopened multiple times

---

## Validation and Warning Tests

### Test Case V.1: VDisks Per Device Warning
**Objective**: Verify that warnings appear when VDisks per device exceeds recommended values.

**Preconditions**: 
- Application is loaded

**Test Steps**:
1. Enter VDisks per HDD PDisk: `12` (exceeds recommended 8)
2. Observe warning message
3. Enter VDisks per NVMe PDisk: `20` (exceeds recommended 16)
4. Observe warning message and popover

**Expected Results**:
- Warning message appears below HDD field: "More than 8 vdisks per HDD PDisk is not recommended."
- Warning message appears below NVMe field: "More than 16 vdisks per NVMe PDisk is not recommended."
- Popover dialog appears with Cthulhu image and warning text
- Calculation is NOT blocked (warnings are non-blocking)
- Popover appears only when VDisks field value changes

---

### Test Case V.2: Device Count Warning
**Objective**: Verify that warnings appear when device count exceeds 16 per server.

**Preconditions**: 
- Application is loaded

**Test Steps**:
1. Enter NVMe devices per server: `20`
2. Observe warning message
3. Enter HDD devices per server: `18`
4. Observe warning message

**Expected Results**:
- Warning appears for NVMe: "More than 16 NVMe devices per server is unusual; verify configuration."
- Warning appears for HDD: "More than 16 HDD devices per server is unusual; verify configuration."
- Warnings are non-blocking
- Calculation can still proceed

---

### Test Case V.3: Storage Device Mismatch Validation
**Objective**: Verify validation when storage groups are requested but no devices are configured.

**Preconditions**: 
- Application is loaded
- "Calculate Servers Needed" mode is selected

**Test Steps**:
1. Enter server configuration with HDD devices: `0`
2. Enter capacity requirements with HDD Storage Groups: `10`
3. Click "Calculate Servers"

**Expected Results**:
- Error message appears: "HDD devices per server must be greater than 0 when HDD storage groups are specified."
- Calculation is blocked
- Same validation applies for NVMe devices/groups mismatch

---

## Instructions for Future Test Case Creation

When adding new user stories or features to the YDB Capacity Calculator, follow these guidelines to create corresponding test cases:

### 1. Test Case Naming Convention
- Use format: `Test Case [Story#].[Test#]: [Descriptive Title]`
- Example: `Test Case 6.1: New Feature Validation`

### 2. Test Case Structure
Each test case must include:
- **Objective**: Clear statement of what is being tested
- **Preconditions**: Application state before test begins
- **Test Steps**: Numbered, specific actions to perform
- **Expected Results**: Detailed description of correct behavior

### 3. Smoke Test Criteria
For each new user story, create up to 3 smoke tests covering:
1. **Happy Path**: Basic functionality works as expected
2. **Validation**: Error handling and input validation
3. **Edge Case**: Boundary conditions or special scenarios

### 4. Test Categories
Classify tests into categories:
- **Functional**: Core feature behavior
- **Validation**: Input validation and error handling
- **UI/UX**: User interface and experience
- **Integration**: Interaction between features
- **Performance**: Response time and resource usage (if applicable)

### 5. Automation Considerations
When writing test cases, consider:
- Use specific, testable values (not "some value")
- Include element identifiers (IDs, classes) for automation
- Specify exact error messages for validation
- Note any timing dependencies (e.g., auto-fill delays)

### 6. Maintenance
- Update test cases when features change
- Mark deprecated tests clearly
- Keep test data realistic and representative
- Document any test data dependencies

### 7. Example Template

```markdown
### Test Case X.Y: [Feature Name]
**Objective**: [What are we testing?]

**Preconditions**: 
- [Initial state]
- [Required setup]

**Test Steps**:
1. [First action]
2. [Second action]
3. [Third action]

**Expected Results**:
- [Expected outcome 1]
- [Expected outcome 2]
- [Expected outcome 3]
```

---

## Regression Testing Strategy

To ensure no regressions are introduced when making changes to the YDB Capacity Calculator, implement the following testing strategy:

### 1. Manual Testing Approach

**When to Run**: Before each deployment or after significant changes

**Test Execution**:
1. Open the application in a browser
2. Execute all test cases in this document sequentially
3. Document any failures or unexpected behavior
4. Verify fixes before proceeding

**Recommended Browsers**:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest, for macOS users)
- Edge (latest)

**Test Checklist**:
- [ ] All Servers Needed mode tests pass
- [ ] All Resources Provided mode tests pass
- [ ] All Config Summary feature tests pass
- [ ] All Reserved Resources feature tests pass
- [ ] All Reservation Settings feature tests pass
- [ ] All validation tests pass
- [ ] Configuration persists across page reloads
- [ ] No console errors appear

---

### 2. Automated Testing with Playwright/Puppeteer

**Recommended Tool**: Playwright (cross-browser) or Puppeteer (Chrome-based)

**Setup Instructions**:

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Or install Puppeteer
npm install --save-dev puppeteer
```

**Sample Playwright Test Structure**:

```javascript
// tests/e2e/servers-needed.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Servers Needed Mode: Calculate Servers Needed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000'); // or your deployment URL
  });

  test('Test Case 1.1: Basic Server Calculation', async ({ page }) => {
    // Ensure Servers Needed mode is selected
    await page.click('#servers-needed-toggle');
    
    // Enter server configuration
    await page.fill('#cores-per-server', '32');
    await page.fill('#ram-per-server', '1024');
    await page.fill('#nvme-devices-per-server', '2');
    await page.fill('#nvme-device-size', '1');
    await page.fill('#hdd-devices-per-server', '4');
    await page.fill('#hdd-device-size', '4');
    
    // Enter capacity requirements
    await page.fill('#hdd-storage-groups', '10');
    await page.fill('#nvme-storage-groups', '5');
    await page.fill('#database-cores', '100');
    await page.fill('#database-ram', '5000');
    
    // Click calculate
    await page.click('#calculate-button');
    
    // Verify results appear
    await expect(page.locator('#servers-needed-results')).toBeVisible();
    await expect(page.locator('#final-servers-result')).toContainText(/\d+/);
  });
  
  test('Test Case 1.2: Validation - No Storage', async ({ page }) => {
    await page.click('#servers-needed-toggle');
    
    // Enter config without storage
    await page.fill('#cores-per-server', '32');
    await page.fill('#ram-per-server', '512');
    await page.fill('#database-cores', '50');
    
    await page.click('#calculate-button');
    
    // Verify error message
    await expect(page.locator('.error-message')).toContainText('At least one storage type');
  });
});
```

**Running Automated Tests**:

```bash
# Run all Playwright tests
npx playwright test

# Run with UI mode for debugging
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/servers-needed.spec.js
```

---

### 3. Continuous Integration (CI) Setup

**GitHub Actions Example** (`.github/workflows/test.yml`):

```yaml
name: Test YDB Calculator

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run unit tests
      run: npm test
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Start local server
      run: |
        python3 -m http.server 8000 &
        sleep 2
    
    - name: Run E2E tests
      run: npx playwright test
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
```

---

### 4. Visual Regression Testing

**Tool**: Playwright with screenshot comparison

**Implementation**:

```javascript
test('Visual regression - Servers Needed results', async ({ page }) => {
  // Setup and calculate
  await page.goto('http://localhost:8000');
  // ... perform calculation ...
  
  // Take screenshot
  await expect(page.locator('#servers-needed-results')).toHaveScreenshot('servers-needed-results.png');
});
```

**Benefits**:
- Catches unintended UI changes
- Verifies layout consistency
- Detects CSS regressions

---

### 5. Testing Checklist for Deployments

Before deploying to production:

- [ ] All unit tests pass (`npm test`)
- [ ] All manual smoke tests executed and pass
- [ ] Automated E2E tests pass (if implemented)
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Local storage persistence tested
- [ ] No console errors in browser
- [ ] Performance is acceptable (page loads < 2s)
- [ ] All validation messages display correctly
- [ ] Configuration summary works when hidden
- [ ] Settings modal opens and closes properly

---

### 6. Test Data Management

**Standard Test Configurations**:

```javascript
// test-data.js
const TEST_CONFIGS = {
  small: {
    cores: 16,
    ram: 128,
    nvme: 1,
    nvmeSize: 1,
    hdd: 2,
    hddSize: 2
  },
  medium: {
    cores: 32,
    ram: 512,
    nvme: 2,
    nvmeSize: 1,
    hdd: 4,
    hddSize: 4
  },
  large: {
    cores: 64,
    ram: 1024,
    nvme: 4,
    nvmeSize: 2,
    hdd: 8,
    hddSize: 8
  }
};
```

Use consistent test data across manual and automated tests for reproducibility.

---

### 7. Monitoring and Reporting

**Test Execution Tracking**:
- Maintain a test execution log
- Track pass/fail rates over time
- Document any flaky tests
- Report bugs with test case references

**Metrics to Track**:
- Test coverage percentage
- Average test execution time
- Number of bugs found in testing vs production
- Time to fix regressions

---

## Summary

This testing strategy provides:
1. **Comprehensive manual test cases** for all user stories
2. **Clear instructions** for creating new test cases
3. **Multiple regression testing approaches** (manual, automated, CI/CD)
4. **Practical implementation examples** using Playwright
5. **Deployment checklist** to prevent regressions

**Recommended Approach**:
- Start with manual testing for immediate coverage
- Gradually implement automated tests for critical paths
- Set up CI/CD pipeline for continuous testing
- Review and update tests with each new feature

This ensures the YDB Capacity Calculator remains reliable and regression-free as it evolves.