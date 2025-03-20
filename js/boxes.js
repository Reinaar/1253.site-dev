let boxesData = null;
const boxLevelSelect = document.getElementById('box-level');
const boxRaritySelect = document.getElementById('box-rarity');
const calculateButton = document.getElementById('calculate-btn');
const boxCart = document.getElementById('box-cart');
const addBoxButton = document.getElementById('add-box-btn');
const calculateTotalButton = document.getElementById('calculate-total-btn');
const resultsContainer = document.getElementById('results-container');

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function setupBoxCartRow(row) {
    const levelSelect = row.querySelector('.box-level-select');
    const raritySelect = row.querySelector('.box-rarity-select');
    const quantityInput = row.querySelector('.box-quantity');
    const removeBtn = row.querySelector('.remove');
    
    if (levelSelect.options.length <= 1 && boxesData) {
        const levels = Object.keys(boxesData).sort((a, b) => parseInt(a) - parseInt(b));
        
        levelSelect.innerHTML = '<option value="">Select Level</option>';
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = `Level ${level}`;
            levelSelect.appendChild(option);
        });
    };
    
    removeBtn.addEventListener('click', () => {
        if (document.querySelectorAll('.box-cart-row').length > 1) {
            row.remove();
        } else {
            levelSelect.value = '';
            raritySelect.value = '';
            quantityInput.value = 1;
            removeBtn.disabled = true;
        };
    });
    
    const enableRemoveButton = () => {
        if (levelSelect.value || raritySelect.value || quantityInput.value !== '1')
            removeBtn.disabled = false;
        else
            removeBtn.disabled = true;
    };
    
    levelSelect.addEventListener('change', enableRemoveButton);
    raritySelect.addEventListener('change', enableRemoveButton);
    quantityInput.addEventListener('change', enableRemoveButton);
};

function addBoxToCart() {
    const newRow = document.createElement('div');
    newRow.className = 'box-cart-row';
    newRow.innerHTML = `
        <select class="box-level-select wide-select">
            <option value="">Select Level</option>
        </select>
        <select class="box-rarity-select">
            <option value="">Rarity</option>
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
        </select>
        <input type="number" class="box-quantity" min="1" value="1">
        <button class="remove" disabled>✕</button>
    `;
    
    boxCart.appendChild(newRow);
    const newLevelSelect = newRow.querySelector('.box-level-select');
    
    if (boxesData) {
        const levels = Object.keys(boxesData).sort((a, b) => parseInt(a) - parseInt(b));
        
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = `Level ${level}`;
            newLevelSelect.appendChild(option);
        });
    };
    
    setupBoxCartRow(newRow);
};

function displayTotalResources(boxRequests) {
    const totals = { Iron: 0, Food: 0, Coin: 0, EXP: 0 };
    
    boxRequests.forEach(request => {
        const boxData = boxesData[request.level][request.rarity];
        const quantity = request.quantity;
        
        totals.Iron += boxData.Iron * quantity;
        totals.Food += boxData.Food * quantity;
        totals.Coin += boxData.Coin * quantity;
        totals.EXP += boxData.EXP * quantity;
    });
    
    let html = `
        <div class="box-result">
            <div class="box-name">Total Resources from ${boxRequests.length} Box Type${boxRequests.length > 1 ? 's' : ''}</div>
            <div class="resource resource-iron">
                <span>Iron:</span>
                <span>${formatNumber(totals.Iron)}</span>
            </div>
            <div class="resource resource-food">
                <span>Food:</span>
                <span>${formatNumber(totals.Food)}</span>
            </div>
            <div class="resource resource-coin">
                <span>Coins:</span>
                <span>${formatNumber(totals.Coin)}</span>
            </div>
            <div class="resource resource-exp">
                <span>EXP:</span>
                <span>${formatNumber(totals.EXP)}</span>
            </div>
        </div>
        
        <div class="box-breakdown">
            <h3>Box Breakdown</h3>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Box</th>
                        <th>Quantity</th>
                        <th>Iron</th>
                        <th>Food</th>
                        <th>Coins</th>
                        <th>EXP</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    boxRequests.forEach(request => {
        const boxData = boxesData[request.level][request.rarity];
        const quantity = request.quantity;
        
        html += `
            <tr>
                <td>Level ${request.level} ${request.rarity}</td>
                <td>${quantity}</td>
                <td>${formatNumber(boxData.Iron * quantity)}</td>
                <td>${formatNumber(boxData.Food * quantity)}</td>
                <td>${formatNumber(boxData.Coin * quantity)}</td>
                <td>${formatNumber(boxData.EXP * quantity)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
};

function calculateBoxWorth() {
    const level = boxLevelSelect.value;
    const rarity = boxRaritySelect.value;
    
    if (!level || !rarity) {
        alert('Please select both level and rarity');
        return;
    };
    
    if (!boxesData[level] || !boxesData[level][rarity]) {
        alert(`No data available for ${rarity} box at level ${level}`);
        return;
    };
    
    const boxData = boxesData[level][rarity];
    let html = `
        <div class="box-result">
            <div class="box-name">${rarity} Box - Level ${level}</div>
            <div class="resource resource-iron">
                <span>Iron:</span>
                <span>${formatNumber(boxData.Iron)}</span>
            </div>
            <div class="resource resource-food">
                <span>Food:</span>
                <span>${formatNumber(boxData.Food)}</span>
            </div>
            <div class="resource resource-coin">
                <span>Coins:</span>
                <span>${formatNumber(boxData.Coin)}</span>
            </div>
            <div class="resource resource-exp">
                <span>EXP:</span>
                <span>${formatNumber(boxData.EXP)}</span>
            </div>
        </div>
    `;
    
    const otherRarities = ['Common', 'Rare', 'Epic', 'Legendary'].filter(r => r !== rarity);
    html += `
        <div class="comparison">
            <h3>Comparison with Other Rarities</h3>
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Resource</th>
                        ${otherRarities.map(r => `<th>${r}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    ['Iron', 'Food', 'Coin', 'EXP'].forEach(resource => {
        html += `
            <tr>
                <td>${resource}</td>
                ${otherRarities.map(r => `<td>${formatNumber(boxesData[level][r][resource])}</td>`).join('')}
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
};

function calculateTotalBoxes() {
    const boxRows = document.querySelectorAll('.box-cart-row');
    const boxRequests = [];
    let validRequest = true;
    
    boxRows.forEach(row => {
        const level = row.querySelector('.box-level-select').value;
        const rarity = row.querySelector('.box-rarity-select').value;
        const quantity = parseInt(row.querySelector('.box-quantity').value) || 1;
        
        if (level && rarity) {
            if (boxesData[level] && boxesData[level][rarity]) {
                boxRequests.push({level: level, rarity: rarity, quantity: quantity});
            } else {
                alert(`No data available for ${rarity} box at level ${level}`);
                validRequest = false;
            };
        };
    });
    
    if (boxRequests.length === 0) {
        alert('Please add at least one valid box');
        return;
    };
    
    if (validRequest)
        displayTotalResources(boxRequests);
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/boxes.json');
        if (!response.ok)
            throw new Error(`HTTP error. Status: ${response.status}`);

        boxesData = await response.json();
        if (!boxesData) return;
    
        const levels = Object.keys(boxesData).sort((a, b) => parseInt(a) - parseInt(b));
        boxLevelSelect.innerHTML = '<option value="">Select Level</option>';
        
        levels.forEach((level) => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = `Level ${level}`;
            boxLevelSelect.appendChild(option);
        });
        
        const levelSelects = document.querySelectorAll('.box-level-select');
        levelSelects.forEach(select => {
            if (select.options.length <= 1) {
                select.innerHTML = '<option value="">Select Level</option>';
                
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level;
                    option.textContent = `Level ${level}`;
                    select.appendChild(option);
                });
            };
        });
        
        calculateButton.addEventListener('click', calculateBoxWorth);
        addBoxButton.addEventListener('click', addBoxToCart);
        calculateTotalButton.addEventListener('click', calculateTotalBoxes);
        
        setupBoxCartRow(boxCart.querySelector('.box-cart-row'));
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