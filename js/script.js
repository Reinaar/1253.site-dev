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

    /**
     * Converts seconds into a time string formatted as "d\d hh:mm:ss" as "LastWar" does.
     * Examples:
     *  - 4d 03:02:01
     *  - 00:00:01
     *
     * @param {number} seconds - The number of seconds to format.
     * @returns {string} - The formatted time string.
     */
    format: function(totalSeconds) {
        if (totalSeconds === 0) return t('buildings.time.no-data');

        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        totalSeconds %= (24 * 60 * 60);
        const hours = Math.floor(totalSeconds / (60 * 60));  // Yikes.....
        totalSeconds %= (60 * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const days_display = days > 0 ? `${days}d ` : "";

        return days_display + `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
    levelInput.placeholder = t('buildings.level-range').replace('{min}', minLevel).replace('{max}', maxLevel);
};

addBuildingButton.addEventListener('click', () => {
    console.log(t("buildings.level"))
    const newRow = document.createElement('div');
    newRow.className = 'building-row';
    newRow.innerHTML = `
        <select class="building-select">
            <option value="" data-i18n="buildings.select-building">${t('buildings.select-building')}</option>
        </select>
        <input type="number" class="level-input" min="1" placeholder="${t('buildings.level')}" disabled>
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
                alert(t('buildings.errors.level-not-found').replace('{level}', level).replace('{building}', buildingName));
                validRequest = false;
            };
        } else if (buildingName || levelStr) {
            alert(t('buildings.errors.select-both'));
            validRequest = false;
        };
    });

    if (buildingRequests.length === 0) {
        alert(t('buildings.errors.select-at-least-one'));
        return;
    };

    if (validRequest)
        calculateRequirements(buildingRequests);
});

function calculateRequirements(buildingRequests) {
    const userInputBuff = parseFloat(speedBuffInput.value) || 0;
    // The normal buff was used with different buffs, using average of 70 as default
    const adjustedSpeedBuff = Math.max(0, userInputBuff - 70);
    const speedMultiplier = 1 + (adjustedSpeedBuff / 100);

    const adjustedSpeedBuffOriginal = Math.max(0, userInputBuff);
    const speedMultiplierOriginal = 1 + (adjustedSpeedBuffOriginal / 100);

    const totals = { Iron: 0, Food: 0, Coin: 0, Time: 0, BuffedTime: 0 };

    const details = buildingRequests.map(request => {
        const buildingName = request.building;
        const level = request.level;
        const resources = buildingsData[buildingName][level];


        const originalTimeInSeconds = Time.parseToSeconds(resources.OriginalTime ?? resources.Time);
        const buffedTimeInSeconds = originalTimeInSeconds > 0
            ? Math.ceil(originalTimeInSeconds / (resources.OriginalTime ? speedMultiplierOriginal : speedMultiplier))
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

    displayResults({ totals, details, speedBuff: userInputBuff, adjustedSpeedBuff, adjustedSpeedBuffOriginal });
};

/*
 * Takes a number and will format it to percent. 1 means 100%
 *
 * @param {number} percentage - The percentage to be shown
 * @param {number} decimals - How many decimals to show. Defaults to 1
 * @returns {string} - The formatted percent string.
 */
function formatPercent(percentage, decimals = 1) {
    return (percentage * 100).toFixed(decimals) + " %";
}

function displayResults(results) {
    const userSpeedBuff = results.speedBuff;
    const adjustedSpeedBuff = results.adjustedSpeedBuff;
    const adjustedSpeedBuffOriginal = results.adjustedSpeedBuffOriginal;
    let html = '';

    if (userSpeedBuff > 0) {
        html += `
            <div class="building-result">
                <div class="building-name">${t('buildings.results.applied-speed-buff').replace('{buff}', userSpeedBuff)}</div>
                <p>${t('buildings.results.construction-times-reduced').replace('{factor}', (1 + (adjustedSpeedBuff / 100)).toFixed(2))}</p>
                <p>${t('buildings.results.construction-original-times-reduced').replace('{factor}', (1 + (adjustedSpeedBuffOriginal / 100)).toFixed(2))}</p>
            </div>
        `;
    };

    results.details.forEach((detail) => {
        const time = detail.resources.OriginalTime ?? detail.resources.Time;
        const isOriginal = detail.resources.OriginalTime !== undefined
        html += `
            <div class="building-result">
                <div class="building-name">${detail.building} ${t('buildings.results.level')} ${detail.level}</div>
                <div class="resource resource-iron">
                    <span>${t('buildings.resources.iron')}:</span>
                    <span>${formatNumber(detail.resources.Iron)}</span>
                </div>
                <div class="resource resource-food">
                    <span>${t('buildings.resources.food')}:</span>
                    <span>${formatNumber(detail.resources.Food)}</span>
                </div>
                <div class="resource resource-coin">
                    <span>${t('buildings.resources.coins')}:</span>
                    <span>${formatNumber(detail.resources.Coin)}</span>
                </div>
                <div class="resource resource-time">
                    <span>${t(isOriginal ? 'buildings.resources.original-base-time' : 'buildings.resources.base-time')}:</span>
                    <span>${Time.format(Time.parseToSeconds(time))}</span>
                </div>`;

        if (adjustedSpeedBuff > 0 && time !== "00:00:00:00") {
            html += `
                <div class="resource resource-time-buffed">
                    <span>${t('buildings.resources.buffed-time')}:</span>
                    <span>${Time.format(detail.buffedTime)} (-${formatPercent(1 - detail.buffedTime / Time.parseToSeconds(time))})</span>
                </div>`;
        };

        html += `</div>`;
    });

    html += `
        <div class="totals">
            <h3>${t('buildings.results.total-requirements')}</h3>
            <div class="resource resource-iron">
                <span>${t('buildings.resources.iron')}:</span>
                <span>${formatNumber(results.totals.Iron)}</span>
            </div>
            <div class="resource resource-food">
                <span>${t('buildings.resources.food')}:</span>
                <span>${formatNumber(results.totals.Food)}</span>
            </div>
            <div class="resource resource-coin">
                <span>${t('buildings.resources.coins')}:</span>
                <span>${formatNumber(results.totals.Coin)}</span>
            </div>
            <div class="resource resource-time">
                <span>${t('buildings.results.total-base-time')}:</span>
                <span>${Time.format(results.totals.Time)}</span>
            </div>`;

    if (adjustedSpeedBuff > 0) {
        html += `
            <div class="resource resource-time-buffed">
                <span>${t('buildings.results.total-buffed-time')}:</span>
                <span>${Time.format(results.totals.BuffedTime)}</span>
            </div>
            <div class="resource resource-time-buffed">
                <span>${t('buildings.results.time-saved')}:</span>
                <span>${Time.format(results.totals.Time - results.totals.BuffedTime)} (${formatPercent(1 - results.totals.BuffedTime / results.totals.Time)})</span>
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
                <div class="building-name">${t('buildings.errors.loading-data')}</div>
                <p>${t('buildings.errors.contact-manager')}</p>
                <p>${t('buildings.errors.error-message')}: ${error.message}</p>
                <p>${t('buildings.errors.file-location')}</p>
            </div>
        `;
    };
});
