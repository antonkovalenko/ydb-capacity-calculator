# YDB Capacity Calculator - Technical Specification

## Overview
This document describes the technical implementation of the YDB Capacity Calculator, a single-page application that helps capacity planners determine server requirements for YDB clusters based on capacity needs or calculate capacity provided by a given server configuration.

## Application Architecture
The application is a client-side single-page application built with:
- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript for functionality
- Local storage for data persistence

## Core Components

### 1. HTML Structure
- Header with application title and description
- Story toggle buttons for switching between use cases
- Server configuration input section
- Capacity requirements input section (Story 1)
- Server count input (Story 2)
- Calculate button
- Results display section
- Footer with YDB information

### 2. CSS Styling
- Responsive design using CSS Grid and Flexbox
- YDB color scheme implementation
- Mobile-friendly layout
- Clear visual hierarchy
- Interactive elements with hover states

### 3. JavaScript Functionality
- Form input validation
- Calculation logic for both stories
- Local storage integration
- Dynamic UI updates
- Error handling

## Implementation Details

### Story 1: Calculate Servers Needed
This functionality allows users to determine how many servers are needed based on capacity requirements.

#### Calculation Process
1. **Storage Groups Calculation**
   - Each storage group consists of 9 VDisks
   - Reserve calculation (1% or minimum 18 VDisks)
   - VDisks per server calculation based on device count and VDisks per device
   - Server count calculation based on required VDisks

2. **CPU Cores Calculation**
   - System reserve: 2-4 cores per server (using 2 as minimum)
   - Storage reserve: 6 cores per NVMe device, 0.5 per HDD device
   - Available cores for database nodes
   - Server count calculation based on required database cores

3. **RAM Calculation**
   - System reserve: 4GB per server
   - Storage reserve: 6GB per NVMe device, 2GB per HDD device
   - Available RAM for database nodes
   - Server count calculation based on required database RAM

4. **Final Server Count**
   - Takes the maximum of storage, CPU, and RAM requirements
   - Ensures minimum of 12 servers

### Story 2: Calculate Capacity Provided
This functionality allows users to determine what capacity is provided by a given server configuration and server count.

#### Calculation Process
1. **Storage Groups Calculation**
   - Total VDisks calculation for HDD and NVMe
   - Reserve application (1% or minimum 18 VDisks)
   - Available VDisks after reserve
   - Storage groups calculation (9 VDisks per group)

2. **Database Cores Calculation**
   - System reserve: 2 cores per server
   - Storage reserve: 6 cores per NVMe device, 0.5 per HDD device
   - Available cores per server for database nodes
   - Total database cores across all servers

3. **Database RAM Calculation**
   - System reserve: 4GB per server
   - Storage reserve: 6GB per NVMe device, 2GB per HDD device
   - Available RAM per server for database nodes
   - Total database RAM across all servers

## Data Persistence
- Server configuration is saved to local storage on any change
- Configuration is loaded from local storage on page load
- Capacity requirements are not persisted (user may want different values each time)

## Error Handling
- Input validation for all numeric fields
- Clear error messages for invalid inputs
- Prevention of negative or zero server counts
- Handling of edge cases (e.g., no devices specified)

## Responsive Design
- Adapts to different screen sizes
- Mobile-friendly layout
- Appropriate font sizes and spacing for all devices
- Accessible color scheme

## Business Rules Implementation
All business rules from the requirements document are implemented:
- Storage group calculation with 9 VDisks per group
- Reserve calculation (1% or minimum 18 VDisks)
- System resource reservations (cores and RAM)
- Storage device resource reservations
- Calculation of available resources for database nodes
- Minimum server count enforcement (12 servers)

## File Structure
- `index.html`: Main HTML file
- `css/styles.css`: Styling
- `js/calculator.js`: Calculation logic
- `docs/`: Documentation files
  - `requirements.md`: Project requirements
  - `user-stories.md`: User stories
  - `business-rules.md`: Business rules
  - `technical-specification.md`: This document
  - `story2-technical-spec.md`: Detailed specification for Story 2
  - `ui-design.md`: UI design documentation
  - `user-guide.md`: User instructions
  - `project-summary.md`: Project overview
  - `test-results.md`: Testing results

## Testing
The application has been tested with various configurations to ensure:
- Correct calculation of server requirements
- Proper application of business rules
- Accurate handling of edge cases
- Responsive design on different devices
- Data persistence functionality
- Correct behavior when switching between stories

