// creature.js

// Artificial Creature Experiment

// Creature state, needs, movement, outcomes, and reset behavior.

export const CREATURE_RADIUS = 10;

export const STARTING_ENERGY = 50;

export const MAX_ENERGY = 100;

export function createCreature() {

    return {

        // Position

        x: 430,

        y: 375,

        // Physical state

        radius: CREATURE_RADIUS,

        vx: 0,

        vy: 0,

        speed: 1.65,

        maxSpeed: 2.4,

        acceleration: 0.075,

        friction: 0.88,

        // Core needs

        energy: STARTING_ENERGY,

        hunger: 0,

        thirst: 0,

        fear: 0,

        // Internal states

        curiosity: 0.35,

        calm: 0.5,

        chaos: 0,

        fatigue: 0,

        // Behavior

        behavior: "Exploring",

        goal: "Explore the environment",

        reason: "The creature has no urgent need.",

        targetType: null,

        targetX: null,

        targetY: null,

        // Recent movement

        lastDirectionX: 0,

        lastDirectionY: 0,

        movementMomentum: 0,

        turnAmount: 0,

        // Recent outcome

        lastOutcome: "None",

        lastReward: 0,

        lastPredictionError: 0,

        // Experiment statistics

        survivalTime: 0,

        steps: 0,

        totalDistance: 0,

        foodConsumed: 0,

        waterConsumed: 0,

        dangerEncounters: 0,

        discoveries: 0,

        // Exploration state

        explorationTimer: 0,

        explorationAngle: Math.random() * Math.PI * 2,

        explorationStrength: 0.4,

        // Learning-related state

        recentNovelty: 0,

        recentSuccess: 0,

        recentFailure: 0,

        // Animation

        pulse: 0,

        blinkTimer: 0

    };

}

/*

    Completely reset the creature's current lifetime state.

    IMPORTANT:

    This does NOT touch the brain.

    Learned memories, associations, specializations, connections,

    and brain growth are preserved by the simulation.

*/

export function resetCreature(creature) {

    const fresh = createCreature();

    Object.keys(fresh).forEach((key) => {

        creature[key] = fresh[key];

    });

    return creature;

}

/*

    Update basic physiological needs.

    Hunger and thirst slowly rise over time.

    Energy slowly falls.

    Fear naturally fades when danger is no longer present.

    Curiosity rises when the creature has little to do.

*/

export function updateNeeds(creature, environment = {}) {

    const dt = environment.dt ?? 1;

    creature.steps += dt;

    creature.survivalTime += dt;

    // Basic metabolism.

    creature.energy -= 0.0045 * dt;

    // Hunger and thirst increase gradually.

    creature.hunger += 0.0028 * dt;

    creature.thirst += 0.0032 * dt;

    // Movement costs a tiny amount of additional energy.

    const movement =

        Math.sqrt(

            creature.vx * creature.vx +

            creature.vy * creature.vy

        );

    creature.energy -= movement * 0.0009 * dt;

    // Fatigue responds to low energy.

    const energyRatio = creature.energy / MAX_ENERGY;

    if (energyRatio < 0.25) {

        creature.fatigue += 0.003 * dt;

    } else {

        creature.fatigue -= 0.002 * dt;

    }

    // Fear naturally decreases.

    creature.fear -= 0.006 * dt;

    // Chaos slowly settles.

    creature.chaos -= 0.002 * dt;

    // Curiosity rises when the creature is calm and not under pressure.

    if (creature.fear < 0.25 && creature.hunger < 0.75 && creature.thirst < 0.75) {

        creature.curiosity += 0.0025 * dt;

    } else {

        creature.curiosity -= 0.0015 * dt;

    }

    // Calm increases when nothing bad happens.

    if (creature.fear < 0.2) {

        creature.calm += 0.002 * dt;

    } else {

        creature.calm -= 0.003 * dt;

    }

    // Clamp everything.

    creature.energy = clamp(creature.energy, 0, MAX_ENERGY);

    creature.hunger = clamp(creature.hunger, 0, 1);

    creature.thirst = clamp(creature.thirst, 0, 1);

    creature.fear = clamp(creature.fear, 0, 1);

    creature.curiosity = clamp(creature.curiosity, 0, 1);

    creature.calm = clamp(creature.calm, 0, 1);

    creature.chaos = clamp(creature.chaos, 0, 1);

    creature.fatigue = clamp(creature.fatigue, 0, 1);

    creature.recentSuccess *= Math.pow(0.995, dt);

    creature.recentFailure *= Math.pow(0.995, dt);

}

/*

    Choose the creature's high-level behavior.

    This doesn't directly tell it where to walk.

    It establishes what the creature is currently trying to accomplish.

    The actual decision is later influenced by:

    - sensory input

    - neural activity

    - memories

    - learned associations

    - needs

    - exploration

    - prediction errors

*/

export function setBehavior(

    creature,

    {

        environment = null,

        dominantNeed = "none",

        target = null,

        dangerNearby = false,

        memoryInfluence = null

    } = {}

) {

    if (dangerNearby || creature.fear > 0.7) {

        creature.behavior = "Avoiding Danger";

        creature.goal = "Move away from danger";

        creature.reason = "A threatening stimulus is strongly affecting the creature.";

        creature.targetType = "danger";

    }

    else if (dominantNeed === "hunger" && target) {

        creature.behavior = "Seeking Food";

        creature.goal = "Find something edible";

        creature.reason = "Hunger is becoming important and food-related information was detected.";

        creature.targetType = "food";

    }

    else if (dominantNeed === "thirst" && target) {

        creature.behavior = "Seeking Water";

        creature.goal = "Find water";

        creature.reason = "Thirst is becoming important and water-related information was detected.";

        creature.targetType = "water";

    }

    else if (dominantNeed === "hunger") {

        creature.behavior = "Searching for Food";

        creature.goal = "Explore for food";

        creature.reason = "Hunger is high, but no clear food target is currently known.";

        creature.targetType = "food";

    }

    else if (dominantNeed === "thirst") {

        creature.behavior = "Searching for Water";

        creature.goal = "Explore for water";

        creature.reason = "Thirst is high, but no clear water target is currently known.";

        creature.targetType = "water";

    }

    else if (memoryInfluence && memoryInfluence.type) {

        creature.behavior = "Using Memory";

        creature.goal = memoryInfluence.goal || "Use a previous experience";

        creature.reason = memoryInfluence.reason || "A previous experience is influencing the current decision.";

        creature.targetType = memoryInfluence.type;

    }

    else {

        creature.behavior = "Exploring";

        creature.goal = "Explore the environment";

        creature.reason = "No immediate need requires priority, so the creature is exploring.";

        creature.targetType = null;

    }

    if (target) {

        creature.targetX = target.x;

        creature.targetY = target.y;

    } else {

        creature.targetX = null;

        creature.targetY = null;

    }

}

/*

    Apply a movement force.

    Movement is acceleration-based rather than instantly changing

    the creature's position. This makes motion look more natural.

*/

export function steerCreature(creature, desiredX, desiredY, strength = 1) {

    const magnitude = Math.sqrt(

        desiredX * desiredX +

        desiredY * desiredY

    );

    if (magnitude < 0.0001) {

        return;

    }

    desiredX /= magnitude;

    desiredY /= magnitude;

    const desiredVX = desiredX * creature.maxSpeed * strength;

    const desiredVY = desiredY * creature.maxSpeed * strength;

    creature.vx += (desiredVX - creature.vx) * creature.acceleration;

    creature.vy += (desiredVY - creature.vy) * creature.acceleration;

    creature.lastDirectionX = desiredX;

    creature.lastDirectionY = desiredY;

}

/*

    Add a small amount of natural movement variation.

    This is intentionally controlled.

    The creature should explore, but it shouldn't behave like

    completely random noise.

*/

export function addExplorationMovement(creature, intensity = 0.15) {

    creature.explorationTimer--;

    if (creature.explorationTimer <= 0) {

        creature.explorationTimer =

            25 + Math.random() * 80;

        creature.explorationAngle +=

            (Math.random() - 0.5) * 1.5;

    }

    const noiseX = Math.cos(creature.explorationAngle);

    const noiseY = Math.sin(creature.explorationAngle);

    creature.vx += noiseX * intensity * 0.018;

    creature.vy += noiseY * intensity * 0.018;

}

/*

    Limit movement speed.

*/

export function limitSpeed(creature) {

    const velocity = Math.sqrt(

        creature.vx * creature.vx +

        creature.vy * creature.vy

    );

    if (velocity <= creature.maxSpeed) {

        return;

    }

    const scale = creature.maxSpeed / velocity;

    creature.vx *= scale;

    creature.vy *= scale;

}

/*

    Move the creature.

    The world object is used only for boundaries.

*/

export function updateMovement(creature, world, dt = 1) {

    const oldX = creature.x;

    const oldY = creature.y;

    creature.x += creature.vx * dt;

    creature.y += creature.vy * dt;

    // Natural friction.

    creature.vx *= Math.pow(creature.friction, dt);

    creature.vy *= Math.pow(creature.friction, dt);

    limitSpeed(creature);

    // Keep the creature inside the world.

    const width = world?.width ?? 860;

    const height = world?.height ?? 750;

    const margin = creature.radius;

    if (creature.x < margin) {

        creature.x = margin;

        creature.vx *= -0.35;

    }

    if (creature.x > width - margin) {

        creature.x = width - margin;

        creature.vx *= -0.35;

    }

    if (creature.y < margin) {

        creature.y = margin;

        creature.vy *= -0.35;

    }

    if (creature.y > height - margin) {

        creature.y = height - margin;

        creature.vy *= -0.35;

    }

    const dx = creature.x - oldX;

    const dy = creature.y - oldY;

    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    creature.totalDistance += distanceMoved;

    creature.movementMomentum =

        creature.movementMomentum * 0.9 +

        Math.min(1, distanceMoved / 2) * 0.1;

    creature.turnAmount =

        Math.abs(

            creature.lastDirectionX * creature.vy -

            creature.lastDirectionY * creature.vx

        );

    creature.pulse += distanceMoved * 0.15;

}

/*

    Food collision outcome.

    Returns a reward value for the brain to learn from.

*/

export function eatFood(creature) {

    const hungerBefore = creature.hunger;

    creature.hunger *= 0.38;

    creature.energy += 12;

    creature.calm += 0.15;

    creature.fear *= 0.85;

    creature.foodConsumed++;

    creature.discoveries++;

    creature.lastOutcome = "Food found";

    creature.lastReward =

        0.8 + Math.min(0.9, hungerBefore);

    creature.recentSuccess += 0.35;

    creature.recentFailure *= 0.5;

    creature.energy = clamp(creature.energy, 0, MAX_ENERGY);

    return creature.lastReward;

}

/*

    Water collision outcome.

*/

export function drinkWater(creature) {

    const thirstBefore = creature.thirst;

    creature.thirst *= 0.25;

    creature.energy += 4;

    creature.calm += 0.12;

    creature.fear *= 0.9;

    creature.waterConsumed++;

    creature.discoveries++;

    creature.lastOutcome = "Water found";

    creature.lastReward =

        0.8 + Math.min(0.9, thirstBefore);

    creature.recentSuccess += 0.3;

    creature.recentFailure *= 0.5;

    creature.energy = clamp(creature.energy, 0, MAX_ENERGY);

    return creature.lastReward;

}

/*

    Danger collision outcome.

*/

export function hitDanger(creature) {

    creature.energy -= 10;

    creature.fear += 0.65;

    creature.chaos += 0.35;

    creature.calm *= 0.35;

    creature.dangerEncounters++;

    creature.lastOutcome = "Danger encountered";

    creature.lastReward = -1;

    creature.recentFailure += 0.45;

    creature.recentSuccess *= 0.5;

    creature.energy = clamp(creature.energy, 0, MAX_ENERGY);

    creature.fear = clamp(creature.fear, 0, 1);

    creature.chaos = clamp(creature.chaos, 0, 1);

    return creature.lastReward;

}

/*

    Record a neutral discovery.

    Useful when the creature encounters something interesting

    without receiving a strong positive or negative reward.

*/

export function recordDiscovery(creature, novelty = 0.5) {

    creature.discoveries++;

    creature.recentNovelty =

        creature.recentNovelty * 0.7 +

        clamp(novelty, 0, 1) * 0.3;

    creature.curiosity += novelty * 0.04;

    creature.curiosity = clamp(creature.curiosity, 0, 1);

}

/*

    Determine which need is currently strongest.

*/

export function getDominantNeed(creature) {

    const hunger = creature.hunger;

    const thirst = creature.thirst;

    const fear = creature.fear;

    const fatigue = creature.fatigue;

    if (fear > 0.55) {

        return "fear";

    }

    if (thirst > hunger && thirst > fatigue) {

        return "thirst";

    }

    if (hunger > thirst && hunger > fatigue) {

        return "hunger";

    }

    if (fatigue > 0.75) {

        return "fatigue";

    }

    return "none";

}

/*

    Calculate a general urgency score.

    Used by the simulation's decision system.

*/

export function getNeedUrgency(creature) {

    return {

        hunger: creature.hunger,

        thirst: creature.thirst,

        fear: creature.fear,

        fatigue: creature.fatigue,

        curiosity: creature.curiosity

    };

}

/*

    Get a simple snapshot for the UI.

*/

export function getCreatureStats(creature) {

    const velocity = Math.sqrt(

        creature.vx * creature.vx +

        creature.vy * creature.vy

    );

    return {

        energy: creature.energy,

        hunger: creature.hunger,

        thirst: creature.thirst,

        fear: creature.fear,

        curiosity: creature.curiosity,

        calm: creature.calm,

        chaos: creature.chaos,

        fatigue: creature.fatigue,

        speed: velocity,

        behavior: creature.behavior,

        goal: creature.goal,

        reason: creature.reason,

        lastOutcome: creature.lastOutcome,

        lastReward: creature.lastReward,

        predictionError: creature.lastPredictionError,

        survivalTime: creature.survivalTime,

        steps: creature.steps,

        totalDistance: creature.totalDistance,

        foodConsumed: creature.foodConsumed,

        waterConsumed: creature.waterConsumed,

        dangerEncounters: creature.dangerEncounters,

        discoveries: creature.discoveries

    };

}

/*

    Small helper.

*/

function clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}

