# YDB Capacity Calculator

## Overview
The YDB Capacity Calculator is a single-page web application designed to help capacity planners determine server requirements for YDB clusters. The application implements two key use cases:

1. **Calculate Servers Needed**: Determine how many servers are required based on specific capacity requirements
2. **Calculate Capacity Provided**: Determine what capacity is provided by a given server configuration and server count

This tool implements all the business rules specified in the YDB capacity planning documentation.

## Features
- **Dual Functionality**: Toggle between calculating server requirements or provided capacity
- **Comprehensive Input**: Capture all relevant server configuration parameters
- **Business Rule Compliance**: Implements all YDB capacity planning business rules
- **Real-time Calculation**: Instant results based on user inputs
- **Data Persistence**: Server configuration automatically saved in local storage
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear validation and error messages
- **YDB Branding**: Uses official YDB colors and styling

## Getting Started
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start calculating your YDB capacity requirements!

## Documentation
The project includes comprehensive documentation in the `docs` folder:

- [Requirements](docs/requirements.md)
- [User Stories](docs/user-stories.md)
- [Business Rules](docs/business-rules.md)
- [User Guide](docs/user-guide.md)
- [Technical Specification](docs/technical-specification.md)
- [Story 2 Technical Specification](docs/story2-technical-spec.md)
- [UI Design](docs/ui-design.md)
- [Test Results](docs/test-results.md)
- [Project Summary](docs/project-summary.md)

## Usage

### Story 1: Calculate Servers Needed
1. Click the "Calculate Servers Needed" toggle
2. Enter your server configuration parameters
3. Enter your capacity requirements
4. Click "Calculate Servers" to see the results

### Story 2: Calculate Capacity Provided
1. Click the "Calculate Capacity Provided" toggle
2. Enter your server configuration parameters
3. Enter the number of servers in your configuration
4. Click "Calculate Capacity" to see the results

## Business Rules Implemented
- Storage groups consist of 9 VDisks each
- Reserve calculation (1% or minimum 18 VDisks)
- System resource reservations (CPU cores and RAM)
- Storage device resource reservations
- Minimum server count enforcement (12 servers)

## Technical Implementation
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser local storage for configuration persistence
- **Architecture**: Single-page application with dynamic UI updates
- **Validation**: Client-side input validation with user-friendly error messages

## Browser Support
The application works in all modern browsers that support:
- HTML5
- CSS3
- JavaScript ES6+
- Local Storage

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
For questions about using this calculator, please refer to the YDB documentation or contact YDB support.