// Character initialization and system setup methods
export class CharacterInitialization {
    
    static initializeCharacterSystems(character) {
        // Initialize skills with random values
        this.initializeSkills(character);
        
        // Initialize traits
        this.initializeTraits(character);
        
        // Initialize needs (Maslow's hierarchy-inspired)
        this.initializeNeeds(character);
    }

    static initializeSkills(character) {
        // Core skills with random starting values
        const skillTypes = ['swimming', 'climbing', 'hunting', 'gathering', 'crafting', 'cooking', 'building', 'healing'];
        
        skillTypes.forEach(skill => {
            // Random starting skill level (0-50, can grow to 100)
            const startingLevel = Math.floor(Math.random() * 51);
            character.skills.set(skill, startingLevel);
        });
        
        // Ensure swimming skill exists (as mentioned in requirements)
        if (!character.skills.has('swimming')) {
            character.skills.set('swimming', Math.floor(Math.random() * 51));
        }
    }

    static initializeTraits(character) {
        // Personality traits that affect behavior
        const traits = [
            { name: 'adventurous', probability: 0.3 },
            { name: 'cautious', probability: 0.25 },
            { name: 'social', probability: 0.4 },
            { name: 'independent', probability: 0.2 },
            { name: 'hardworking', probability: 0.35 },
            { name: 'lazy', probability: 0.15 },
            { name: 'brave', probability: 0.3 },
            { name: 'fearful', probability: 0.2 },
            { name: 'curious', probability: 0.4 },
            { name: 'practical', probability: 0.3 }
        ];

        traits.forEach(trait => {
            if (Math.random() < trait.probability) {
                // Trait strength from 1-5
                character.traits.set(trait.name, Math.floor(Math.random() * 5) + 1);
            }
        });
    }

    static initializeNeeds(character) {
        // Human needs in order of priority (lower priority number = higher priority)
        const needsConfig = [
            { name: 'thirst', priority: 1, satisfaction: 80, decayRate: 0.8 },
            { name: 'hunger', priority: 2, satisfaction: 70, decayRate: 0.6 },
            { name: 'safety', priority: 3, satisfaction: 90, decayRate: 0.2 },
            { name: 'rest', priority: 4, satisfaction: 85, decayRate: 0.4 },
            { name: 'warmth', priority: 5, satisfaction: 75, decayRate: 0.3 },
            { name: 'social', priority: 6, satisfaction: 60, decayRate: 0.25 },
            { name: 'purpose', priority: 7, satisfaction: 50, decayRate: 0.15 },
            { name: 'creativity', priority: 8, satisfaction: 40, decayRate: 0.1 }
        ];

        needsConfig.forEach(need => {
            character.needs.set(need.name, {
                priority: need.priority,
                satisfaction: need.satisfaction + Math.random() * 20 - 10, // ±10 random variation
                decayRate: need.decayRate,
                lastUpdate: Date.now()
            });
        });
    }

    // Get the most urgent need (lowest satisfaction relative to priority)
    static getMostUrgentNeed(character) {
        let mostUrgent = null;
        let urgencyScore = Infinity;

        for (const [needName, need] of character.needs) {
            // Lower satisfaction and higher priority (lower number) = more urgent
            const score = need.satisfaction * need.priority;
            if (score < urgencyScore) {
                urgencyScore = score;
                mostUrgent = { name: needName, ...need };
            }
        }

        return mostUrgent;
    }

    // Update needs over time
    static updateNeeds(character) {
        const currentTime = Date.now();
        
        for (const [, need] of character.needs) {
            const timeSinceLastUpdate = currentTime - need.lastUpdate;
            const hoursElapsed = timeSinceLastUpdate / (1000 * 60 * 60); // Convert to hours
            
            // Decay satisfaction over time
            const decay = need.decayRate * hoursElapsed * 10; // Accelerated for game time
            need.satisfaction = Math.max(0, need.satisfaction - decay);
            need.lastUpdate = currentTime;
        }
    }
}
