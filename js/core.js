// Pure calculation functions for YDB Capacity Calculator
// Accepts plain objects and returns plain results - no DOM usage

function getDominantResource(serversByResource) {
    if (serversByResource.storage >= serversByResource.cores && serversByResource.storage >= serversByResource.ram) {
        return 'storage';
    } else if (serversByResource.cores >= serversByResource.ram) {
        return 'cores';
    } else {
        return 'ram';
    }
}

function calculateStorageServers(serverConfig, capacityRequirements) {
    const hddVdisksRequired = (capacityRequirements.hddStorageGroups || 0) * 9;
    const nvmeVdisksRequired = (capacityRequirements.nvmeStorageGroups || 0) * 9;

    const hddReserve = Math.max(18, Math.ceil(hddVdisksRequired * 0.01));
    const nvmeReserve = Math.max(18, Math.ceil(nvmeVdisksRequired * 0.01));

    const totalHddVdisks = hddVdisksRequired + hddReserve;
    const totalNvmeVdisks = nvmeVdisksRequired + nvmeReserve;

    const hddVdisksPerServer = (serverConfig.hddDevicesPerServer || 0) * (serverConfig.vdisksPerHddPdisk || 0);
    const nvmeVdisksPerServer = (serverConfig.nvmeDevicesPerServer || 0) * (serverConfig.vdisksPerNvmePdisk || 0);

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

function calculateCoresServers(serverConfig, capacityRequirements) {
    const systemCores = 2;
    const storageCores = ((serverConfig.nvmeDevicesPerServer || 0) * 6) + ((serverConfig.hddDevicesPerServer || 0) * 0.5);
    const availableCoresPerServer = (serverConfig.coresPerServer || 0) - systemCores - storageCores;
    if (availableCoresPerServer <= 0) return 0;
    if (!capacityRequirements.databaseCores || capacityRequirements.databaseCores <= 0) return 0;
    return Math.ceil(capacityRequirements.databaseCores / availableCoresPerServer);
}

function calculateRamServers(serverConfig, capacityRequirements) {
    const systemRam = 4;
    const storageRam = ((serverConfig.nvmeDevicesPerServer || 0) * 6) + ((serverConfig.hddDevicesPerServer || 0) * 2);
    const availableRamPerServer = (serverConfig.ramPerServer || 0) - systemRam - storageRam;
    if (availableRamPerServer <= 0) return 0;
    if (!capacityRequirements.databaseRam || capacityRequirements.databaseRam <= 0) return 0;
    return Math.ceil(capacityRequirements.databaseRam / availableRamPerServer);
}

function performCalculations(serverConfig, capacityRequirements) {
    const storageServers = calculateStorageServers(serverConfig, capacityRequirements);
    const coresServers = calculateCoresServers(serverConfig, capacityRequirements);
    const ramServers = calculateRamServers(serverConfig, capacityRequirements);

    const serversByResource = { storage: storageServers, cores: coresServers, ram: ramServers };
    const dominantResource = getDominantResource(serversByResource);
    const finalServers = Math.max(12, serversByResource[dominantResource]);

    return { serversByResource, dominantResource, finalServers };
}

function calculateProvidedCapacity(serverConfig, serverCount) {
    const hddVdisksPerServer = (serverConfig.hddDevicesPerServer || 0) * (serverConfig.vdisksPerHddPdisk || 0);
    const nvmeVdisksPerServer = (serverConfig.nvmeDevicesPerServer || 0) * (serverConfig.vdisksPerNvmePdisk || 0);

    const totalHddVdisks = hddVdisksPerServer * serverCount;
    const totalNvmeVdisks = nvmeVdisksPerServer * serverCount;

    const hddReserve = Math.max(18, Math.ceil(totalHddVdisks * 0.01));
    const nvmeReserve = Math.max(18, Math.ceil(totalNvmeVdisks * 0.01));

    const availableHddVdisks = Math.max(0, totalHddVdisks - hddReserve);
    const availableNvmeVdisks = Math.max(0, totalNvmeVdisks - nvmeReserve);

    const hddStorageGroups = Math.floor(availableHddVdisks / 9);
    const nvmeStorageGroups = Math.floor(availableNvmeVdisks / 9);

    const systemCores = 2;
    const storageCores = ((serverConfig.nvmeDevicesPerServer || 0) * 6) + ((serverConfig.hddDevicesPerServer || 0) * 0.5);
    const availableCoresPerServer = Math.max(0, (serverConfig.coresPerServer || 0) - systemCores - storageCores);
    const databaseCores = availableCoresPerServer * serverCount;

    const systemRam = 4;
    const storageRam = ((serverConfig.nvmeDevicesPerServer || 0) * 6) + ((serverConfig.hddDevicesPerServer || 0) * 2);
    const availableRamPerServer = Math.max(0, (serverConfig.ramPerServer || 0) - systemRam - storageRam);
    const databaseRam = availableRamPerServer * serverCount;

    return { hddStorageGroups, nvmeStorageGroups, databaseCores, databaseRam };
}

// Export for Node and attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateStorageServers,
        calculateCoresServers,
        calculateRamServers,
        performCalculations,
        calculateProvidedCapacity,
        getDominantResource
    };
}

if (typeof window !== 'undefined') {
    window.Core = window.Core || {};
    Object.assign(window.Core, { calculateStorageServers, calculateCoresServers, calculateRamServers, performCalculations, calculateProvidedCapacity, getDominantResource });
}
