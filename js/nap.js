function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
};

function setupPenaltyCalculator() {
    const breachTypeSelect = document.getElementById('breach-type');
    const offenseNumberSelect = document.getElementById('offense-number');
    const calculateButton = document.getElementById('calculate-penalty-btn');
    const resultContainer = document.getElementById('penalty-result');
    
    calculateButton.addEventListener('click', () => {
        const breachType = breachTypeSelect.value;
        const offenseNumber = parseInt(offenseNumberSelect.value);
        
        resultContainer.classList.remove('minor', 'medium', 'major');
        resultContainer.classList.add(breachType);
        
        const penalty = calculatePenalty(breachType, offenseNumber);
        
        resultContainer.style.opacity = 0;
        setTimeout(() => {
            resultContainer.innerHTML = penalty;
            resultContainer.style.opacity = 1;
        }, 300);
    });
    
    breachTypeSelect.addEventListener('change', updateOffenseOptions);
    
    updateOffenseOptions();
};

function updateOffenseOptions() {
    const breachType = document.getElementById('breach-type').value;
    const offenseNumberSelect = document.getElementById('offense-number');
    
    offenseNumberSelect.innerHTML = '';
    
    let maxOffenses = 4;
    
    if (breachType === 'medium') {
        maxOffenses = 3;
    } else if (breachType === 'major') {
        maxOffenses = 2;
    };
    
    for (let i = 1; i <= maxOffenses; i++) {
        const option = document.createElement('option');
        option.value = i;
        
        if (i === 1) {
            option.textContent = '1st Offense';
        } else if (i === 2) {
            option.textContent = '2nd Offense';
        } else if (i === 3) {
            option.textContent = '3rd Offense';
        } else {
            option.textContent = `${i}th Offense`;
        };
        
        offenseNumberSelect.appendChild(option);
    };
};

function calculatePenalty(breachType, offenseNumber) {
    const penalties = {
        minor: {
            1: '<strong>Demoted to R1</strong> (lowest rank) for at least 1 week as probation.',
            2: '<strong>Attacked twice for every attack</strong> made, with no wall defenses allowed. Attacks continue until relocation.',
            3: '<strong>Removed from the alliance</strong> and <strong>banned from the top 10 alliances</strong> for at least 1 week. May rejoin original alliance afterward.',
            4: '<strong>Permanently blacklisted</strong> from all alliances and labeled as a <strong>"farm"</strong> to be attacked on sight.'
        },
        medium: {
            1: '<strong>Demoted to R1</strong> and <strong>attacked twice per attack</strong> made, continuing until relocation.',
            2: '<strong>Removed from the alliance</strong> and <strong>banned from the top 10 alliances</strong> for at least 1 week. May rejoin original alliance afterward.',
            3: '<strong>Permanently blacklisted</strong> from all alliances and labeled as a <strong>"farm"</strong> to be attacked on sight.'
        },
        major: {
            1: '<strong>Removed from the alliance</strong> and <strong>banned from the top 10 alliances</strong> for at least 1 week. May rejoin original alliance afterward.',
            2: '<strong>Permanently blacklisted</strong> from all alliances and labeled as a <strong>"farm"</strong> to be attacked on sight.'
        }
    };
    
    const cooldownPeriods = {
        minor: '1 week',
        medium: '2 weeks',
        major: '1 month'
    };
    
    const penaltyDesc = penalties[breachType][offenseNumber];
    const cooldown = cooldownPeriods[breachType];
    
    let escalationNote = '';
    if (breachType === 'medium' || breachType === 'major') {
        escalationNote = '<p class="note"><strong>Important:</strong> Any further breach during the cooldown period will be treated as the next offense of the same level.</p>';
    };
    
    return `
        <p>${penaltyDesc}</p>
        <p>Cooldown period: <strong>${cooldown}</strong></p>
        ${escalationNote}
    `;
};

function setupRuleCardInteractions() {
    const ruleCards = document.querySelectorAll('.rule-card');
    ruleCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
};

function setupAccordions() {
    if (window.innerWidth <= 768) {
        const sectionHeaders = document.querySelectorAll('.nap-section h2');
        
        sectionHeaders.forEach(header => {
            header.style.cursor = 'pointer';
            
            const indicator = document.createElement('span');
            indicator.textContent = '+';
            indicator.style.marginLeft = '10px';
            indicator.style.fontSize = '20px';
            header.appendChild(indicator);
            
            const content = header.nextElementSibling;
            if (header !== sectionHeaders[0]) {
                content.style.display = 'none';
                indicator.textContent = '+';
            } else {
                indicator.textContent = '-';
            };
            
            header.addEventListener('click', () => {
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    indicator.textContent = '-';
                } else {
                    content.style.display = 'none';
                    indicator.textContent = '+';
                };
            });
        });
    };
};

document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    setupPenaltyCalculator();
    setupRuleCardInteractions();
    setupAccordions();
});