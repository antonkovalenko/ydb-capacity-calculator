# YDB Capacity Calculator

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/your-username/ydb-capacity-calculator.svg)](https://github.com/your-username/ydb-capacity-calculator/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/your-username/ydb-capacity-calculator.svg)](https://github.com/your-username/ydb-capacity-calculator/pulls)

A single-page web application that helps capacity planners determine the number of servers required for a YDB cluster based on specified hardware configurations and capacity requirements.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Data Persistence](#data-persistence)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Server Configuration**: Define your standard server specifications including CPU cores, RAM, and storage devices
- **Capacity Planning**: Calculate server requirements based on storage groups and database resource needs
- **Business Rule Compliance**: Implements all YDB capacity planning business rules
- **Responsive Design**: Works on desktops, tablets, and mobile devices
- **Data Persistence**: Automatically saves your server configuration for future use
- **No Dependencies**: Pure HTML, CSS, and JavaScript with no external libraries
- **Real-time Validation**: Immediate feedback on input errors

## Demo

*Screenshot of the YDB Capacity Calculator in action*

![YDB Capacity Calculator Screenshot](screenshot.png)

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of YDB cluster architecture (helpful but not required)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ydb-capacity-calculator.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ydb-capacity-calculator
   ```

3. Open `index.html` in your web browser:
   ```bash
   open index.html
   ```
   Or simply double-click the `index.html` file

### Usage

1. **Define Server Configuration**:
   - Enter your standard server specifications
   - Configuration is automatically saved for future visits

2. **Specify Capacity Requirements**:
   - Enter the number of HDD and NVMe storage groups needed
   - Specify database node cores and RAM requirements

3. **Calculate Servers**:
   - Click the "Calculate Servers" button
   - View detailed results showing server counts by resource type

4. **Review Results**:
   - See which resource (storage, CPU, or RAM) is dominant
   - Get the final server count based on the dominant resource

## How It Works

The calculator implements YDB's official capacity planning methodology:

1. **Storage Group Calculation**:
   - Each storage group consists of 9 VDisks
   - Reserve calculation: 1% of required VDisks or minimum 18 VDisks
   - Calculates servers needed based on VDisks per server

2. **CPU Allocation**:
   - Reserves 2-4 cores per server for OS processes
   - Reserves 6 cores per NVMe drive and 0.5 cores per HDD drive
   - Calculates available cores for database nodes

3. **RAM Allocation**:
   - Reserves 4GB RAM per server for system needs
   - Reserves 6GB per NVMe device and 2GB per HDD device
   - Calculates available RAM for database nodes

4. **Final Calculation**:
   - Determines server count for each resource type
   - Identifies the dominant resource
   - Enforces minimum cluster size of 12 nodes

## Project Structure

```
ydb-capacity-calculator/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling rules
├── js/
│   └── calculator.js       # All JavaScript functionality
├── docs/
│   ├── requirements.md     # Project requirements
│   ├── user-stories.md     # User stories and acceptance criteria
│   ├── business-rules.md   # Business rules and calculation logic
│   ├── user-guide.md       # User guide for the application
│   ├── project-summary.md  # Project summary and technical details
│   └── ...                 # Additional documentation
├── LICENSE                 # Apache 2.0 License
└── README.md               # This file
```

## Data Persistence

The application uses the browser's local storage to save your server configuration:

- **What's Saved**: Server configuration fields only
- **What's Not Saved**: Capacity requirement fields (cleared on each visit)
- **Privacy**: All data is stored locally in your browser and never sent to any server
- **Benefits**: No need to re-enter standard server specs on future visits

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate documentation.

### Development Setup

1. Clone the repository
2. Make your changes
3. Test thoroughly in multiple browsers
4. Update documentation as needed
5. Submit a pull request

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [YDB](https://ydb.tech/) - The distributed SQL database that this calculator helps plan for
- All contributors who have helped shape this project

---

Made with ❤️ for the YDB community