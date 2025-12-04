# YDB Capacity Calculator - Project Summary

## Project Overview
The YDB Capacity Calculator is a single-page web application designed to help capacity planners determine server requirements for YDB clusters. The application implements two key use cases:

1. **Calculate Servers Needed**: Determine how many servers are required based on specific capacity requirements
2. **Calculate Capacity Provided**: Determine what capacity is provided by a given server configuration and server count

## Features
- **Dual Functionality**: Toggle between calculating server requirements or provided capacity
- **Comprehensive Input**: Capture all relevant server configuration parameters
- **Business Rule Compliance**: Implements all YDB capacity planning business rules
- **Real-time Calculation**: Instant results based on user inputs
- **Data Persistence**: Server configuration automatically saved in local storage
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear validation and error messages
- **YDB Branding**: Uses official YDB colors and styling

## Technical Implementation
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser local storage for configuration persistence
- **Architecture**: Single-page application with dynamic UI updates
- **Validation**: Client-side input validation with user-friendly error messages

## Business Rules Implemented
- Storage groups consist of 9 VDisks each
- Reserve calculation (1% or minimum 18 VDisks)
- System resource reservations (CPU cores and RAM)
- Storage device resource reservations
- Minimum server count enforcement (12 servers)

## File Structure
- `index.html`: Main application interface
- `css/styles.css`: YDB-styled CSS
- `js/calculator.js`: Calculation logic and UI handling
- `docs/`: Comprehensive documentation
  - Requirements, user stories, and business rules
  - Technical specifications
  - User guide
  - UI design
  - Test results

## Usage
1. Open `index.html` in any modern web browser
2. Choose between calculating servers needed or capacity provided
3. Enter server configuration parameters
4. For Story 1: Enter capacity requirements
5. For Story 2: Enter server count
6. Click the calculate button to see results

## Testing
The application has been tested with various configurations to ensure:
- Accurate calculation of server requirements
- Correct application of business rules
- Proper handling of edge cases
- Responsive design across devices
- Data persistence functionality

## Future Enhancements
- Export results to PDF or CSV
- Advanced configuration presets
- Comparison of multiple scenarios
- Integration with YDB documentation