// Netlify serverless function for capacity calculations
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { serverConfig, requirements, constraints } = JSON.parse(event.body);
    const result = calculateCapacity(serverConfig, requirements, constraints);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function calculateCapacity(serverConfig, requirements, constraints = {}) {
  // Story 1: Capacity Planning
  const {
    coresPerHost,
    nvmeDevices = [],
    hddDevices = []
  } = serverConfig;

  const {
    storageGroupsHdd = 0,
    storageGroupsNvme = 0,
    databaseCores = 0
  } = requirements;

  // Calculate storage requirements
  const nvmeCapacityPerHost = nvmeDevices.reduce((sum, device) => sum + device.size, 0);
  const hddCapacityPerHost = hddDevices.reduce((sum, device) => sum + device.size, 0);

  // Calculate servers needed for storage groups
  const serversForNvme = storageGroupsNvme > 0 ? 
    Math.ceil(storageGroupsNvme / Math.floor(nvmeCapacityPerHost / 100)) : 0; // Assuming 100GB per storage group
  
  const serversForHdd = storageGroupsHdd > 0 ? 
    Math.ceil(storageGroupsHdd / Math.floor(hddCapacityPerHost / 1000)) : 0; // Assuming 1TB per storage group

  // Calculate servers needed for compute
  const systemCoresReserved = constraints.systemCoresReserved || 2;
  const availableCoresPerHost = coresPerHost - systemCoresReserved;
  const serversForCompute = Math.ceil(databaseCores / availableCoresPerHost);

  const totalServers = Math.max(serversForNvme + serversForHdd, serversForCompute);

  return {
    totalServers,
    breakdown: {
      serversForStorage: serversForNvme + serversForHdd,
      serversForCompute,
      serversForNvme,
      serversForHdd
    },
    utilization: {
      totalCores: totalServers * coresPerHost,
      usedCores: databaseCores + (totalServers * systemCoresReserved),
      totalNvmeStorage: totalServers * nvmeCapacityPerHost,
      totalHddStorage: totalServers * hddCapacityPerHost
    }
  };
}