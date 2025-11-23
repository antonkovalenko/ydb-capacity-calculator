# YDB Capacity Calculator - User Guide

## Overview
The YDB Capacity Calculator is a single-page web application that helps capacity planners determine the number of servers required for a YDB cluster based on specified hardware configurations and capacity requirements.

## Project Structure
The application is organized into separate files for better maintainability:
- `index.html` - Main HTML structure
- `css/styles.css` - All styling rules
- `js/calculator.js` - All JavaScript functionality

## How to Use the Application

### 1. Server Configuration
Enter the specifications of the servers you plan to use:
- **Cores per server**: Total CPU cores available on each server
- **RAM per server**: Total RAM available on each server (in GB)
- **NVMe devices per server**: Number of NVMe storage devices per server
- **NVMe device size**: Size of each NVMe device (in TB)
- **HDD devices per server**: Number of HDD storage devices per server
- **HDD device size**: Size of each HDD device (in TB)
- **VDisks per HDD PDisks**: Number of VDisks that can be launched over HDD PDisks
- **VDisks per NVMe PDisks**: Number of VDisks that can be launched over NVMe PDisks

**Note**: Your server configuration is automatically saved in your browser's local storage. When you return to the page, your server configuration will be pre-filled, allowing you to quickly enter new capacity requirements.

### 2. Capacity Requirements
Specify your capacity requirements:
- **HDD Storage Groups**: Number of HDD storage groups required
- **NVMe Storage Groups**: Number of NVMe storage groups required
- **Database Node Cores**: Total CPU cores required for database nodes
- **Database Node RAM**: Total RAM required for database nodes (in GB)

### 3. Calculate Servers
Click the "Calculate Servers" button to perform the calculation.

### 4. View Results
The results section will display:
- Servers required by storage groups
- Servers required by CPU cores
- Servers required by RAM
- Dominant resource (the resource that requires the most servers)
- Final server count (based on the dominant resource, with a minimum of 12 servers)

## Business Rules Implemented

### Storage Group Sizing
- Each storage group consists of 9 VDisks
- Reserve calculation: 1% of required VDisks or minimum 18 VDisks, whichever is greater

### CPU Allocation

- System cores reserved: 2-4 cores per server for OS and system processes
- Storage cores reserved: 6 cores per NVMe drive and 0.5 cores per HDD drive
- Remaining cores are available for database nodes

### RAM Allocation
- System RAM reserved: 4 GB per server for system needs
- Storage RAM reserved: 6 GB per NVMe device and 2 GB per HDD device
- Remaining RAM is available for database nodes

### Cluster Sizing
- Minimum cluster size: 12 nodes
- Final server count is determined by the dominant resource (the one requiring the most servers)

## Example Calculation
Using the example from the requirements:
- Server: 32 cores, 1024 GB RAM, 2×1TB NVMe, 4×4TB HDD
- Requirements: 10 HDD storage groups, 5 NVMe storage groups, 100 database cores, 5000 GB database RAM
- Result: 32 servers required (dominant resource: storage groups)

## Validation Rules
- All numeric inputs must be positive numbers
- At least one storage type (HDD or NVMe) must be specified
- When storage groups are specified, the corresponding storage devices must also be specified
- The application enforces a minimum cluster size of 12 nodes

## Browser Compatibility
The application works in all modern browsers that support HTML5, CSS3, and JavaScript ES6+.

## Data Persistence
The application automatically saves your server configuration in your browser's local storage. This means:
- Your server configuration is preserved between page visits
- Capacity requirement fields are cleared each time for new calculations
- Data is stored locally in your browser and is not sent to any server

## Running the Application
Simply open the `index.html` file in any modern web browser. No internet connection is required for the calculations, though an internet connection is needed to load the YDB logo.