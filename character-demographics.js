// Character demographics data and utility functions
export const CHARACTER_NAMES = {
    male: [
        'Aiden', 'Blake', 'Cael', 'Doran', 'Ethan', 'Finn', 'Gavin', 'Hunter', 'Ian', 'Jack',
        'Kane', 'Luke', 'Max', 'Noah', 'Owen', 'Paul', 'Quinn', 'Ryan', 'Sam', 'Tyler',
        'Ash', 'Bear', 'Clay', 'Drake', 'Fox', 'Gray', 'Hawk', 'Iron', 'Jay', 'Knox'
    ],
    female: [
        'Aria', 'Beth', 'Cora', 'Dana', 'Eva', 'Faye', 'Grace', 'Hope', 'Ivy', 'Jane',
        'Kate', 'Luna', 'Maya', 'Nora', 'Olive', 'Piper', 'Quinn', 'Rose', 'Sage', 'Tara',
        'Alba', 'Briar', 'Cleo', 'Dawn', 'Echo', 'Fern', 'Gaia', 'Hazel', 'Iris', 'Jade'
    ]
};

export const ETHNICITIES = [
    'Nordic', 'Celtic', 'Mediterranean', 'Slavic', 'Germanic', 'Iberian', 
    'Anglo', 'Gallic', 'Balkan', 'Alpine', 'Steppe', 'Coastal', 'Mountain', 'Desert'
];

// Utility functions for character generation
export function generateName(gender) {
    const nameList = CHARACTER_NAMES[gender];
    if (!nameList || nameList.length === 0) {
        return `Character_${Math.random().toString(36).substr(2, 9)}`; // Fallback name
    }
    return nameList[Math.floor(Math.random() * nameList.length)];
}

export function generateEthnicity() {
    return ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)];
}

export function generateAge() {
    return Math.floor(Math.random() * 60) + 18; // Age between 18 and 77
}

export function generateGender() {
    return Math.random() < 0.5 ? 'male' : 'female';
}
