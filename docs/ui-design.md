# UI Design - YDB Capacity Calculator

## Layout Structure

```
+------------------------------------------------------------+
|  YDB Capacity Calculator                        [YDB Logo] |
+------------------------------------------------------------+
|  Server Configuration                                      |
|  +------------------------------------------------------+  |
|  | Cores per server: [____]                             |  |
|  | RAM per server (GB): [____]                          |  |
|  |                                                      |  |
|  | NVMe devices per server: [____]                      |  |
|  | NVMe device size (TB): [____]                        |  |
|  |                                                      |  |
|  | HDD devices per server: [____]                       |  |
|  | HDD device size (TB): [____]                         |  |  |
|  |                                                      |  |
|  | VDisks per HDD PDisks: [____]                        |  |
|  | VDisks per NVMe PDisks: [____]                       |  |
|  +------------------------------------------------------+  |
|                                                            |
|  Capacity Requirements                                     |
|  +------------------------------------------------------+  |
|  | HDD Storage Groups: [____]                           |  |
|  | NVMe Storage Groups: [____]                          |  |
|  |                                                      |  |
|  | Database Node Cores: [____]                          |  |
|  | Database Node RAM (GB): [____]                       |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [ Calculate Servers ]                                     |
|                                                            |
|  Results                                                   |
|  +------------------------------------------------------+  |
|  | Servers required by storage groups: [____]           |  |
|  | Servers required by cores: [____]                    |  |
|  | Servers required by RAM: [____]                      |  |
|  |                                                      |  |
|  | Dominant resource: [____]                            |  |
|  | Final server count: [____]                           |  |
|  +------------------------------------------------------+  |
+------------------------------------------------------------+
```

## Component Breakdown

### 1. Header Section
- Title: "YDB Capacity Calculator"
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
Since we don't have the ydb-styles.css file, we'll use a clean, modern design with:
- Primary color: YDB blue (#007bff or similar from YDB branding)
- Secondary colors: Grays for backgrounds and borders
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