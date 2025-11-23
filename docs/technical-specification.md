# Technical Specification - YDB Capacity Calculator

## Overview
This document outlines the technical implementation plan for the YDB Capacity Calculator, a single-page application that helps capacity planners determine the number of servers required for a YDB cluster based on specified hardware configurations and capacity requirements.

## Application Structure
- Single HTML file with embedded CSS and JavaScript
- Responsive design using modern UI principles
- Client-side calculations in JavaScript
- YDB branding with official logo and colors

## Key Components

### 1. Input Section
- Server Configuration Form:
  - CPU cores per server
  - RAM per server (GB)
  - NVMe storage devices per server
  - NVMe device size (TB)
  - HDD storage devices per server
  - HDD device size (TB)
  - VDisks per HDD PDisks
  - VDisks per NVMe PDisks

- Capacity Requirements Form:
  - Number of HDD storage groups
  - Number of NVMe storage groups
  - Database node cores required
  - Database node RAM required (GB)

### 2. Calculation Engine
- Storage group calculations (9 VDisks per group)
- Server count calculations by resource type:
  - Storage groups (HDD and NVMe)
  - CPU cores for database nodes
  - RAM for database nodes
- Minimum cluster size enforcement (12 nodes)
- Dominant resource identification

### 3. Results Display
- Server count by resource type
- Dominant resource identification
- Relative differences between resource requirements
- Clear presentation of final server count

## Business Logic Implementation

### Storage Group Calculations
1. Each storage group consists of 9 VDisks
2. Calculate required VDisks: (groups * 9) + reserve
3. Reserve: 1% or minimum 18 VDisks
4. Calculate servers needed based on VDisks per server

### CPU Calculations
1. System cores reserved: 2-4 per server
2. Storage cores: 6 per NVMe drive, 0.5 per HDD drive
3. Available cores: Total cores - system cores - storage cores
4. Servers by CPU: Required database cores / available cores per server

### RAM Calculations
1. System RAM reserved: 4GB per server
2. Storage RAM: 6GB per NVMe device, 2GB per HDD device
3. Available RAM: Total RAM - system RAM - storage RAM
4. Servers by RAM: Required database RAM / available RAM per server

### Final Calculation
1. Calculate servers needed for each resource type
2. Identify dominant resource (highest server count)
3. Present final server count based on dominant resource
4. Show relative differences between resource requirements

## UI/UX Design
- Clean, modern interface with YDB branding
- Form sections with clear labels and input fields
- Real-time validation with helpful error messages
- Results displayed in an easy-to-understand format
- Responsive design for various screen sizes

## Validation Rules
- All numeric inputs must be positive numbers
- At least one storage type (HDD or NVMe) must be specified
- Minimum cluster size enforced (12 nodes)
- Reasonable value ranges for all inputs

## Dependencies
- No external libraries or frameworks
- Pure HTML, CSS, and JavaScript
- YDB logo from: https://storage.yandexcloud.net/ydb-site-assets/ydb_icon.svg