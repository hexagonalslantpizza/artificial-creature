// Artificial Creature Experiment

// Main simulation controller

import {

    createBrain,

    resetNeuralActivity,

    getMotorVector,

    stimulateSensoryNeuron,

    updateNeurons,

    updatePulses,

    applyLearning,

    decayEligibility,

    randomActivity,

    addMotorNoise,

    SENSE_FOOD_LEFT,

    SENSE_FOOD_RIGHT,

    SENSE_DANGER_LEFT,

    SENSE_DANGER_RIGHT,

    SENSE_WATER_LEFT,

    SENSE_WATER_RIGHT

} from "./brain.js";

import {

    createWorld,

    spawnFood,

    spawnWater,

    spawnDanger,

    getSensoryState,

    detectPattern,

    updateDangerCooldowns,

    findCollision

} from "./world.js";

import {

    createCreature,

    resetCreature,

    updateCreatureNeeds,

    moveCreature,

    eatFood,

    drinkWater,

    hitDanger

} from "./creature.js";

export function createSimulation() {

    return {

        brain: createBrain(),

        world: createWorld(),

        creature: createCreature(),

        running: false,

        experimentNumber: 0,

        totalFoodEaten: 0,

        totalWaterDrunk: 0,

        totalDangerHits: 0,

        lastReinforcement: 0,

        currentPattern: "NONE",

        lastMotorVector: {

            north: 0,

            south: 0,

            east: 0,

            west: 0

        },

        patternTrace: [],

        activityEvents: [],

        selectedNeuron: null

    };

}

export function startExperiment(sim) {

    resetCreature(sim.creature);

    resetNeuralActivity(sim.brain);

    sim.running = true;

    sim.experimentNumber++;

    sim.patternTrace = [];

    sim.activityEvents = [];

}

export function stopExperiment(sim) {

    sim.running = false;

    resetNeuralActivity(

        sim.brain

    );

}

export function resetExperiment(sim) {

    sim.running = false;

    resetCreature(

        sim.creature

    );

    resetNeuralActivity(

        sim.brain

    );

    sim.world.food = [];

    sim.world.water = [];

    sim.world.danger = [];

    sim.patternTrace = [];

    sim.currentPattern = "NONE";

}

function stimulateFromNeeds(sim) {

    const creature =

        sim.creature;

    const brain =

        sim.brain;

    // Raw sensory input

    const senses =

        getSensoryState(

            sim.world,

            creature

        );

    for (

        let i = 0;

        i < senses.length;

        i++

    ) {

        stimulateSensoryNeuron(

            brain,

            i,

            senses[i] * 0.18

        );

    }

    // Hunger increases food-related stimulation.

    if (creature.hunger > 0.25) {

        brain.neurons[

            SENSE_FOOD_LEFT

        ].potential +=

            creature.hunger * 0.025;

        brain.neurons[

            SENSE_FOOD_RIGHT

        ].potential +=

            creature.hunger * 0.025;

    }

    // Thirst increases water-related stimulation.

    if (creature.thirst > 0.25) {

        brain.neurons[

            SENSE_WATER_LEFT

        ].potential +=

            creature.thirst * 0.025;

        brain.neurons[

            SENSE_WATER_RIGHT

        ].potential +=

            creature.thirst * 0.025;

    }

    // Fear increases danger-related stimulation.

    if (creature.fear > 0.25) {

        brain.neurons[

            SENSE_DANGER_LEFT

        ].potential +=

            creature.fear * 0.025;

        brain.neurons[

            SENSE_DANGER_RIGHT

        ].potential +=

            creature.fear * 0.025;

    }

    return senses;

}

function recordExperience(

    sim,

    pattern,

    senses,

    motor

) {

    sim.patternTrace.push({

        pattern,

        senses: [...senses],

        action: { ...motor }

    });

    // Keep roughly the same history size

    // as the Python PATTERN_TRACE_LENGTH.

    if (

        sim.patternTrace.length > 180

    ) {

        sim.patternTrace.shift();

    }

}

function processOutcome(

    sim,

    outcome

) {

    sim.lastReinforcement += outcome;

    // Reinforcement learning is applied

    // to the current neural eligibility traces.

    applyLearning(

        sim.brain,

        outcome

    );

    // Strong experiences leave a trace.

    if (

        Math.abs(outcome) > 0.5

    ) {

        sim.creature.calm +=

            outcome > 0 ? 0.25 : 0;

        sim.creature.chaos +=

            outcome < 0 ? 0.25 : 0;

    }

    // A positive outcome strengthens

    // the most recent behavioral pattern.

    if (

        sim.patternTrace.length > 0

    ) {

        const recent =

            sim.patternTrace[

                sim.patternTrace.length - 1

            ];

        if (

            recent.pattern !== "NONE"

        ) {

            sim.patternTrace.push({

                pattern:

                    `OUTCOME:${outcome > 0 ? "POSITIVE" : "NEGATIVE"}`,

                senses:

                    [...recent.senses],

                action:

                    { ...recent.action }

            });

        }

    }

}

function handleFood(sim) {

    const index =

        findCollision(

            sim.creature,

            sim.world.food,

            14

        );

    if (index === -1) {

        return;

    }

    const food =

        sim.world.food[index];

    sim.world.food.splice(

        index,

        1

    );

    const reward =

        eatFood(

            sim.creature

        );

    sim.totalFoodEaten++;

    processOutcome(

        sim,

        reward

    );

    addActivity(

        sim,

        `Food eaten (+${reward.toFixed(2)} reward)`

    );

}

function handleWater(sim) {

    const index =

        findCollision(

            sim.creature,

            sim.world.water,

            14

        );

    if (index === -1) {

        return;

    }

    sim.world.water.splice(

        index,

        1

    );

    const reward =

        drinkWater(

            sim.creature

        );

    sim.totalWaterDrunk++;

    processOutcome(

        sim,

        reward

    );

    addActivity(

        sim,

        `Water consumed (+${reward.toFixed(2)} reward)`

    );

}

function handleDanger(sim) {

    const index =

        findCollision(

            sim.creature,

            sim.world.danger,

            14

        );

    if (index === -1) {

        return;

    }

    const danger =

        sim.world.danger[index];

    if (

        danger.cooldown > 0

    ) {

        return;

    }

    danger.cooldown = 45;

    const reward =

        hitDanger(

            sim.creature

        );

    sim.totalDangerHits++;

    processOutcome(

        sim,

        reward

    );

    addActivity(

        sim,

        "Danger encountered (-1 reward)"

    );

}

function addActivity(

    sim,

    text

) {

    sim.activityEvents.push({

        text,

        life: 45

    });

    if (

        sim.activityEvents.length > 30

    ) {

        sim.activityEvents.shift();

    }

}

function updateActivity(sim) {

    for (

        const event of sim.activityEvents

    ) {

        event.life--;

    }

    sim.activityEvents =

        sim.activityEvents.filter(

            event =>

                event.life > 0

        );

}

export function updateSimulation(

    sim

) {

    if (!sim.running) {

        updateActivity(sim);

        return;

    }

    updateDangerCooldowns(

        sim.world

    );

    updateCreatureNeeds(

        sim.creature

    );

    const senses =

        stimulateFromNeeds(sim);

    sim.currentPattern =

        detectPattern(

            sim.world,

            sim.creature

        );

    // Random internal activity.

    randomActivity(

        sim.brain

    );

    // Tiny amount of motor randomness.

    addMotorNoise(

        sim.brain

    );

    // Update neural activity.

    updateNeurons(

        sim.brain

    );

    updatePulses(

        sim.brain

    );

    const motor =

        getMotorVector(

            sim.brain

        );

    sim.lastMotorVector = {

        ...motor

    };

    moveCreature(

        sim.creature,

        motor

    );

    recordExperience(

        sim,

        sim.currentPattern,

        senses,

        motor

    );

    handleFood(sim);

    handleWater(sim);

    handleDanger(sim);

    // Reinforcement slowly fades.

    sim.lastReinforcement *=

        0.96;

    decayEligibility(

        sim.brain

    );

    updateActivity(sim);

}

export function addFood(

    sim,

    x,

    y

) {

    spawnFood(

        sim.world,

        x,

        y

    );

}

export function addWater(

    sim,

    x,

    y

) {

    spawnWater(

        sim.world,

        x,

        y

    );

}

export function addDanger(

    sim,

    x,

    y

) {

    spawnDanger(

        sim.world,

        x,

        y

    );

}

