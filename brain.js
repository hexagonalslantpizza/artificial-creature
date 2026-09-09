// Artificial Creature Experiment — Alpha

// Neural Brain Engine

//

// The brain is designed around distributed processing.

// No single neuron represents an entire fact such as "food is here."

// Information is processed through populations of neurons so memories,

// predictions, needs, rewards, exploration, and movement can interact.

export const SENSOR_COUNT = 6;

export const INTERNAL_START = 6;

export const INITIAL_INTERNAL_COUNT = 72;

export const MOTOR_START = 78;

export const MOTOR_COUNT = 4;

export const INITIAL_NEURON_COUNT =

  SENSOR_COUNT + INITIAL_INTERNAL_COUNT + MOTOR_COUNT;

// Sensory neurons

export const FOOD_LEFT = 0;

export const FOOD_RIGHT = 1;

export const DANGER_LEFT = 2;

export const DANGER_RIGHT = 3;

export const WATER_LEFT = 4;

export const WATER_RIGHT = 5;

// Motor neurons

export const MOTOR_NORTH = 78;

export const MOTOR_SOUTH = 79;

export const MOTOR_EAST = 80;

export const MOTOR_WEST = 81;

// Neural constants

export const THRESHOLD = 1.0;

export const DECAY = 0.94;

export const REFRACTORY_PERIOD = 7;

export const PULSE_SPEED = 0.045;

export const LEARNING_RATE = 0.015;

export const ELIGIBILITY_DECAY = 0.96;

export const MEMORY_LEARNING_RATE = 0.08;

export const MEMORY_DECAY = 0.99998;

export const PATTERN_LEARNING_RATE = 0.12;

export const PATTERN_DECAY = 0.99998;

export const MEMORY_BEHAVIOR_GAIN = 0.035;

export const SPONTANEOUS_ACTIVITY = 0.002;

export const MOTOR_NOISE = 0.008;

export const SENSORY_VALUE_LEARNING_RATE = 0.025;

export const SENSORY_CONFIDENCE_RATE = 0.015;

export const MAX_MEMORIES = 500;

export const MAX_PATTERN_TRACE = 180;

export const MAX_DYNAMIC_NEURONS = 40;

// ------------------------------------------------------------

// Neuron roles

// ------------------------------------------------------------

export const NEURON_ROLES = {

    PERCEPTION: "Perception",

    MEMORY: "Memory",

    PREDICTION: "Prediction",

    VALUE: "Value",

    NEED: "Need",

    ASSOCIATION: "Association",

    SPATIAL: "Spatial",

    DECISION: "Decision",

    EXPLORATION: "Exploration",

    MOTOR_PLANNING: "Motor Planning",

    UNDEVELOPED: "Undeveloped"

};

// ------------------------------------------------------------

// Utility

// ------------------------------------------------------------

function randomRange(min, max) {

    return min + Math.random() * (max - min);

}

function randomChoice(array) {

    return array[Math.floor(Math.random() * array.length)];

}

function clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}

// ------------------------------------------------------------

// Functional brain organization

// ------------------------------------------------------------

function createInitialRole(index) {

    if (index < 18) {

        return NEURON_ROLES.PERCEPTION;

    }

    if (index < 28) {

        return NEURON_ROLES.MEMORY;

    }

    if (index < 38) {

        return NEURON_ROLES.PREDICTION;

    }

    if (index < 46) {

        return NEURON_ROLES.VALUE;

    }

    if (index < 54) {

        return NEURON_ROLES.NEED;

    }

    if (index < 62) {

        return NEURON_ROLES.ASSOCIATION;

    }

    if (index < 68) {

        return NEURON_ROLES.SPATIAL;

    }

    if (index < 73) {

        return NEURON_ROLES.DECISION;

    }

    return NEURON_ROLES.EXPLORATION;

}

function createNeuron(index, type = "internal", role = null) {

    return {

        id: index,

        type,

        role:

            role ||

            (type === "internal"

                ? createInitialRole(index)

                : type === "sensory"

                    ? "Sensory"

                    : "Motor"),

        potential: 0,

        activation: 0,

        firing: false,

        refractory: 0,

        totalFires: 0,

        recentFires: 0,

        memoryStrength: 0,

        specialization: 0,

        // What this neuron has increasingly responded to.

        foodAssociation: 0,

        waterAssociation: 0,

        dangerAssociation: 0,

        explorationAssociation: 0,

        // Used to determine whether a neuron is becoming specialized.

        roleEvidence: {},

        incoming: [],

        outgoing: []

    };

}

// ------------------------------------------------------------

// Connection creation

// ------------------------------------------------------------

function createConnection(from, to, weight) {

    return {

        from,

        to,

        weight,

        eligibility: 0,

        signal: 0,

        // Learning history

        totalUpdates: 0

    };

}

function connectBrain(brain, from, to, weight = randomRange(-0.8, 0.8)) {

    const connection = createConnection(from, to, weight);

    brain.connections.push(connection);

    brain.neurons[from].outgoing.push(connection);

    brain.neurons[to].incoming.push(connection);

    return connection;

}

// ------------------------------------------------------------

// Brain creation

// ------------------------------------------------------------

export function createBrain() {

    const brain = {

        neurons: [],

        connections: [],

        pulses: [],

        memories: [],

        patternAssociations: {},

        sensoryValues: {

            foodLeft: 0,

            foodRight: 0,

            dangerLeft: 0,

            dangerRight: 0,

            waterLeft: 0,

            waterRight: 0

        },

        sensoryConfidence: {

            foodLeft: 0,

            foodRight: 0,

            dangerLeft: 0,

            dangerRight: 0,

            waterLeft: 0,

            waterRight: 0

        },

        patternTrace: [],

        currentPattern: "",

        lastPattern: "",

        lastMotorVector: {

            x: 0,

            y: 0

        },

        lastReward: 0,

        predictionError: 0,

        totalReward: 0,

        totalFires: 0,

        experimentNumber: 0,

        brainGrowth: {

            initialNeurons: INITIAL_NEURON_COUNT,

            neuronsGrown: 0,

            growthEvents: 0

        },

        learningEvents: 0,

        lastLearningEvent: "Brain initialized",

        recentEvents: [],

        // Behavior preference system.

        behaviorPreferences: {

            food: 0,

            water: 0,

            dangerAvoidance: 0,

            exploration: 0.25,

            novelty: 0.25

        },

        // Prevents constant brain growth.

        growthCooldown: 0,

        initialized: true

    };

    // Sensory neurons

    for (let i = 0; i < SENSOR_COUNT; i++) {

        brain.neurons.push(

            createNeuron(i, "sensory", "Sensory")

        );

    }

    // Internal neurons

    for (

        let i = INTERNAL_START;

        i < INTERNAL_START + INITIAL_INTERNAL_COUNT;

        i++

    ) {

        brain.neurons.push(

            createNeuron(i, "internal")

        );

    }

    // Motor neurons

    for (

        let i = MOTOR_START;

        i < MOTOR_START + MOTOR_COUNT;

        i++

    ) {

        brain.neurons.push(

            createNeuron(i, "motor", "Motor")

        );

    }

    // --------------------------------------------------------

    // Sensory → internal

    // --------------------------------------------------------

    for (let sensor = 0; sensor < SENSOR_COUNT; sensor++) {

        const targets = [];

        while (targets.length < 8) {

            const target = Math.floor(

                randomRange(

                    INTERNAL_START,

                    INTERNAL_START + INITIAL_INTERNAL_COUNT

                )

            );

            if (!targets.includes(target)) {

                targets.push(target);

            }

        }

        for (const target of targets) {

            connectBrain(

                brain,

                sensor,

                target,

                randomRange(-0.8, 0.8)

            );

        }

    }

    // --------------------------------------------------------

    // Internal → internal

    // --------------------------------------------------------

    for (

        let from = INTERNAL_START;

        from < INTERNAL_START + INITIAL_INTERNAL_COUNT;

        from++

    ) {

        const targets = [];

        while (targets.length < 4) {

            const target = Math.floor(

                randomRange(

                    INTERNAL_START,

                    INTERNAL_START + INITIAL_INTERNAL_COUNT

                )

            );

            if (

                target !== from &&

                !targets.includes(target)

            ) {

                targets.push(target);

            }

        }

        for (const target of targets) {

            connectBrain(

                brain,

                from,

                target,

                randomRange(-0.8, 0.8)

            );

        }

    }

    // --------------------------------------------------------

    // Internal → motor

    // --------------------------------------------------------

    for (

        let motor = MOTOR_START;

        motor < MOTOR_START + MOTOR_COUNT;

        motor++

    ) {

        const sources = [];

        while (sources.length < 10) {

            const source = Math.floor(

                randomRange(

                    INTERNAL_START,

                    INTERNAL_START + INITIAL_INTERNAL_COUNT

                )

            );

            if (!sources.includes(source)) {

                sources.push(source);

            }

        }

        for (const source of sources) {

            connectBrain(

                brain,

                source,

                motor,

                randomRange(-0.8, 0.8)

            );

        }

    }

    // --------------------------------------------------------

    // Motor → internal

    // --------------------------------------------------------

    for (

        let motor = MOTOR_START;

        motor < MOTOR_START + MOTOR_COUNT;

        motor++

    ) {

        const targets = [];

        while (targets.length < 3) {

            const target = Math.floor(

                randomRange(

                    INTERNAL_START,

                    INTERNAL_START + INITIAL_INTERNAL_COUNT

                )

            );

            if (!targets.includes(target)) {

                targets.push(target);

            }

        }

        for (const target of targets) {

            connectBrain(

                brain,

                motor,

                target,

                randomRange(-0.5, 0.5)

            );

        }

    }

    return brain;

}

// ------------------------------------------------------------

// Neuron descriptions

// ------------------------------------------------------------

export function neuronType(neuron) {

    return neuron?.type || "unknown";

}

export function neuronDescription(neuron) {

    if (!neuron) {

        return "Unknown neuron";

    }

    if (neuron.type === "sensory") {

        switch (neuron.id) {

            case FOOD_LEFT:

                return "Detects food to the left.";

            case FOOD_RIGHT:

                return "Detects food to the right.";

            case DANGER_LEFT:

                return "Detects danger to the left.";

            case DANGER_RIGHT:

                return "Detects danger to the right.";

            case WATER_LEFT:

                return "Detects water to the left.";

            case WATER_RIGHT:

                return "Detects water to the right.";

            default:

                return "Receives environmental information.";

        }

    }

    if (neuron.type === "motor") {

        switch (neuron.id) {

            case MOTOR_NORTH:

                return "Encourages movement north.";

            case MOTOR_SOUTH:

                return "Encourages movement south.";

            case MOTOR_EAST:

                return "Encourages movement east.";

            case MOTOR_WEST:

                return "Encourages movement west.";

            default:

                return "Controls movement.";

        }

    }

    return `${neuron.role} processing neuron.`;

}

// ------------------------------------------------------------

// Firing

// ------------------------------------------------------------

export function fireNeuron(brain, neuronId) {

    const neuron = brain.neurons[neuronId];

    if (!neuron) {

        return;

    }

    if (neuron.refractory > 0) {

        return;

    }

    neuron.firing = true;

    neuron.activation = 1;

    neuron.potential = 0;

    neuron.refractory = REFRACTORY_PERIOD;

    neuron.totalFires += 1;

    neuron.recentFires += 1;

    brain.totalFires += 1;

    for (const connection of neuron.outgoing) {

        connection.signal = 1;

        connection.eligibility += 1;

        brain.pulses.push({

            from: connection.from,

            to: connection.to,

            progress: 0,

            weight: connection.weight

        });

    }

}

// ------------------------------------------------------------

// Sensory stimulation

// ------------------------------------------------------------

export function stimulateSensoryNeuron(

    brain,

    neuronId,

    value

) {

    const neuron = brain.neurons[neuronId];

    if (!neuron) {

        return;

    }

    const strength = clamp(value, 0, 1);

    neuron.potential += strength;

    if (strength > 0.35) {

        neuron.activation = Math.max(

            neuron.activation,

            strength

        );

    }

}

// ------------------------------------------------------------

// Neuron update

// ------------------------------------------------------------

export function updateNeurons(brain) {

    for (const neuron of brain.neurons) {

        neuron.activation *= DECAY;

        if (neuron.refractory > 0) {

            neuron.refractory -= 1;

        }

        if (neuron.refractory <= 0) {

            neuron.refractory = 0;

        }

        neuron.potential *= DECAY;

        if (

            neuron.potential >= THRESHOLD &&

            neuron.refractory <= 0

        ) {

            fireNeuron(brain, neuron.id);

        }

        neuron.firing = false;

        if (neuron.recentFires > 0) {

            neuron.recentFires *= 0.96;

        }

    }

}

// ------------------------------------------------------------

// Pulse movement

// ------------------------------------------------------------

export function updatePulses(brain) {

    const remaining = [];

    for (const pulse of brain.pulses) {

        pulse.progress += PULSE_SPEED;

        if (pulse.progress >= 1) {

            const target = brain.neurons[pulse.to];

            if (target) {

                target.potential += pulse.weight;

            }

        } else {

            remaining.push(pulse);

        }

    }

    brain.pulses = remaining;

}

// ------------------------------------------------------------

// Motor output

// ------------------------------------------------------------

export function getMotorVector(brain) {

    const north = brain.neurons[MOTOR_NORTH];

    const south = brain.neurons[MOTOR_SOUTH];

    const east = brain.neurons[MOTOR_EAST];

    const west = brain.neurons[MOTOR_WEST];

    let x =

        (east?.activation || 0) -

        (west?.activation || 0);

    let y =

        (south?.activation || 0) -

        (north?.activation || 0);

    brain.lastMotorVector = {

        x,

        y

    };

    return {

        x,

        y

    };

}

// ------------------------------------------------------------

// Controlled motor randomness

// ------------------------------------------------------------

export function addMotorNoise(

    brain,

    amount = MOTOR_NOISE

) {

    const motors = [

        MOTOR_NORTH,

        MOTOR_SOUTH,

        MOTOR_EAST,

        MOTOR_WEST

    ];

    for (const id of motors) {

        brain.neurons[id].potential +=

            randomRange(-amount, amount);

    }

}

// ------------------------------------------------------------

// Controlled spontaneous activity

// ------------------------------------------------------------

export function randomActivity(

    brain,

    amount = SPONTANEOUS_ACTIVITY

) {

    for (const neuron of brain.neurons) {

        if (neuron.type !== "internal") {

            continue;

        }

        if (Math.random() < amount) {

            neuron.potential += randomRange(

                0.05,

                0.18

            );

        }

    }

}

// ------------------------------------------------------------

// Reward / reinforcement learning

// ------------------------------------------------------------

export function applyLearning(

    brain,

    reward,

    learningRate = LEARNING_RATE

) {

    const effectiveReward = clamp(

        reward,

        -1,

        1

    );

    for (const connection of brain.connections) {

        const change =

            effectiveReward *

            connection.eligibility *

            learningRate;

        connection.weight = clamp(

            connection.weight + change,

            -1,

            1

        );

        if (Math.abs(change) > 0.0001) {

            connection.totalUpdates += 1;

        }

    }

    brain.lastReward = effectiveReward;

    brain.totalReward += effectiveReward;

    brain.learningEvents += 1;

    brain.lastLearningEvent =

        effectiveReward >= 0

            ? "Positive reinforcement"

            : "Negative reinforcement";

}

// ------------------------------------------------------------

// Eligibility decay

// ------------------------------------------------------------

export function decayEligibility(brain) {

    for (const connection of brain.connections) {

        connection.eligibility *=

            ELIGIBILITY_DECAY;

        connection.signal *= 0.85;

    }

}

// ------------------------------------------------------------

// Prediction error

// ------------------------------------------------------------

export function calculatePredictionError(

    brain,

    reward

) {

    const expected = brain.lastReward;

    const error =

        reward - expected;

    brain.predictionError = clamp(

        error,

        -1,

        1

    );

    return brain.predictionError;

}

// ------------------------------------------------------------

// Learned sensory values

// ------------------------------------------------------------

export function learnSensoryAssociation(

    brain,

    sensoryState,

    outcome

) {

    const keys = Object.keys(

        brain.sensoryValues

    );

    for (const key of keys) {

        const signal = clamp(

            sensoryState[key] || 0,

            0,

            1

        );

        const oldValue =

            brain.sensoryValues[key];

        const target =

            signal * outcome;

        brain.sensoryValues[key] +=

            (target - oldValue) *

            SENSORY_VALUE_LEARNING_RATE;

        brain.sensoryValues[key] = clamp(

            brain.sensoryValues[key],

            -1,

            1

        );

        if (signal > 0.05) {

            brain.sensoryConfidence[key] =

                clamp(

                    brain.sensoryConfidence[key] +

                    SENSORY_CONFIDENCE_RATE,

                    0,

                    1

                );

        }

    }

}

// ------------------------------------------------------------

// Pattern learning

// ------------------------------------------------------------

export function learnPattern(

    brain,

    pattern,

    outcome,

    motorVector

) {

    if (!pattern) {

        return;

    }

    if (!brain.patternAssociations[pattern]) {

        brain.patternAssociations[pattern] = {

            value: 0,

            confidence: 0,

            exposures: 0,

            response: {

                x: 0,

                y: 0

            }

        };

    }

    const memory =

        brain.patternAssociations[pattern];

    memory.exposures += 1;

    memory.value +=

        (outcome - memory.value) *

        PATTERN_LEARNING_RATE;

    memory.confidence = clamp(

        memory.confidence +

        PATTERN_LEARNING_RATE *

        (1 - memory.confidence),

        0,

        1

    );

    memory.response.x +=

        (motorVector.x - memory.response.x) *

        PATTERN_LEARNING_RATE;

    memory.response.y +=

        (motorVector.y - memory.response.y) *

        PATTERN_LEARNING_RATE;

}

// ------------------------------------------------------------

// Memory creation

// ------------------------------------------------------------

export function createMemory(

    brain,

    {

        pattern = "",

        outcome = 0,

        action = { x: 0, y: 0 },

        senses = {}

    } = {}

) {

    const memory = {

        id: Date.now() + Math.random(),

        pattern,

        outcome,

        action: {

            x: action.x || 0,

            y: action.y || 0

        },

        senses: {

            ...senses

        },

        strength: 1,

        age: 0

    };

    brain.memories.push(memory);

    if (brain.memories.length > MAX_MEMORIES) {

        brain.memories.shift();

    }

    return memory;

}

// ------------------------------------------------------------

// Memory replay

// ------------------------------------------------------------

export function applyLongTermMemories(

    brain,

    currentPattern

) {

    if (!currentPattern) {

        return {

            x: 0,

            y: 0,

            influence: 0

        };

    }

    let x = 0;

    let y = 0;

    let influence = 0;

    for (const memory of brain.memories) {

        if (memory.pattern !== currentPattern) {

            continue;

        }

        const strength =

            memory.strength *

            Math.max(

                0,

                memory.outcome

            );

        x +=

            memory.action.x *

            strength *

            MEMORY_BEHAVIOR_GAIN;

        y +=

            memory.action.y *

            strength *

            MEMORY_BEHAVIOR_GAIN;

        influence += strength;

    }

    return {

        x,

        y,

        influence

    };

}

// ------------------------------------------------------------

// Pattern decay

// ------------------------------------------------------------

export function decayMemories(brain) {

    for (const memory of brain.memories) {

        memory.age += 1;

        memory.strength *= MEMORY_DECAY;

    }

    for (const key of Object.keys(

        brain.patternAssociations

    )) {

        const association =

            brain.patternAssociations[key];

        association.confidence *=

            PATTERN_DECAY;

        association.value *=

            PATTERN_DECAY;

    }

}

// ------------------------------------------------------------

// Behavior preferences

// ------------------------------------------------------------

export function updateBehaviorPreferences(

    brain,

    {

        hunger = 0,

        thirst = 0,

        fear = 0,

        novelty = 0,

        foodReward = 0,

        waterReward = 0,

        dangerReward = 0

    } = {}

) {

    const p = brain.behaviorPreferences;

    // Needs influence priorities.

    p.food +=

        ((hunger * 0.8) + foodReward * 0.4 - p.food) *

        0.02;

    p.water +=

        ((thirst * 0.8) + waterReward * 0.4 - p.water) *

        0.02;

    p.dangerAvoidance +=

        ((fear * 0.9) - dangerReward * 0.5 -

            p.dangerAvoidance) *

        0.025;

    p.novelty +=

        (novelty - p.novelty) *

        0.02;

    // Exploration never completely disappears.

    const targetExploration =

        0.12 +

        p.novelty * 0.5;

    p.exploration +=

        (targetExploration - p.exploration) *

        0.02;

    for (const key of Object.keys(p)) {

        p[key] = clamp(

            p[key],

            -1,

            1

        );

    }

}

// ------------------------------------------------------------

// Memory / sensory influence

// ------------------------------------------------------------

export function applySensoryLearning(

    brain,

    sensoryState

) {

    const ids = [

        FOOD_LEFT,

        FOOD_RIGHT,

        DANGER_LEFT,

        DANGER_RIGHT,

        WATER_LEFT,

        WATER_RIGHT

    ];

    const keys = [

        "foodLeft",

        "foodRight",

        "dangerLeft",

        "dangerRight",

        "waterLeft",

        "waterRight"

    ];

    for (let i = 0; i < ids.length; i++) {

        const signal = clamp(

            sensoryState[keys[i]] || 0,

            0,

            1

        );

        const learned =

            brain.sensoryValues[keys[i]];

        const confidence =

            brain.sensoryConfidence[keys[i]];

        brain.neurons[ids[i]].potential +=

            signal *

            0.18 *

            (1 + Math.abs(learned) * confidence);

    }

}

// ------------------------------------------------------------

// Specialization

// ------------------------------------------------------------

export function updateNeuronSpecialization(

    brain,

    context = {}

) {

    const {

        food = 0,

        water = 0,

        danger = 0,

        novelty = 0,

        reward = 0

    } = context;

    for (const neuron of brain.neurons) {

        if (neuron.type !== "internal") {

            continue;

        }

        const activity =

            neuron.activation +

            neuron.recentFires * 0.1;

        if (activity <= 0.02) {

            continue;

        }

        // Associations accumulate slowly.

        neuron.foodAssociation +=

            activity * food * 0.003;

        neuron.waterAssociation +=

            activity * water * 0.003;

        neuron.dangerAssociation +=

            activity * danger * 0.003;

        neuron.explorationAssociation +=

            activity * novelty * 0.003;

        // Reward strengthens whichever context

        // was active when the neuron participated.

        const positiveReward =

            Math.max(0, reward);

        neuron.memoryStrength +=

            activity *

            positiveReward *

            0.002;

        neuron.memoryStrength = clamp(

            neuron.memoryStrength,

            0,

            1

        );

        const associations = {

            food: neuron.foodAssociation,

            water: neuron.waterAssociation,

            danger: neuron.dangerAssociation,

            exploration:

                neuron.explorationAssociation

        };

        let strongest = "Undeveloped";

        let strongestValue = 0;

        for (const [key, value] of Object.entries(

            associations

        )) {

            if (value > strongestValue) {

                strongest = key;

                strongestValue = value;

            }

        }

        // Specialization requires repeated evidence.

        if (strongestValue > 0.4) {

            neuron.specialization = clamp(

                neuron.specialization + 0.001,

                0,

                1

            );

            if (

                neuron.specialization > 0.25 &&

                strongest === "food"

            ) {

                neuron.role =

                    NEURON_ROLES.ASSOCIATION;

            }

            if (

                neuron.specialization > 0.25 &&

                strongest === "water"

            ) {

                neuron.role =

                    NEURON_ROLES.ASSOCIATION;

            }

            if (

                neuron.specialization > 0.25 &&

                strongest === "danger"

            ) {

                neuron.role =

                    NEURON_ROLES.VALUE;

            }

            if (

                neuron.specialization > 0.25 &&

                strongest === "exploration"

            ) {

                neuron.role =

                    NEURON_ROLES.EXPLORATION;

            }

        }

    }

}

// ------------------------------------------------------------

// Brain growth

// ------------------------------------------------------------

export function maybeGrowBrain(

    brain,

    {

        novelty = 0,

        predictionError = 0,

        repeatedUnexpectedEvents = 0

    } = {}

) {

    if (brain.neurons.length >=

        INITIAL_NEURON_COUNT +

        MAX_DYNAMIC_NEURONS) {

        return null;

    }

    if (brain.growthCooldown > 0) {

        brain.growthCooldown -= 1;

        return null;

    }

    const pressure =

        novelty * 0.35 +

        Math.abs(predictionError) * 0.4 +

        repeatedUnexpectedEvents * 0.25;

    // Growth is intentionally rare.

    if (pressure < 0.55) {

        return null;

    }

    if (Math.random() > 0.025) {

        return null;

    }

    const id = brain.neurons.length;

    const possibleRoles = [

        NEURON_ROLES.PERCEPTION,

        NEURON_ROLES.MEMORY,

        NEURON_ROLES.PREDICTION,

        NEURON_ROLES.VALUE,

        NEURON_ROLES.ASSOCIATION,

        NEURON_ROLES.SPATIAL,

        NEURON_ROLES.DECISION,

        NEURON_ROLES.EXPLORATION

    ];

    const neuron = createNeuron(

        id,

        "internal",

        randomChoice(possibleRoles)

    );

    neuron.specialization = 0;

    brain.neurons.push(neuron);

    // Connect to a few existing neurons.

    const possibleSources =

        brain.neurons.filter(

            n =>

                n.id !== id &&

                n.type !== "motor"

        );

    const sourceCount = Math.min(

        5,

        possibleSources.length

    );

    for (let i = 0; i < sourceCount; i++) {

        const source =

            randomChoice(possibleSources);

        connectBrain(

            brain,

            source.id,

            id,

            randomRange(-0.6, 0.6)

        );

    }

    // Connect outward as well.

    const possibleTargets =

        brain.neurons.filter(

            n =>

                n.id !== id &&

                n.type !== "sensory"

        );

    const targetCount = Math.min(

        5,

        possibleTargets.length

    );

    for (let i = 0; i < targetCount; i++) {

        const target =

            randomChoice(possibleTargets);

        connectBrain(

            brain,

            id,

            target.id,

            randomRange(-0.6, 0.6)

        );

    }

    brain.brainGrowth.neuronsGrown += 1;

    brain.brainGrowth.growthEvents += 1;

    brain.learningEvents += 1;

    brain.lastLearningEvent =

        `Brain growth: neuron #${id} developed`;

    brain.recentEvents.unshift(

        `New neuron #${id} formed`

    );

    brain.recentEvents =

        brain.recentEvents.slice(0, 12);

    // Prevent growth bursts.

    brain.growthCooldown = 300;

    return neuron;

}

// ------------------------------------------------------------

// Neural reset

// ------------------------------------------------------------

export function resetNeuralActivity(brain) {

    for (const neuron of brain.neurons) {

        neuron.potential = 0;

        neuron.activation = 0;

        neuron.firing = false;

        neuron.refractory = 0;

        neuron.recentFires = 0;

    }

    brain.pulses = [];

}

// ------------------------------------------------------------

// Complete brain reset

// ------------------------------------------------------------

export function resetBrain() {

    return createBrain();

}

// ------------------------------------------------------------

// Statistics

// ------------------------------------------------------------

export function getBrainStats(brain) {

    let activeNeurons = 0;

    let firingNeurons = 0;

    for (const neuron of brain.neurons) {

        if (neuron.activation > 0.1) {

            activeNeurons += 1;

        }

        if (neuron.firing) {

            firingNeurons += 1;

        }

    }

    const specializedNeurons =

        brain.neurons.filter(

            neuron =>

                neuron.type === "internal" &&

                neuron.specialization > 0.25

        ).length;

    return {

        neurons: brain.neurons.length,

        initialNeurons:

            INITIAL_NEURON_COUNT,

        grownNeurons:

            Math.max(

                0,

                brain.neurons.length -

                INITIAL_NEURON_COUNT

            ),

        activeNeurons,

        firingNeurons,

        specializedNeurons,

        connections:

            brain.connections.length,

        pulses:

            brain.pulses.length,

        memories:

            brain.memories.length,

        patterns:

            Object.keys(

                brain.patternAssociations

            ).length,

        totalFires:

            brain.totalFires,

        totalReward:

            brain.totalReward,

        lastReward:

            brain.lastReward,

        predictionError:

            brain.predictionError,

        learningEvents:

            brain.learningEvents

    };

}

// ------------------------------------------------------------

// Activity event logging

// ------------------------------------------------------------

export function addBrainEvent(

    brain,

    message

) {

    brain.recentEvents.unshift(message);

    brain.recentEvents =

        brain.recentEvents.slice(0, 12);

}
