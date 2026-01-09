// Current active story (1 or 2)
let currentStory = 1;
// Flag to avoid showing warnings triggered by programmatic input population
let userHasInteracted = false;
// Track previous VDisks values to detect changes for popover display
let previousVDisksHdd = null;
let previousVDisksNvme = null;

// Constants for configuration and business rules
const DEFAULT_VDISKS_HDD = 8;
const DEFAULT_VDISKS_NVME = 16;
const MIN_VDISKS_PER_PDISK = 1;
const MAX_VDISKS_HDD = 16;
const MAX_VDISKS_NVME = 32;
const MAX_DEVICES_PER_SERVER = 16;
const RECOMMENDED_MAX_VDISKS_HDD = 8;
const RECOMMENDED_MAX_VDISKS_NVME = 16;
const STORAGE_GROUP_SIZE = 9;
const MIN_RESERVE_VDISKS = 18;
const RESERVE_PERCENTAGE = 0.01;
const SYSTEM_CORES_RESERVE = 2;
const NVME_CORES_RESERVE = 6;
const HDD_CORES_RESERVE = 0.5;
const SYSTEM_RAM_RESERVE = 4;
const NVME_RAM_RESERVE = 6;
const HDD_RAM_RESERVE = 2;
const MIN_SERVERS = 12;
const RAM_PER_CORE_RATIO = 5;

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
    // Keep the brief summary in sync when config changes
    updateServerConfigSummary();
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
        document.getElementById('vdisks-per-hdd-pdisk').value = serverConfig.vdisksPerHddPdisk || DEFAULT_VDISKS_HDD.toString();
        document.getElementById('vdisks-per-nvme-pdisk').value = serverConfig.vdisksPerNvmePdisk || DEFAULT_VDISKS_NVME.toString();
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
        const dbCores = parseFloat(document.getElementById('database-cores').value) || 0;
        const dbRam = parseFloat(document.getElementById('database-ram').value) || 0;
        // Enable if server config is valid AND at least one requirement is specified
        const hasRequirements = (hddGroups > 0 || nvmeGroups > 0 || dbCores > 0 || dbRam > 0);
        const enable = cores > 0 && ram > 0 && hasRequirements;
        btn.disabled = !enable;
        btn.setAttribute('aria-disabled', (!enable).toString());
    } else {
        const serverCount = parseInt(document.getElementById('server-count').value) || 0;
        // Rule 2: Disable button if server count is less than 9
        const enable = cores > 0 && ram > 0 && serverCount >= 9;
        btn.disabled = !enable;
        btn.setAttribute('aria-disabled', (!enable).toString());
    }
}

// Toggle visibility of server configuration section
function toggleServerConfig() {
    const content = document.getElementById('server-config-content');
    const btn = document.getElementById('toggle-server-config');
    const reservedDisplay = document.getElementById('reserved-resources-display');
    if (!content || !btn) return;

    const hidden = content.classList.toggle('hidden');
    btn.textContent = hidden ? 'Show' : 'Hide';

    // Also toggle reserved resources display
    if (reservedDisplay) {
        if (hidden) {
            reservedDisplay.classList.add('hidden');
        } else {
            reservedDisplay.classList.remove('hidden');
        }
    }

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
    if (!validateServerConfig(serverConfig)) {
        return;
    }
    
    // Validate server count with specific rules
    clearErrorMessages();
    clearWarningMessages();
    
    if (serverCount < 9) {
        // Rule 2: Less than 9 servers - show error and disable calculation
        showErrorMessage('server-count', "Mirror-3dc configuration requires at least 9 servers to work.");
        return;
    }
    
    if (serverCount >= 9 && serverCount < MIN_SERVERS) {
        // Rule 3: Between 9 and 12 servers - show warning but allow calculation
        showWarningMessage('server-count', "Mirror-3dc configuration requires minimum 12 servers to work in production mode.");
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
    if (serverConfig.vdisksPerHddPdisk < MIN_VDISKS_PER_PDISK || serverConfig.vdisksPerHddPdisk > MAX_VDISKS_HDD) {
        showErrorMessage('vdisks-per-hdd-pdisk', `VDisks per HDD PDisk should be between ${MIN_VDISKS_PER_PDISK} and ${MAX_VDISKS_HDD}.`);
        isValid = false;
    }

    if (serverConfig.vdisksPerNvmePdisk < MIN_VDISKS_PER_PDISK || serverConfig.vdisksPerNvmePdisk > MAX_VDISKS_NVME) {
        showErrorMessage('vdisks-per-nvme-pdisk', `VDisks per NVMe PDisk should be between ${MIN_VDISKS_PER_PDISK} and ${MAX_VDISKS_NVME}.`);
        isValid = false;
    }
    
    return isValid;
}

// Enforce defaults and clamp ranges for server configuration inputs
function enforceAndNormalizeServerConfig(serverConfig) {
    // defaults per business rules
    if (!serverConfig.vdisksPerHddPdisk || isNaN(serverConfig.vdisksPerHddPdisk)) serverConfig.vdisksPerHddPdisk = DEFAULT_VDISKS_HDD;
    if (!serverConfig.vdisksPerNvmePdisk || isNaN(serverConfig.vdisksPerNvmePdisk)) serverConfig.vdisksPerNvmePdisk = DEFAULT_VDISKS_NVME;

    // clamp to allowed ranges
    if (serverConfig.vdisksPerHddPdisk < MIN_VDISKS_PER_PDISK) serverConfig.vdisksPerHddPdisk = MIN_VDISKS_PER_PDISK;
    if (serverConfig.vdisksPerHddPdisk > MAX_VDISKS_HDD) {
        serverConfig.vdisksPerHddPdisk = MAX_VDISKS_HDD;
        showWarningMessage('vdisks-per-hdd-pdisk', `VDisks per HDD PDisk capped to ${MAX_VDISKS_HDD} (max supported).`);
    }

    if (serverConfig.vdisksPerNvmePdisk < MIN_VDISKS_PER_PDISK) serverConfig.vdisksPerNvmePdisk = MIN_VDISKS_PER_PDISK;
    if (serverConfig.vdisksPerNvmePdisk > MAX_VDISKS_NVME) {
        serverConfig.vdisksPerNvmePdisk = MAX_VDISKS_NVME;
        showWarningMessage('vdisks-per-nvme-pdisk', `VDisks per NVMe PDisk capped to ${MAX_VDISKS_NVME} (max supported).`);
    }

    // update DOM elements to reflect normalized values
    const hEl = document.getElementById('vdisks-per-hdd-pdisk');
    const nEl = document.getElementById('vdisks-per-nvme-pdisk');
    if (hEl) hEl.value = serverConfig.vdisksPerHddPdisk;
    if (nEl) nEl.value = serverConfig.vdisksPerNvmePdisk;

    return serverConfig;
}

// Show a non-blocking warning message for an input (e.g. not recommended values)
function showWarningMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // remove existing warning next to this element
    let container = element.parentNode;
    // For result items, we need to add the warning to the same container
    const existing = container.querySelector('.warning-message');
    if (existing) existing.remove();
    
    const warn = document.createElement('div');
    warn.className = 'warning-message';
    warn.textContent = message;
    container.appendChild(warn);
}

function clearWarningMessages() {
    const warnings = document.querySelectorAll('.warning-message');
    warnings.forEach(w => w.remove());
}

// Check for soft warnings according to business rules
function checkWarnings(changedFieldId = null) {
    // If the user hasn't interacted yet (page load / programmatic population), don't show warnings
    if (!userHasInteracted) {
        // clearWarningMessages();
        hideWarningPopover();
        return;
    }
    clearWarningMessages();
    const nvme = parseInt(document.getElementById('nvme-devices-per-server').value) || 0;
    const hdd = parseInt(document.getElementById('hdd-devices-per-server').value) || 0;
    const vdisksHdd = parseInt(document.getElementById('vdisks-per-hdd-pdisk').value) || 0;
    const vdisksNvme = parseInt(document.getElementById('vdisks-per-nvme-pdisk').value) || 0;
    const popMessages = [];
    let shouldShowPopover = false;

    if (nvme > MAX_DEVICES_PER_SERVER) {
        const msg = `More than ${MAX_DEVICES_PER_SERVER} NVMe devices per server is unusual; verify configuration.`;
        showWarningMessage('nvme-devices-per-server', msg);
    }
    if (hdd > MAX_DEVICES_PER_SERVER) {
        const msg = `More than ${MAX_DEVICES_PER_SERVER} HDD devices per server is unusual; verify configuration.`;
        showWarningMessage('hdd-devices-per-server', msg);
    }
    
    // Check VDisks warnings and determine if popover should be shown
    if (vdisksHdd > RECOMMENDED_MAX_VDISKS_HDD) {
        const msg = `More than ${RECOMMENDED_MAX_VDISKS_HDD} vdisks per HDD PDisk is not recommended.`;
        showWarningMessage('vdisks-per-hdd-pdisk', msg);
        // Show popover only if this field changed and value is different from previous
        if (changedFieldId === 'vdisks-per-hdd-pdisk' && previousVDisksHdd !== vdisksHdd) {
            popMessages.push(msg);
            shouldShowPopover = true;
            previousVDisksHdd = vdisksHdd;
        }
    }
    if (vdisksNvme > RECOMMENDED_MAX_VDISKS_NVME) {
        const msg = `More than ${RECOMMENDED_MAX_VDISKS_NVME} vdisks per NVMe PDisk is not recommended.`;
        showWarningMessage('vdisks-per-nvme-pdisk', msg);
        // Show popover only if this field changed and value is different from previous
        if (changedFieldId === 'vdisks-per-nvme-pdisk' && previousVDisksNvme !== vdisksNvme) {
            popMessages.push(msg);
            shouldShowPopover = true;
            previousVDisksNvme = vdisksNvme;
        }
    }

    // Show popover dialog only when VDisks field changed and warnings exist
    if (shouldShowPopover && popMessages.length > 0) {
        showWarningPopover(popMessages);
    } else if (changedFieldId !== 'vdisks-per-hdd-pdisk' && changedFieldId !== 'vdisks-per-nvme-pdisk') {
        // Hide popover if other fields changed
        hideWarningPopover();
    }
}

// Show the large warning popover with messages and image
function showWarningPopover(messages) {
    const overlay = document.getElementById('warning-popover-overlay');
    const container = document.getElementById('warning-popover-messages');
    if (!overlay || !container) return;
    container.innerHTML = '';
    messages.forEach(m => {
        const p = document.createElement('div');
        p.textContent = m;
        container.appendChild(p);
    });
    overlay.classList.remove('hidden');
}

function hideWarningPopover() {
    const overlay = document.getElementById('warning-popover-overlay');
    if (!overlay) {
        return;
    }
    overlay.classList.add('hidden');
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

// Update the server configuration summary element depending on visibility
function updateServerConfigSummary() {
    const section = document.getElementById('server-config-section');
    const summaryEl = document.getElementById('server-config-summary');
    if (!summaryEl) return;

    if (section && section.classList.contains('hidden')) {
        summaryEl.textContent = buildServerConfigSummary();
        summaryEl.classList.remove('hidden');
    } else {
        summaryEl.classList.add('hidden');
    }
}

// Calculate and display reserved resources overhead in server configuration section
function updateReservedResourcesDisplay() {
    const cores = parseFloat(document.getElementById('cores-per-server').value) || 0;
    const ram = parseFloat(document.getElementById('ram-per-server').value) || 0;
    const nvmeDevices = parseInt(document.getElementById('nvme-devices-per-server').value) || 0;
    const hddDevices = parseInt(document.getElementById('hdd-devices-per-server').value) || 0;
    
    // Calculate reserved resources
    const systemCores = SYSTEM_CORES_RESERVE;
    const storageCores = (nvmeDevices * NVME_CORES_RESERVE) + (hddDevices * HDD_CORES_RESERVE);
    const systemRam = SYSTEM_RAM_RESERVE;
    const storageRam = (nvmeDevices * NVME_RAM_RESERVE) + (hddDevices * HDD_RAM_RESERVE);
    
    // Calculate available resources
    const availableCores = Math.max(0, cores - systemCores - storageCores);
    const availableRam = Math.max(0, ram - systemRam - storageRam);
    
    // Update display
    document.getElementById('overhead-system-cores').textContent = cores > 0 ? systemCores.toFixed(1) : '-';
    document.getElementById('overhead-storage-cores').textContent = cores > 0 ? storageCores.toFixed(1) : '-';
    document.getElementById('overhead-system-ram').textContent = ram > 0 ? systemRam.toFixed(0) + ' GB' : '-';
    document.getElementById('overhead-storage-ram').textContent = ram > 0 ? storageRam.toFixed(0) + ' GB' : '-';
    
    // Display available resources
    if (cores > 0 && ram > 0) {
        document.getElementById('overhead-available').textContent =
            `${availableCores.toFixed(1)} cores, ${availableRam.toFixed(0)} GB RAM`;
    } else {
        document.getElementById('overhead-available').textContent = '-';
    }
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
    const calculatedServers = serversByResource[dominantResource];
    const finalServers = Math.max(MIN_SERVERS, calculatedServers);
    
    // Check if minimum server count was applied
    const isMinimumApplied = finalServers > calculatedServers;
    
    return {
        serversByResource,
        dominantResource,
        finalServers,
        isMinimumApplied
    };
}

// Storage group calculation
function calculateStorageServers(serverConfig, capacityRequirements) {
    // Each storage group consists of 9 VDisks
    const hddVdisksRequired = capacityRequirements.hddStorageGroups * STORAGE_GROUP_SIZE;
    const nvmeVdisksRequired = capacityRequirements.nvmeStorageGroups * STORAGE_GROUP_SIZE;
    
    // Add reserve: 1% or minimum 18 VDisks
    const hddReserve = Math.max(MIN_RESERVE_VDISKS, Math.ceil(hddVdisksRequired * RESERVE_PERCENTAGE));
    const nvmeReserve = Math.max(MIN_RESERVE_VDISKS, Math.ceil(nvmeVdisksRequired * RESERVE_PERCENTAGE));
    
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
    const systemCores = SYSTEM_CORES_RESERVE;
    
    // Reserve 6 cores per NVMe drive and 0.5 per HDD drive
    const storageCores = (serverConfig.nvmeDevicesPerServer * NVME_CORES_RESERVE) + (serverConfig.hddDevicesPerServer * HDD_CORES_RESERVE);
    
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
    const systemRam = SYSTEM_RAM_RESERVE;
    
    // Reserve 6GB per NVMe device and 2GB per HDD device
    const storageRam = (serverConfig.nvmeDevicesPerServer * NVME_RAM_RESERVE) + (serverConfig.hddDevicesPerServer * HDD_RAM_RESERVE);
    
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
    const hddReserve = Math.max(MIN_RESERVE_VDISKS, Math.ceil(totalHddVdisks * RESERVE_PERCENTAGE));
    const nvmeReserve = Math.max(MIN_RESERVE_VDISKS, Math.ceil(totalNvmeVdisks * RESERVE_PERCENTAGE));
    
    const availableHddVdisks = Math.max(0, totalHddVdisks - hddReserve);
    const availableNvmeVdisks = Math.max(0, totalNvmeVdisks - nvmeReserve);
    
    const hddStorageGroups = Math.floor(availableHddVdisks / STORAGE_GROUP_SIZE);
    const nvmeStorageGroups = Math.floor(availableNvmeVdisks / STORAGE_GROUP_SIZE);
    
    // Calculate database resources
    // Reserve 2-4 cores per server for OS (using 2 as minimum)
    const systemCores = SYSTEM_CORES_RESERVE;
    
    // Reserve 6 cores per NVMe drive and 0.5 per HDD drive
    const storageCores = (serverConfig.nvmeDevicesPerServer * NVME_CORES_RESERVE) + (serverConfig.hddDevicesPerServer * HDD_CORES_RESERVE);
    
    // Available cores for database nodes
    const availableCoresPerServer = Math.max(0, serverConfig.coresPerServer - systemCores - storageCores);
    const databaseCores = availableCoresPerServer * serverCount;
    
    // Reserve 4GB RAM per server for system
    const systemRam = SYSTEM_RAM_RESERVE;
    
    // Reserve 6GB per NVMe device and 2GB per HDD device
    const storageRam = (serverConfig.nvmeDevicesPerServer * NVME_RAM_RESERVE) + (serverConfig.hddDevicesPerServer * HDD_RAM_RESERVE);
    
    // Available RAM for database nodes
    const availableRamPerServer = Math.max(0, serverConfig.ramPerServer - systemRam - storageRam);
    const databaseRam = availableRamPerServer * serverCount;
    
    return {
        hddStorageGroups,
        nvmeStorageGroups,
        databaseCores,
        databaseRam,
        // Story 4: Reserved resources breakdown
        reservedResources: {
            systemCores,
            storageCores,
            systemRam,
            storageRam,
            availableCoresPerServer,
            availableRamPerServer
        }
    };
}

// Display Story 1 results
function displayStory1Results(results) {
    const maxServers = results.finalServers;
    const storage = results.serversByResource.storage;
    const cores = results.serversByResource.cores;
    const ram = results.serversByResource.ram;
    
    // Calculate relative differences
    const storageDiff = maxServers > 0 ? Math.round((maxServers - storage) / maxServers * 100) : 0;
    const coresDiff = maxServers > 0 ? Math.round((maxServers - cores) / maxServers * 100) : 0;
    const ramDiff = maxServers > 0 ? Math.round((maxServers - ram) / maxServers * 100) : 0;
    
    // Format results with relative differences
    let storageText = storage.toString();
    let coresText = cores.toString();
    let ramText = ram.toString();
    
    if (results.dominantResource === 'storage') {
        storageText += ' (dominant resource)';
    } else if (storage < maxServers) {
        const serverDiff = maxServers - storage;
        storageText += ` (${serverDiff} servers or ${storageDiff}% less)`;
    }
    
    if (results.dominantResource === 'cores') {
        coresText += ' (dominant resource)';
    } else if (cores < maxServers) {
        const serverDiff = maxServers - cores;
        coresText += ` (${serverDiff} servers or ${coresDiff}% less)`;
    }
    
    if (results.dominantResource === 'ram') {
        ramText += ' (dominant resource)';
    } else if (ram < maxServers) {
        const serverDiff = maxServers - ram;
        ramText += ` (${serverDiff} servers or ${ramDiff}% less)`;
    }
    
    // Update the results section with calculated values
    document.getElementById('storage-servers-result').textContent = storageText;
    document.getElementById('cores-servers-result').textContent = coresText;
    document.getElementById('ram-servers-result').textContent = ramText;
    
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
    
    // Show warning if minimum server count was applied
    if (results.isMinimumApplied) {
        const msg = 'Note: 12 is the minimum recommended cluster size.';
        showWarningMessage('final-servers-result', msg);
    }
    
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
    
    // Story 4: Display reserved resources breakdown
    if (results.reservedResources) {
        const reserved = results.reservedResources;
        document.getElementById('system-cores-reserved-result').textContent = reserved.systemCores.toFixed(1);
        document.getElementById('storage-cores-reserved-result').textContent = reserved.storageCores.toFixed(1);
        document.getElementById('system-ram-reserved-result').textContent = reserved.systemRam.toFixed(0);
        document.getElementById('storage-ram-reserved-result').textContent = reserved.storageRam.toFixed(0);
        document.getElementById('available-cores-result').textContent = reserved.availableCoresPerServer.toFixed(1);
        document.getElementById('available-ram-result').textContent = reserved.availableRamPerServer.toFixed(0);
    }
    
    // Show the results section
    document.getElementById('story2-results').classList.remove('hidden');
    document.getElementById('story1-results').classList.add('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Define event handler variables to ensure we can properly remove them
    let popCloseHandler, overlayClickHandler, popInnerClickHandler, documentClickHandler;
    
    // Set copyright year dynamically
    const copyrightYearEl = document.getElementById('copyright-year');
    if (copyrightYearEl) {
        copyrightYearEl.textContent = new Date().getFullYear();
    }
    
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
    // Mark the first user interaction so programmatic loads won't trigger warnings
    function markUserInteracted() {
        userHasInteracted = true;
    }
    liveInputs.forEach(inputId => {
        const el = document.getElementById(inputId);
        if (el) {
            // attach a one-time marker that flags the user has interacted before running warnings
            el.addEventListener('input', function onFirst() { markUserInteracted(); el.removeEventListener('input', onFirst); }, { once: true });
            el.addEventListener('input', updateCalculateButtonState);
            // Pass the field ID to checkWarnings so it knows which field changed
            el.addEventListener('input', function() { checkWarnings(inputId); });
            // Keep summary and reserved resources updated when server config inputs change
            if (serverConfigInputs.indexOf(inputId) !== -1) {
                el.addEventListener('input', updateServerConfigSummary);
                el.addEventListener('input', updateReservedResourcesDisplay);
            }
        }
    });
    
    // Add special handler for database-cores to auto-fill RAM
    const dbCoresEl = document.getElementById('database-cores');
    if (dbCoresEl) {
        dbCoresEl.addEventListener('input', function() {
            const cores = parseFloat(dbCoresEl.value) || 0;
            const ramEl = document.getElementById('database-ram');
            const currentRam = parseFloat(ramEl.value) || 0;
            
            // Auto-fill RAM if it's empty or zero and cores are entered
            if (cores > 0 && currentRam <= 0) {
                const autoRam = Math.ceil(cores * RAM_PER_CORE_RATIO);
                ramEl.value = autoRam;
            }
        });
    }

    // Toggle server config visibility
    const toggleBtn = document.getElementById('toggle-server-config');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleServerConfig);

    // Ensure calculate button initial state
    updateCalculateButtonState();
    // Update reserved resources display on initial load
    updateReservedResourcesDisplay();
    // Do NOT run warnings on initial load; warnings should appear only after user interaction
    // Hide warning popover on initial load
    hideWarningPopover();
    // if server config is initially hidden show a summary
    const serverContent = document.getElementById('server-config-content');
    if (serverContent && serverContent.classList.contains('hidden')) {
        const summaryEl = document.getElementById('server-config-summary');
        if (summaryEl) {
            summaryEl.textContent = buildServerConfigSummary();
            summaryEl.classList.remove('hidden');
        }
    }

    // Make the summary clickable to reopen the server configuration
    const summaryEl = document.getElementById('server-config-summary');
    if (summaryEl) {
        summaryEl.style.cursor = 'pointer';
        summaryEl.title = 'Click to edit server configuration';
        summaryEl.addEventListener('click', function() {
            const content = document.getElementById('server-config-content');
            if (content && content.classList.contains('hidden')) {
                toggleServerConfig();
                // focus first input for convenience
                const firstInput = document.getElementById('cores-per-server');
                if (firstInput) firstInput.focus();
            }
        });
    }

    // Wire up settings modal
    const settingsLink = document.getElementById('view-settings-link');
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const settingsModalClose = document.getElementById('settings-modal-close');
    
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (settingsModalOverlay) {
                settingsModalOverlay.classList.remove('hidden');
            }
        });
    }
    
    if (settingsModalClose) {
        settingsModalClose.addEventListener('click', function() {
            if (settingsModalOverlay) {
                settingsModalOverlay.classList.add('hidden');
            }
        });
    }
    
    if (settingsModalOverlay) {
        settingsModalOverlay.addEventListener('click', function(e) {
            // Close when clicking on the overlay (outside the modal content)
            if (e.target === settingsModalOverlay) {
                settingsModalOverlay.classList.add('hidden');
            }
        });
    }
    
    // Prevent clicks inside the modal from closing it
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Wire up warning popover close and overlay behavior (in-DOM handlers)
    const popClose = document.getElementById('warning-popover-close');
    const overlayEl = document.getElementById('warning-popover-overlay');
    const popInner = document.getElementById('warning-popover');
    
    // Remove any existing event listeners to prevent duplicates
    if (popClose) {
        popClose.removeEventListener('click', popCloseHandler);
        // Define the handler function in a way that we can reference it for removal
        popCloseHandler = function(e) {
            hideWarningPopover();
        };
        popClose.addEventListener('click', popCloseHandler);
    }
    
    if (overlayEl) {
        overlayEl.removeEventListener('click', overlayClickHandler);
        // Define the handler function
        overlayClickHandler = function(e) {
            // close when clicking outside the popover content
            if (e.target === overlayEl) hideWarningPopover();
        };
        overlayEl.addEventListener('click', overlayClickHandler);
    }
    
    if (popInner) {
        popInner.removeEventListener('click', popInnerClickHandler);
        // Define the handler function
        popInnerClickHandler = function(e) {
            e.stopPropagation();
        };
        popInner.addEventListener('click', popInnerClickHandler);
    }

    // Fallback: ensure clicks on close or overlay are handled even if listeners weren't attached
    document.removeEventListener('click', documentClickHandler);
    documentClickHandler = function(e) {
        if (!e.target) return;
        if (e.target.id === 'warning-popover-close') {
            hideWarningPopover();
        }
    };
    document.addEventListener('click', documentClickHandler);
});