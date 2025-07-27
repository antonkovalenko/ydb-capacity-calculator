document.getElementById('capacityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        serverConfig: {
            coresPerHost: parseInt(document.getElementById('coresPerHost').value),
            nvmeDevices: [{ size: parseInt(document.getElementById('nvmeStorage').value) }],
            hddDevices: [{ size: parseInt(document.getElementById('hddStorage').value) }]
        },
        requirements: {
            storageGroupsHdd: parseInt(document.getElementById('storageGroupsHdd').value),
            storageGroupsNvme: parseInt(document.getElementById('storageGroupsNvme').value),
            databaseCores: parseInt(document.getElementById('databaseCores').value)
        },
        constraints: {
            systemCoresReserved: 2
        }
    };

    try {
        const response = await fetch('/.netlify/functions/calculate-capacity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        displayResults(result);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML = 
            '<p class="text-red-600">Error calculating capacity</p>';
    }
});

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="space-y-4">
            <div class="text-2xl font-bold text-green-600">
                Total Servers Required: ${result.totalServers}
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <strong>Storage Servers:</strong> ${result.breakdown.serversForStorage}
                </div>
                <div>
                    <strong>Compute Servers:</strong> ${result.breakdown.serversForCompute}
                </div>
                <div>
                    <strong>NVMe Servers:</strong> ${result.breakdown.serversForNvme}
                </div>
                <div>
                    <strong>HDD Servers:</strong> ${result.breakdown.serversForHdd}
                </div>
            </div>
            
            <div class="border-t pt-4">
                <h4 class="font-semibold">Resource Utilization</h4>
                <div class="text-sm space-y-1">
                    <div>Total Cores: ${result.utilization.totalCores}</div>
                    <div>Used Cores: ${result.utilization.usedCores}</div>
                    <div>Total NVMe: ${result.utilization.totalNvmeStorage} GB</div>
                    <div>Total HDD: ${result.utilization.totalHddStorage} GB</div>
                </div>
            </div>
        </div>
    `;
}