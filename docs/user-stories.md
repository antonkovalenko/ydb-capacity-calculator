# User Stories - YDB Capacity Calculator

## Story 1: Capacity Planner

**As a** capacity planner  
**I want to** define server configuration in terms of cores per host, NVMe and HDD devices per host and their respective size in gigabytes, provide how many storage groups are required on HDD and NVMe, how many cores and gigabytes of RAM for database nodes are requested  
**So that** I receive the number of servers required to provide the requested capacity to order them

### Acceptance Criteria

- [ ] Input form for server specifications (cores, storage devices)
- [ ] Input form for requirements (storage groups, database cores, RAM in GB)
- [ ] Calculate and display total servers needed
- [ ] Show breakdown of storage vs compute requirements
- [ ] Validate all inputs for reasonable values
- [ ] It is allowed to specify no HDD or no SSD storage groups, but at least one type of storage must present
- [ ] Check that minimum cluster has 12 nodes even if calcultaion by any other resource requires less

### Example Input

- Server: 32 cores, 1024 GB of RAM, 2x1TB NVMe, 4x4TB HDD
- Requirements: 10 HDD storage groups, 5 NVMe storage groups, database nodes: 100 cores, 5000 GB of RAM
- Output: "You need X servers"

## Story 2: Calculate the amount of groups, RAM and cores provided by specified server configuration and server count

**As a** capacity planner  
**I want to** specify server configuration and server count  
**So that** I receive the amount of storage groups, RAM and cores provided by specified server configuration and server count