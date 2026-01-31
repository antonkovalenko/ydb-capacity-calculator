# Resources Provided Mode: Calculate Capacity Provided by Server Configuration - Technical Specification

## Overview
This document describes the technical implementation for the Resources Provided mode of the YDB Capacity Calculator, which allows users to calculate the capacity provided by a given server configuration and server count.

## User Story
As a capacity planner, I want to calculate the capacity provided by a given server configuration and server count, so that I can understand what resources a specific setup will provide.

## Implementation Details

### UI Components

1. **Mode Toggle**: Buttons to switch between Servers Needed and Resources Provided modes
2. **Server Count Input**: Field for specifying the number of servers
3. **Results Display**: Section showing the calculated capacity provided

### JavaScript Functions

#### calculateCapacity()
Main function that handles the Resources Provided mode calculation workflow:
- Gets input values (server configuration and server count)
- Validates inputs
- Saves server configuration to local storage
- Calls calculateProvidedCapacity() to perform calculations
- Calls displayResourcesProvidedResults() to show results

#### calculateProvidedCapacity(serverConfig, serverCount)
Performs the capacity calculation based on server configuration and count:
- Calculates total VDisks for HDD and NVMe storage
- Applies reserve (1% or minimum 18 VDisks)
- Calculates available VDisks after reserve
- Calculates storage groups (9 VDisks per group)
- Calculates database cores:
  - Reserves 2 cores for system
  - Reserves 6 cores per NVMe device and 0.5 per HDD device
  - Calculates available cores per server
  - Multiplies by server count
- Calculates database RAM:
  - Reserves 4GB for system
  - Reserves 6GB per NVMe device and 2GB per HDD device
  - Calculates available RAM per server
  - Multiplies by server count

#### displayResourcesProvidedResults(results)
Displays the calculated capacity in the results section:
- Updates values for HDD storage groups
- Updates values for NVMe storage groups
- Updates value for database cores
- Updates value for database RAM
- Shows the Resources Provided results section
- Hides the Servers Needed results section

### Data Flow
1. User selects Resources Provided mode using the toggle
2. User inputs server configuration and server count
3. User clicks "Calculate Capacity" button
4. Form data is validated
5. Server configuration is saved to local storage
6. Capacity calculation is performed
7. Results are displayed in the Resources Provided results section

### Business Rules Implementation
All business rules from the requirements document are implemented:
- Storage group calculation with 9 VDisks per group
- Reserve calculation (1% or minimum 18 VDisks)
- System resource reservations (cores and RAM)
- Storage device resource reservations
- Calculation of available resources for database nodes

## File Structure
- `index.html`: Updated with Resources Provided mode UI elements
- `css/styles.css`: Updated with styles for Resources Provided mode components
- `js/calculator.js`: Enhanced with Resources Provided mode calculation functions
- `docs/resources-provided-technical-spec.md`: This document

## Testing
The implementation has been tested with various server configurations to ensure:
- Correct calculation of storage groups
- Proper application of reserves
- Accurate calculation of database resources
- Correct handling of edge cases (zero devices, etc.)
- Proper UI behavior when switching between modes