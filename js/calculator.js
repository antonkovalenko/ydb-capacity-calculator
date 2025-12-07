// Current active story (1 or 2)
let currentStory = 1;

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
        // sensible defaults per business rules
        document.getElementById('vdisks-per-hdd-pdisk').value = serverConfig.vdisksPerHddPdisk || '8';
        document.getElementById('vdisks-per-nvme-pdisk').value = serverConfig.vdisksPerNvmePdisk || '16';
    }
}

// Switch between stories
function switchStory(storyNumber) {
    currentStory = storyNumber;
    
    // Update toggle buttons
    document.getElementById('story1-toggle').classList.toggle('active', storyNumber === 1);
    document.getElementById('story2-toggle').classList.toggle('active', storyNumber === 2);
    
    // Show/hide sections
    document.getElementById('story1-section').classList.toggle('hidden', storyNumber !== 1);
    document.getElementById('story2-section').classList.toggle('hidden', storyNumber !== 2);
    
    // Update button text
    document.getElementById('calculate-button').textContent = 
        storyNumber === 1 ? 'Calculate Servers' : 'Calculate Capacity';
    
    // Hide results
    document.getElementById('story1-results').classList.add('hidden');
    document.getElementById('story2-results').classList.add('hidden');
    
    // Clear capacity requirements for Story 1
    if (storyNumber === 1) {
        document.getElementById('hdd-storage-groups').value = '0';
        document.getElementById('nvme-storage-groups').value = '0';
        document.getElementById('database-cores').value = '0';
        document.getElementById('database-ram').value = '0';
    }
    
    // Clear server count for Story 2
    if (storyNumber === 2) {
        document.getElementById('server-count').value = '1';
    }

    // Update calculate button enabled state
    updateCalculateButtonState();
}

// Update enabled/disabled state of calculate button based on minimal validation
function updateCalculateButtonState() {
    const btn = document.getElementById('calculate-button');
    if (!btn) return;

    const cores = parseFloat(document.getElementById('cores-per-server').value) || 0;
    const ram = parseFloat(document.getElementById('ram-per-server').value) || 0;

    if (currentStory === 1) {
        const hddGroups = parseInt(document.getElementById('hdd-storage-groups').value) || 0;
        const nvmeGroups = parseInt(document.getElementById('nvme-storage-groups').value) || 0;
        const enable = cores > 0 && ram > 0 && (hddGroups > 0 || nvmeGroups > 0);
        btn.disabled = !enable;
        btn.setAttribute('aria-disabled', (!enable).toString());
    } else {
        const serverCount = parseInt(document.getElementById('server-count').value) || 0;
        const enable = cores > 0 && ram > 0 && serverCount > 0;
        btn.disabled = !enable;
        btn.setAttribute('aria-disabled', (!enable).toString());
    }
}

// Toggle visibility of server configuration section
function toggleServerConfig() {
    const section = document.getElementById('server-config-section');
    const btn = document.getElementById('toggle-server-config');
    if (!section || !btn) return;

    const hidden = section.classList.toggle('hidden');
    btn.textContent = hidden ? 'Show Server Configuration' : 'Hide Server Configuration';

    const summaryEl = document.getElementById('server-config-summary');
    if (hidden) {
        // show brief configuration summary
        if (summaryEl) {
            summaryEl.textContent = buildServerConfigSummary();
            summaryEl.classList.remove('hidden');
        }
    } else {
        if (summaryEl) summaryEl.classList.add('hidden');
    }
}

// Main calculation function
function calculate(event) {
    event.preventDefault();
    
    if (currentStory === 1) {
        calculateServers();
    } else {
        calculateCapacity();
    }
}

// Story 1: Calculate servers needed
function calculateServers() {
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
    
    // Enforce defaults and clamp ranges (vdisks defaults: HDD=8, NVMe=16)
    enforceAndNormalizeServerConfig(serverConfig);

    // If database RAM not specified but cores requested, auto-fill RAM: 50 GB per 10 cores (5 GB/core)
    if ((capacityRequirements.databaseRam || 0) <= 0 && (capacityRequirements.databaseCores || 0) > 0) {
        capacityRequirements.databaseRam = Math.ceil(capacityRequirements.databaseCores * 5);
        // update input to show auto-filled value
        const ramEl = document.getElementById('database-ram');
        if (ramEl) ramEl.value = capacityRequirements.databaseRam;
    }

    // Validate inputs
    if (!validateInputs(serverConfig, capacityRequirements)) {
        return;
    }
    
    // Save server configuration to local storage
    saveServerConfigToLocalStorage();
    
    // Perform calculations
    const results = performCalculations(serverConfig, capacityRequirements);
    
    // Display results
    displayStory1Results(results);
}

// Story 2: Calculate capacity provided
function calculateCapacity() {
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
    
    const serverCount = parseInt(document.getElementById('server-count').value) || 1;
    
    // Enforce defaults and clamp ranges
    enforceAndNormalizeServerConfig(serverConfig);

    // Validate inputs
    if (!validateServerConfig(serverConfig) || serverCount <= 0) {
        if (serverCount <= 0) {
            showErrorMessage('server-count', "Server count must be a positive number.");
        }
        return;
    }
    
    // Save server configuration to local storage
    saveServerConfigToLocalStorage();
    
    // Perform calculations
    const results = calculateProvidedCapacity(serverConfig, serverCount);
    
    // Display results
    displayStory2Results(results);
}

// Input validation for Story 1
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
    
    // Validate server configuration
    if (!validateServerConfig(serverConfig)) {
        return false;
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

// Validate server configuration
function validateServerConfig(serverConfig) {
    let isValid = true;
    
    // Validate all inputs are positive numbers where required
    if (serverConfig.coresPerServer <= 0) {
        showErrorMessage('cores-per-server', "Cores per server must be a positive number.");
        isValid = false;
    }
    
    if (serverConfig.ramPerServer <= 0) {
        showErrorMessage('ram-per-server', "RAM per server must be a positive number.");
        isValid = false;
    }

    // Validate vdisks per pdisk ranges
    if (serverConfig.vdisksPerHddPdisk < 1 || serverConfig.vdisksPerHddPdisk > 16) {
        showErrorMessage('vdisks-per-hdd-pdisk', 'VDisks per HDD PDisk should be between 1 and 16.');
        isValid = false;
    }

    if (serverConfig.vdisksPerNvmePdisk < 1 || serverConfig.vdisksPerNvmePdisk > 32) {
        showErrorMessage('vdisks-per-nvme-pdisk', 'VDisks per NVMe PDisk should be between 1 and 32.');
        isValid = false;
    }
    
    return isValid;
}

// Enforce defaults and clamp ranges for server configuration inputs
function enforceAndNormalizeServerConfig(serverConfig) {
    // defaults per business rules
    if (!serverConfig.vdisksPerHddPdisk || isNaN(serverConfig.vdisksPerHddPdisk)) serverConfig.vdisksPerHddPdisk = 8;
    if (!serverConfig.vdisksPerNvmePdisk || isNaN(serverConfig.vdisksPerNvmePdisk)) serverConfig.vdisksPerNvmePdisk = 16;

    // clamp to allowed ranges
    if (serverConfig.vdisksPerHddPdisk < 1) serverConfig.vdisksPerHddPdisk = 1;
    if (serverConfig.vdisksPerHddPdisk > 16) {
        serverConfig.vdisksPerHddPdisk = 16;
        showWarningMessage('vdisks-per-hdd-pdisk', 'VDisks per HDD PDisk capped to 16 (max supported).');
    }

    if (serverConfig.vdisksPerNvmePdisk < 1) serverConfig.vdisksPerNvmePdisk = 1;
    if (serverConfig.vdisksPerNvmePdisk > 32) {
        serverConfig.vdisksPerNvmePdisk = 32;
        showWarningMessage('vdisks-per-nvme-pdisk', 'VDisks per NVMe PDisk capped to 32 (max supported).');
    }

    // update DOM elements to reflect normalized values
    const hEl = document.getElementById('vdisks-per-hdd-pdisk');
    const nEl = document.getElementById('vdisks-per-nvme-pdisk');
    if (hEl) hEl.value = serverConfig.vdisksPerHddPdisk;
    if (nEl) nEl.value = serverConfig.vdisksPerNvmePdisk;

    return serverConfig;
}

// Show a non-blocking warning message for an input (e.g. not recommended values)
function showWarningMessage(inputId, message) {
    const inputElement = document.getElementById(inputId);
    // remove existing warning next to this input
    const existing = inputElement.parentNode.querySelector('.warning-message');
    if (existing) existing.remove();
    const warn = document.createElement('div');
    warn.className = 'warning-message';
    warn.textContent = message;
    inputElement.parentNode.appendChild(warn);
}

function clearWarningMessages() {
    const warnings = document.querySelectorAll('.warning-message');
    warnings.forEach(w => w.remove());
}

// Check for soft warnings according to business rules
function checkWarnings() {
    clearWarningMessages();
    const nvme = parseInt(document.getElementById('nvme-devices-per-server').value) || 0;
    const hdd = parseInt(document.getElementById('hdd-devices-per-server').value) || 0;
    const vdisksHdd = parseInt(document.getElementById('vdisks-per-hdd-pdisk').value) || 0;
    const vdisksNvme = parseInt(document.getElementById('vdisks-per-nvme-pdisk').value) || 0;

    if (nvme > 16) {
        showWarningMessage('nvme-devices-per-server', 'More than 16 NVMe devices per server is unusual; verify configuration.');
    }
    if (hdd > 16) {
        showWarningMessage('hdd-devices-per-server', 'More than 16 HDD devices per server is unusual; verify configuration.');
    }
    if (vdisksHdd > 8) {
        showWarningMessage('vdisks-per-hdd-pdisk', 'More than 8 vdisks per HDD PDisk is not recommended.');
    }
    if (vdisksNvme > 16) {
        showWarningMessage('vdisks-per-nvme-pdisk', 'More than 16 vdisks per NVMe PDisk is not recommended.');
    }
}

// Build a brief server configuration summary for story 3
function buildServerConfigSummary() {
    const cores = document.getElementById('cores-per-server').value || 'N/A';
    const ram = document.getElementById('ram-per-server').value || 'N/A';
    const nvmeCount = document.getElementById('nvme-devices-per-server').value || '0';
    const nvmeSize = document.getElementById('nvme-device-size').value || '0';
    const hddCount = document.getElementById('hdd-devices-per-server').value || '0';
    const hddSize = document.getElementById('hdd-device-size').value || '0';

    return `${cores} cores, ${ram} GB RAM, ${nvmeCount}x${nvmeSize}TB NVMe, ${hddCount}x${hddSize}TB HDD`;
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

// Story 1: Calculation logic
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

// Story 2: Calculate provided capacity
function calculateProvidedCapacity(serverConfig, serverCount) {
    // Calculate storage groups
    const hddVdisksPerServer = serverConfig.hddDevicesPerServer * serverConfig.vdisksPerHddPdisk;
    const nvmeVdisksPerServer = serverConfig.nvmeDevicesPerServer * serverConfig.vdisksPerNvmePdisk;
    
    const totalHddVdisks = hddVdisksPerServer * serverCount;
    const totalNvmeVdisks = nvmeVdisksPerServer * serverCount;
    
    // Each storage group consists of 9 VDisks
    // Subtract reserve: 1% or minimum 18 VDisks
    const hddReserve = Math.max(18, Math.ceil(totalHddVdisks * 0.01));
    const nvmeReserve = Math.max(18, Math.ceil(totalNvmeVdisks * 0.01));
    
    const availableHddVdisks = Math.max(0, totalHddVdisks - hddReserve);
    const availableNvmeVdisks = Math.max(0, totalNvmeVdisks - nvmeReserve);
    
    const hddStorageGroups = Math.floor(availableHddVdisks / 9);
    const nvmeStorageGroups = Math.floor(availableNvmeVdisks / 9);
    
    // Calculate database resources
    // Reserve 2-4 cores per server for OS (using 2 as minimum)
    const systemCores = 2;
    
    // Reserve 6 cores per NVMe drive and 0.5 per HDD drive
    const storageCores = (serverConfig.nvmeDevicesPerServer * 6) + (serverConfig.hddDevicesPerServer * 0.5);
    
    // Available cores for database nodes
    const availableCoresPerServer = Math.max(0, serverConfig.coresPerServer - systemCores - storageCores);
    const databaseCores = availableCoresPerServer * serverCount;
    
    // Reserve 4GB RAM per server for system
    const systemRam = 4;
    
    // Reserve 6GB per NVMe device and 2GB per HDD device
    const storageRam = (serverConfig.nvmeDevicesPerServer * 6) + (serverConfig.hddDevicesPerServer * 2);
    
    // Available RAM for database nodes
    const availableRamPerServer = Math.max(0, serverConfig.ramPerServer - systemRam - storageRam);
    const databaseRam = availableRamPerServer * serverCount;
    
    return {
        hddStorageGroups,
        nvmeStorageGroups,
        databaseCores,
        databaseRam
    };
}

// Display Story 1 results
function displayStory1Results(results) {
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
    document.getElementById('story1-results').classList.remove('hidden');
    document.getElementById('story2-results').classList.add('hidden');

    // Clear previous highlights
    ['storage','cores','ram'].forEach(r => {
        const el = document.getElementById(`${r}-servers-item`);
        if (el) el.classList.remove('dominant');
    });
    const finalItem = document.getElementById('final-item');
    if (finalItem) finalItem.classList.remove('final');

    // Highlight dominant resource and final result
    const dominant = results.dominantResource;
    const dominantEl = document.getElementById(dominant + '-servers-item');
    if (dominantEl) dominantEl.classList.add('dominant');
    if (finalItem) finalItem.classList.add('final');
}

// Display Story 2 results
function displayStory2Results(results) {
    // Update the results section with calculated values
    document.getElementById('hdd-storage-groups-result').textContent = results.hddStorageGroups;
    document.getElementById('nvme-storage-groups-result').textContent = results.nvmeStorageGroups;
    document.getElementById('database-cores-result').textContent = results.databaseCores.toFixed(0);
    document.getElementById('database-ram-result').textContent = results.databaseRam.toFixed(0);
    
    // Show the results section
    document.getElementById('story2-results').classList.remove('hidden');
    document.getElementById('story1-results').classList.add('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load saved server configuration
    loadServerConfigFromLocalStorage();
    
    // Add event listeners for story toggle
    document.getElementById('story1-toggle').addEventListener('click', function() {
        switchStory(1);
    });
    
    document.getElementById('story2-toggle').addEventListener('click', function() {
        switchStory(2);
    });
    
    // Add event listener for form submission
    document.getElementById('calculator-form').addEventListener('submit', calculate);
    
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

    // Live behavior: update calculate button, check warnings and save on changes
    const liveInputs = serverConfigInputs.concat(['hdd-storage-groups','nvme-storage-groups','database-cores','database-ram','server-count']);
    liveInputs.forEach(inputId => {
        const el = document.getElementById(inputId);
        if (el) {
            el.addEventListener('input', updateCalculateButtonState);
            el.addEventListener('input', checkWarnings);
        }
    });

    // Toggle server config visibility
    const toggleBtn = document.getElementById('toggle-server-config');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleServerConfig);

    // Ensure calculate button initial state
    updateCalculateButtonState();
    checkWarnings();
    // if server config is initially hidden show a summary
    const serverSection = document.getElementById('server-config-section');
    if (serverSection && serverSection.classList.contains('hidden')) {
        const summaryEl = document.getElementById('server-config-summary');
        if (summaryEl) {
            summaryEl.textContent = buildServerConfigSummary();
            summaryEl.classList.remove('hidden');
        }
    }
});