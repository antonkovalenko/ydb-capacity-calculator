/**
 * YDB Capacity Calculator - Core Calculation Engine
 * 
 * This class handles all capacity planning calculations for YDB clusters
 * using the mirror-3dc configuration. It provides methods for calculating
 * server requirements based on capacity needs and vice versa.
 * 
 * @class CapacityCalculator
 */

// Import configuration (works in both Node.js and browser)
let DEFAULT_CONFIG;
if (typeof require !== 'undefined') {
    DEFAULT_CONFIG = require('./CalculatorConfig').DEFAULT_CONFIG;
} else if (typeof window !== 'undefined' && window.CalculatorConfig) {
    DEFAULT_CONFIG = window.CalculatorConfig.DEFAULT_CONFIG;
}

class CapacityCalculator {
    /**
     * Creates a new CapacityCalculator instance
     * 
     * @param {Object} [config={}] - Custom configuration to override defaults
     * @example
     * const calculator = new CapacityCalculator();
     * const customCalculator = new CapacityCalculator({ MIN_SERVERS: 15 });
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Calculate the number of servers needed based on capacity requirements
     * 
     * @param {Object} serverConfig - Server hardware configuration
     * @param {number} serverConfig.coresPerServer - CPU cores per server
     * @param {number} serverConfig.ramPerServer - RAM in GB per server
     * @param {number} serverConfig.nvmeDevicesPerServer - Number of NVMe devices per server
     * @param {number} serverConfig.hddDevicesPerServer - Number of HDD devices per server
     * @param {number} serverConfig.vdisksPerHddPdisk - VDisks per HDD PDisk
     * @param {number} serverConfig.vdisksPerNvmePdisk - VDisks per NVMe PDisk
     * @param {Object} requirements - Capacity requirements
     * @param {number} requirements.hddStorageGroups - Number of HDD storage groups needed
     * @param {number} requirements.nvmeStorageGroups - Number of NVMe storage groups needed
     * @param {number} requirements.databaseCores - Database CPU cores needed
     * @param {number} requirements.databaseRam - Database RAM in GB needed
     * @returns {Object} Calculation results with server counts by resource and final count
     * @throws {Error} If validation fails
     * @example
     * const result = calculator.calculateServersNeeded(
     *   { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 4, 
     *     hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 },
     *   { hddStorageGroups: 0, nvmeStorageGroups: 10, databaseCores: 100, databaseRam: 500 }
     * );
     */
    calculateServersNeeded(serverConfig, requirements) {
        // Validate inputs
        this.validateServerConfig(serverConfig);
        this.validateCapacityRequirements(requirements);

        // Calculate servers needed for each resource type
        const storageServers = this._calculateStorageServers(serverConfig, requirements);
        const coresServers = this._calculateCoresServers(serverConfig, requirements);
        const ramServers = this._calculateRamServers(serverConfig, requirements);

        const serversByResource = {
            storage: storageServers,
            cores: coresServers,
            ram: ramServers
        };

        // Determine which resource requires the most servers
        const dominantResource = this._getDominantResource(serversByResource);
        const calculatedServers = serversByResource[dominantResource];
        
        // Apply minimum server count
        const finalServers = Math.max(this.config.MIN_SERVERS, calculatedServers);

        return {
            serversByResource,
            dominantResource,
            finalServers,
            isMinimumApplied: finalServers > calculatedServers
        };
    }

    /**
     * Calculate the capacity provided by a given number of servers
     * 
     * @param {Object} serverConfig - Server hardware configuration
     * @param {number} serverConfig.coresPerServer - CPU cores per server
     * @param {number} serverConfig.ramPerServer - RAM in GB per server
     * @param {number} serverConfig.nvmeDevicesPerServer - Number of NVMe devices per server
     * @param {number} serverConfig.hddDevicesPerServer - Number of HDD devices per server
     * @param {number} serverConfig.vdisksPerHddPdisk - VDisks per HDD PDisk
     * @param {number} serverConfig.vdisksPerNvmePdisk - VDisks per NVMe PDisk
     * @param {number} serverCount - Number of servers in the cluster
     * @returns {Object} Provided capacity including storage groups and database resources
     * @throws {Error} If validation fails
     * @example
     * const capacity = calculator.calculateProvidedCapacity(
     *   { coresPerServer: 32, ramPerServer: 128, nvmeDevicesPerServer: 4,
     *     hddDevicesPerServer: 0, vdisksPerHddPdisk: 8, vdisksPerNvmePdisk: 16 },
     *   12
     * );
     */
    calculateProvidedCapacity(serverConfig, serverCount) {
        // Validate inputs
        this.validateServerConfig(serverConfig);
        this._validateServerCount(serverCount);

        // Calculate total VDisks
        const hddVdisksPerServer = (serverConfig.hddDevicesPerServer || 0) * 
                                   (serverConfig.vdisksPerHddPdisk || 0);
        const nvmeVdisksPerServer = (serverConfig.nvmeDevicesPerServer || 0) * 
                                    (serverConfig.vdisksPerNvmePdisk || 0);

        const totalHddVdisks = hddVdisksPerServer * serverCount;
        const totalNvmeVdisks = nvmeVdisksPerServer * serverCount;

        // Calculate reserves
        const hddReserve = this._calculateVDisksReserve(totalHddVdisks);
        const nvmeReserve = this._calculateVDisksReserve(totalNvmeVdisks);

        // Calculate available VDisks after reserve
        const availableHddVdisks = Math.max(0, totalHddVdisks - hddReserve);
        const availableNvmeVdisks = Math.max(0, totalNvmeVdisks - nvmeReserve);

        // Calculate storage groups
        const hddStorageGroups = Math.floor(availableHddVdisks / this.config.STORAGE_GROUP_SIZE);
        const nvmeStorageGroups = Math.floor(availableNvmeVdisks / this.config.STORAGE_GROUP_SIZE);

        // Calculate available database resources
        const availableResources = this._calculateAvailableResources(serverConfig);
        const databaseCores = availableResources.coresPerServer * serverCount;
        const databaseRam = availableResources.ramPerServer * serverCount;

        return {
            hddStorageGroups,
            nvmeStorageGroups,
            databaseCores,
            databaseRam
        };
    }

    /**
     * Validate server configuration
     * 
     * @param {Object} serverConfig - Server configuration to validate
     * @throws {Error} If validation fails
     */
    validateServerConfig(serverConfig) {
        this._validatePositiveNumber(serverConfig.coresPerServer, 'coresPerServer');
        this._validatePositiveNumber(serverConfig.ramPerServer, 'ramPerServer');
        this._validateNonNegativeInteger(serverConfig.nvmeDevicesPerServer, 'nvmeDevicesPerServer');
        this._validateNonNegativeInteger(serverConfig.hddDevicesPerServer, 'hddDevicesPerServer');
        
        this._validateRange(
            serverConfig.vdisksPerHddPdisk,
            this.config.MIN_VDISKS_PER_PDISK,
            this.config.MAX_VDISKS_HDD,
            'vdisksPerHddPdisk'
        );
        
        this._validateRange(
            serverConfig.vdisksPerNvmePdisk,
            this.config.MIN_VDISKS_PER_PDISK,
            this.config.MAX_VDISKS_NVME,
            'vdisksPerNvmePdisk'
        );
    }

    /**
     * Validate capacity requirements
     * 
     * @param {Object} requirements - Capacity requirements to validate
     * @throws {Error} If validation fails
     */
    validateCapacityRequirements(requirements) {
        this._validateNonNegativeInteger(requirements.hddStorageGroups, 'hddStorageGroups');
        this._validateNonNegativeInteger(requirements.nvmeStorageGroups, 'nvmeStorageGroups');
        this._validateNonNegativeNumber(requirements.databaseCores, 'databaseCores');
        this._validateNonNegativeNumber(requirements.databaseRam, 'databaseRam');

        // At least one requirement must be specified
        if (requirements.hddStorageGroups === 0 && 
            requirements.nvmeStorageGroups === 0 &&
            requirements.databaseCores === 0 &&
            requirements.databaseRam === 0) {
            throw new Error('At least one capacity requirement must be specified');
        }
    }

    /**
     * Calculate servers needed for storage requirements
     * @private
     */
    _calculateStorageServers(serverConfig, requirements) {
        const hddVdisksRequired = (requirements.hddStorageGroups || 0) * this.config.STORAGE_GROUP_SIZE;
        const nvmeVdisksRequired = (requirements.nvmeStorageGroups || 0) * this.config.STORAGE_GROUP_SIZE;

        const hddReserve = this._calculateVDisksReserve(hddVdisksRequired);
        const nvmeReserve = this._calculateVDisksReserve(nvmeVdisksRequired);

        const totalHddVdisks = hddVdisksRequired + hddReserve;
        const totalNvmeVdisks = nvmeVdisksRequired + nvmeReserve;

        const hddVdisksPerServer = (serverConfig.hddDevicesPerServer || 0) * 
                                   (serverConfig.vdisksPerHddPdisk || 0);
        const nvmeVdisksPerServer = (serverConfig.nvmeDevicesPerServer || 0) * 
                                    (serverConfig.vdisksPerNvmePdisk || 0);

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

    /**
     * Calculate servers needed for CPU core requirements
     * @private
     */
    _calculateCoresServers(serverConfig, requirements) {
        const availableResources = this._calculateAvailableResources(serverConfig);
        
        if (availableResources.coresPerServer <= 0) {
            return 0;
        }

        if (!requirements.databaseCores || requirements.databaseCores <= 0) {
            return 0;
        }

        return Math.ceil(requirements.databaseCores / availableResources.coresPerServer);
    }

    /**
     * Calculate servers needed for RAM requirements
     * @private
     */
    _calculateRamServers(serverConfig, requirements) {
        const availableResources = this._calculateAvailableResources(serverConfig);
        
        if (availableResources.ramPerServer <= 0) {
            return 0;
        }

        if (!requirements.databaseRam || requirements.databaseRam <= 0) {
            return 0;
        }

        return Math.ceil(requirements.databaseRam / availableResources.ramPerServer);
    }

    /**
     * Calculate VDisks reserve (1% or minimum 18)
     * @private
     */
    _calculateVDisksReserve(totalVdisks) {
        if (totalVdisks === 0) return 0;
        return Math.max(
            this.config.MIN_RESERVE_VDISKS,
            Math.ceil(totalVdisks * this.config.RESERVE_PERCENTAGE)
        );
    }

    /**
     * Calculate available resources per server after reserves
     * @private
     */
    _calculateAvailableResources(serverConfig) {
        const systemCores = this.config.SYSTEM_CORES_RESERVE;
        const storageCores = ((serverConfig.nvmeDevicesPerServer || 0) * this.config.NVME_CORES_RESERVE) +
                           ((serverConfig.hddDevicesPerServer || 0) * this.config.HDD_CORES_RESERVE);
        const coresPerServer = Math.max(0, (serverConfig.coresPerServer || 0) - systemCores - storageCores);

        const systemRam = this.config.SYSTEM_RAM_RESERVE;
        const storageRam = ((serverConfig.nvmeDevicesPerServer || 0) * this.config.NVME_RAM_RESERVE) +
                         ((serverConfig.hddDevicesPerServer || 0) * this.config.HDD_RAM_RESERVE);
        const ramPerServer = Math.max(0, (serverConfig.ramPerServer || 0) - systemRam - storageRam);

        return { coresPerServer, ramPerServer };
    }

    /**
     * Determine which resource requires the most servers
     * @private
     */
    _getDominantResource(serversByResource) {
        if (serversByResource.storage >= serversByResource.cores && 
            serversByResource.storage >= serversByResource.ram) {
            return 'storage';
        } else if (serversByResource.cores >= serversByResource.ram) {
            return 'cores';
        } else {
            return 'ram';
        }
    }

    /**
     * Validate that a value is a positive number
     * @private
     */
    _validatePositiveNumber(value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            throw new Error(`${fieldName} must be a valid number`);
        }
        if (value <= 0) {
            throw new Error(`${fieldName} must be a positive number`);
        }
    }

    /**
     * Validate that a value is a non-negative number
     * @private
     */
    _validateNonNegativeNumber(value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            throw new Error(`${fieldName} must be a valid number`);
        }
        if (value < 0) {
            throw new Error(`${fieldName} must be non-negative`);
        }
    }

    /**
     * Validate that a value is a non-negative integer
     * @private
     */
    _validateNonNegativeInteger(value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            throw new Error(`${fieldName} must be a valid number`);
        }
        if (value < 0 || !Number.isInteger(value)) {
            throw new Error(`${fieldName} must be a non-negative integer`);
        }
    }

    /**
     * Validate that a value is within a specified range
     * @private
     */
    _validateRange(value, min, max, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
            throw new Error(`${fieldName} must be a valid number`);
        }
        if (value < min || value > max) {
            throw new Error(`${fieldName} must be between ${min} and ${max}`);
        }
    }

    /**
     * Validate server count
     * @private
     */
    _validateServerCount(count) {
        if (typeof count !== 'number' || isNaN(count) || !isFinite(count)) {
            throw new Error('Server count must be a valid number');
        }
        if (!Number.isInteger(count) || count < this.config.MIN_SERVERS_TO_CALCULATE) {
            throw new Error(`Server count must be at least ${this.config.MIN_SERVERS_TO_CALCULATE}`);
        }
    }
}

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CapacityCalculator;
}

if (typeof window !== 'undefined') {
    window.CapacityCalculator = CapacityCalculator;
}