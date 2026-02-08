/**
 * YDB Capacity Calculator - Configuration Constants
 * 
 * This module contains all business rule constants and default values
 * used by the YDB Capacity Calculator. These values are based on
 * YDB's mirror-3dc configuration requirements and best practices.
 * 
 * @module CalculatorConfig
 */

/**
 * Default configuration object containing all business rule constants
 * @const {Object}
 */
const DEFAULT_CONFIG = {
    // VDisk Configuration
    /**
     * Default number of VDisks per HDD PDisk
     * @type {number}
     */
    DEFAULT_VDISKS_HDD: 8,
    
    /**
     * Default number of VDisks per NVMe PDisk
     * @type {number}
     */
    DEFAULT_VDISKS_NVME: 16,
    
    /**
     * Minimum allowed VDisks per PDisk
     * @type {number}
     */
    MIN_VDISKS_PER_PDISK: 1,
    
    /**
     * Maximum allowed VDisks per HDD PDisk
     * @type {number}
     */
    MAX_VDISKS_HDD: 16,
    
    /**
     * Maximum allowed VDisks per NVMe PDisk
     * @type {number}
     */
    MAX_VDISKS_NVME: 32,
    
    /**
     * Recommended maximum VDisks per HDD PDisk for optimal performance
     * @type {number}
     */
    RECOMMENDED_MAX_VDISKS_HDD: 8,
    
    /**
     * Recommended maximum VDisks per NVMe PDisk for optimal performance
     * @type {number}
     */
    RECOMMENDED_MAX_VDISKS_NVME: 16,
    
    // Storage Configuration
    /**
     * Number of VDisks in a storage group (mirror-3dc configuration)
     * @type {number}
     */
    STORAGE_GROUP_SIZE: 9,
    
    /**
     * Minimum number of reserve VDisks required
     * @type {number}
     */
    MIN_RESERVE_VDISKS: 18,
    
    /**
     * Reserve percentage for VDisks (1%)
     * @type {number}
     */
    RESERVE_PERCENTAGE: 0.01,
    
    /**
     * Maximum number of storage devices per server
     * @type {number}
     */
    MAX_DEVICES_PER_SERVER: 16,
    
    // Resource Reserves
    /**
     * CPU cores reserved for system operations per server
     * @type {number}
     */
    SYSTEM_CORES_RESERVE: 2,
    
    /**
     * CPU cores reserved per NVMe device
     * @type {number}
     */
    NVME_CORES_RESERVE: 6,
    
    /**
     * CPU cores reserved per HDD device
     * @type {number}
     */
    HDD_CORES_RESERVE: 0.5,
    
    /**
     * RAM (in GB) reserved for system operations per server
     * @type {number}
     */
    SYSTEM_RAM_RESERVE: 4,
    
    /**
     * RAM (in GB) reserved per NVMe device
     * @type {number}
     */
    NVME_RAM_RESERVE: 6,
    
    /**
     * RAM (in GB) reserved per HDD device
     * @type {number}
     */
    HDD_RAM_RESERVE: 2,
    
    // Cluster Configuration
    /**
     * Minimum number of servers for production cluster
     * @type {number}
     */
    MIN_SERVERS: 12,
    
    /**
     * Minimum number of servers to perform capacity calculations
     * @type {number}
     */
    MIN_SERVERS_TO_CALCULATE: 9,
    
    /**
     * Recommended RAM per CPU core ratio
     * @type {number}
     */
    RAM_PER_CORE_RATIO: 5
};

// Export for Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_CONFIG
    };
}

if (typeof window !== 'undefined') {
    window.CalculatorConfig = {
        DEFAULT_CONFIG
    };
}