# Business Rules & Calculation Logic

## Storage Group Sizing Rules

- **NVMe Storage Groups**: Assume ~100GB per storage group (configurable)
- **HDD Storage Groups**: Assume ~1TB per storage group (configurable)
- **Redundancy**: Each storage group needs multiple servers (RAID-like distribution)

## CPU Allocation Rules

- **System Cores**: Reserve 2-4 cores per server for OS and system processes
- **Database Cores**: Remaining cores available for YDB database nodes
- **Compute vs Storage**: Servers can run both storage and database nodes
- Reserve 6 cores of hardware server for every NVMe drive and .5 core for HDD drive

## RAM Allocation rules

- **System RAM**: Reserve 4 GB of hardware server for system needs
- **Storage RAM**: Reserve 6 GB of RAM for every NVMe storage device and 2 GB for every HDD storage device on a server. This is storage process reserve
- Rest of RAM might be used by database nodes

## Server configuration

Only one type of servers is used in calculation. Configuration is defined by:
- number of CPU cores per server
- number of RAM per server in GB
- number of NVMe storage devices attached to every server
- size of a single NVMe devices on TB
- number of HDD storage devices attached to every server
- size of a single HDD devices on TB
- number of vdisks that could be launched over HDD PDisks
- number of vdisks that could be launched over NVMe PDisks

## Server Calculation Algorithm

Purpose of server calculation algorithm is to calculate the amount of servers required to provide requested amount of cores, ram, hdd storage groups or nvme storage groups.

Servers are calculated base on all requested resources. The result covering need in all the resources is chosen.

Calculation process receives capacity requirements:

- number of cores for database nodes
- amount of RAM in GB for database nodes
- number of NVMe storage groups
- number of HDD storage groups

### How to calculate servers by storage groups

1. storage group consists of 9 vdisks
2. calculate number of vdisks required for the groups (groups count / 9)
3. add reserve for device failure (1% would suffice but not less than 18 vdisks)
4. calculate the amount of vdisks from one server
5. calculate amount of servers by dividing number required vdisks to vdisks from one server
6. Number of servers in a cluster cannot be less than 12

### How to calculate servers by cores and memory

1. Calculate how many cores for databases nodes are available from every server: substract cores, reserved for OS and cores for storage from server cores count.
2. Divide cores ordered by cores for databases node from one server - get number of servers
3. Calculate how many RAM for databases nodes is available from every server: substract RAM, reserved for OS and RAM for storage from server total RAM.
2. Divide RAM ordered by RAM for databases node from one server - get number of servers by RAM

### How to present final calculation

1. Final calculation must show amount of servers by every order param: cores, storage groups, RAM
2. Final calculation must show which resource requires the most servers and present final number estimated by such resource
3. Final calculation must show relative difference in server count ordered by each resource. Use example below:

Servers required by storage groups: 234 (dominant resource)
Servers required by cores: 12 (222 servers or  94 % less)