document.addEventListener('DOMContentLoaded', function() {
    const collapsibleSections = document.querySelectorAll('.collapsible');
    
    collapsibleSections.forEach(function(section, index) {
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        const toggleBtn = section.querySelector('.toggle-btn');
        
        if (index === 0) {
            section.classList.add('active');
        };
        
        header.addEventListener('click', function() {
            section.classList.toggle('active');
            
            collapsibleSections.forEach(function(otherSection) {
                if (otherSection !== section && otherSection.classList.contains('active')) {
                    otherSection.classList.remove('active');
                }
            });
            
            saveSectionStates();
        });
    });
    
    restoreSectionStates();
    
    function saveSectionStates() {
        const states = [];
        collapsibleSections.forEach(function(section, index) {
            states[index] = section.classList.contains('active');
        });
        
        try {
            localStorage.setItem('guideSectionStates', JSON.stringify(states));
        } catch (e) {
            console.warn('Could not save section states to localStorage', e);
        };
    };
    
    function restoreSectionStates() {
        try {
            const savedStates = localStorage.getItem('guideSectionStates');
            if (savedStates) {
                const states = JSON.parse(savedStates);
                collapsibleSections.forEach(function(section, index) {
                    if (states[index]) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    };
                });
            };
        } catch (e) {
            console.warn('Could not restore section states from localStorage', e);
        };
    };
    
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection && targetSection.classList.contains('collapsible')) {
            collapsibleSections.forEach(section => section.classList.remove('active'));
            targetSection.classList.add('active');
            
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        };
    };
    
    collapsibleSections.forEach(function(section, index) {
        if (!section.id) {
            const title = section.querySelector('h2').textContent;
            const id = title.toLowerCase().replace(/\s+/g, '-');
            section.id = id;
        };
    });
    
    if ('ontouchstart' in window) {
        document.querySelectorAll('.toggle-btn').forEach(function(btn) {
            btn.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                const section = this.closest('.collapsible');
                section.classList.toggle('active');
                
                collapsibleSections.forEach(function(otherSection) {
                    if (otherSection !== section && otherSection.classList.contains('active')) {
                        otherSection.classList.remove('active');
                    }
                });
                
                saveSectionStates();
            });
        });
    };
});

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const heroItems = document.querySelectorAll('.hero-item');
    const generateButton = document.getElementById('generate-formation');
    const resetButton = document.getElementById('reset-selection');
    const formationPlaceholder = document.querySelector('.formation-placeholder');
    const formationGrid = document.querySelector('.formation-grid');
    
    const selectedHeroes = new Set();
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            heroItems.forEach(hero => {
                if (filter === 'all') {
                    hero.style.display = 'block';
                } else if (filter === 'tank' || filter === 'air' || filter === 'missile') {
                    hero.style.display = hero.dataset.type === filter ? 'block' : 'none';
                } else if (filter === 'ur' || filter === 'ssr') {
                    hero.style.display = hero.dataset.rarity === filter ? 'block' : 'none';
                };
            });
        });
    });
    
    heroItems.forEach(hero => {
        hero.addEventListener('click', function() {
            this.classList.toggle('selected');
            
            if (this.classList.contains('selected')) {
                selectedHeroes.add(this.querySelector('img').alt);
            } else {
                selectedHeroes.delete(this.querySelector('img').alt);
            };
        });
    });
    
    generateButton.addEventListener('click', function() {
        if (selectedHeroes.size === 0) {
            alert('Please select at least one hero');
            return;
        };
        
        generateFormation(Array.from(selectedHeroes), heroItems);
        formationPlaceholder.style.display = 'none';
        formationGrid.style.display = 'block';
    });
    
    resetButton.addEventListener('click', function() {
        heroItems.forEach(hero => hero.classList.remove('selected'));
        selectedHeroes.clear();
        
        resetFormation();
        formationPlaceholder.style.display = 'flex';
        formationGrid.style.display = 'none';
    });
});

function fillHeroSlot(slot, hero) {
    const img = document.createElement('img');
    img.src = hero.querySelector('img').src;
    img.alt = hero.querySelector('img').alt;
    
    slot.innerHTML = '';
    slot.appendChild(img);
    
    slot.classList.add(`${hero.dataset.type}-type`);
    
    const rarityBadge = document.createElement('div');
    rarityBadge.className = 'hero-rarity';
    rarityBadge.textContent = hero.dataset.rarity.toUpperCase();
    rarityBadge.style.position = 'absolute';
    rarityBadge.style.bottom = '0';
    rarityBadge.style.left = '0';
    rarityBadge.style.backgroundColor = hero.dataset.rarity === 'ur' ? 'var(--ur-color)' : 'var(--ssr-color)';
    rarityBadge.style.color = hero.dataset.rarity === 'ur' ? 'black' : 'white';
    rarityBadge.style.padding = '2px 4px';
    rarityBadge.style.fontSize = '10px';
    rarityBadge.style.fontWeight = 'bold';
    slot.appendChild(rarityBadge);
    
    const nameBadge = document.createElement('div');
    nameBadge.className = 'hero-slot-name';
    nameBadge.textContent = hero.querySelector('.hero-name').textContent;
    nameBadge.style.position = 'absolute';
    nameBadge.style.bottom = '0';
    nameBadge.style.right = '0';
    nameBadge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    nameBadge.style.color = 'white';
    nameBadge.style.padding = '2px 4px';
    nameBadge.style.fontSize = '10px';
    nameBadge.style.borderTopLeftRadius = '4px';
    slot.appendChild(nameBadge);
};

function updateFormationStrength(heroes, dominantType) {
    const urCount = heroes.filter(hero => hero.dataset.rarity === 'ur').length;
    const backCount = heroes.filter(hero => hero.dataset.position === 'back').length;
    const attackScore = Math.min(100, (urCount * 15) + (backCount * 10));
    
    const frontCount = heroes.filter(hero => hero.dataset.position === 'front').length;
    const tankCount = heroes.filter(hero => hero.dataset.type === 'tank').length;
    const defenseScore = Math.min(100, (frontCount * 25) + (tankCount * 15));
    
    const matchingTypeCount = heroes.filter(hero => hero.dataset.type === dominantType).length;
    const synergyScore = Math.min(100, (matchingTypeCount / heroes.length) * 100);
    
    document.getElementById('attack-bar').style.width = `${attackScore}%`;
    document.getElementById('attack-value').textContent = attackScore;
    document.getElementById('defense-bar').style.width = `${defenseScore}%`;
    document.getElementById('defense-value').textContent = defenseScore;
    document.getElementById('synergy-bar').style.width = `${synergyScore}%`;
    document.getElementById('synergy-value').textContent = Math.round(synergyScore);
    
    updateFormationTips(heroes, dominantType, attackScore, defenseScore, synergyScore);
};

function updateFormationTips(heroes, dominantType, attackScore, defenseScore, synergyScore) {
    const tipsList = document.getElementById('formation-tips-list');
    const tips = [];
    
    if (heroes.length < 5) {
        tips.push("Your formation is incomplete. Try to fill all 5 slots for maximum effectiveness.");
    };
    
    const frontHeroes = heroes.filter(hero => hero.dataset.position === 'front');
    if (frontHeroes.length < 2) {
        tips.push("Add more front row heroes to improve your defensive capabilities.");
    };
    
    if (synergyScore < 60) {
        tips.push(`Consider adding more ${dominantType} type heroes to increase squad synergy.`);
    };
    
    switch (dominantType) {
        case 'tank':
            tips.push("Tank squads excel at defense with bonus damage against Missile units.");
            break;
        case 'air':
            tips.push("Aircraft squads provide balanced performance with bonus damage against Tank units.");
            break;
        case 'missile':
            tips.push("Missile squads focus on high damage output with bonus damage against Aircraft units.");
            break;
    };
    
    const urCount = heroes.filter(hero => hero.dataset.rarity === 'ur').length;
    if (urCount === 0) {
        tips.push("Try to include at least one UR hero in your formation for better performance.");
    } else if (urCount >= 3) {
        tips.push("Your formation has a strong UR core. Consider maxing their gear first.");
    };
    
    if (tips.length === 0) {
        tips.push("Your formation looks balanced and effective!");
    };
    
    tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
};

function generateFormation(selectedHeroes, heroItems) {
    const selectedHeroElements = Array.from(heroItems).filter(hero => 
        selectedHeroes.includes(hero.querySelector('img').alt)
    );
    
    const heroesByType = {
        tank: selectedHeroElements.filter(hero => hero.dataset.type === 'tank'),
        air: selectedHeroElements.filter(hero => hero.dataset.type === 'air'),
        missile: selectedHeroElements.filter(hero => hero.dataset.type === 'missile')
    };
    
    let dominantType = 'mixed';
    let maxCount = 0;
    for (const [type, heroes] of Object.entries(heroesByType)) {
        if (heroes.length > maxCount) {
            maxCount = heroes.length;
            dominantType = type;
        }
    };
    
    if (dominantType === 'mixed' && selectedHeroElements.length > 0) {
        if (heroesByType.tank.length >= heroesByType.missile.length && 
            heroesByType.tank.length >= heroesByType.air.length) {
            dominantType = 'tank';
        } else if (heroesByType.missile.length >= heroesByType.air.length) {
            dominantType = 'missile';
        } else {
            dominantType = 'air';
        };
    };
    
    document.getElementById('formation-type').textContent = 
        dominantType === 'mixed' ? 'Mixed' : 
        dominantType === 'tank' ? 'Tank' : 
        dominantType === 'air' ? 'Aircraft' : 'Missile';
    
    const heroSlots = document.querySelectorAll('.hero-slot');
    heroSlots.forEach(slot => {
        slot.innerHTML = '<div class="empty-slot">Empty</div>';
        slot.className = 'hero-slot';
    });
    
    // Sort heroes by priority:
    // 1. First by rarity (UR > SSR)
    // 2. Then by dominant type
    // 3. Then by position (front/back)
    const sortedHeroes = [...selectedHeroElements].sort((a, b) => {
        if (a.dataset.rarity !== b.dataset.rarity) {
            return a.dataset.rarity === 'ur' ? -1 : 1;
        };
        
        if (a.dataset.type !== b.dataset.type) {
            if (a.dataset.type === dominantType) return -1;
            if (b.dataset.type === dominantType) return 1;
        };
        
        return a.dataset.position === 'front' ? -1 : 1;
    });
    
    const frontHeroes = sortedHeroes.filter(hero => hero.dataset.position === 'front');
    const backHeroes = sortedHeroes.filter(hero => hero.dataset.position === 'back');
    
    const frontSlots = document.querySelectorAll('.hero-slot[data-position^="front-"]');
    frontSlots.forEach((slot, index) => {
        if (index < frontHeroes.length) {
            const hero = frontHeroes[index];
            fillHeroSlot(slot, hero);
        };
    });
    
    const backSlots = document.querySelectorAll('.hero-slot[data-position^="back-"]');
    backSlots.forEach((slot, index) => {
        if (index < backHeroes.length) {
            const hero = backHeroes[index];
            fillHeroSlot(slot, hero);
        }
    });
    
    updateFormationStrength(sortedHeroes, dominantType);
};