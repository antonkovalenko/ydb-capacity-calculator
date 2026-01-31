# User Stories - YDB Capacity Calculator

## Servers Needed: Capacity Planner

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
- Output: "You need X servers". Note that when server count is displayed based on on minimum server count a warning must be displayed that 12 is the minimum recommended cluster size.

## Resources Provided: Calculate the amount of groups, RAM and cores provided by specified server configuration and server count

**As a** capacity planner  
**I want to** specify server configuration and server count  
**So that** I receive the amount of storage groups, RAM and cores provided by specified server configuration and server count

### Example Output

I want the results for databases recources to be easily distinguishable from storage resources. Example

```
### Storage Capacity:
- HDD Storage Groups: X
- NVMe Storage Groups: Y
### Database Capacity:
- Database Cores: Z
- Database RAM: W GB
```

## Config Summary: When server configuration is hidden I want to see the brief configuration summary

**As a** capacity planner  
**I want to** see the brief server configuration summary when server configuration form is hidden  
**So that** I always know what server configuration is used for calculation

Brief configuration summary example: "32 cores, 1024 GB of RAM, 2x1TB NVMe, 4x4TB HDD"

## Reserved Resources: As capacity planner I want to know how many resources are reserved for system and storage processes

**As a** capacity planner  
**I want to** see how many resources are reserved for system and storage processes  
**So that** I could estimnate overhead introduced by system and storage processes

When server configuration is entered or altered I want to see below the server configuration form the following information:

```
### Reserved Resources per Server:
- CPU Cores: X (Y for system, Z for storage processes: A per NVMe device, B per HDD device)
- RAM: M GB (N GB for system, P GB for storage processes: Q GB per NVMe device, R GB per HDD device)
```

## Reservation Settings: As capacity planner I want to know what settings are used for resource reservation calculations

As capacity planner defining server configuration I want to be able to see current settings for resource reservation. I don't want to change them.