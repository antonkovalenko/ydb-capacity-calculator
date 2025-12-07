const assert = require('assert');
const Core = require('../js/core');

console.log('Running Core calculation tests...');

// Test 1: storage servers calculation
(function(){
    const serverConfig = { hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, nvmeDevicesPerServer: 0, vdisksPerNvmePdisk: 16 };
    const capacityRequirements = { hddStorageGroups: 1, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };

    const storageServers = Core.calculateStorageServers(serverConfig, capacityRequirements);
    assert.strictEqual(storageServers, 1, 'Expected 1 server for small HDD groups');

    const res = Core.performCalculations(serverConfig, { ...capacityRequirements, databaseCores: 0, databaseRam: 0 });
    assert.strictEqual(res.serversByResource.storage, 1, 'performCalculations should report storage=1');
    assert.strictEqual(res.finalServers, 12, 'finalServers must be at least 12');
})();

// Test 2: cores calculation
(function(){
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0, hddDevicesPerServer: 0, vdisksPerHddPdisk:8, vdisksPerNvmePdisk:16 };
    const capacityRequirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 60, databaseRam: 0 };

    const coresServers = Core.calculateCoresServers(serverConfig, capacityRequirements);
    assert.strictEqual(coresServers, 2, '60 cores on 32-core servers (2 reserved) => available 30 => 2 servers');

    const res = Core.performCalculations(serverConfig, capacityRequirements);
    assert.strictEqual(res.serversByResource.cores, 2, 'performCalculations should report cores=2');
    assert.strictEqual(res.finalServers, 12, 'finalServers must be at least 12');
})();

// Test 3: provided capacity
(function(){
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0, hddDevicesPerServer: 0, vdisksPerHddPdisk:8, vdisksPerNvmePdisk:16 };
    const provided = Core.calculateProvidedCapacity(serverConfig, 3);
    // available cores per server = 32 - 2 - 0 = 30 => *3 = 90
    assert.strictEqual(Math.round(provided.databaseCores), 90, 'Provided database cores should be 90');

    console.log('All Core calculation tests passed.');
})();
