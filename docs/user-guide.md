# YDB Capacity Calculator - User Guide

## Overview
The YDB Capacity Calculator is a tool that helps capacity planners determine server requirements for YDB clusters. It supports two different use cases:
1. Calculate how many servers are needed based on capacity requirements
2. Calculate what capacity is provided by a given server configuration

## Getting Started
1. Open `index.html` in a web browser
2. The application will load with default values or your previously entered server configuration

## Using Story 1: Calculate Servers Needed

### 1. Select Story 1
- Click the "Calculate Servers Needed" button at the top of the form

### 2. Enter Server Configuration
- **Cores per Server**: Total CPU cores available per server
- **RAM per Server (GB)**: Total RAM available per server in GB
- **NVMe Devices per Server**: Number of NVMe devices per server
- **NVMe Device Size (TB)**: Size of each NVMe device in TB
- **HDD Devices per Server**: Number of HDD devices per server
- **HDD Device Size (TB)**: Size of each HDD device in TB
- **VDisks per HDD PDisk**: Number of VDisks per HDD physical disk (default: 1)
- **VDisks per NVMe PDisk**: Number of VDisks per NVMe physical disk (default: 1)

### 3. Enter Capacity Requirements
- **HDD Storage Groups**: Number of storage groups using HDD devices
- **NVMe Storage Groups**: Number of storage groups using NVMe devices
- **Database Cores**: Number of CPU cores required for database nodes
- **Database RAM (GB)**: Amount of RAM required for database nodes in GB

### 4. Calculate
- Click the "Calculate Servers" button
- The application will display:
  - Servers required for storage
  - Servers required for CPU cores
  - Servers required for RAM
  - Dominant resource (the resource requiring the most servers)
  - Final server count (minimum of 12 servers or the dominant resource count)

## Using Story 2: Calculate Capacity Provided

### 1. Select Story 2
- Click the "Calculate Capacity Provided" button at the top of the form

### 2. Enter Server Configuration
- Enter the same server configuration fields as in Story 1:
  - **Cores per Server**
  - **RAM per Server (GB)**
  - **NVMe Devices per Server**
  - **NVMe Device Size (TB)**
  - **HDD Devices per Server**
  - **HDD Device Size (TB)**
  - **VDisks per HDD PDisk**
  - **VDisks per NVMe PDisk**

### 3. Enter Server Count
- **Server Count**: Number of servers in your configuration

### 4. Calculate
- Click the "Calculate Capacity" button
- The application will display:
  - HDD Storage Groups that can be supported
  - NVMe Storage Groups that can be supported
  - Database Cores available
  - Database RAM available (GB)

## Data Persistence
- Server configuration is automatically saved in your browser's local storage
- When you reload the page, your previous server configuration will be restored
- Capacity requirements and server count are not saved (to allow for different scenarios)

## Business Rules
The calculator implements the following YDB business rules:
- Each storage group consists of 9 VDisks
- A reserve of 1% or minimum 18 VDisks is subtracted from total VDisks
- 2-4 CPU cores per server are reserved for the operating system (using 2 as minimum)
- 6 CPU cores per NVMe device and 0.5 CPU cores per HDD device are reserved for storage needs
- 4GB RAM per server is reserved for the operating system
- 6GB RAM per NVMe device and 2GB RAM per HDD device are reserved for storage needs
- The final server count will be at least 12 servers

## Troubleshooting
- If you see error messages, check that all required fields have valid positive numbers
- If calculations seem incorrect, verify that your server configuration matches your actual hardware
- For storage group calculations, ensure you have specified the correct number of storage devices
- The application works best with modern browsers that support local storage

## Support
For questions about using this calculator, please refer to the YDB documentation or contact YDB support.