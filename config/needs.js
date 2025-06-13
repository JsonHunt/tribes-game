export default {
  "hunger": {
    "displayName": "Hunger",
    "description": "Represents the need for food. Increases over time and decreases when eating.",
    "decayRate": 0.05,
    "satisfactionEffect": -1,
    "priority": 1,
    "min": 0,
    "max": 100,
    "initial": 80
  },
  "thirst": {
    "displayName": "Thirst",
    "description": "Represents the need for water. Increases over time and decreases when drinking.",
    "decayRate": 0.07,
    "satisfactionEffect": -1,
    "priority": 2,
    "min": 0,
    "max": 100,
    "initial": 90
  },
  "sleep": {
    "displayName": "Sleep",
    "description": "Represents the need for rest. Increases as the character stays awake and decreases when sleeping.",
    "decayRate": 0.03,
    "satisfactionEffect": -1,
    "priority": 3,
    "min": 0,
    "max": 100,
    "initial": 70
  },
  "social": {
    "displayName": "Social",
    "description": "Represents the need for social interaction. Increases when alone and decreases when interacting with others.",
    "decayRate": 0.01,
    "satisfactionEffect": -1,
    "priority": 4,
    "min": 0,
    "max": 100,
    "initial": 60
  },
  "comfort": {
    "displayName": "Comfort",
    "description": "Represents the need for comfort and shelter. Increases in harsh environments and decreases in safe, comfortable places.",
    "decayRate": 0.02,
    "satisfactionEffect": -1,
    "priority": 5,
    "min": 0,
    "max": 100,
    "initial": 75
  }
}
