let heroExpData = null;

const heroStartLevelInput = document.getElementById('hero-start-level');
const heroTargetLevelInput = document.getElementById('hero-target-level');
const calculateHeroButton = document.getElementById('calculate-hero-btn');
const heroCart = document.getElementById('hero-cart');
const addHeroButton = document.getElementById('add-hero-btn');
const calculateTotalButton = document.getElementById('calculate-total-btn');
const resultsContainer = document.getElementById('results-container');

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function validateInputs() {
    if (!heroExpData) return;
    
    const validLevels = Object.keys(heroExpData).map(Number).sort((a, b) => a - b);
    const minLevel = Math.min(...validLevels);
    const maxLevel = Math.max(...validLevels);
    
    heroStartLevelInput.min = minLevel;
    heroStartLevelInput.max = maxLevel - 1;
    
    heroTargetLevelInput.min = minLevel + 1;
    heroTargetLevelInput.max = maxLevel;
    
    heroStartLevelInput.addEventListener('change', () => {
        const startLevel = parseInt(heroStartLevelInput.value);
        const targetLevel = parseInt(heroTargetLevelInput.value);
        
        if (startLevel >= targetLevel) { // Oopsie prevented. Day saved!
            heroTargetLevelInput.value = Math.min(startLevel + 1, maxLevel);
        };
    });
    
    heroTargetLevelInput.addEventListener('change', () => {
        const startLevel = parseInt(heroStartLevelInput.value);
        const targetLevel = parseInt(heroTargetLevelInput.value);
        
        if (targetLevel <= startLevel) { // Must I really repeat myself...
            heroStartLevelInput.value = Math.max(targetLevel - 1, minLevel);
        };
    });
};

function setupHeroCartRow(row) {
    const startLevelInput = row.querySelector('.hero-start-level');
    const targetLevelInput = row.querySelector('.hero-target-level');
    const heroNameInput = row.querySelector('.hero-name-multiple');
    const removeButton = row.querySelector('.remove');
    removeButton.disabled = false;

    startLevelInput.addEventListener('change', () => {
        let startValue = parseInt(startLevelInput.value);
        if (isNaN(startValue) || startValue < 1) {
            startLevelInput.value = 1;
            startValue = 1;
        } else if (startValue > 149) { // Please don't look at this ugly implmentation.
            startLevelInput.value = 149;
            startValue = 149;
        };
        
        let targetValue = parseInt(targetLevelInput.value);
        if (startValue >= targetValue) {
            targetLevelInput.value = Math.min(startValue + 1, 150);
        };
    });
    
    targetLevelInput.addEventListener('change', () => {
        let targetValue = parseInt(targetLevelInput.value);
        if (isNaN(targetValue) || targetValue < 2) {
            targetLevelInput.value = 2;
            targetValue = 2;
        } else if (targetValue > 150) {
            targetLevelInput.value = 150;
            targetValue = 150;
        };
        
        let startValue = parseInt(startLevelInput.value);
        if (targetValue <= startValue) {
            startLevelInput.value = Math.max(targetValue - 1, 1);
        };
    });
    
    removeButton.addEventListener('click', () => {
        if (document.querySelectorAll('.hero-cart-row').length > 1) {
            row.remove();
        } else {
            startLevelInput.value = 1;
            targetLevelInput.value = 10;
            heroNameInput.value = '';
        };
    });
};

function addHeroToCart() {
    const newRow = document.createElement('div');
    newRow.className = 'hero-cart-row';
    newRow.innerHTML = `
        <input type="number" class="hero-start-level" min="1" max="149" placeholder="Start Level" value="1">
        <input type="number" class="hero-target-level" min="2" max="150" placeholder="Target Level" value="10">
        <input type="text" class="hero-name-multiple" placeholder="Hero Name (optional)">
        <button class="remove">✕</button>
    `;
    
    heroCart.appendChild(newRow);
    setupHeroCartRow(newRow);
    
    newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

function calculateExpBetweenLevels(startLevel, targetLevel) {
    if (!heroExpData) return 0;
    let totalExp = 0;

    for (let level = startLevel + 1; level <= targetLevel; level++) {
        totalExp += heroExpData[level] || 0;
    };
    
    return totalExp;
};

function calculateHeroExp() {
    const startLevel = parseInt(heroStartLevelInput.value);
    const targetLevel = parseInt(heroTargetLevelInput.value);
    
    if (isNaN(startLevel) || isNaN(targetLevel)) {
        alert('Please enter valid hero levels');
        return;
    };
    
    if (startLevel >= targetLevel) {
        alert('Target level must be greater than start level');
        return;
    };
    
    if (!heroExpData) {
        alert('Hero experience data not loaded yet');
        return;
    };
    
    const expRequired = calculateExpBetweenLevels(startLevel, targetLevel);
    let html = `
        <div class="hero-result">
            <div class="hero-name-multiple">Level ${startLevel} → ${targetLevel}</div>
            <div class="resource resource-exp">
                <span>Experience Required:</span>
                <span>${formatNumber(expRequired)}</span>
            </div>
        </div>
    `;
    
    html += `
        <div class="comparison">
            <h3>Level Breakdown</h3>
            <div style="margin-right: 8px;">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Level</th>
                            <th style="width: 35%;">XP for Level</th>
                            <th style="width: 40%;">Cumulative XP</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    let cumulativeXP = 0;
    for (let level = startLevel + 1; level <= targetLevel; level++) {
        const levelXP = heroExpData[level] || 0;
        cumulativeXP += levelXP;
        html += `
            <tr>
                <td>${level - 1} → ${level}</td>
                <td>${formatNumber(levelXP)}</td>
                <td>${formatNumber(cumulativeXP)}</td>
            </tr>
        `;
    };
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
};

function displayTotalHeroExp(heroRequests) {
    let totalExp = 0;
    const heroResults = [];
    
    heroRequests.forEach(request => {
        const expRequired = calculateExpBetweenLevels(request.startLevel, request.targetLevel);
        totalExp += expRequired;
        
        heroResults.push({
            name: request.name,
            startLevel: request.startLevel,
            targetLevel: request.targetLevel,
            expRequired: expRequired
        });
    });
    
    let html = `
        <div class="hero-result">
            <div class="hero-name">Total Experience Required</div>
            <div class="resource resource-exp">
                <span>Total XP:</span>
                <span>${formatNumber(totalExp)}</span>
            </div>
        </div>
    `;
    
    if (heroResults.length > 0) {
        html += `
            <div class="comparison">
                <div class="box-name">Hero Breakdown</div>
                <div style="margin-right: 8px;">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th style="width: 30%;">Hero</th>
                                <th style="width: 20%;">Levels</th>
                                <th style="width: 30%;">XP Required</th>
                                <th style="width: 20%;">% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        heroResults.forEach(result => {
            const percentOfTotal = ((result.expRequired / totalExp) * 100).toFixed(2); 
            html += `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.startLevel} → ${result.targetLevel}</td>
                    <td>${formatNumber(result.expRequired)}</td>
                    <td>${percentOfTotal}%</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    };
    
    // My pitiful attempt at visualization
    if (heroResults.length > 0) {
        let maxLevelExp = 0;
        for (let i = 1; i < 150; i++) {
            if (heroExpData[i+1] > maxLevelExp) {
                maxLevelExp = heroExpData[i+1];
            };
        };
        
        html += `
            <div class="comparison">
                <h3>XP Growth Chart</h3>
                <p>This chart shows the XP requirements for each level upgrade with a relative scale</p>
                <div class="xp-chart" style="margin-right: 8px;">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th style="width: 25%;">Level Range</th>
                                <th style="width: 35%;">XP Required</th>
                                <th style="width: 40%;">Visual Scale</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        const levelRanges = [
            { start: 1, end: 10 },
            { start: 11, end: 20 },
            { start: 21, end: 30 },
            { start: 31, end: 40 },
            { start: 41, end: 50 },
            { start: 51, end: 60 },
            { start: 61, end: 70 },
            { start: 71, end: 80 },
            { start: 81, end: 90 },
            { start: 91, end: 100 },
            { start: 101, end: 110 },
            { start: 111, end: 120 },
            { start: 121, end: 130 },
            { start: 131, end: 140 },
            { start: 141, end: 150 }
        ];
        
        levelRanges.forEach(range => {
            const rangeExp = calculateExpBetweenLevels(range.start, range.end);
            const scaleWidth = Math.max(5, Math.min(100, (rangeExp / (maxLevelExp * 10)) * 100));
            html += `
                <tr>
                    <td>${range.start} → ${range.end}</td>
                    <td>${formatNumber(rangeExp)}</td>
                    <td>
                        <div class="xp-bar" style="width: ${scaleWidth}%; background-color: var(--exp-color);"></div>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };
    
    resultsContainer.innerHTML = html;
};

function calculateTotalHeroExp() {
    const heroRows = document.querySelectorAll('.hero-cart-row');
    const heroRequests = [];
    let validRequest = true;
    
    heroRows.forEach(row => {
        const startLevel = parseInt(row.querySelector('.hero-start-level').value);
        const targetLevel = parseInt(row.querySelector('.hero-target-level').value);
        const heroName = row.querySelector('.hero-name-multiple').value.trim() || `Hero ${heroRequests.length + 1}`;
        
        if (isNaN(startLevel) || isNaN(targetLevel)) {
            alert('Please enter valid hero levels');
            validRequest = false;
            return;
        };
        
        if (startLevel >= targetLevel) {
            alert(`Target level must be greater than start level for ${heroName}`);
            validRequest = false;
            return;
        };
        
        heroRequests.push({
            name: heroName,
            startLevel: startLevel,
            targetLevel: targetLevel
        });
    });
    
    if (heroRequests.length === 0) {
        alert('Please add at least one hero');
        return;
    };
    
    if (!validRequest) {
        return;
    };
    
    displayTotalHeroExp(heroRequests); // I know I love using (this) but this is def not worth a .bind()...
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/heroes.json');
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

        heroExpData = await response.json();
        calculateHeroButton.addEventListener('click', calculateHeroExp);
        addHeroButton.addEventListener('click', addHeroToCart);
        calculateTotalButton.addEventListener('click', calculateTotalHeroExp);
        
        setupHeroCartRow(heroCart.querySelector('.hero-cart-row'));
        validateInputs();
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="hero-result">
                <div class="hero-name">Error Loading Data</div>
                <p>Could not load the data, please contact the site manager</p>
                <p>Error: ${error.message}</p>
                <p>Please ensure the file exists in the correct location.</p>
            </div>
        `;
    };
});