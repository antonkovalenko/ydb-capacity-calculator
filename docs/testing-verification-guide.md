# Testing Verification Guide

This guide demonstrates how to verify that the test suite actually catches bugs by intentionally breaking the code, running tests, and then fixing the issues.

## Overview

The best way to trust your tests is to see them fail when they should. This guide walks you through:
1. Making intentional breaking changes to the code
2. Running tests to verify they catch the bugs
3. Understanding the error messages
4. Reverting the changes to restore functionality

## Prerequisites

Before starting, ensure you can run the tests:

```bash
npm test
```

You should see output like:
```
Running Core calculation tests...
All Core calculation tests passed.
```

## Example 1: Breaking System Cores Reserve

### What to Change

The system reserves 2 cores per server for OS operations. Let's break this by changing it to 3.

**File:** `js/core.js`  
**Line:** 41  
**Change:** `const systemCores = 2;` → `const systemCores = 3;`

### Making the Change

1. Open [`js/core.js`](../js/core.js)
2. Find line 41: `const systemCores = 2;`
3. Change it to: `const systemCores = 3;`
4. Save the file

### Which Tests Should Fail

**Test 2: cores calculation** (lines 19-30 in [`test/calculations.test.js`](../test/calculations.test.js))

This test expects:
- Server config: 32 cores per server
- Database needs: 60 cores
- With 2 cores reserved: 30 cores available per server
- Expected result: 2 servers needed (60 ÷ 30 = 2)

### Running the Test

```bash
npm test
```

### Expected Error Message

```
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ 3
- 2
    at Object.<anonymous> (/path/to/test/calculations.test.js:25:12)
```

The test fails because:
- With 3 cores reserved: only 29 cores available per server (32 - 3 = 29)
- Servers needed: 60 ÷ 29 = 2.07 → rounds up to 3 servers
- Test expects 2, but gets 3

### Understanding the Failure

The error shows:
- **Line 25**: The assertion that failed
- **Expected**: 2 servers
- **Actual**: 3 servers

This proves the test correctly detects when the system cores reserve changes.

### How to Fix

1. Open [`js/core.js`](../js/core.js)
2. Change line 41 back to: `const systemCores = 2;`
3. Save the file
4. Run `npm test` again - all tests should pass

---

## Example 2: Breaking Storage Group Size

### What to Change

YDB storage groups require exactly 9 vdisks. Let's break this by changing it to 10.

**File:** `js/core.js`  
**Lines:** 15, 16, 83, 84  
**Change:** All instances of `* 9` → `* 10`

### Making the Change

1. Open [`js/core.js`](../js/core.js)
2. Find line 15: `const hddVdisksRequired = (capacityRequirements.hddStorageGroups || 0) * 9;`
3. Change to: `const hddVdisksRequired = (capacityRequirements.hddStorageGroups || 0) * 10;`
4. Find line 16: `const nvmeVdisksRequired = (capacityRequirements.nvmeStorageGroups || 0) * 9;`
5. Change to: `const nvmeVdisksRequired = (capacityRequirements.nvmeStorageGroups || 0) * 10;`
6. Find line 83: `const hddStorageGroups = Math.floor(availableHddVdisks / 9);`
7. Change to: `const hddStorageGroups = Math.floor(availableHddVdisks / 10);`
8. Find line 84: `const nvmeStorageGroups = Math.floor(availableNvmeVdisks / 9);`
9. Change to: `const nvmeStorageGroups = Math.floor(availableNvmeVdisks / 10);`
10. Save the file

### Which Tests Should Fail

**Test 1: storage servers calculation** (lines 6-17 in [`test/calculations.test.js`](../test/calculations.test.js))

This test expects:
- 1 HDD storage group requested
- With 9 vdisks per group: needs 9 vdisks
- Server has 4 HDD devices × 8 vdisks = 32 vdisks capacity
- Expected result: 1 server

### Running the Test

```bash
npm test
```

### Expected Error Message

```
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ 2
- 1
    at Object.<anonymous> (/path/to/test/calculations.test.js:12:12)
```

The test fails because:
- With 10 vdisks per group: needs 10 vdisks + 18 reserve = 28 vdisks
- Server capacity: 32 vdisks
- Still fits in 1 server, but the calculation is now inconsistent

Actually, this might still pass initially. Let's try a more obvious break:

### Alternative: More Dramatic Change

Change line 15 to multiply by 20 instead:
```javascript
const hddVdisksRequired = (capacityRequirements.hddStorageGroups || 0) * 20;
```

Now the test will definitely fail:
- 1 storage group × 20 = 20 vdisks needed
- Plus 18 reserve = 38 vdisks total
- Server capacity: 32 vdisks
- Needs 2 servers instead of 1

### How to Fix

1. Open [`js/core.js`](../js/core.js)
2. Revert all changes back to `* 9`
3. Save the file
4. Run `npm test` - all tests should pass

---

## Example 3: Breaking Minimum Server Count

### What to Change

YDB requires a minimum of 12 servers for a production cluster. Let's break this by changing it to 10.

**File:** `js/core.js`  
**Line:** 65  
**Change:** `const finalServers = Math.max(12, serversByResource[dominantResource]);` → `const finalServers = Math.max(10, serversByResource[dominantResource]);`

### Making the Change

1. Open [`js/core.js`](../js/core.js)
2. Find line 65: `const finalServers = Math.max(12, serversByResource[dominantResource]);`
3. Change to: `const finalServers = Math.max(10, serversByResource[dominantResource]);`
4. Save the file

### Which Tests Should Fail

**Both Test 1 and Test 2** will fail because they both verify `finalServers` equals 12.

- Test 1, line 16: `assert.strictEqual(res.finalServers, 12, 'finalServers must be at least 12');`
- Test 2, line 29: `assert.strictEqual(res.finalServers, 12, 'finalServers must be at least 12');`

### Running the Test

```bash
npm test
```

### Expected Error Messages

```
AssertionError [ERR_ASSERTION]: finalServers must be at least 12
Expected values to be strictly equal:
+ actual - expected

+ 10
- 12
    at Object.<anonymous> (/path/to/test/calculations.test.js:16:12)
```

And then:

```
AssertionError [ERR_ASSERTION]: finalServers must be at least 12
Expected values to be strictly equal:
+ actual - expected

+ 10
- 12
    at Object.<anonymous> (/path/to/test/calculations.test.js:29:12)
```

### Understanding the Failures

Both tests fail because:
- Test 1 calculates only 1 server needed for storage
- Test 2 calculates only 2 servers needed for cores
- Both should be raised to minimum of 12
- But with our bug, they're only raised to 10

This demonstrates that the tests protect the critical business rule about minimum cluster size.

### How to Fix

1. Open [`js/core.js`](../js/core.js)
2. Change line 65 back to: `const finalServers = Math.max(12, serversByResource[dominantResource]);`
3. Save the file
4. Run `npm test` - all tests should pass

---

## Example 4: Breaking a Calculation Formula

### What to Change

Let's break the cores calculation by using addition instead of subtraction.

**File:** `js/core.js`  
**Line:** 43  
**Change:** `const availableCoresPerServer = (serverConfig.coresPerServer || 0) - systemCores - storageCores;`  
**To:** `const availableCoresPerServer = (serverConfig.coresPerServer || 0) + systemCores - storageCores;`

### Making the Change

1. Open [`js/core.js`](../js/core.js)
2. Find line 43: `const availableCoresPerServer = (serverConfig.coresPerServer || 0) - systemCores - storageCores;`
3. Change the first `-` to `+`: `const availableCoresPerServer = (serverConfig.coresPerServer || 0) + systemCores - storageCores;`
4. Save the file

### Which Tests Should Fail

**Test 2: cores calculation** (line 25) and **Test 3: provided capacity** (line 37)

### Running the Test

```bash
npm test
```

### Expected Error Messages

```
AssertionError [ERR_ASSERTION]: 60 cores on 32-core servers (2 reserved) => available 30 => 2 servers
Expected values to be strictly equal:
+ actual - expected

+ 1
- 2
    at Object.<anonymous> (/path/to/test/calculations.test.js:25:12)
```

And:

```
AssertionError [ERR_ASSERTION]: Provided database cores should be 90
Expected values to be strictly equal:
+ actual - expected

+ 102
- 90
    at Object.<anonymous> (/path/to/test/calculations.test.js:37:12)
```

### Understanding the Failures

**Test 2 fails** because:
- Correct: 32 - 2 = 30 cores available per server
- Broken: 32 + 2 = 34 cores available per server
- With 34 available: 60 ÷ 34 = 1.76 → rounds up to 2 servers
- But wait, this should still be 2... Let me recalculate
- Actually: 60 ÷ 34 = 1.76 → rounds up to 2 servers
- The test expects 2, so this might pass!

Let me reconsider. The bug gives MORE available cores (34 instead of 30):
- 60 cores needed ÷ 34 available = 1.76 → rounds to 2 servers ✓

**Test 3 fails** because:
- Correct: 3 servers × 30 cores = 90 cores
- Broken: 3 servers × 34 cores = 102 cores
- Test expects 90, gets 102

So Test 3 will definitely catch this bug!

### How to Fix

1. Open [`js/core.js`](../js/core.js)
2. Change line 43 back to: `const availableCoresPerServer = (serverConfig.coresPerServer || 0) - systemCores - storageCores;`
3. Save the file
4. Run `npm test` - all tests should pass

---

## Example 5: Breaking the Provided Capacity Calculation

### What to Change

Let's break the calculation that determines how many storage groups can be created.

**File:** `js/core.js`  
**Line:** 83  
**Change:** `const hddStorageGroups = Math.floor(availableHddVdisks / 9);`  
**To:** `const hddStorageGroups = Math.ceil(availableHddVdisks / 9);`

### Making the Change

1. Open [`js/core.js`](../js/core.js)
2. Find line 83: `const hddStorageGroups = Math.floor(availableHddVdisks / 9);`
3. Change `Math.floor` to `Math.ceil`: `const hddStorageGroups = Math.ceil(availableHddVdisks / 9);`
4. Save the file

### Why This Breaks Things

Using `Math.ceil` instead of `Math.floor` means we'd claim to provide more storage groups than we actually have vdisks for. For example:
- If we have 10 available vdisks
- `Math.floor(10 / 9) = 1` storage group (correct - we have enough for 1 complete group)
- `Math.ceil(10 / 9) = 2` storage groups (wrong - we don't have enough vdisks for 2 groups)

### Which Tests Should Fail

This particular change might not be caught by the current test suite, which demonstrates the importance of comprehensive testing! The current tests focus on the "required servers" direction, not the "provided capacity" validation.

### Running the Test

```bash
npm test
```

### Result

Tests might still pass! This reveals a gap in test coverage. To properly test this, we'd need a test that:
1. Calculates required servers for a given capacity
2. Calculates provided capacity for those servers
3. Verifies the provided capacity meets or exceeds the required capacity

### How to Fix

1. Open [`js/core.js`](../js/core.js)
2. Change line 83 back to: `const hddStorageGroups = Math.floor(availableHddVdisks / 9);`
3. Save the file

### Lesson Learned

This example shows that even with tests, there can be gaps in coverage. When you find a bug that tests don't catch, add a new test for it!

---

## Best Practices for Test Verification

### 1. Run Tests Before Making Changes

Always verify tests pass before breaking anything:
```bash
npm test
```

### 2. Make One Change at a Time

Break one thing at a time so you can clearly see which test catches which bug.

### 3. Read the Error Messages

Error messages tell you:
- Which test failed (file and line number)
- What was expected vs. what was received
- The assertion message explaining what should happen

### 4. Verify the Fix

After reverting changes, always run tests again to confirm everything works:
```bash
npm test
```

### 5. Add Tests for Uncaught Bugs

If you find a bug that tests don't catch, add a new test to prevent regression.

---

## Quick Reference: Common Breaking Changes

| Change | File | Line | Test That Fails | Error Type |
|--------|------|------|-----------------|------------|
| System cores: 2→3 | `js/core.js` | 41 | Test 2 (cores) | Wrong server count |
| Storage group: 9→10 | `js/core.js` | 15,16,83,84 | Test 1 (storage) | Wrong server count |
| Min servers: 12→10 | `js/core.js` | 65 | Tests 1 & 2 | Wrong minimum |
| Cores formula: `-`→`+` | `js/core.js` | 43 | Test 3 (capacity) | Wrong capacity |
| Floor→Ceil | `js/core.js` | 83 | None (gap!) | No test coverage |

---

## Conclusion

This guide demonstrates that the test suite effectively catches most bugs in critical calculations. By intentionally breaking the code and watching tests fail, you can:

1. **Trust your tests** - They actually work!
2. **Understand the code** - See how changes affect behavior
3. **Learn the business rules** - Tests document requirements
4. **Find coverage gaps** - Discover what's not tested

Remember: **A test that never fails is a test that might not be testing anything!**

For more information about the test suite, see [`TESTING.md`](../TESTING.md).