// simulation.js

// Artificial Creature Experiment

// Main integration layer connecting the brain, creature, world,

// sensory processing, decisions, learning, rewards, memories,

// specialization, and brain growth.

import {

    createBrain,

    resetNeuralActivity,

    updateNeurons,

    updatePulses,

    getMotorVector,

    addMotorNoise,

    randomActivity,

    applyLearning,

    decayEligibility,

    calculatePredictionError,

    learnSensoryAssociation,

    learnPattern,

    createMemory,

    applyLongTermMemories,

    decayMemories,

    updateBehaviorPreferences,

    updateNeuronSpecialization,

    maybeGrowBrain,

    getBrainStats,

    addBrainEvent,

    stimulateSensoryNeuron,

    MOTOR_NORTH,

    MOTOR_SOUTH,

    MOTOR_EAST,

    MOTOR_WEST

} from "./brain.js";

import {

    createWorld,

    updateWorld,

    getSensoryState,

    getEnvironmentPerception,

    detectPattern,

    findCollision,

    removeObject,

    getWorldStats

} from "./world.js";

import {

    createCreature,

    resetCreature,

    updateNeeds,

    steerCreature,

    addExplorationMovement,

    updateMovement,

    eatFood,

    drinkWater,

    hitDanger,

    recordDiscovery,

    getDominantNeed,

    getNeedUrgency,

    getCreatureStats,

    setBehavior

} from "./creature.js";

const MAX_ACTIVITY_EVENTS = 80;

const MAX_REWARD_HISTORY = 180;

const MAX_DECISION_HISTORY = 120;

const MAX_OUTCOME_HISTORY = 120;

export function createSimulation() {

    const simulation = {

        brain: createBrain(),

        world: createWorld(),

        creature: createCreature(),

        running: true,

        // Experiment information

        experimentNumber: 1,

        frame: 0,

        totalFrames: 0,

        // Learning

        currentReward: 0,

        averageReward: 0,

        predictionError: 0,

        learningStrength: 0,

        lastOutcome: "Experiment started",

        // Pattern state

        currentPattern: "none",

        previousPattern: null,

        patternChanged: false,

        // Sensory state

        senses: {

            foodLeft: 0,

            foodRight: 0,

            dangerLeft: 0,

            dangerRight: 0,

            waterLeft: 0,

            waterRight: 0

        },

        previousSenses: null,

        // Decision state

        decision: {

            behavior: "Exploring",

            goal: "Explore the environment",

            reason: "The experiment has just begun.",

            directionX: 0,

            directionY: 0,

            confidence: 0,

            exploration: 1,

            targetType: null

        },

        // Histories for UI

        rewardHistory: [],

        predictionHistory: [],

        activityEvents: [],

        decisionHistory: [],

        outcomeHistory: [],

        // Recent learning event

        lastLearningEvent: "None",

        // Brain growth

        lastGrowthFrame: -9999,

        // Timing

        elapsedTime: 0

    };

    addActivity(simulation, "Experiment initialized.");

    return simulation;

}

/*

    Reset only the creature.

    Learned brain, memories, associations, specializations,

    and brain growth remain untouched.

*/

export function resetSimulationCreature(simulation) {

    resetCreature(simulation.creature);

    resetNeuralActivity(simulation.brain);

    simulation.currentReward = 0;

    simulation.predictionError = 0;

    simulation.lastOutcome = "Creature reset";

    simulation.currentPattern = "none";

    simulation.previousPattern = null;

    simulation.decision = {

        behavior: "Exploring",

        goal: "Explore the environment",

        reason: "The creature was reset while its learned brain was preserved.",

        directionX: 0,

        directionY: 0,

        confidence: 0,

        exploration: 1,

        targetType: null

    };

    addActivity(

        simulation,

        "Creature reset — learned brain preserved."

    );

}

/*

    Completely reset the brain AND creature.

    The brain returns to the original newborn architecture.

*/

export function resetSimulationBrain(simulation) {

    simulation.brain = createBrain();

    simulation.creature = createCreature();

    simulation.currentReward = 0;

    simulation.averageReward = 0;

    simulation.predictionError = 0;

    simulation.learningStrength = 0;

    simulation.lastOutcome = "Brain reset";

    simulation.currentPattern = "none";

    simulation.previousPattern = null;

    simulation.rewardHistory = [];

    simulation.predictionHistory = [];

    simulation.decisionHistory = [];

    simulation.outcomeHistory = [];

    simulation.decision = {

        behavior: "Exploring",

        goal: "Explore the environment",

        reason: "Newborn brain — no previous experiences are available.",

        directionX: 0,

        directionY: 0,

        confidence: 0,

        exploration: 1,

        targetType: null

    };

    addActivity(

        simulation,

        "FULL BRAIN RESET — newborn 82-neuron brain restored."

    );

}

/*

    Factory reset:

    brain + creature + environment.

*/

export function fullResetSimulation(simulation) {

    simulation.brain = createBrain();

    simulation.world = createWorld();

    simulation.creature = createCreature();

    simulation.currentReward = 0;

    simulation.averageReward = 0;

    simulation.predictionError = 0;

    simulation.learningStrength = 0;

    simulation.lastOutcome = "Full reset";

    simulation.currentPattern = "none";

    simulation.previousPattern = null;

    simulation.rewardHistory = [];

    simulation.predictionHistory = [];

    simulation.decisionHistory = [];

    simulation.outcomeHistory = [];

    simulation.experimentNumber = 1;

    simulation.frame = 0;

    simulation.decision = {

        behavior: "Exploring",

        goal: "Explore the environment",

        reason: "Factory-new experiment.",

        directionX: 0,

        directionY: 0,

        confidence: 0,

        exploration: 1,

        targetType: null

    };

    addActivity(

        simulation,

        "FULL RESET — brain, creature, and map restored."

    );

}

/*

    Begin a new experiment without deleting learning.

*/

export function startNewExperiment(simulation) {

    resetCreature(simulation.creature);

    resetNeuralActivity(simulation.brain);

    simulation.experimentNumber++;

    simulation.frame = 0;

    simulation.currentReward = 0;

    simulation.predictionError = 0;

    simulation.lastOutcome = "New experiment started";

    simulation.currentPattern = "none";

    simulation.previousPattern = null;

    addActivity(

        simulation,

        `Experiment ${simulation.experimentNumber} started — learned brain preserved.`

    );

}

/*

    Main simulation update.

*/

export function updateSimulation(simulation, dt = 1) {

    if (!simulation.running) {

        return;

    }

    simulation.frame += dt;

    simulation.totalFrames += dt;

    simulation.elapsedTime += dt / 60;

    const brain = simulation.brain;

    const world = simulation.world;

    const creature = simulation.creature;

    // ------------------------------------------------------------

    // 1. WORLD UPDATE

    // ------------------------------------------------------------

    updateWorld(world, dt);

    // ------------------------------------------------------------

    // 2. CREATURE NEEDS

    // ------------------------------------------------------------

    updateNeeds(creature, { dt });

    // ------------------------------------------------------------

    // 3. SENSORY PROCESSING

    // ------------------------------------------------------------

    const senses = getSensoryState(world, creature);

    const perception = getEnvironmentPerception(world, creature);

    simulation.previousSenses = simulation.senses;

    simulation.senses = senses;

    // Convert sensory information into neural stimulation.

    stimulateSensoryNeuron(

        brain,

        0,

        senses.foodLeft

    );

    stimulateSensoryNeuron(

        brain,

        1,

        senses.foodRight

    );

    stimulateSensoryNeuron(

        brain,

        2,

        senses.dangerLeft

    );

    stimulateSensoryNeuron(

        brain,

        3,

        senses.dangerRight

    );

    stimulateSensoryNeuron(

        brain,

        4,

        senses.waterLeft

    );

    stimulateSensoryNeuron(

        brain,

        5,

        senses.waterRight

    );

    // ------------------------------------------------------------

    // 4. PATTERN DETECTION

    // ------------------------------------------------------------

    const pattern = detectPattern(world, creature);

    simulation.previousPattern = simulation.currentPattern;

    simulation.currentPattern = pattern;

    simulation.patternChanged =

        simulation.previousPattern !== simulation.currentPattern;

    // ------------------------------------------------------------

    // 5. NEED-BASED INTERNAL SIGNALS

    // ------------------------------------------------------------

    stimulateNeedSignals(brain, creature);

    // ------------------------------------------------------------

    // 6. LONG-TERM MEMORY INFLUENCE

    // ------------------------------------------------------------

    const memoryInfluence =

        applyLongTermMemories(

            brain,

            simulation.currentPattern,

            senses,

            creature

        );

    // ------------------------------------------------------------

    // 7. NEURAL ACTIVITY

    // ------------------------------------------------------------

    updateNeurons(brain, dt);

    updatePulses(brain, dt);

    // Small amount of spontaneous activity.

    randomActivity(brain, 0.65);

    // ------------------------------------------------------------

    // 8. DECISION MAKING

    // ------------------------------------------------------------

    const decision = chooseBehavior(

        simulation,

        perception,

        memoryInfluence

    );

    simulation.decision = decision;

    setBehavior(creature, {

        environment: perception,

        dominantNeed: decision.need,

        target: decision.target,

        dangerNearby: decision.dangerNearby,

        memoryInfluence

    });

    // ------------------------------------------------------------

    // 9. MOTOR OUTPUT

    // ------------------------------------------------------------

    let motor = getMotorVector(brain);

    // Brain output is combined with goal-directed signals.

    motor = blendGoalWithBrain(

        motor,

        decision,

        creature,

        perception

    );

    // Controlled exploration prevents endless repetitive loops.

    const explorationAmount =

        decision.exploration *

        creature.curiosity *

        0.28;

    addExplorationMovement(

        creature,

        explorationAmount

    );

    motor = normalizeVector(

        motor.x,

        motor.y

    );

    // Small motor noise.

    motor = addMotorNoise(

        brain,

        motor

    );

    // ------------------------------------------------------------

    // 10. MOVEMENT

    // ------------------------------------------------------------

    const beforeX = creature.x;

    const beforeY = creature.y;

    steerCreature(

        creature,

        motor.x,

        motor.y,

        decision.movementStrength

    );

    updateMovement(

        creature,

        world,

        dt

    );

    const movedX = creature.x - beforeX;

    const movedY = creature.y - beforeY;

    // ------------------------------------------------------------

    // 11. COLLISIONS / OUTCOMES

    // ------------------------------------------------------------

    const collision = findCollision(

        world,

        creature

    );

    if (collision) {

        handleCollision(

            simulation,

            collision

        );

    }

    // ------------------------------------------------------------

    // 12. LEARNING

    // ------------------------------------------------------------

    processLearning(

        simulation,

        {

            senses,

            pattern,

            motor,

            movedX,

            movedY,

            perception,

            decision

        }

    );

    // ------------------------------------------------------------

    // 13. MEMORY DECAY

    // ------------------------------------------------------------

    decayMemories(brain, dt);

    // ------------------------------------------------------------

    // 14. NEURON SPECIALIZATION

    // ------------------------------------------------------------

    updateNeuronSpecialization(

        brain,

        {

            pattern,

            reward: simulation.currentReward,

            predictionError: simulation.predictionError,

            senses,

            behavior: creature.behavior

        }

    );

    // ------------------------------------------------------------

    // 15. BRAIN GROWTH

    // ------------------------------------------------------------

    const growthResult = maybeGrowBrain(

        brain,

        {

            pattern,

            predictionError: simulation.predictionError,

            novelty: creature.recentNovelty,

            repeatedFailure: creature.recentFailure,

            frame: simulation.frame

        }

    );

    if (growthResult && growthResult.grew) {

        simulation.lastGrowthFrame = simulation.frame;

        addActivity(

            simulation,

            `Brain growth: neuron ${growthResult.neuronId} developed.`

        );

    }

    // ------------------------------------------------------------

    // 16. UI ACTIVITY

    // ------------------------------------------------------------

    collectActivity(

        simulation,

        decision,

        senses

    );

    // Keep reward history bounded.

    trimHistory(simulation);

}

/*

    Convert needs into neural stimulation.

    These are distributed internal signals rather than direct

    "food = move right" commands.

*/

function stimulateNeedSignals(brain, creature) {

    const hungerSignal = creature.hunger;

    const thirstSignal = creature.thirst;

    const fearSignal = creature.fear;

    const curiositySignal = creature.curiosity;

    // Need-related internal neurons begin at 46.

    stimulateRange(

        brain,

        46,

        2,

        hungerSignal * 0.22

    );

    stimulateRange(

        brain,

        48,

        2,

        thirstSignal * 0.22

    );

    stimulateRange(

        brain,

        50,

        2,

        fearSignal * 0.3

    );

    stimulateRange(

        brain,

        52,

        2,

        curiositySignal * 0.15

    );

}

/*

    Decide what the creature currently cares about.

    The brain, needs, environment, memory, and controlled

    exploration all contribute.

*/

function chooseBehavior(

    simulation,

    perception,

    memoryInfluence

) {

    const creature = simulation.creature;

    const brain = simulation.brain;

    const needs = getNeedUrgency(creature);

    const dangerNearby =

        perception.nearestDanger &&

        perception.nearestDanger.distance < 145;

    // Danger has strong priority.

    if (

        dangerNearby ||

        creature.fear > 0.68

    ) {

        const target = perception.nearestDanger;

        const direction = target

            ? directionAwayFrom(

                creature,

                target

            )

            : randomDirection();

        return {

            behavior: "Avoiding Danger",

            goal: "Move away from danger",

            reason:

                "Danger signals are strong enough to override lower-priority goals.",

            need: "fear",

            target,

            targetType: "danger",

            dangerNearby: true,

            directionX: direction.x,

            directionY: direction.y,

            confidence: Math.max(

                0.6,

                creature.fear

            ),

            exploration: 0.05,

            movementStrength: 1

        };

    }

    // Determine the strongest biological need.

    let need = getDominantNeed(creature);

    // Hungry creature.

    if (

        need === "hunger" &&

        perception.nearestFood

    ) {

        const target =

            perception.nearestFood;

        const direction =

            directionTo(

                creature,

                target

            );

        return {

            behavior: "Seeking Food",

            goal: "Reach a remembered or detected food source",

            reason:

                "Hunger is high and food-related sensory information is available.",

            need: "hunger",

            target,

            targetType: "food",

            dangerNearby: false,

            directionX: direction.x,

            directionY: direction.y,

            confidence: Math.min(

                1,

                0.45 +

                creature.hunger * 0.45 +

                sensoryFoodStrength(simulation) * 0.25

            ),

            exploration: 0.12,

            movementStrength: 1

        };

    }

    // Thirsty creature.

    if (

        need === "thirst" &&

        perception.nearestWater

    ) {

        const target =

            perception.nearestWater;

        const direction =

            directionTo(

                creature,

                target

            );

        return {

            behavior: "Seeking Water",

            goal: "Reach a remembered or detected water source",

            reason:

                "Thirst is high and water-related information is available.",

            need: "thirst",

            target,

            targetType: "water",

            dangerNearby: false,

            directionX: direction.x,

            directionY: direction.y,

            confidence: Math.min(

                1,

                0.45 +

                creature.thirst * 0.45 +

                sensoryWaterStrength(simulation) * 0.25

            ),

            exploration: 0.1,

            movementStrength: 1

        };

    }

    // Memory can influence a decision.

    if (

        memoryInfluence &&

        memoryInfluence.direction

    ) {

        return {

            behavior: "Using Memory",

            goal:

                memoryInfluence.goal ||

                "Use previous experience",

            reason:

                memoryInfluence.reason ||

                "A previous experience is influencing the current decision.",

            need: need,

            target: memoryInfluence.target || null,

            targetType:

                memoryInfluence.type || null,

            dangerNearby: false,

            directionX:

                memoryInfluence.direction.x,

            directionY:

                memoryInfluence.direction.y,

            confidence:

                memoryInfluence.confidence || 0.35,

            exploration:

                0.2 +

                creature.curiosity * 0.2,

            movementStrength: 0.8

        };

    }

    // If needs aren't urgent, explore.

    const randomDirectionValue =

        randomDirection();

    return {

        behavior: "Exploring",

        goal: "Explore the environment",

        reason:

            creature.curiosity > 0.55

                ? "Curiosity is encouraging the creature to investigate its surroundings."

                : "No immediate need requires priority.",

        need: need,

        target: null,

        targetType: null,

        dangerNearby: false,

        directionX:

            randomDirectionValue.x,

        directionY:

            randomDirectionValue.y,

        confidence: 0.2,

        exploration:

            0.55 +

            creature.curiosity * 0.4,

        movementStrength: 0.6

    };

}

/*

    Blend neural motor output with high-level goals.

    This is deliberately a blend rather than a hard override.

*/

function blendGoalWithBrain(

    motor,

    decision,

    creature,

    perception

) {

    let brainX = motor?.x ?? 0;

    let brainY = motor?.y ?? 0;

    const brainMagnitude =

        Math.sqrt(

            brainX * brainX +

            brainY * brainY

        );

    if (brainMagnitude < 0.001) {

        brainX = 0;

        brainY = 0;

    } else {

        brainX /= brainMagnitude;

        brainY /= brainMagnitude;

    }

    const goalX = decision.directionX;

    const goalY = decision.directionY;

    let goalWeight = 0.38;

    if (

        decision.behavior === "Avoiding Danger"

    ) {

        goalWeight = 0.72;

    }

    if (

        decision.behavior === "Seeking Food" ||

        decision.behavior === "Seeking Water"

    ) {

        goalWeight =

            0.45 +

            creature.hunger * 0.18 +

            creature.thirst * 0.18;

    }

    const brainWeight = 1 - goalWeight;

    let x =

        brainX * brainWeight +

        goalX * goalWeight;

    let y =

        brainY * brainWeight +

        goalY * goalWeight;

    // Add a tiny spatial bias when an object is very close.

    if (

        perception &&

        perception.nearestFood &&

        creature.hunger > 0.8 &&

        perception.nearestFood.distance < 50

    ) {

        const direction =

            directionTo(

                creature,

                perception.nearestFood

            );

        x = x * 0.7 + direction.x * 0.3;

        y = y * 0.7 + direction.y * 0.3;

    }

    return normalizeVector(x, y);

}

/*

    Process an object collision.

*/

function handleCollision(

    simulation,

    collision

) {

    const creature = simulation.creature;

    const world = simulation.world;

    if (!collision || !collision.object) {

        return;

    }

    const object = collision.object;

    let reward = 0;

    let outcome = "Nothing happened";

    if (object.type === "food") {

        reward = eatFood(creature);

        outcome = "Food consumed";

        removeObject(

            world,

            object

        );

        addActivity(

            simulation,

            "Food consumed — positive reward."

        );

    }

    else if (object.type === "water") {

        reward = drinkWater(creature);

        outcome = "Water consumed";

        removeObject(

            world,

            object

        );

        addActivity(

            simulation,

            "Water consumed — positive reward."

        );

    }

    else if (object.type === "danger") {

        reward = hitDanger(creature);

        outcome = "Danger encountered";

        removeObject(

            world,

            object

        );

        addActivity(

            simulation,

            "Danger encountered — negative reward."

        );

    }

    simulation.currentReward = reward;

    simulation.lastOutcome = outcome;

    simulation.outcomeHistory.push({

        frame: simulation.frame,

        outcome,

        reward

    });

    creature.lastPredictionError =

        simulation.predictionError;

    // Record episodic memory.

    const memory = createMemory(

        simulation.brain,

        {

            pattern: simulation.currentPattern,

            outcome,

            reward,

            action: {

                x: creature.lastDirectionX,

                y: creature.lastDirectionY

            },

            senses: simulation.senses,

            behavior: creature.behavior

        }

    );

    if (memory) {

        simulation.lastLearningEvent =

            `Memory formed: ${outcome}`;

        addActivity(

            simulation,

            `Long-term memory formed: ${outcome}.`

        );

    }

}

/*

    Reinforcement learning and associative learning.

*/

function processLearning(

    simulation,

    context

) {

    const brain = simulation.brain;

    const creature = simulation.creature;

    const reward =

        simulation.currentReward;

    // Prediction error compares expected outcome

    // with actual outcome.

    const prediction =

        brain.lastPredictedReward ?? 0;

    const error =

        calculatePredictionError(

            brain,

            reward,

            prediction

        );

    simulation.predictionError = error;

    creature.lastPredictionError = error;

    // Learn sensory value.

    learnSensoryAssociation(

        brain,

        simulation.senses,

        reward

    );

    // Learn the current pattern.

    learnPattern(

        brain,

        context.pattern,

        {

            reward,

            behavior: creature.behavior,

            action: {

                x: creature.lastDirectionX,

                y: creature.lastDirectionY

            },

            senses: simulation.senses

        }

    );

    // Reinforce active neural connections.

    applyLearning(

        brain,

        reward,

        error

    );

    decayEligibility(

        brain

    );

    // Learn behavior preferences.

    updateBehaviorPreferences(

        brain,

        {

            behavior: creature.behavior,

            reward,

            predictionError: error,

            pattern: context.pattern

        }

    );

    simulation.learningStrength =

        Math.min(

            1,

            Math.abs(reward) * 0.5 +

            Math.abs(error) * 0.35 +

            creature.recentSuccess * 0.15

        );

    simulation.rewardHistory.push(

        simulation.currentReward

    );

    simulation.predictionHistory.push(

        simulation.predictionError

    );

    simulation.currentReward *= 0.94;

    // Average reward.

    if (simulation.rewardHistory.length > 0) {

        const recent =

            simulation.rewardHistory.slice(-60);

        simulation.averageReward =

            recent.reduce(

                (sum, value) =>

                    sum + value,

                0

            ) / recent.length;

    }

    if (Math.abs(error) > 0.5) {

        simulation.lastLearningEvent =

            "Large prediction error — neural connections adapting.";

    }

}

/*

    Collect events for the UI.

*/

function collectActivity(

    simulation,

    decision,

    senses

) {

    const brainStats =

        getBrainStats(

            simulation.brain

        );

    // Record decisions only when they change.

    const last =

        simulation.decisionHistory[

            simulation.decisionHistory.length - 1

        ];

    if (

        !last ||

        last.behavior !== decision.behavior ||

        last.goal !== decision.goal

    ) {

        simulation.decisionHistory.push({

            frame: simulation.frame,

            behavior: decision.behavior,

            goal: decision.goal,

            reason: decision.reason,

            confidence: decision.confidence

        });

        addActivity(

            simulation,

            `${decision.behavior}: ${decision.goal}`

        );

    }

    // Interesting neural events.

    if (

        brainStats.activeNeurons > 0 &&

        simulation.frame % 18 < 1

    ) {

        addActivity(

            simulation,

            `${brainStats.activeNeurons} neurons active — ${decision.behavior}.`

        );

    }

    // Pattern changes are useful learning events.

    if (simulation.patternChanged) {

        if (

            simulation.frame % 10 < 1

        ) {

            addActivity(

                simulation,

                `New environmental pattern detected.`

            );

        }

    }

}

/*

    Add an event to the activity log.

*/

function addActivity(

    simulation,

    message

) {

    simulation.activityEvents.push({

        frame: simulation.frame,

        time: simulation.elapsedTime,

        message

    });

    while (

        simulation.activityEvents.length >

        MAX_ACTIVITY_EVENTS

    ) {

        simulation.activityEvents.shift();

    }

}

/*

    Get everything the UI needs.

*/

export function getSimulationState(

    simulation

) {

    const brainStats =

        getBrainStats(

            simulation.brain

        );

    const worldStats =

        getWorldStats(

            simulation.world

        );

    const creatureStats =

        getCreatureStats(

            simulation.creature

        );

    return {

        running: simulation.running,

        experimentNumber:

            simulation.experimentNumber,

        frame:

            simulation.frame,

        elapsedTime:

            simulation.elapsedTime,

        senses:

            simulation.senses,

        currentPattern:

            simulation.currentPattern,

        previousPattern:

            simulation.previousPattern,

        currentReward:

            simulation.currentReward,

        averageReward:

            simulation.averageReward,

        predictionError:

            simulation.predictionError,

        learningStrength:

            simulation.learningStrength,

        lastOutcome:

            simulation.lastOutcome,

        lastLearningEvent:

            simulation.lastLearningEvent,

        decision:

            simulation.decision,

        brain:

            simulation.brain,

        brainStats,

        creature:

            creatureStats,

        world:

            worldStats,

        rewardHistory:

            simulation.rewardHistory,

        predictionHistory:

            simulation.predictionHistory,

        activityEvents:

            simulation.activityEvents,

        decisionHistory:

            simulation.decisionHistory,

        outcomeHistory:

            simulation.outcomeHistory

    };

}

/*

    Spawn helpers.

*/

export function spawnFood(

    simulation,

    x,

    y

) {

    return simulation.world.spawnFood(

        x,

        y

    );

}

export function spawnWater(

    simulation,

    x,

    y

) {

    return simulation.world.spawnWater(

        x,

        y

    );

}

export function spawnDanger(

    simulation,

    x,

    y

) {

    return simulation.world.spawnDanger(

        x,

        y

    );

}

/*

    Map clearing helpers.

*/

export function clearFood(

    simulation

) {

    simulation.world.clearFood();

}

export function clearWater(

    simulation

) {

    simulation.world.clearWater();

}

export function clearDanger(

    simulation

) {

    simulation.world.clearDanger();

}

export function clearMap(

    simulation

) {

    simulation.world.clearMap();

}

/*

    Toggle simulation.

*/

export function toggleSimulation(

    simulation

) {

    simulation.running =

        !simulation.running;

    addActivity(

        simulation,

        simulation.running

            ? "Simulation resumed."

            : "Simulation paused."

    );

}

/*

    Explicit running state.

*/

export function setSimulationRunning(

    simulation,

    running

) {

    simulation.running = Boolean(running);

}

/*

    Get the direction toward a target.

*/

function directionTo(

    creature,

    target

) {

    return normalizeVector(

        target.x - creature.x,

        target.y - creature.y

    );

}

/*

    Get the direction away from a target.

*/

function directionAwayFrom(

    creature,

    target

) {

    return normalizeVector(

        creature.x - target.x,

        creature.y - target.y

    );

}

/*

    Random exploration direction.

*/

function randomDirection() {

    const angle =

        Math.random() *

        Math.PI *

        2;

    return {

        x: Math.cos(angle),

        y: Math.sin(angle)

    };

}

/*

    Normalize a vector.

*/

function normalizeVector(

    x,

    y

) {

    const magnitude =

        Math.sqrt(

            x * x +

            y * y

        );

    if (

        magnitude < 0.0001

    ) {

        return {

            x: 0,

            y: 0

        };

    }

    return {

        x: x / magnitude,

        y: y / magnitude

    };

}

/*

    Sensory strength helpers.

*/

function sensoryFoodStrength(

    simulation

) {

    return Math.max(

        simulation.senses.foodLeft,

        simulation.senses.foodRight

    );

}

function sensoryWaterStrength(

    simulation

) {

    return Math.max(

        simulation.senses.waterLeft,

        simulation.senses.waterRight

    );

}

/*

    Stimulate several neurons in a range.

*/

function stimulateRange(

    brain,

    start,

    count,

    amount

) {

    for (

        let i = 0;

        i < count;

        i++

    ) {

        stimulateSensoryNeuron(

            brain,

            start + i,

            amount

        );

    }

}

/*

    Prevent histories from growing forever.

*/

function trimHistory(

    simulation

) {

    while (

        simulation.rewardHistory.length >

        MAX_REWARD_HISTORY

    ) {

        simulation.rewardHistory.shift();

    }

    while (

        simulation.predictionHistory.length >

        MAX_REWARD_HISTORY

    ) {

        simulation.predictionHistory.shift();

    }

    while (

        simulation.decisionHistory.length >

        MAX_DECISION_HISTORY

    ) {

        simulation.decisionHistory.shift();

    }

    while (

        simulation.outcomeHistory.length >

        MAX_OUTCOME_HISTORY

    ) {

        simulation.outcomeHistory.shift();

    }

}

