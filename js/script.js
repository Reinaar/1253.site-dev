let buildingsData = null;
const calculatorSection = document.getElementById('calculator-secticalculateButtonon');
const buildingsContainer = document.getElementById('buildings-container');
const addBuildingButton = document.getElementById('add-building-btn');
const calculateButton = document.getElementById('calculate-btn');
const resultsContainer = document.getElementById('results-container');
const speedBuffInput = document.getElementById('speed-buff');

const Time = {
    parseToSeconds: function(timeStr) {
        if (!timeStr || timeStr === "00:00:00:00") return 0;

        const [days, hours, minutes, seconds] = timeStr.split(':').map(num => parseInt(num, 10));
        return (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
    },

    format: function(totalSeconds) {
        if (totalSeconds === 0) return "No time data available";

        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        totalSeconds %= (24 * 60 * 60);
        const hours = Math.floor(totalSeconds / (60 * 60));  // Yikes.....
        totalSeconds %= (60 * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let result = "";
        if (days > 0) result += `${days} day${days !== 1 ? 's' : ''}, `;
        if (hours > 0 || days > 0) result += `${hours} hour${hours !== 1 ? 's' : ''}, `;
        if (minutes > 0 || hours > 0 || days > 0) result += `${minutes} minute${minutes !== 1 ? 's' : ''}, `;
        result += `${seconds} second${seconds !== 1 ? 's' : ''}`;

        return result;
    },

    formatTimeString: function(totalSeconds) {
        if (totalSeconds === 0) return "00:00:00:00";

        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        totalSeconds %= (24 * 60 * 60);
        const hours = Math.floor(totalSeconds / (60 * 60));
        totalSeconds %= (60 * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
};

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Leave REGEX for the AI
};

function populateBuildingOptions() {
    if (!buildingsData) return;

    const buildingNames = Object.keys(buildingsData).sort();
    const buildingSelects = document.querySelectorAll('.building-select');

    buildingSelects.forEach(select => {
        const firstOption = select.querySelector('option');
        if (select.options.length <= 1) {
            select.innerHTML = '';
            select.appendChild(firstOption);

            buildingNames.forEach(building => {
                const option = document.createElement('option');
                option.value = building;
                option.textContent = building;
                select.appendChild(option);
            });
        };
    });
};

function setupBuildingRow(row) {
    const buildingSelect = row.querySelector('.building-select');
    const levelInput = row.querySelector('.level-input');
    const removeButton = row.querySelector('.remove');

    buildingSelect.addEventListener('change', () => {
        const buildingName = buildingSelect.value;
        if (buildingName) {
            levelInput.disabled = false;
            populateLevelOptions(buildingName, levelInput);
        } else {
            levelInput.disabled = true;
            levelInput.value = '';
        };
    });

    removeButton.addEventListener('click', () => {
        if (document.querySelectorAll('.building-row').length > 1) {
            row.remove();
        } else {
            buildingSelect.value = '';
            levelInput.value = '';
            levelInput.disabled = true;
        };
    });
};

function populateLevelOptions(buildingName, levelInput) {
    if (!buildingsData || !buildingsData[buildingName]) return;

    const buildingLevels = buildingsData[buildingName];
    const levelNumbers = Object.keys(buildingLevels).map(Number).filter(n => !isNaN(n)); // God bless filter
    const maxLevel = Math.max(...levelNumbers);
    const minLevel = Math.min(...levelNumbers);

    levelInput.value = '';
    levelInput.max = maxLevel;
    levelInput.min = minLevel;
    levelInput.placeholder = `Level (${minLevel}-${maxLevel})`;
};

addBuildingButton.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'building-row';
    newRow.innerHTML = `
        <select class="building-select">
            <option value="">Select Building</option>
        </select>
        <input type="number" class="level-input" min="1" placeholder="Level" disabled>
        <button class="remove">✕</button>
    `;

    buildingsContainer.appendChild(newRow);
    const newSelect = newRow.querySelector('.building-select');

    if (buildingsData) {
        const buildingNames = Object.keys(buildingsData).sort();
        buildingNames.forEach(building => {
            const option = document.createElement('option');
            option.value = building;
            option.textContent = building;
            newSelect.appendChild(option);
        });
    };

    setupBuildingRow(newRow);
});

calculateButton.addEventListener('click', () => {
    if (!buildingsData) {
        alert('Building data not loaded yet');
        return;
    };

    const buildingRows = document.querySelectorAll('.building-row');
    const buildingRequests = [];
    let validRequest = true;

    buildingRows.forEach(row => {
        const buildingName = row.querySelector('.building-select').value;
        const levelStr = row.querySelector('.level-input').value;

        if (buildingName && levelStr) {
            const level = levelStr;

            if (buildingsData[buildingName] && buildingsData[buildingName][level]) {
                buildingRequests.push({
                    building: buildingName,
                    level: level
                });
            } else { // Sorry for whoever is seeing this... I can't avoid the ugly strucutre here.
                alert(`Level ${level} not found for ${buildingName}`);
                validRequest = false;
            };
        } else if (buildingName || levelStr) {
            alert('Please select both building and level');
            validRequest = false;
        };
    });

    if (buildingRequests.length === 0) {
        alert('Please select at least one building and level');
        return;
    };

    if (validRequest)
        calculateRequirements(buildingRequests);
});

function calculateRequirements(buildingRequests) {
    const userInputBuff = parseFloat(speedBuffInput.value) || 0;
    const adjustedSpeedBuff = Math.max(0, userInputBuff - 70); // Data was collected with different buffs
    const speedMultiplier = 1 + (adjustedSpeedBuff / 100);     // Therefore a median average will be 70%

    const totals = { Iron: 0, Food: 0, Coin: 0, Time: 0, BuffedTime: 0 };

    const details = buildingRequests.map(request => {
        const buildingName = request.building;
        const level = request.level;
        const resources = buildingsData[buildingName][level];

        const originalTimeInSeconds = Time.parseToSeconds(resources.Time);
        const buffedTimeInSeconds = originalTimeInSeconds > 0
            ? Math.ceil(originalTimeInSeconds / speedMultiplier)
            : 0;

        totals.Iron += resources.Iron;
        totals.Food += resources.Food;
        totals.Coin += resources.Coin;
        totals.Time += originalTimeInSeconds;
        totals.BuffedTime += buffedTimeInSeconds;

        return {
            building: buildingName,
            level: level,
            resources: resources,
            buffedTime: buffedTimeInSeconds
        };
    });

    displayResults({ totals, details, speedBuff: userInputBuff, adjustedSpeedBuff });
};

function displayResults(results) {
    const userSpeedBuff = results.speedBuff;
    const adjustedSpeedBuff = results.adjustedSpeedBuff;
    let html = '';

    if (userSpeedBuff > 0) {
        html += `
            <div class="building-result">
                <div class="building-name">Applied Speed Buff: ${userSpeedBuff}%</div>
                <p>Construction times are reduced by a factor of ${(1 + (adjustedSpeedBuff / 100)).toFixed(2)}x</p>
            </div>
        `;
    };

    results.details.forEach((detail) => {
        html += `
            <div class="building-result">
                <div class="building-name">${detail.building} Level ${detail.level}</div>
                <div class="resource resource-iron">
                    <span>Iron:</span>
                    <span>${formatNumber(detail.resources.Iron)}</span>
                </div>
                <div class="resource resource-food">
                    <span>Food:</span>
                    <span>${formatNumber(detail.resources.Food)}</span>
                </div>
                <div class="resource resource-coin">
                    <span>Coins:</span>
                    <span>${formatNumber(detail.resources.Coin)}</span>
                </div>
                <div class="resource resource-time">
                    <span>Base Time:</span>
                    <span>${detail.resources.Time} (${Time.format(Time.parseToSeconds(detail.resources.Time))})</span>
                </div>`;

        if (adjustedSpeedBuff > 0) {
            html += `
                <div class="resource resource-time-buffed">
                    <span>Buffed Time:</span>
                    <span>${Time.formatTimeString(detail.buffedTime)} (${Time.format(detail.buffedTime)})</span>
                </div>`;
        };

        html += `</div>`;
    });

    html += `
        <div class="totals">
            <h3>Total Requirements</h3>
            <div class="resource resource-iron">
                <span>Iron:</span>
                <span>${formatNumber(results.totals.Iron)}</span>
            </div>
            <div class="resource resource-food">
                <span>Food:</span>
                <span>${formatNumber(results.totals.Food)}</span>
            </div>
            <div class="resource resource-coin">
                <span>Coins:</span>
                <span>${formatNumber(results.totals.Coin)}</span>
            </div>
            <div class="resource resource-time">
                <span>Total Base Time:</span>
                <span>${Time.format(results.totals.Time)}</span>
            </div>`;

    if (adjustedSpeedBuff > 0) {
        html += `
            <div class="resource resource-time-buffed">
                <span>Total Buffed Time:</span>
                <span>${Time.format(results.totals.BuffedTime)}</span>
            </div>
            <div class="resource resource-time-buffed">
                <span>Time Saved:</span>
                <span>${Time.format(results.totals.Time - results.totals.BuffedTime)}</span>
            </div>`;
    };

    html += `</div>`;
    resultsContainer.innerHTML = html;
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/buildings.json');
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        buildingsData = await response.json();
        populateBuildingOptions();
        setupBuildingRow(buildingsContainer.querySelector('.building-row'));
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="building-result">
                <div class="building-name">Error Loading Data</div>
                <p>Could not load the data, please contact the site manager</p>
                <p>Error: ${error.message}</p>
                <p>Please ensure the file exists in the correct location.</p>
            </div>
        `;
    };
});
