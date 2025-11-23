// Save server configuration to local storage
function saveServerConfigToLocalStorage() {
    const serverConfig = {
        coresPerServer: document.getElementById('cores-per-server').value,
        ramPerServer: document.getElementById('ram-per-server').value,
        nvmeDevicesPerServer: document.getElementById('nvme-devices-per-server').value,
        nvmeDeviceSize: document.getElementById('nvme-device-size').value,
        hddDevicesPerServer: document.getElementById('hdd-devices-per-server').value,
        hddDeviceSize: document.getElementById('hdd-device-size').value,
        vdisksPerHddPdisk: document.getElementById('vdisks-per-hdd-pdisk').value,
        vdisksPerNvmePdisk: document.getElementById('vdisks-per-nvme-pdisk').value
    };
    
    localStorage.setItem('ydbServerConfig', JSON.stringify(serverConfig));
}

// Load server configuration from local storage
function loadServerConfigFromLocalStorage() {
    const savedConfig = localStorage.getItem('ydbServerConfig');
    
    if (savedConfig) {
        const serverConfig = JSON.parse(savedConfig);
        
        document.getElementById('cores-per-server').value = serverConfig.coresPerServer || '';
        document.getElementById('ram-per-server').value = serverConfig.ramPerServer || '';
        document.getElementById('nvme-devices-per-server').value = serverConfig.nvmeDevicesPerServer || '0';
        document.getElementById('nvme-device-size').value = serverConfig.nvmeDeviceSize || '0';
        document.getElementById('hdd-devices-per-server').value = serverConfig.hddDevicesPerServer || '0';
        document.getElementById('hdd-device-size').value = serverConfig.hddDeviceSize || '0';
        document.getElementById('vdisks-per-hdd-pdisk').value = serverConfig.vdisksPerHddPdisk || '1';
        document.getElementById('vdisks-per-nvme-pdisk').value = serverConfig.vdisksPerNvmePdisk || '1';
    }
}

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
        databaseCores: parseFloat(document.getElementById('database-cores').value) || 0,
        databaseRam: parseFloat(document.getElementById('database-ram').value) || 0
    };
    
    // Validate inputs
    if (!validateInputs(serverConfig, capacityRequirements)) {
        return;
    }
    
    // Save server configuration to local storage
    saveServerConfigToLocalStorage();
    
    // Perform calculations
    const results = performCalculations(serverConfig, capacityRequirements);
    
    // Display results
    displayResults(results);
}

// Input validation function
function validateInputs(serverConfig, capacityRequirements) {
    // Clear previous error messages
    clearErrorMessages();
    
    let isValid = true;
    
    // Check that at least one storage type is specified
    if (capacityRequirements.hddStorageGroups === 0 && capacityRequirements.nvmeStorageGroups === 0) {
        showErrorMessage('hdd-storage-groups', "At least one storage type (HDD or NVMe) must be specified.");
        showErrorMessage('nvme-storage-groups', "At least one storage type (HDD or NVMe) must be specified.");
        isValid = false;
    }
    
    // Validate all inputs are positive numbers where required
    if (serverConfig.coresPerServer <= 0) {
        showErrorMessage('cores-per-server', "Cores per server must be a positive number.");
        isValid = false;
    }
    
    if (serverConfig.ramPerServer <= 0) {
        showErrorMessage('ram-per-server', "RAM per server must be a positive number.");
        isValid = false;
    }
    
    // Check if storage is specified but no devices
    if (capacityRequirements.hddStorageGroups > 0 && serverConfig.hddDevicesPerServer === 0) {
        showErrorMessage('hdd-devices-per-server', "HDD devices per server must be greater than 0 when HDD storage groups are specified.");
        isValid = false;
    }
    
    if (capacityRequirements.nvmeStorageGroups > 0 && serverConfig.nvmeDevicesPerServer === 0) {
        showErrorMessage('nvme-devices-per-server', "NVMe devices per server must be greater than 0 when NVMe storage groups are specified.");
        isValid = false;
    }
    
    return isValid;
}

// Show error message for an input
function showErrorMessage(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    inputElement.parentNode.appendChild(errorElement);
}

// Clear all error messages
function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(element => element.remove());
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
    // Each storage group consists of 9 VDisks
    const hddVdisksRequired = capacityRequirements.hddStorageGroups * 9;
    const nvmeVdisksRequired = capacityRequirements.nvmeStorageGroups * 9;
    
    // Add reserve: 1% or minimum 18 VDisks
    const hddReserve = Math.max(18, Math.ceil(hddVdisksRequired * 0.01));
    const nvmeReserve = Math.max(18, Math.ceil(nvmeVdisksRequired * 0.01));
    
    const totalHddVdisks = hddVdisksRequired + hddReserve;
    const totalNvmeVdisks = nvmeVdisksRequired + nvmeReserve;
    
    // Calculate VDisks per server
    const hddVdisksPerServer = serverConfig.hddDevicesPerServer * serverConfig.vdisksPerHddPdisk;
    const nvmeVdisksPerServer = serverConfig.nvmeDevicesPerServer * serverConfig.vdisksPerNvmePdisk;
    
    // Calculate servers needed
    let hddServers = 0;
    let nvmeServers = 0;
    
    if (hddVdisksPerServer > 0 && totalHddVdisks > 0) {
        hddServers = Math.ceil(totalHddVdisks / hddVdisksPerServer);
    }
    
    if (nvmeVdisksPerServer > 0 && totalNvmeVdisks > 0) {
        nvmeServers = Math.ceil(totalNvmeVdisks / nvmeVdisksPerServer);
    }
    
    return Math.max(hddServers, nvmeServers);
}

// CPU calculation
function calculateCoresServers(serverConfig, capacityRequirements) {
    // Reserve 2-4 cores per server for OS (using 2 as minimum)
    const systemCores = 2;
    
    // Reserve 6 cores per NVMe drive and 0.5 per HDD drive
    const storageCores = (serverConfig.nvmeDevicesPerServer * 6) + (serverConfig.hddDevicesPerServer * 0.5);
    
    // Available cores for database nodes
    const availableCoresPerServer = serverConfig.coresPerServer - systemCores - storageCores;
    
    // If no cores available for database nodes, return 0
    if (availableCoresPerServer <= 0) {
        return 0;
    }
    
    // Calculate servers needed
    if (capacityRequirements.databaseCores <= 0) {
        return 0;
    }
    
    return Math.ceil(capacityRequirements.databaseCores / availableCoresPerServer);
}

// RAM calculation
function calculateRamServers(serverConfig, capacityRequirements) {
    // Reserve 4GB RAM per server for system
    const systemRam = 4;
    
    // Reserve 6GB per NVMe device and 2GB per HDD device
    const storageRam = (serverConfig.nvmeDevicesPerServer * 6) + (serverConfig.hddDevicesPerServer * 2);
    
    // Available RAM for database nodes
    const availableRamPerServer = serverConfig.ramPerServer - systemRam - storageRam;
    
    // If no RAM available for database nodes, return 0
    if (availableRamPerServer <= 0) {
        return 0;
    }
    
    // Calculate servers needed
    if (capacityRequirements.databaseRam <= 0) {
        return 0;
    }
    
    return Math.ceil(capacityRequirements.databaseRam / availableRamPerServer);
}

// Determine dominant resource
function getDominantResource(serversByResource) {
    // Return the resource requiring the most servers
    if (serversByResource.storage >= serversByResource.cores && serversByResource.storage >= serversByResource.ram) {
        return 'storage';
    } else if (serversByResource.cores >= serversByResource.ram) {
        return 'cores';
    } else {
        return 'ram';
    }
}

// Display results
function displayResults(results) {
    // Update the results section with calculated values
    document.getElementById('storage-servers-result').textContent = results.serversByResource.storage;
    document.getElementById('cores-servers-result').textContent = results.serversByResource.cores;
    document.getElementById('ram-servers-result').textContent = results.serversByResource.ram;
    
    // Display dominant resource
    let dominantResourceText = '';
    switch (results.dominantResource) {
        case 'storage':
            dominantResourceText = 'Storage Groups';
            break;
        case 'cores':
            dominantResourceText = 'CPU Cores';
            break;
        case 'ram':
            dominantResourceText = 'RAM';
            break;
    }
    document.getElementById('dominant-resource-result').textContent = dominantResourceText;
    
    // Display final server count
    document.getElementById('final-servers-result').textContent = results.finalServers;
    
    // Show the results section
    document.getElementById('results-section').classList.remove('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved server configuration
    loadServerConfigFromLocalStorage();
    
    // Add event listener for form submission
    document.getElementById('calculator-form').addEventListener('submit', calculateServers);
    
    // Add event listeners to save server config on input changes
    const serverConfigInputs = [
        'cores-per-server',
        'ram-per-server',
        'nvme-devices-per-server',
        'nvme-device-size',
        'hdd-devices-per-server',
        'hdd-device-size',
        'vdisks-per-hdd-pdisk',
        'vdisks-per-nvme-pdisk'
    ];
    
    serverConfigInputs.forEach(inputId => {
        document.getElementById(inputId).addEventListener('change', saveServerConfigToLocalStorage);
    });
});