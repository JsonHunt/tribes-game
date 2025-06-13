// Info panel logic extracted from UIManager
export class CharacterInfoPanel {
    static showCharacterInfo(character) {
        const panel = document.getElementById('characterInfoPanel');
        const characterIdSpan = document.getElementById('selectedCharacterId');
        const currentNeedDiv = document.getElementById('currentNeed');
        const needsList = document.getElementById('needsList');
        const skillsList = document.getElementById('skillsList');
        const traitsList = document.getElementById('traitsList');

        if (!panel) return;
        panel.style.display = 'block';

        if (characterIdSpan) {
            characterIdSpan.textContent = `${character.name} (#${character.id})`;
        }

        if (currentNeedDiv && character.getMostUrgentNeed) {
            const urgentNeed = character.getMostUrgentNeed();
            if (urgentNeed) {
                currentNeedDiv.innerHTML = `<strong>${urgentNeed.name}</strong> (${Math.round(urgentNeed.satisfaction)}%)`;
                currentNeedDiv.style.color = getNeedColor(urgentNeed.satisfaction);
            } else {
                currentNeedDiv.textContent = 'Content';
                currentNeedDiv.style.color = '#27ae60';
            }
        }

        const panelContent = panel.querySelector('.panel-content');
        if (panelContent) {
            const existingDemographics = panelContent.querySelector('.demographics-section');
            if (existingDemographics) existingDemographics.remove();
            const demographicsSection = document.createElement('div');
            demographicsSection.className = 'section demographics-section';
            demographicsSection.innerHTML = `
                <h4>Demographics</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div><strong>Gender:</strong> ${character.gender}</div>
                    <div><strong>Age:</strong> ${character.age}</div>
                    <div><strong>Ethnicity:</strong> ${character.ethnicity}</div>
                    <div><strong>Health:</strong> ${character.health}%</div>
                </div>
            `;
            const currentNeedSection = panelContent.querySelector('.section');
            if (currentNeedSection && currentNeedSection.nextSibling) {
                panelContent.insertBefore(demographicsSection, currentNeedSection.nextSibling);
            } else {
                panelContent.appendChild(demographicsSection);
            }
        }

        if (needsList && character.needs) {
            needsList.innerHTML = '';
            const sortedNeeds = Array.from(character.needs.entries())
                .sort((a, b) => a[1].priority - b[1].priority);
            sortedNeeds.forEach(([needName, need]) => {
                const needItem = document.createElement('div');
                needItem.className = 'need-item';
                const satisfaction = Math.round(need.satisfaction);
                needItem.innerHTML = `
                    <span>${needName}</span>
                    <div class="need-bar">
                        <div class="need-fill" style="width: ${satisfaction}%"></div>
                    </div>
                `;
                needsList.appendChild(needItem);
            });
        }

        if (skillsList && character.skills) {
            skillsList.innerHTML = '';
            const sortedSkills = Array.from(character.skills.entries())
                .sort((a, b) => b[1] - a[1]);
            sortedSkills.forEach(([skillName, level]) => {
                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item';
                skillItem.innerHTML = `
                    <span>${skillName}</span>
                    <div class="skill-bar">
                        <div class="skill-fill" style="width: ${level}%"></div>
                    </div>
                `;
                skillsList.appendChild(skillItem);
            });
        }

        if (traitsList && character.traits) {
            traitsList.innerHTML = '';
            const sortedTraits = Array.from(character.traits.entries())
                .sort((a, b) => b[1] - a[1]);
            sortedTraits.forEach(([traitName, strength]) => {
                const traitItem = document.createElement('div');
                traitItem.className = 'trait-item';
                traitItem.innerHTML = `<span>${traitName}</span><span>${'★'.repeat(strength)}</span>`;
                traitsList.appendChild(traitItem);
            });
            if (sortedTraits.length === 0) {
                traitsList.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">No notable traits</div>';
            }
        }
        panel.style.display = 'block';
    }
    static hideCharacterInfo() {
        const panel = document.getElementById('characterInfoPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
}

function getNeedColor(satisfaction) {
    if (satisfaction < 30) return '#e74c3c';
    if (satisfaction < 60) return '#f39c12';
    return '#27ae60';
}
