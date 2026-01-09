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

On the same horizontal level with server configration section title I want to see hide button in the right corner. When server configuration is hidden I want to see the brief configuration summary. When server configuration is hidden I want to see a button labled "show" instead of "hide". 

Close to server configutaion section title I want to see a link "View resource reservation settings" that opens a modal window with resource reservation settings used for calculations. I want to see close control for this modal window. I want to see resource reservation settings grouped by storage type (HDD/NVMe) and compute resources: CPU and them RAM.

Split into two sections:
Compute: Number of cores and RAM size per server. Two column layout for better organization.
Storage: Number of NVMe and HDD devices, size of each device, number of VDisks per device Three column layout for better organization.

- Input fields with appropriate labels and placeholders
- Clear grouping of related inputs (CPU, RAM, Storage)

### 3. Capacity Requirements Form

Split into two sections:
Compute: Number of cores and RAM size. Two column layout for better organization.
Storage: Number of NVMe and HDD groups Two column layout.

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

I want results to be easy to read and understand. When story 2 is selected I want to see capacity provided in terms of storage groups, cores and RAM. When story 1 is selected I want to see server counts by resource type and final server count.

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