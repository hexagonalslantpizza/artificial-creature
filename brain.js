// Artificial Creature Experiment

// Neural brain system — JavaScript web port

export const BRAIN_WIDTH = 340;

export const SENSE_FOOD_LEFT = 0;

export const SENSE_FOOD_RIGHT = 1;

export const SENSE_DANGER_LEFT = 2;

export const SENSE_DANGER_RIGHT = 3;

export const SENSE_WATER_LEFT = 4;

export const SENSE_WATER_RIGHT = 5;

export const INTERNAL_START = 6;

export const INTERNAL_END = 77;

export const MOVE_NORTH = 78;

export const MOVE_SOUTH = 79;

export const MOVE_EAST = 80;

export const MOVE_WEST = 81;

export const NEURON_COUNT = 82;

export const THRESHOLD = 1.0;

export const DECAY = 0.94;

export const REFRACTORY_TIME = 7;

export const PULSE_SPEED = 0.045;

export const LEARNING_RATE = 0.015;

export const ELIGIBILITY_DECAY = 0.96;

export const MEMORY_LEARNING_RATE = 0.08;

export const MEMORY_DECAY = 0.99998;

export const PATTERN_LEARNING_RATE = 0.12;

export const PATTERN_DECAY = 0.99998;

export const PATTERN_TRACE_LENGTH = 180;

export const MEMORY_BEHAVIOR_GAIN = 0.035;

export const SPONTANEOUS_ACTIVITY = 0.002;

export const MOTOR_NOISE = 0.008;

export const SENSORY_VALUE_LEARNING_RATE = 0.025;

export const SENSORY_CONFIDENCE_RATE = 0.015;

export const DANGER_COOLDOWN = 45;

function randomRange(min, max) {

    return min + Math.random() * (max - min);

}

function clamp(value, min, max) {

    return Math.max(min, Math.min(max, value));

}

export function createBrain() {

    const neurons = [];

    for (let i = 0; i < NEURON_COUNT; i++) {

        neurons.push({

            x: Math.random(),

            y: Math.random(),

            potential: 0,

            refractory: 0,

            memory: 0,

            fired: false,

            activation: 0

        });

    }

    const connections = [];

    // Internal → Internal

    for (let source = INTERNAL_START; source <= INTERNAL_END; source++) {

        const targets = [];

        while (targets.length < 4) {

            const target =

                Math.floor(

                    randomRange(INTERNAL_START, INTERNAL_END + 1)

                );

            if (target !== source && !targets.includes(target)) {

                targets.push(target);

            }

        }

        for (const target of targets) {

            connections.push({

                source,

                target,

                weight: randomRange(-0.8, 0.8),

                eligibility: 0

            });

        }

    }

    // Sensory → Internal

    for (let source = 0; source < 6; source++) {

        const targets = [];

        while (targets.length < 8) {

            const target =

                Math.floor(

                    randomRange(INTERNAL_START, INTERNAL_END + 1)

                );

            if (!targets.includes(target)) {

                targets.push(target);

            }

        }

        for (const target of targets) {

            connections.push({

                source,

                target,

                weight: randomRange(-0.8, 0.8),

                eligibility: 0

            });

        }

    }

    // Internal → Motor

    for (let motor = MOVE_NORTH; motor <= MOVE_WEST; motor++) {

        const sources = [];

        while (sources.length < 10) {

            const source =

                Math.floor(

                    randomRange(INTERNAL_START, INTERNAL_END + 1)

                );

            if (!sources.includes(source)) {

                sources.push(source);

            }

        }

        for (const source of sources) {

            connections.push({

                source,

                target: motor,

                weight: randomRange(-0.8, 0.8),

                eligibility: 0

            });

        }

    }

    // Motor → Internal

    for (let motor = MOVE_NORTH; motor <= MOVE_WEST; motor++) {

        const targets = [];

        while (targets.length < 3) {

            const target =

                Math.floor(

                    randomRange(INTERNAL_START, INTERNAL_END + 1)

                );

            if (!targets.includes(target)) {

                targets.push(target);

            }

        }

        for (const target of targets) {

            connections.push({

                source: motor,

                target,

                weight: randomRange(-0.5, 0.5),

                eligibility: 0

            });

        }

    }

    return {

        neurons,

        connections,

        pulses: []

    };

}

export function neuronType(index) {

    if (index >= 0 && index <= 5) {

        return "SENSORY";

    }

    if (index >= INTERNAL_START && index <= INTERNAL_END) {

        return "INTERNAL";

    }

    return "MOTOR";

}

export function neuronDescription(index) {

    if (index === SENSE_FOOD_LEFT) {

        return "Detects food toward the left.";

    }

    if (index === SENSE_FOOD_RIGHT) {

        return "Detects food toward the right.";

    }

    if (index === SENSE_DANGER_LEFT) {

        return "Detects danger toward the left.";

    }

    if (index === SENSE_DANGER_RIGHT) {

        return "Detects danger toward the right.";

    }

    if (index === SENSE_WATER_LEFT) {

        return "Detects water toward the left.";

    }

    if (index === SENSE_WATER_RIGHT) {

        return "Detects water toward the right.";

    }

    if (index === MOVE_NORTH) {

        return "Controls northward movement.";

    }

    if (index === MOVE_SOUTH) {

        return "Controls southward movement.";

    }

    if (index === MOVE_EAST) {

        return "Controls eastward movement.";

    }

    if (index === MOVE_WEST) {

        return "Controls westward movement.";

    }

    return "Emergent internal processing neuron.";

}

export function fireNeuron(brain, index) {

    const neuron = brain.neurons[index];

    neuron.fired = true;

    neuron.memory = 1;

    neuron.activation = 1;

    neuron.potential = 0;

    neuron.refractory = REFRACTORY_TIME;

    for (const connection of brain.connections) {

        if (connection.source === index) {

            brain.pulses.push({

                source: connection.source,

                target: connection.target,

                connection,

                progress: 0

            });

        }

    }

}

export function stimulateSensoryNeuron(brain, index, amount) {

    if (!brain.neurons[index]) return;

    brain.neurons[index].potential += amount;

}

export function updateNeurons(brain) {

    for (const neuron of brain.neurons) {

        neuron.fired = false;

        neuron.potential *= DECAY;

        neuron.memory *= 0.97;

        neuron.activation = clamp(

            neuron.potential / THRESHOLD,

            0,

            1.5

        );

        if (neuron.refractory > 0) {

            neuron.refractory--;

        }

    }

    for (let i = 0; i < brain.neurons.length; i++) {

        const neuron = brain.neurons[i];

        if (

            neuron.potential >= THRESHOLD &&

            neuron.refractory <= 0

        ) {

            fireNeuron(brain, i);

        }

    }

}

export function updatePulses(brain) {

    const remaining = [];

    for (const pulse of brain.pulses) {

        pulse.progress += PULSE_SPEED;

        if (pulse.progress >= 1) {

            const target =

                brain.neurons[pulse.target];

            target.potential += pulse.connection.weight;

            pulse.connection.eligibility =

                clamp(

                    pulse.connection.eligibility + 0.05,

                    0,

                    1

                );

        } else {

            remaining.push(pulse);

        }

    }

    brain.pulses = remaining;

}

export function getMotorVector(brain) {

    const values = [];

    for (let i = MOVE_NORTH; i <= MOVE_WEST; i++) {

        const neuron = brain.neurons[i];

        let value =

            Math.max(0, neuron.potential);

        value = Math.min(

            value / THRESHOLD,

            1.5

        );

        value += neuron.memory * 0.75;

        value = Math.min(value, 1.5);

        if (neuron.fired) {

            value = Math.max(value, 1);

        }

        values.push(value);

    }

    return {

        north: values[0],

        south: values[1],

        east: values[2],

        west: values[3]

    };

}

export function applyLearning(brain, reinforcement) {

    for (const connection of brain.connections) {

        connection.weight +=

            LEARNING_RATE *

            reinforcement *

            connection.eligibility;

        connection.weight =

            clamp(

                connection.weight,

                -1,

                1

            );

    }

}

export function decayEligibility(brain) {

    for (const connection of brain.connections) {

        connection.eligibility *=

            ELIGIBILITY_DECAY;

    }

}

export function resetNeuralActivity(brain) {

    brain.pulses = [];

    for (const neuron of brain.neurons) {

        neuron.potential = 0;

        neuron.refractory = 0;

        neuron.memory = 0;

        neuron.fired = false;

        neuron.activation = 0;

    }

    for (const connection of brain.connections) {

        connection.eligibility = 0;

    }

}

export function randomActivity(brain) {

    if (Math.random() < SPONTANEOUS_ACTIVITY) {

        const index =

            Math.floor(

                randomRange(

                    INTERNAL_START,

                    INTERNAL_END + 1

                )

            );

        brain.neurons[index].potential +=

            randomRange(0.15, 0.45);

    }

}

export function addMotorNoise(brain) {

    for (

        let i = MOVE_NORTH;

        i <= MOVE_WEST;

        i++

    ) {

        brain.neurons[i].potential +=

            randomRange(

                -MOTOR_NOISE,

                MOTOR_NOISE

            );

    }

}

