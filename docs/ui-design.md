# UI Design - YDB Capacity Calculator

## Layout Structure

I want to be able to hide server configuration and enter see story selectors as large buttons.
When I select a story I want to enter required parameters for the story in a form layout.

When I press "Calculate" button I want to see results below the button in a clear and structured way.

## Component Breakdown

### 1. Header Section

- Title: "Capacity Calculator"
- YDB Logo from: https://storage.yandexcloud.net/ydb-site-assets/ydb_icon.svg
- Brief description of the tool

### 2. Server Configuration Form

- Two-column layout for better organization
- Input fields with appropriate labels and placeholders
- Clear grouping of related inputs (CPU, RAM, Storage)

### 3. Capacity Requirements Form

- Similar two-column layout
- Inputs for storage groups and database resources
- Clear section separation from server configuration

### 4. Action Button

- Prominent "Calculate Servers" button
- Centered below the forms

### 5. Results Section

- Collapsible or hidden by default, shown after calculation
- Clear display of server counts by resource type
- Highlighting of dominant resource
- Final server count prominently displayed

## Color Scheme and Styling

Use YDB styles from ydb-styles.css:

- Primary color: YDB blue (#007bff or similar from YDB branding)
- Clean typography with good readability
- Adequate spacing between elements
- Responsive design for different screen sizes

## Form Validation Feedback

- Real-time validation with visual cues
- Error messages below invalid fields
- Disabled "Calculate" button until all required fields are valid
- Clear indication of which fields are required

## Responsive Design

- Single column layout on mobile devices
- Appropriate spacing and sizing for all screen sizes
- Scrollable sections if needed on small screens