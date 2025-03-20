let dronePartsData = null;
const droneLevelInput = document.getElementById('drone-level');
const startLevelInput = document.getElementById('start-level');
const endLevelInput = document.getElementById('end-level');
const currentLevelToggle = document.getElementById('current-level-toggle');
const currentLevelRow = document.getElementById('current-level-row');
const currentLevelInput = document.getElementById('current-level');
const calculateButton = document.getElementById('calculate-btn');
const rangecalculateButton = document.getElementById('range-calculate-btn');
const resultsContainer = document.getElementById('results-container');

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function validateInputs() {
    if (!dronePartsData) return;
    
    const validLevels = Object.keys(dronePartsData).map(Number).sort((a, b) => a - b);
    const minLevel = Math.min(...validLevels);
    const maxLevel = Math.max(...validLevels);
    
    droneLevelInput.min = minLevel;
    droneLevelInput.max = maxLevel;
    
    startLevelInput.min = minLevel;
    startLevelInput.max = maxLevel - 5;
    
    endLevelInput.min = minLevel + 5;
    endLevelInput.max = maxLevel;
    
    droneLevelInput.addEventListener('change', () => {
        const currentValue = parseInt(droneLevelInput.value);
        const closestLevel = findClosestLevel(currentValue);
        
        if (currentValue !== closestLevel) {
            droneLevelInput.value = closestLevel;
        };
    });
    
    startLevelInput.addEventListener('change', () => {
        const currentValue = parseInt(startLevelInput.value);
        const closestLevel = findClosestLevel(currentValue);
        
        if (currentValue !== closestLevel) {
            startLevelInput.value = closestLevel;
        };
        
        if (parseInt(endLevelInput.value) <= parseInt(startLevelInput.value)) {
            endLevelInput.value = Math.min(parseInt(startLevelInput.value) + 5, maxLevel);
        };
    });
    
    endLevelInput.addEventListener('change', () => {
        const currentValue = parseInt(endLevelInput.value);
        const closestLevel = findClosestLevel(currentValue);
        
        if (currentValue !== closestLevel) {
            endLevelInput.value = closestLevel;
        };
        
        if (parseInt(startLevelInput.value) >= parseInt(endLevelInput.value)) {
            startLevelInput.value = Math.max(parseInt(endLevelInput.value) - 5, minLevel);
        };
    });
};

function findClosestLevel(level) {
    if (!dronePartsData) return level;
    
    const validLevels = Object.keys(dronePartsData).map(Number).sort((a, b) => a - b);
    if (validLevels.includes(level)) {
        return level;
    };
    
    let closest = validLevels[0];
    let closestDiff = Math.abs(level - closest);
    
    for (let i = 1; i < validLevels.length; i++) {
        const currentDiff = Math.abs(level - validLevels[i]);
        if (currentDiff < closestDiff) {
            closest = validLevels[i];
            closestDiff = currentDiff;
        };
    };
    
    return closest;
};

function calculateDroneParts() {
    const level = parseInt(droneLevelInput.value);
    
    if (isNaN(level)) {
        alert('Please enter a valid drone level');
        return;
    };
    
    const closestLevel = findClosestLevel(level);
    if (!dronePartsData[closestLevel]) {
        alert(`No data available for drone level ${closestLevel}`);
        return;
    };
    
    const partsRequired = dronePartsData[closestLevel];
    let html = `
        <div class="drone-result">
            <div class="drone-name">Drone Level ${closestLevel}</div>
            <div class="resource resource-parts">
                <span>Drone Parts Required:</span>
                <span>${formatNumber(partsRequired)}</span>
            </div>
        </div>
    `;
    
    const validLevels = Object.keys(dronePartsData).map(Number).sort((a, b) => a - b);
    const currentIndex = validLevels.indexOf(closestLevel);
    
    const startIdx = Math.max(0, currentIndex - 5);
    const endIdx = Math.min(validLevels.length - 1, currentIndex + 5);
    
    if (startIdx < endIdx) {
        html += `
            <div class="comparison">
                <h3>Nearby Levels</h3>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Drone Level</th>
                            <th>Parts Required</th>
                            <th>Difference</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let i = startIdx; i <= endIdx; i++) {
            const lvl = validLevels[i];
            const parts = dronePartsData[lvl];
            const difference = i === currentIndex ? '-' : (parts - partsRequired);
            const differenceFormatted = difference === '-' ? '-' : (difference > 0 ? `+${formatNumber(difference)}` : formatNumber(difference));
            
            html += `
                <tr${i === currentIndex ? ' class="selected-level"' : ''}>
                    <td>${lvl}</td>
                    <td>${formatNumber(parts)}</td>
                    <td>${differenceFormatted}</td>
                </tr>
            `;
        };
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    };
    
    resultsContainer.innerHTML = html;
};

function calculateDronePartsRange() {
    let startLevel;
    const endLevel = parseInt(endLevelInput.value);
    
    if (currentLevelToggle.checked) {
        startLevel = parseInt(currentLevelInput.value);
    } else {
        startLevel = parseInt(startLevelInput.value);
    };
    
    if (isNaN(startLevel) || isNaN(endLevel)) {
        alert('Please enter valid drone levels');
        return;
    };
    
    if (startLevel >= endLevel) {
        alert('End level must be greater than start level');
        return;
    };
    
    const startClosest = findClosestLevel(startLevel);
    const endClosest = findClosestLevel(endLevel);
    
    const validLevels = Object.keys(dronePartsData)
        .map(Number)
        .filter(lvl => lvl >= startClosest && lvl <= endClosest)
        .sort((a, b) => a - b); // No... I'm not a wizard and my name is not Harry.
    
    if (validLevels.length === 0) {
        alert(`No data available for levels between ${startClosest} and ${endClosest}`);
        return;
    };
    
    let totalParts = 0;
    let html = `
        <div class="drone-range-result">
            <div class="drone-name">Drone Level Range: ${startClosest} to ${endClosest}</div>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Level Range</th>
                        <th>Parts Required</th>
                        <th>Cumulative Parts</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < validLevels.length - 1; i++) {
        const currentLevel = validLevels[i];
        const nextLevel = validLevels[i + 1];
        const parts = dronePartsData[nextLevel];
        
        totalParts += parts;
        
        html += `
            <tr>
                <td>${currentLevel} → ${nextLevel}</td>
                <td>${formatNumber(parts)}</td>
                <td>${formatNumber(totalParts)}</td>
            </tr>
        `;
    };
    
    html += `
                </tbody>
            </table>
            <div class="resource resource-parts total-parts">
                <span>Total Drone Parts Required:</span>
                <span>${formatNumber(totalParts)}</span>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/drone.json');
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        dronePartsData = await response.json();
        calculateButton.addEventListener('click', calculateDroneParts);
        rangecalculateButton.addEventListener('click', calculateDronePartsRange);

        currentLevelToggle.addEventListener('change', function() {
            if (this.checked) {
                currentLevelRow.style.display = 'flex';
                startLevelInput.disabled = true;
                startLevelInput.parentElement.style.opacity = '0.6';
            } else {
                currentLevelRow.style.display = 'none';
                startLevelInput.disabled = false;
                startLevelInput.parentElement.style.opacity = '1';
            };
        });
        
        validateInputs();
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="box-result">
                <div class="box-name">Error Loading Data</div>
                <p>Could not load the data, please contact the site manager</p>
                <p>Error: ${error.message}</p>
                <p>Please ensure the file exists in the correct location.</p>
            </div>
        `;
    };
});