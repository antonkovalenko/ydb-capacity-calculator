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

## Deployment

The application is deployed to Yandex Cloud S3 bucket with static website hosting:
- **Live URL**: https://capacity-calculator.s3-website.mds.yandex.net

### Quick Deploy

```bash
./deploy.sh
```

For detailed deployment instructions, see [How to Deploy](docs/how-to-deploy.md).

## Documentation
The project includes comprehensive documentation in the `docs` folder:

### User Documentation
- [User Guide](docs/user-guide.md) - How to use the calculator
- [User Stories](docs/user-stories.md) - User requirements and scenarios

### Technical Documentation
- [Requirements](docs/requirements.md) - Project requirements
- [Business Rules](docs/business-rules.md) - Calculation logic and rules
- [Technical Specification](docs/technical-specification.md) - Architecture and implementation
- [Story 2 Technical Specification](docs/story2-technical-spec.md) - Capacity calculation feature
- [UI Design](docs/ui-design.md) - User interface design
- [Test Results](docs/test-results.md) - Testing documentation
- [Project Summary](docs/project-summary.md) - Project overview

### Deployment Documentation
- [How to Deploy](docs/how-to-deploy.md) - Deployment guide
- [Deployment Plan](docs/deployment-plan.md) - Deployment architecture and strategy
- [GitIgnore Recommendations](docs/gitignore-recommendations.md) - Security guidelines

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

## Development

### Running Tests
```bash
npm test
```

### Project Structure
```
ydb-capacity-calculator/
├── index.html          # Main application entry point
├── css/               # Stylesheets
│   ├── styles.css     # Application styles
│   └── ydb-tech.css   # YDB technical styles
├── js/                # JavaScript files
│   ├── calculator.js  # Main calculator logic
│   └── core.js       # Core calculation functions
├── images/            # Image assets
├── docs/              # Documentation
├── test/              # Test files
├── deploy.sh          # Deployment script
└── deply/             # Deployment configuration
    └── settings.txt   # S3 credentials (not in git)
```

### Contributing
1. Make changes to the application files
2. Test locally by opening `index.html` in a browser
3. Run tests: `npm test`
4. Deploy: `./deploy.sh`

## License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support
For questions about using this calculator, please refer to the YDB documentation or contact YDB support.