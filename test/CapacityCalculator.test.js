const assert = require('assert');
const CapacityCalculator = require('../js/CapacityCalculator');

console.log('Running CapacityCalculator tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
    try {
        fn();
        testsPassed++;
        console.log(`✓ ${description}`);
    } catch (error) {
        testsFailed++;
        console.error(`✗ ${description}`);
        console.error(`  ${error.message}`);
    }
}

// ============================================================================
// Constructor Tests
// ============================================================================

console.log('Constructor Tests:');

test('should use default configuration when no config provided', () => {
    const calc = new CapacityCalculator();
    assert.strictEqual(calc.config.MIN_SERVERS, 12);
    assert.strictEqual(calc.config.DEFAULT_VDISKS_HDD, 8);
    assert.strictEqual(calc.config.DEFAULT_VDISKS_NVME, 16);
});

test('should merge custom configuration with defaults', () => {
    const calc = new CapacityCalculator({ MIN_SERVERS: 15 });
    assert.strictEqual(calc.config.MIN_SERVERS, 15);
    assert.strictEqual(calc.config.DEFAULT_VDISKS_HDD, 8); // default preserved
});

test('should allow multiple custom config values', () => {
    const calc = new CapacityCalculator({ 
        MIN_SERVERS: 20, 
        SYSTEM_CORES_RESERVE: 4 
    });
    assert.strictEqual(calc.config.MIN_SERVERS, 20);
    assert.strictEqual(calc.config.SYSTEM_CORES_RESERVE, 4);
});

// ============================================================================
// Validation Tests - Server Config
// ============================================================================

console.log('\nValidation Tests - Server Config:');

test('should reject negative cores per server', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: -1, ramPerServer: 128, nvmeDevicesPerServer: 0, 
                    hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /coresPerServer must be a positive number/);
});

test('should reject zero cores per server', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: 0, ramPerServer: 128, nvmeDevicesPerServer: 0,
                    hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /coresPerServer must be a positive number/);
});

test('should reject negative RAM per server', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: 32, ramPerServer: -128, nvmeDevicesPerServer: 0,
                    hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /ramPerServer must be a positive number/);
});

test('should reject NaN values', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: NaN, ramPerServer: 128, nvmeDevicesPerServer: 0,
                    hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /coresPerServer must be a valid number/);
});

test('should reject Infinity values', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: Infinity, ramPerServer: 128, nvmeDevicesPerServer: 0,
                    hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /coresPerServer must be a valid number/);
});

test('should reject VDisks per HDD PDisk below minimum', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                    hddDevicesPerServer: 4, vdisksPerHddPdisk: 0, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /vdisksPerHddPdisk must be between/);
});

test('should reject VDisks per HDD PDisk above maximum', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                    hddDevicesPerServer: 4, vdisksPerHddPdisk: 17, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.validateServerConfig(config), /vdisksPerHddPdisk must be between/);
});

test('should reject VDisks per NVMe PDisk above maximum', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 4,
                    hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 33 };
    assert.throws(() => calc.validateServerConfig(config), /vdisksPerNvmePdisk must be between/);
});

test('should accept valid server configuration', () => {
    const calc = new CapacityCalculator();
    const config = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 4,
                    hddDevicesPerServer: 2, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.doesNotThrow(() => calc.validateServerConfig(config));
});

// ============================================================================
// Validation Tests - Capacity Requirements
// ============================================================================

console.log('\nValidation Tests - Capacity Requirements:');

test('should reject negative storage groups', () => {
    const calc = new CapacityCalculator();
    const req = { hddStorageGroups: -1, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    assert.throws(() => calc.validateCapacityRequirements(req), /hddStorageGroups must be a non-negative integer/);
});

test('should reject negative database cores', () => {
    const calc = new CapacityCalculator();
    const req = { hddStorageGroups: 1, nvmeStorageGroups: 0, databaseCores: -10, databaseRam: 0 };
    assert.throws(() => calc.validateCapacityRequirements(req), /databaseCores must be non-negative/);
});

test('should reject all zero requirements', () => {
    const calc = new CapacityCalculator();
    const req = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    assert.throws(() => calc.validateCapacityRequirements(req), /At least one capacity requirement must be specified/);
});

test('should accept valid requirements with only storage', () => {
    const calc = new CapacityCalculator();
    const req = { hddStorageGroups: 10, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    assert.doesNotThrow(() => calc.validateCapacityRequirements(req));
});

test('should accept valid requirements with only cores', () => {
    const calc = new CapacityCalculator();
    const req = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 100, databaseRam: 0 };
    assert.doesNotThrow(() => calc.validateCapacityRequirements(req));
});

// ============================================================================
// Storage Calculation Tests
// ============================================================================

console.log('\nStorage Calculation Tests:');

test('should calculate servers for single HDD storage group', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 1, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // 1 group = 9 VDisks, reserve = 18 (min), total = 27, per server = 32, need 1 server
    assert.strictEqual(result.serversByResource.storage, 1);
});

test('should calculate servers for single NVMe storage group', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // 1 group = 9 VDisks, reserve = 18 (min), total = 27, per server = 32, need 1 server
    assert.strictEqual(result.serversByResource.storage, 1);
});

test('should apply minimum reserve of 18 VDisks', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 10, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 1, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // 1 group = 9 VDisks, 1% = 0.09 < 18, so reserve = 18, total = 27, per server = 80, need 1 server
    assert.strictEqual(result.serversByResource.storage, 1);
});

test('should apply 1% reserve when it exceeds 18 VDisks', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 200, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // 200 groups = 1800 VDisks, 1% = 18, reserve = 18, total = 1818, per server = 32, need 57 servers
    assert.strictEqual(result.serversByResource.storage, 57);
});

test('should handle mixed HDD and NVMe storage groups', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 10, nvmeStorageGroups: 5, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // HDD: 10*9=90, reserve=18, total=108, per server=32, need 4 servers
    // NVMe: 5*9=45, reserve=18, total=63, per server=32, need 2 servers
    // Max = 4
    assert.strictEqual(result.serversByResource.storage, 4);
});

test('should handle zero storage groups', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 100, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.serversByResource.storage, 0);
});

test('should handle large number of storage groups', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1000, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // 1000*9=9000, reserve=max(18, ceil(9000*0.01))=max(18,90)=90, total=9090, per server=64, need 143 servers
    assert.strictEqual(result.serversByResource.storage, 143);
});

// ============================================================================
// Cores Calculation Tests
// ============================================================================

console.log('\nCores Calculation Tests:');

test('should calculate servers for basic cores requirement', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 60, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 32 - 2 (system) = 30 per server, need 60, so 2 servers
    assert.strictEqual(result.serversByResource.cores, 2);
});

test('should return 0 for zero cores requirement', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 1, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.serversByResource.cores, 0);
});

test('should reserve cores for NVMe devices', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 40, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 32 - 2 (system) - 12 (2*6 NVMe) = 18 per server, need 40, so 3 servers
    assert.strictEqual(result.serversByResource.cores, 3);
});

test('should reserve cores for HDD devices', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 60, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 32 - 2 (system) - 2 (4*0.5 HDD) = 28 per server, need 60, so 3 servers
    assert.strictEqual(result.serversByResource.cores, 3);
});

test('should handle mixed storage devices for cores', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 100, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 64 - 2 (system) - 12 (2*6 NVMe) - 2 (4*0.5 HDD) = 48 per server, need 100, so 3 servers
    assert.strictEqual(result.serversByResource.cores, 3);
});

test('should return 0 when insufficient cores available', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 2, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 100, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 2 - 2 (system) = 0, cannot provide cores
    assert.strictEqual(result.serversByResource.cores, 0);
});

test('should handle large core counts', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 128, ramPerServer: 512, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 10000, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 128 - 2 = 126 per server, need 10000, so 80 servers
    assert.strictEqual(result.serversByResource.cores, 80);
});

// ============================================================================
// RAM Calculation Tests
// ============================================================================

console.log('\nRAM Calculation Tests:');

test('should calculate servers for basic RAM requirement', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 250 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 128 - 4 (system) = 124 per server, need 250, so 3 servers
    assert.strictEqual(result.serversByResource.ram, 3);
});

test('should return 0 for zero RAM requirement', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 1, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.serversByResource.ram, 0);
});

test('should reserve RAM for NVMe devices', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 200 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 128 - 4 (system) - 24 (4*6 NVMe) = 100 per server, need 200, so 2 servers
    assert.strictEqual(result.serversByResource.ram, 2);
});

test('should reserve RAM for HDD devices', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 8, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 220 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 128 - 4 (system) - 16 (8*2 HDD) = 108 per server, need 220, so 3 servers
    assert.strictEqual(result.serversByResource.ram, 3);
});

test('should handle mixed storage devices for RAM', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 4, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 500 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 256 - 4 (system) - 12 (2*6 NVMe) - 8 (4*2 HDD) = 232 per server, need 500, so 3 servers
    assert.strictEqual(result.serversByResource.ram, 3);
});

test('should handle large RAM amounts', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 128, ramPerServer: 1024, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 0, databaseRam: 100000 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Available: 1024 - 4 = 1020 per server, need 100000, so 99 servers
    assert.strictEqual(result.serversByResource.ram, 99);
});

// ============================================================================
// Dominant Resource Tests
// ============================================================================

console.log('\nDominant Resource Tests:');

test('should identify storage as dominant resource', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 128, ramPerServer: 512, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 100, databaseCores: 100, databaseRam: 500 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.dominantResource, 'storage');
});

test('should identify cores as dominant resource', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 512, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1, databaseCores: 1000, databaseRam: 500 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.dominantResource, 'cores');
});

test('should identify RAM as dominant resource', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 128, ramPerServer: 64, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1, databaseCores: 100, databaseRam: 5000 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.dominantResource, 'ram');
});

test('should handle tie between storage and cores', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 512, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    // Craft requirements so storage and cores both need same servers
    // Storage: 7*9=63, reserve=18, total=81, per server=64, need 2 servers
    // Cores: available=32-2-24=6 per server, need 12, so 2 servers
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 7, databaseCores: 12, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Both should be 2, storage wins in tie
    assert.strictEqual(result.dominantResource, 'storage');
});

test('should apply minimum server count', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 128, ramPerServer: 512, nvmeDevicesPerServer: 8,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1, databaseCores: 10, databaseRam: 50 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.finalServers, 12);
    assert.strictEqual(result.isMinimumApplied, true);
});

test('should not apply minimum when calculated exceeds it', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 500, databaseRam: 0 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert(result.finalServers > 12);
    assert.strictEqual(result.isMinimumApplied, false);
});

// ============================================================================
// Provided Capacity Tests
// ============================================================================

console.log('\nProvided Capacity Tests:');

test('should calculate capacity for 9 servers (minimum to calculate)', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result = calc.calculateProvidedCapacity(serverConfig, 9);
    assert(result.nvmeStorageGroups >= 0);
    assert(result.databaseCores >= 0);
    assert(result.databaseRam >= 0);
});

test('should calculate capacity for 12 servers (minimum production)', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result = calc.calculateProvidedCapacity(serverConfig, 12);
    assert(result.nvmeStorageGroups >= 0);
    assert(result.databaseCores >= 0);
    assert(result.databaseRam >= 0);
});

test('should calculate capacity for 100 servers', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 2, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result = calc.calculateProvidedCapacity(serverConfig, 100);
    assert(result.hddStorageGroups > 0);
    assert(result.nvmeStorageGroups > 0);
    assert(result.databaseCores > 1000);
    assert(result.databaseRam > 5000);
});

test('should handle zero devices', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 0,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result = calc.calculateProvidedCapacity(serverConfig, 12);
    assert.strictEqual(result.hddStorageGroups, 0);
    assert.strictEqual(result.nvmeStorageGroups, 0);
    assert(result.databaseCores > 0); // Still have cores
    assert(result.databaseRam > 0); // Still have RAM
});

test('should handle mixed device types', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 8, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result = calc.calculateProvidedCapacity(serverConfig, 20);
    assert(result.hddStorageGroups > 0);
    assert(result.nvmeStorageGroups > 0);
});

test('should apply reserve calculations correctly', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result = calc.calculateProvidedCapacity(serverConfig, 10);
    // 10 servers * 2 devices * 16 vdisks = 320 total vdisks
    // Reserve = max(18, ceil(320 * 0.01)) = max(18, 4) = 18
    // Available = 320 - 18 = 302
    // Groups = floor(302 / 9) = 33
    assert.strictEqual(result.nvmeStorageGroups, 33);
});

test('should reject server count less than 9', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    assert.throws(() => calc.calculateProvidedCapacity(serverConfig, 8),
                  /Server count must be at least 9/);
});

// ============================================================================
// Edge Cases and Integration Tests
// ============================================================================

console.log('\nEdge Cases and Integration Tests:');

test('should handle fractional available resources', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 33, ramPerServer: 129, nvmeDevicesPerServer: 1,
                          hddDevicesPerServer: 1, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 0, databaseCores: 50, databaseRam: 250 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    // Should handle fractional calculations correctly
    assert(result.finalServers >= 12);
});

test('should handle very small requirements', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 128, ramPerServer: 512, nvmeDevicesPerServer: 8,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1, databaseCores: 1, databaseRam: 1 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    assert.strictEqual(result.finalServers, 12); // Minimum applied
});

test('should handle complete real-world scenario', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 8, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 50, nvmeStorageGroups: 20, databaseCores: 500, databaseRam: 2500 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    
    // Verify all components calculated
    assert(result.serversByResource.storage > 0);
    assert(result.serversByResource.cores > 0);
    assert(result.serversByResource.ram > 0);
    assert(result.finalServers >= 12);
    assert(['storage', 'cores', 'ram'].includes(result.dominantResource));
});

test('should handle round-trip calculation', () => {
    const calc = new CapacityCalculator();
    const serverConfig = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 4,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    
    // Calculate servers needed
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 50, databaseCores: 500, databaseRam: 2500 };
    const serversResult = calc.calculateServersNeeded(serverConfig, requirements);
    
    // Calculate what those servers provide
    const capacityResult = calc.calculateProvidedCapacity(serverConfig, serversResult.finalServers);
    
    // Provided capacity should meet or exceed requirements
    assert(capacityResult.nvmeStorageGroups >= requirements.nvmeStorageGroups);
    assert(capacityResult.databaseCores >= requirements.databaseCores);
    assert(capacityResult.databaseRam >= requirements.databaseRam);
});

test('should handle configuration changes between calculations', () => {
    const calc = new CapacityCalculator();
    const serverConfig1 = { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 2,
                           hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 10, databaseCores: 100, databaseRam: 500 };
    
    const result1 = calc.calculateServersNeeded(serverConfig1, requirements);
    
    const serverConfig2 = { coresPerServer: 64, ramPerServer: 256, nvmeDevicesPerServer: 4,
                           hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const result2 = calc.calculateServersNeeded(serverConfig2, requirements);
    
    // More powerful servers should need fewer servers
    assert(result2.finalServers <= result1.finalServers);
});

test('should handle custom configuration in constructor', () => {
    const calc = new CapacityCalculator({ MIN_SERVERS: 20 });
    const serverConfig = { coresPerServer: 128, ramPerServer: 512, nvmeDevicesPerServer: 8,
                          hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 };
    const requirements = { hddStorageGroups: 0, nvmeStorageGroups: 1, databaseCores: 10, databaseRam: 50 };
    const result = calc.calculateServersNeeded(serverConfig, requirements);
    
    // Custom minimum should be applied
    assert.strictEqual(result.finalServers, 20);
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
    process.exit(1);
}

console.log('\n✓ All CapacityCalculator tests passed!\n');