# Refactoring Plan: Story Number Removal

## Overview
This document outlines the plan to refactor the codebase by replacing numeric story references (Story 1, Story 2, etc.) with mnemonic English names.

## Naming Convention

### Story Name Mapping

| Old Name | New Name | Purpose | Scope |
|----------|----------|---------|-------|
| Story 1 | `servers-needed` | Calculate how many servers are needed for requested resources | Main calculation mode |
| Story 2 | `resources-provided` | Calculate what resources are provided by N servers | Main calculation mode |
| Story 3 | `config-summary` | Show brief server configuration when form is hidden | UI feature |
| Story 4 | `reserved-resources` | Display reserved resources for system and storage | UI feature |
| Story 5 | `reservation-settings` | Show resource reservation settings (read-only) | UI feature |

### Naming Rationale

- **`servers-needed`** and **`resources-provided`**: Parallel structure, action-oriented, clearly describes the calculation direction
- **`config-summary`**: Descriptive of the feature's purpose
- **`reserved-resources`**: Matches existing terminology in the codebase
- **`reservation-settings`**: Clear purpose, distinguishes from the display feature

## Refactoring Scope

### 1. JavaScript Files

#### [`js/calculator.js`](js/calculator.js:1)
**Variables and Constants:**
- `currentStory` → `currentMode` (line 2)
- Story number values (1, 2) → mode names ('servers-needed', 'resources-provided')

**Functions to Update:**
- [`switchStory(storyNumber)`](js/calculator.js:68) → `switchMode(modeName)`
- [`calculateServers()`](js/calculator.js:191) → Keep name (already descriptive)
- [`calculateCapacity()`](js/calculator.js:230) → Keep name (already descriptive)
- [`displayStory1Results()`](js/calculator.js:725) → `displayServersNeededResults()`
- [`displayStory2Results()`](js/calculator.js:811) → `displayResourcesProvidedResults()`
- [`buildServerConfigSummary()`](js/calculator.js:469) → Keep name (Story 3 feature, already descriptive)

**Comments to Update:**
- Line 1: "Current active story (1 or 2)" → "Current active calculation mode"
- Line 87: "Clear capacity requirements for Story 1" → "Clear capacity requirements for servers-needed mode"
- Line 95: "Clear server count for Story 2" → "Clear server count for resources-provided mode"
- Line 170: "For Story 2, check if button..." → "For resources-provided mode, check if button..."
- Line 190: "Story 1: Calculate servers needed" → "Servers Needed Mode: Calculate servers needed"
- Line 229: "Story 2: Calculate capacity provided" → "Resources Provided Mode: Calculate capacity provided"
- Line 278: "Input validation for Story 1" → "Input validation for servers-needed mode"
- Line 468: "Build a brief server configuration summary for story 3" → "Build a brief server configuration summary (config-summary feature)"
- Line 541: "Story 1: Calculation logic" → "Servers Needed Mode: Calculation logic"
- Line 666: "Story 2: Calculate provided capacity" → "Resources Provided Mode: Calculate provided capacity"
- Line 712: "Story 4: Reserved resources breakdown" → "Reserved Resources Feature: breakdown"
- Line 724: "Display Story 1 results" → "Display servers-needed mode results"
- Line 810: "Display Story 2 results" → "Display resources-provided mode results"
- Line 818: "Story 4: Display reserved resources breakdown" → "Reserved Resources Feature: Display breakdown"

#### [`js/core.js`](js/core.js:1)
**No changes needed** - This file contains pure calculation functions without story references.

### 2. HTML Files

#### [`index.html`](index.html:1)
**Element IDs to Update:**
- `story1-toggle` → `servers-needed-toggle` (line 23)
- `story2-toggle` → `resources-provided-toggle` (line 24)
- `story1-section` → `servers-needed-section` (line 113)
- `story2-section` → `resources-provided-section` (line 146)
- `story1-results` → `servers-needed-results` (line 167)
- `story2-results` → `resources-provided-results` (line 194)

**Comments to Update:**
- Line 21: "Story Toggle" → "Calculation Mode Toggle"
- Line 112: "Story 1: Capacity Requirements Section" → "Servers Needed Mode: Capacity Requirements Section"
- Line 145: "Story 2: Server Count Section" → "Resources Provided Mode: Server Count Section"
- Line 223: "Story 4: Reserved Resources Breakdown" → "Reserved Resources Feature: Breakdown"

### 3. Documentation Files

#### [`docs/user-stories.md`](docs/user-stories.md:1)
**Headers to Update:**
- "## Story 1: Capacity Planner" → "## Servers Needed: Capacity Planner"
- "## Story 2: Calculate the amount..." → "## Resources Provided: Calculate the amount..."
- "## Story 3: When server configuration..." → "## Config Summary: When server configuration..."
- "## Story 4: As capacity planner..." → "## Reserved Resources: As capacity planner..."
- "## Stopry 5: As capacity planner..." → "## Reservation Settings: As capacity planner..." (also fix typo)

#### [`docs/story2-technical-spec.md`](docs/story2-technical-spec.md:1)
**Rename file:** `story2-technical-spec.md` → `resources-provided-technical-spec.md`

**Content Updates:**
- Title: "Story 2: Calculate Capacity..." → "Resources Provided Mode: Calculate Capacity..."
- All "Story 2" references → "Resources Provided mode"
- All "Story 1" references → "Servers Needed mode"

#### [`docs/requirements.md`](docs/requirements.md:20)
**Update:**
- Line 20: "Never write Story 2 or Story 1 in the UI" → "Use descriptive mode names in the UI (e.g., 'Calculate Servers Needed', 'Calculate Capacity Provided')"

#### [`docs/tests.md`](docs/tests.md:1)
**Headers to Update:**
- "## Story 1: Calculate Servers Needed" → "## Servers Needed Mode: Calculate Servers Needed"
- "## Story 2: Calculate Capacity Provided" → "## Resources Provided Mode: Calculate Capacity Provided"
- "## Story 3: Server Configuration Summary" → "## Config Summary Feature: Server Configuration Summary"
- "## Story 4: Reserved Resources Display" → "## Reserved Resources Feature: Display"
- "## Story 5: Resource Reservation Settings Display" → "## Reservation Settings Feature: Display"

**Test Case References:**
- All "Story 1" → "Servers Needed mode"
- All "Story 2" → "Resources Provided mode"
- All "Story 3" → "Config Summary feature"
- All "Story 4" → "Reserved Resources feature"
- All "Story 5" → "Reservation Settings feature"

#### [`docs/test-results.md`](docs/test-results.md:1)
**Similar updates as tests.md**

#### [`docs/user-guide.md`](docs/user-guide.md:1)
**Headers to Update:**
- "## Using Story 1: Calculate Servers Needed" → "## Using Servers Needed Mode"
- "## Using Story 2: Calculate Capacity Provided" → "## Using Resources Provided Mode"

#### [`docs/technical-specification.md`](docs/technical-specification.md:1)
**Section Updates:**
- "### Story 1: Calculate Servers Needed" → "### Servers Needed Mode"
- "### Story 2: Calculate Capacity Provided" → "### Resources Provided Mode"

#### [`docs/project-summary.md`](docs/project-summary.md:1)
**Update references:**
- "For Story 1" → "For Servers Needed mode"
- "For Story 2" → "For Resources Provided mode"

#### [`docs/ui-design.md`](docs/ui-design.md:1)
**Update references:**
- "story 2" → "Resources Provided mode"
- "story 1" → "Servers Needed mode"

#### [`README.md`](README.md:1)
**Update:**
- Line 50: "Story 2 Technical Specification" → "Resources Provided Mode Technical Specification"
- Line 62: "### Story 1: Calculate Servers Needed" → "### Servers Needed Mode"
- Line 68: "### Story 2: Calculate Capacity Provided" → "### Resources Provided Mode"

### 4. Test Files

#### [`test/calculations.test.js`](test/calculations.test.js:1)
**No changes needed** - Tests use Core functions without story references.

### 5. CSS Files

**No changes needed** - CSS uses generic class names, not story-specific IDs.

## Implementation Strategy

### Phase 1: Documentation Updates (Low Risk)
1. Update all markdown documentation files
2. Rename `story2-technical-spec.md` to `resources-provided-technical-spec.md`
3. Update README.md references

### Phase 2: JavaScript Refactoring (Medium Risk)
1. Update [`js/calculator.js`](js/calculator.js:1):
   - Change variable names and function names
   - Update all comments
   - Update string literals and comparisons
2. Verify [`js/core.js`](js/core.js:1) needs no changes

### Phase 3: HTML Structure Updates (High Risk)
1. Update all element IDs in [`index.html`](index.html:1)
2. Update all comments
3. Ensure JavaScript event listeners match new IDs

### Phase 4: Testing and Verification
1. Test mode switching functionality
2. Test all calculations in both modes
3. Verify all UI features work correctly
4. Check browser console for errors
5. Validate localStorage compatibility

## Risk Mitigation

### Breaking Changes
- **Element ID changes** will break existing JavaScript references
- **localStorage keys** may need migration for saved configurations
- **External links** to documentation may break

### Mitigation Strategies
1. **Atomic commits**: Make changes in logical groups
2. **Comprehensive testing**: Test each phase before proceeding
3. **Backward compatibility**: Consider keeping old IDs as aliases temporarily
4. **Documentation**: Update all references simultaneously

## Testing Checklist

After refactoring:
- [ ] Mode toggle switches between servers-needed and resources-provided
- [ ] Servers-needed mode calculates correctly
- [ ] Resources-provided mode calculates correctly
- [ ] Config summary displays when server config is hidden
- [ ] Reserved resources display shows correct values
- [ ] Reservation settings modal opens and displays correctly
- [ ] All validation messages work
- [ ] localStorage saves and loads configuration
- [ ] No console errors
- [ ] All documentation links work

## Rollback Plan

If issues arise:
1. Revert commits in reverse order (Phase 3 → Phase 2 → Phase 1)
2. Test after each revert
3. Document any issues encountered

## Timeline Estimate

- **Phase 1 (Documentation)**: 1-2 hours
- **Phase 2 (JavaScript)**: 2-3 hours
- **Phase 3 (HTML)**: 1-2 hours
- **Phase 4 (Testing)**: 2-3 hours
- **Total**: 6-10 hours

## Success Criteria

1. ✅ No references to "Story 1", "Story 2", etc. in code
2. ✅ All functionality works as before
3. ✅ Code is more readable and maintainable
4. ✅ Documentation is consistent
5. ✅ No breaking changes for users