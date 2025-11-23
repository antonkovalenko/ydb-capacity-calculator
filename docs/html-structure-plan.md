# HTML Structure Plan - YDB Capacity Calculator

## File Structure
- Single HTML file: index.html
- Embedded CSS for styling
- Embedded JavaScript for functionality

## HTML Structure

### Document Head
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YDB Capacity Calculator</title>
    <link rel="icon" href="https://storage.yandexcloud.net/ydb-site-assets/ydb_icon.svg" type="image/svg+xml">
</head>
```

### Body Structure
```html
<body>
    <header>
        <h1>
            <img src="https://storage.yandexcloud.net/ydb-site-assets/ydb_icon.svg" alt="YDB Logo" class="logo">
            YDB Capacity Calculator
        </h1>
        <p>Calculate the number of servers required for your YDB cluster</p>
    </header>

    <main>
        <form id="calculator-form">
            <!-- Server Configuration Section -->
            <section class="form-section">
                <h2>Server Configuration</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="cores-per-server">Cores per server:</label>
                        <input type="number" id="cores-per-server" min="1" step="1" required>
                    </div>
                    <div class="form-group">
                        <label for="ram-per-server">RAM per server (GB):</label>
                        <input type="number" id="ram-per-server" min="1" step="1" required>
                    </div>
                    <!-- Additional server configuration fields -->
                </div>
            </section>

            <!-- Capacity Requirements Section -->
            <section class="form-section">
                <h2>Capacity Requirements</h2>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="hdd-storage-groups">HDD Storage Groups:</label>
                        <input type="number" id="hdd-storage-groups" min="0" step="1">
                    </div>
                    <div class="form-group">
                        <label for="nvme-storage-groups">NVMe Storage Groups:</label>
                        <input type="number" id="nvme-storage-groups" min="0" step="1">
                    </div>
                    <!-- Additional capacity requirement fields -->
                </div>
            </section>

            <button type="submit" id="calculate-button">Calculate Servers</button>
        </form>

        <!-- Results Section -->
        <section id="results-section" class="hidden">
            <h2>Calculation Results</h2>
            <div class="results-grid">
                <div class="result-item">
                    <span class="result-label">Servers required by storage groups:</span>
                    <span class="result-value" id="storage-servers-result"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Servers required by cores:</span>
                    <span class="result-value" id="cores-servers-result"></span>
                </div>
                <div class="result-item">
                    <span class="result-label">Servers required by RAM:</span>
                    <span class="result-value" id="ram-servers-result"></span>
                </div>
                <div class="result-item dominant">
                    <span class="result-label">Dominant resource:</span>
                    <span class="result-value" id="dominant-resource-result"></span>
                </div>
                <div class="result-item final">
                    <span class="result-label">Final server count:</span>
                    <span class="result-value" id="final-servers-result"></span>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>YDB Capacity Calculator &copy; 2025</p>
    </footer>
</body>
```

### CSS Styling Plan
```css
<style>
/* Base styles */
:root {
    --primary-color: #007bff;
    --primary-dark: #0056b3;
    --secondary-color: #6c757d;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
    --success-color: #28a745;
    --border-color: #dee2e6;
    --shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
}

/* Header styles */
header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem;
    text-align: center;
    box-shadow: var(--shadow);
}

header h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.5rem;
}

.logo {
    height: 2rem;
    width: auto;
}

/* Main content styles */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

/* Form styles */
.form-section {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow);
}

.form-section h2 {
    margin-bottom: 1rem;
    color: var(--dark-color);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 0.25rem;
    font-weight: 500;
}

.form-group input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
    font-size: 1rem;
}

.form-group input:focus {
    outline: 0;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Button styles */
#calculate-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.25rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    display: block;
    margin: 0 auto 2rem;
    box-shadow: var(--shadow);
    transition: background-color 0.15s ease-in-out;
}

#calculate-button:hover {
    background-color: var(--primary-dark);
}

#calculate-button:disabled {
    background-color: var(--secondary-color);
    cursor: not-allowed;
}

/* Results styles */
#results-section {
    background-color: white;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

#results-section.hidden {
    display: none;
}

#results-section h2 {
    margin-bottom: 1rem;
    color: var(--dark-color);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.result-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
    background-color: var(--light-color);
}

.result-item.dominant {
    border-color: var(--primary-color);
    background-color: rgba(0, 123, 255, 0.1);
    font-weight: bold;
}

.result-item.final {
    border-color: var(--success-color);
    background-color: rgba(40, 167, 69, 0.1);
    font-weight: bold;
    font-size: 1.1rem;
}

.result-label {
    font-weight: 500;
}

.result-value {
    font-weight: 600;
}

/* Footer styles */
footer {
    text-align: center;
    padding: 1rem;
    color: var(--secondary-color);
    border-top: 1px solid var(--border-color);
    margin-top: 2rem;
}

/* Responsive styles */
@media (max-width: 768px) {
    .form-grid,
    .results-grid {
        grid-template-columns: 1fr;
    }
    
    header h1 {
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>
```

### JavaScript Functionality Plan
```javascript
<script>
// Main calculation function
function calculateServers(event) {
    event.preventDefault();
    
    // Get input values
    const serverConfig = {
        coresPerServer: parseFloat(document.getElementById('cores-per-server').value),
        ramPerServer: parseFloat(document.getElementById('ram-per-server').value),
        nvmeDevicesPerServer: parseInt(document.getElementById('nvme-devices-per-server').value),
        nvmeDeviceSize: parseFloat(document.getElementById('nvme-device-size').value),
        hddDevicesPerServer: parseInt(document.getElementById('hdd-devices-per-server').value),
        hddDeviceSize: parseFloat(document.getElementById('hdd-device-size').value),
        vdisksPerHddPdisk: parseInt(document.getElementById('vdisks-per-hdd-pdisk').value),
        vdisksPerNvmePdisk: parseInt(document.getElementById('vdisks-per-nvme-pdisk').value)
    };
    
    const capacityRequirements = {
        hddStorageGroups: parseInt(document.getElementById('hdd-storage-groups').value) || 0,
        nvmeStorageGroups: parseInt(document.getElementById('nvme-storage-groups').value) || 0,
        databaseCores: parseFloat(document.getElementById('database-cores').value),
        databaseRam: parseFloat(document.getElementById('database-ram').value)
    };
    
    // Validate inputs
    if (!validateInputs(serverConfig, capacityRequirements)) {
        return;
    }
    
    // Perform calculations
    const results = performCalculations(serverConfig, capacityRequirements);
    
    // Display results
    displayResults(results);
}

// Input validation function
function validateInputs(serverConfig, capacityRequirements) {
    // Check that at least one storage type is specified
    if (capacityRequirements.hddStorageGroups === 0 && capacityRequirements.nvmeStorageGroups === 0) {
        alert("At least one storage type (HDD or NVMe) must be specified.");
        return false;
    }
    
    // Validate all inputs are positive numbers
    // ... validation logic ...
    
    return true;
}

// Calculation logic
function performCalculations(serverConfig, capacityRequirements) {
    // Calculate servers required by storage groups
    const storageServers = calculateStorageServers(serverConfig, capacityRequirements);
    
    // Calculate servers required by CPU cores
    const coresServers = calculateCoresServers(serverConfig, capacityRequirements);
    
    // Calculate servers required by RAM
    const ramServers = calculateRamServers(serverConfig, capacityRequirements);
    
    // Determine dominant resource
    const serversByResource = {
        storage: storageServers,
        cores: coresServers,
        ram: ramServers
    };
    
    const dominantResource = getDominantResource(serversByResource);
    const finalServers = Math.max(12, serversByResource[dominantResource]);
    
    return {
        serversByResource,
        dominantResource,
        finalServers
    };
}

// Storage group calculation
function calculateStorageServers(serverConfig, capacityRequirements) {
    // Implementation based on business rules
    // Each storage group consists of 9 VDisks
    // Add 1% reserve or minimum 18 VDisks
    // Calculate servers needed based on VDisks per server
    // ... calculation logic ...
}

// CPU calculation
function calculateCoresServers(serverConfig, capacityRequirements) {
    // Implementation based on business rules
    // Reserve 2-4 cores per server for OS
    // Reserve 6 cores per NVMe drive and 0.5 per HDD drive
    // ... calculation logic ...
}

// RAM calculation
function calculateRamServers(serverConfig, capacityRequirements) {
    // Implementation based on business rules
    // Reserve 4GB RAM per server for system
    // Reserve 6GB per NVMe device and 2GB per HDD device
    // ... calculation logic ...
}

// Determine dominant resource
function getDominantResource(serversByResource) {
    // Return the resource requiring the most servers
    // ... logic ...
}

// Display results
function displayResults(results) {
    // Update the results section with calculated values
    // Show the results section
    document.getElementById('results-section').classList.remove('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculator-form').addEventListener('submit', calculateServers);
});
</script>
```

### Complete HTML Structure
The final HTML file will combine all these elements into a single, self-contained file with:
1. Proper HTML5 structure
2. Embedded CSS for styling
3. Embedded JavaScript for functionality
4. YDB branding with official logo
5. Responsive design for all screen sizes
6. Form validation and error handling
7. Clear results display