import {

    getSimulationState

} from "./simulation.js";

const WORLD_OFFSET_X = 340;

const WORLD_WIDTH = 860;

const WORLD_HEIGHT = 750;

let selectedNeuron = null;

export function createUI(canvas, simulation) {

    const ctx = canvas.getContext("2d");

    return {

        canvas,

        ctx,

        simulation,

        mouseX: 0,

        mouseY: 0,

        render() {

            drawBackground(ctx);

            drawBrainPanel(

                ctx,

                simulation

            );

            drawWorld(

                ctx,

                simulation

            );

            drawTopInformation(

                ctx,

                simulation

            );

            drawBottomInformation(

                ctx,

                simulation

            );

            drawSelectedNeuron(

                ctx,

                simulation

            );

        }

    };

}

/* ============================================================

   MAIN BACKGROUND

   ============================================================ */

function drawBackground(ctx) {

    ctx.fillStyle = "#070b12";

    ctx.fillRect(

        0,

        0,

        ctx.canvas.width,

        ctx.canvas.height

    );

}

/* ============================================================

   BRAIN PANEL

   ============================================================ */

function drawBrainPanel(

    ctx,

    simulation

) {

    const brain = simulation.brain;

    ctx.fillStyle = "#0b111b";

    ctx.fillRect(

        0,

        0,

        WORLD_OFFSET_X,

        ctx.canvas.height

    );

    ctx.strokeStyle = "#1b2736";

    ctx.beginPath();

    ctx.moveTo(

        WORLD_OFFSET_X,

        0

    );

    ctx.lineTo(

        WORLD_OFFSET_X,

        ctx.canvas.height

    );

    ctx.stroke();

    drawBrainTitle(

        ctx,

        brain

    );

    drawNeuralNetwork(

        ctx,

        brain

    );

    drawBrainStats(

        ctx,

        simulation

    );

    drawRewardPanel(

        ctx,

        simulation

    );

    drawMemoryPanel(

        ctx,

        simulation

    );

    drawSensoryPanel(

        ctx,

        simulation

    );

}

/* ============================================================

   BRAIN TITLE

   ============================================================ */

function drawBrainTitle(

    ctx,

    brain

) {

    ctx.fillStyle = "#e9f1ff";

    ctx.font = "bold 17px Arial";

    ctx.fillText(

        "ARTIFICIAL BRAIN",

        18,

        28

    );

    ctx.fillStyle = "#7f91a8";

    ctx.font = "11px Arial";

    ctx.fillText(

        "DISTRIBUTED NEURAL ACTIVITY",

        18,

        45

    );

    const stats =

        brain.stats ||

        {};

    ctx.fillStyle = "#53657a";

    ctx.fillText(

        `${brain.neurons.length} neurons`,

        18,

        61

    );

}

/* ============================================================

   NEURAL NETWORK

   ============================================================ */

function drawNeuralNetwork(

    ctx,

    brain

) {

    const neurons =

        brain.neurons || [];

    const connections =

        brain.connections || [];

    const area = {

        x: 15,

        y: 72,

        width: 310,

        height: 300

    };

    /*

        Keep the original organized architecture.

        Sensory → Perception → Memory → Prediction →

        Value → Needs → Association → Spatial →

        Decision → Exploration → Motor

    */

    const positions = {};

    const groups = [

        {

            start: 0,

            end: 5,

            x: 32,

            label: "SENSE"

        },

        {

            start: 6,

            end: 17,

            x: 78,

            label: "PERCEPTION"

        },

        {

            start: 18,

            end: 27,

            x: 119,

            label: "MEMORY"

        },

        {

            start: 28,

            end: 37,

            x: 160,

            label: "PREDICTION"

        },

        {

            start: 38,

            end: 45,

            x: 201,

            label: "VALUE"

        },

        {

            start: 46,

            end: 53,

            x: 242,

            label: "NEEDS"

        },

        {

            start: 54,

            end: 61,

            x: 283,

            label: "ASSOCIATION"

        }

    ];

    groups.forEach(

        group => {

            const count =

                group.end -

                group.start +

                1;

            for (

                let i = group.start;

                i <= group.end;

                i++

            ) {

                const local =

                    i - group.start;

                const y =

                    area.y +

                    22 +

                    (local /

                        Math.max(

                            1,

                            count - 1

                        )) *

                        (area.height - 44);

                positions[i] = {

                    x: group.x,

                    y

                };

            }

            ctx.fillStyle =

                "#43536a";

            ctx.font =

                "7px Arial";

            ctx.save();

            ctx.translate(

                group.x - 1,

                area.y + area.height + 4

            );

            ctx.rotate(

                -Math.PI / 2

            );

            ctx.fillText(

                group.label,

                0,

                0

            );

            ctx.restore();

        }

    );

    // Decision / exploration

    for (

        let i = 62;

        i <= 77;

        i++

    ) {

        const local =

            i - 62;

        positions[i] = {

            x: 300,

            y:

                area.y +

                18 +

                local * 18

        };

    }

    // Motor neurons

    const motorPositions = [

        {

            id: 78,

            x: 304,

            y: 390

        },

        {

            id: 79,

            x: 304,

            y: 410

        },

        {

            id: 80,

            x: 304,

            y: 430

        },

        {

            id: 81,

            x: 304,

            y: 450

        }

    ];

    motorPositions.forEach(

        p => {

            positions[p.id] = {

                x: p.x,

                y: p.y

            };

        }

    );

    // Dynamic grown neurons.

    const dynamicStart = 82;

    for (

        let i = dynamicStart;

        i < neurons.length;

        i++

    ) {

        const angle =

            i * 2.399;

        const radius =

            65 +

            (i % 5) * 11;

        positions[i] = {

            x:

                170 +

                Math.cos(angle) *

                    radius,

            y:

                205 +

                Math.sin(angle) *

                    radius

        };

    }

    // Connections first.

    connections.forEach(

        connection => {

            const from =

                positions[

                    connection.from

                ];

            const to =

                positions[

                    connection.to

                ];

            if (!from || !to) {

                return;

            }

            const strength =

                Math.abs(

                    connection.weight ??

                    0

                );

            if (strength < 0.03) {

                return;

            }

            ctx.globalAlpha =

                Math.min(

                    0.45,

                    0.04 +

                        strength * 0.35

                );

            ctx.strokeStyle =

                "#52647c";

            ctx.lineWidth =

                Math.max(

                    0.4,

                    strength * 1.4

                );

            ctx.beginPath();

            ctx.moveTo(

                from.x,

                from.y

            );

            ctx.lineTo(

                to.x,

                to.y

            );

            ctx.stroke();

        }

    );

    ctx.globalAlpha = 1;

    // Neurons.

    neurons.forEach(

        neuron => {

            const p =

                positions[

                    neuron.id

                ];

            if (!p) {

                return;

            }

            const activation =

                Math.min(

                    1,

                    Math.abs(

                        neuron.activation ??

                        0

                    )

                );

            const firing =

                neuron.firing ||

                (neuron.recentFires ?? 0) > 0;

            let radius =

                3.3 +

                activation * 2.8;

            if (

                neuron.id ===

                selectedNeuron

            ) {

                radius += 3;

            }

            ctx.globalAlpha = 0.3;

            if (firing) {

                ctx.beginPath();

                ctx.arc(

                    p.x,

                    p.y,

                    radius + 7,

                    0,

                    Math.PI * 2

                );

                ctx.strokeStyle =

                    "#d9f0ff";

                ctx.lineWidth = 1;

                ctx.stroke();

            }

            ctx.globalAlpha = 1;

            ctx.beginPath();

            ctx.arc(

                p.x,

                p.y,

                radius,

                0,

                Math.PI * 2

            );

            ctx.fillStyle =

                neuronColor(

                    neuron,

                    activation

                );

            ctx.fill();

            ctx.strokeStyle =

                "#0b111b";

            ctx.lineWidth = 1;

            ctx.stroke();

        }

    );

    // Motor labels.

    const labels = [

        ["N", 78],

        ["S", 79],

        ["E", 80],

        ["W", 81]

    ];

    labels.forEach(

        ([label, id]) => {

            const p =

                positions[id];

            ctx.fillStyle =

                "#93a7bd";

            ctx.font =

                "8px Arial";

            ctx.fillText(

                label,

                p.x - 16,

                p.y + 3

            );

        }

    );

    ctx.globalAlpha = 1;

}

/* ============================================================

   NEURON COLORS

   ============================================================ */

function neuronColor(

    neuron,

    activation

) {

    const type =

        neuron.role ||

        neuron.type ||

        "internal";

    if (type === "sensory") {

        return activation > 0.35

            ? "#d9f0ff"

            : "#54728e";

    }

    if (

        type === "motor"

    ) {

        return activation > 0.35

            ? "#ffffff"

            : "#6d7887";

    }

    if (

        neuron.specialization

    ) {

        return activation > 0.35

            ? "#ffffff"

            : "#8c9eb3";

    }

    if (

        type.includes(

            "memory"

        )

    ) {

        return activation > 0.35

            ? "#b6c9df"

            : "#53667d";

    }

    if (

        type.includes(

            "prediction"

        )

    ) {

        return activation > 0.35

            ? "#c5d8eb"

            : "#566a80";

    }

    return activation > 0.35

        ? "#d0d8e2"

        : "#536070";

}

/* ============================================================

   BRAIN STATS

   ============================================================ */

function drawBrainStats(

    ctx,

    simulation

) {

    const stats =

        simulation.brainStats ||

        {};

    const x = 18;

    const y = 390;

    ctx.fillStyle =

        "#dbe6f3";

    ctx.font =

        "bold 11px Arial";

    ctx.fillText(

        "BRAIN STATUS",

        x,

        y

    );

    ctx.font =

        "10px Arial";

    ctx.fillStyle =

        "#8295ab";

    const lines = [

        `Neurons: ${stats.totalNeurons ?? simulation.brain.neurons.length}`,

        `Active: ${stats.activeNeurons ?? 0}`,

        `Specialized: ${stats.specializedNeurons ?? 0}`,

        `Grown: ${stats.grownNeurons ?? 0}`,

        `Connections: ${stats.totalConnections ?? simulation.brain.connections.length}`

    ];

    lines.forEach(

        (line, i) => {

            ctx.fillText(

                line,

                x,

                y + 18 + i * 14

            );

        }

    );

}

/* ============================================================

   REWARD PANEL

   ============================================================ */

function drawRewardPanel(

    ctx,

    simulation

) {

    const x = 165;

    const y = 390;

    ctx.fillStyle =

        "#dbe6f3";

    ctx.font =

        "bold 11px Arial";

    ctx.fillText(

        "LEARNING",

        x,

        y

    );

    ctx.font =

        "10px Arial";

    ctx.fillStyle =

        "#8295ab";

    ctx.fillText(

        `Reward: ${formatNumber(simulation.currentReward)}`,

        x,

        y + 18

    );

    ctx.fillText(

        `Prediction error: ${formatNumber(simulation.predictionError)}`,

        x,

        y + 33

    );

    ctx.fillText(

        `Avg reward: ${formatNumber(simulation.averageReward)}`,

        x,

        y + 48

    );

    ctx.fillText(

        `Learning: ${Math.round(

            (simulation.learningStrength ?? 0) *

                100

        )}%`,

        x,

        y + 63

    );

    drawMiniGraph(

        ctx,

        simulation.rewardHistory || [],

        x,

        y + 74,

        145,

        48

    );

}

/* ============================================================

   MEMORY PANEL

   ============================================================ */

function drawMemoryPanel(

    ctx,

    simulation

) {

    const x = 18;

    const y = 485;

    ctx.fillStyle =

        "#dbe6f3";

    ctx.font =

        "bold 11px Arial";

    ctx.fillText(

        "MEMORY",

        x,

        y

    );

    const memories =

        simulation.brain.memories ||

        [];

    ctx.font =

        "10px Arial";

    ctx.fillStyle =

        "#8295ab";

    ctx.fillText(

        `Long-term memories: ${memories.length}`,

        x,

        y + 17

    );

    ctx.fillText(

        `Current pattern:`,

        x,

        y + 34

    );

    ctx.fillStyle =

        "#c3d0df";

    const pattern =

        simulation.currentPattern ||

        "none";

    drawWrappedText(

        ctx,

        pattern,

        x,

        y + 50,

        140,

        11,

        3

    );

}

/* ============================================================

   SENSORY PANEL

   ============================================================ */

function drawSensoryPanel(

    ctx,

    simulation

) {

    const x = 165;

    const y = 485;

    ctx.fillStyle =

        "#dbe6f3";

    ctx.font =

        "bold 11px Arial";

    ctx.fillText(

        "SENSORY INPUT",

        x,

        y

    );

    const senses =

        simulation.senses || {};

    const items = [

        ["Food L", senses.foodLeft],

        ["Food R", senses.foodRight],

        ["Danger L", senses.dangerLeft],

        ["Danger R", senses.dangerRight],

        ["Water L", senses.waterLeft],

        ["Water R", senses.waterRight]

    ];

    ctx.font =

        "9px Arial";

    items.forEach(

        ([label, value], i) => {

            const row =

                Math.floor(i / 2);

            const col =

                i % 2;

            const px =

                x +

                col * 75;

            const py =

                y +

                18 +

                row * 25;

            ctx.fillStyle =

                "#708298";

            ctx.fillText(

                label,

                px,

                py

            );

            drawBar(

                ctx,

                px,

                py + 5,

                60,

                5,

                value ?? 0

            );

        }

    );

}

/* ============================================================

   WORLD

   ============================================================ */

function drawWorld(

    ctx,

    simulation

) {

    const world =

        simulation.world;

    const creature =

        simulation.creature;

    const x =

        WORLD_OFFSET_X;

    ctx.save();

    ctx.translate(

        WORLD_OFFSET_X,

        0

    );

    ctx.fillStyle =

        "#111b17";

    ctx.fillRect(

        0,

        0,

        WORLD_WIDTH,

        WORLD_HEIGHT

    );

    drawWorldGrid(

        ctx,

        world

    );

    drawObjects(

        ctx,

        world

    );

    drawCreature(

        ctx,

        creature

    );

    drawWorldOverlay(

        ctx,

        simulation

    );

    ctx.restore();

}

/* ============================================================

   WORLD GRID

   ============================================================ */

function drawWorldGrid(

    ctx,

    world

) {

    ctx.strokeStyle =

        "rgba(130,160,145,0.08)";

    ctx.lineWidth = 1;

    const spacing = 50;

    for (

        let x = 0;

        x <= WORLD_WIDTH;

        x += spacing

    ) {

        ctx.beginPath();

        ctx.moveTo(

            x,

            0

        );

        ctx.lineTo(

            x,

            WORLD_HEIGHT

        );

        ctx.stroke();

    }

    for (

        let y = 0;

        y <= WORLD_HEIGHT;

        y += spacing

    ) {

        ctx.beginPath();

        ctx.moveTo(

            0,

            y

        );

        ctx.lineTo(

            WORLD_WIDTH,

            y

        );

        ctx.stroke();

    }

    ctx.strokeStyle =

        "#26372f";

    ctx.strokeRect(

        0,

        0,

        WORLD_WIDTH,

        WORLD_HEIGHT

    );

}

/* ============================================================

   OBJECTS

   ============================================================ */

function drawObjects(

    ctx,

    world

) {

    const objects =

        world.objects ||

        [];

    objects.forEach(

        object => {

            const radius =

                object.radius ||

                8;

            ctx.globalAlpha =

                0.18;

            ctx.beginPath();

            ctx.arc(

                object.x,

                object.y,

                radius + 7,

                0,

                Math.PI * 2

            );

            ctx.fillStyle =

                objectColor(

                    object.type

                );

            ctx.fill();

            ctx.globalAlpha = 1;

            ctx.beginPath();

            ctx.arc(

                object.x,

                object.y,

                radius,

                0,

                Math.PI * 2

            );

            ctx.fillStyle =

                objectColor(

                    object.type

                );

            ctx.fill();

            ctx.strokeStyle =

                "rgba(255,255,255,0.22)";

            ctx.stroke();

        }

    );

}

function objectColor(type) {

    if (type === "food") {

        return "#9cc48a";

    }

    if (type === "water") {

        return "#8db9d2";

    }

    if (type === "danger") {

        return "#b66f6f";

    }

    return "#9aa6b3";

}

/* ============================================================

   CREATURE

   ============================================================ */

function drawCreature(

    ctx,

    creature

) {

    const pulse =

        Math.sin(

            creature.pulse || 0

        ) *

        2;

    const radius =

        (creature.radius || 10) +

        pulse * 0.25;

    // Direction indicator.

    const direction =

        normalize(

            creature.lastDirectionX || 0,

            creature.lastDirectionY || 0

        );

    ctx.strokeStyle =

        "rgba(220,235,250,0.35)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(

        creature.x,

        creature.y

    );

    ctx.lineTo(

        creature.x +

            direction.x * 22,

        creature.y +

            direction.y * 22

    );

    ctx.stroke();

    // Outer glow.

    ctx.globalAlpha = 0.16;

    ctx.beginPath();

    ctx.arc(

        creature.x,

        creature.y,

        radius + 9,

        0,

        Math.PI * 2

    );

    ctx.fillStyle =

        "#d8e7f5";

    ctx.fill();

    ctx.globalAlpha = 1;

    // Body.

    ctx.beginPath();

    ctx.arc(

        creature.x,

        creature.y,

        radius,

        0,

        Math.PI * 2

    );

    ctx.fillStyle =

        "#d5e0ea";

    ctx.fill();

    ctx.strokeStyle =

        "#ffffff";

    ctx.lineWidth = 1;

    ctx.stroke();

    // Core.

    ctx.beginPath();

    ctx.arc(

        creature.x,

        creature.y,

        3,

        0,

        Math.PI * 2

    );

    ctx.fillStyle =

        "#536779";

    ctx.fill();

}

/* ============================================================

   WORLD OVERLAY

   ============================================================ */

function drawWorldOverlay(

    ctx,

    simulation

) {

    const creature =

        simulation.creature;

    ctx.fillStyle =

        "rgba(6,10,15,0.78)";

    ctx.fillRect(

        14,

        14,

        265,

        112

    );

    ctx.fillStyle =

        "#e3edf7";

    ctx.font =

        "bold 13px Arial";

    ctx.fillText(

        creature.behavior ||

            "Exploring",

        26,

        36

    );

    ctx.fillStyle =

        "#91a3b7";

    ctx.font =

        "10px Arial";

    ctx.fillText(

        `Goal: ${creature.goal || "Explore"}`,

        26,

        54

    );

    drawWrappedText(

        ctx,

        `Why: ${creature.reason || "No immediate need."}`,

        26,

        72,

        235,

        11,

        3

    );

    ctx.fillStyle =

        "#65798e";

    ctx.fillText(

        `Pattern: ${simulation.currentPattern || "none"}`,

        26,

        111

    );

}

/* ============================================================

   TOP INFORMATION

   ============================================================ */

function drawTopInformation(

    ctx,

    simulation

) {

    const creature =

        simulation.creature;

    ctx.fillStyle =

        "rgba(5,8,12,0.78)";

    ctx.fillRect(

        WORLD_OFFSET_X + 300,

        14,

        530 - 0,

        30

    );

    ctx.fillStyle =

        "#dce7f2";

    ctx.font =

        "11px Arial";

    ctx.fillText(

        simulation.running

            ? "● RUNNING"

            : "■ PAUSED",

        WORLD_OFFSET_X + 314,

        33

    );

    ctx.fillStyle =

        "#74879b";

    ctx.fillText(

        `Experiment ${simulation.experimentNumber}`,

        WORLD_OFFSET_X + 410,

        33

    );

    ctx.fillText(

        `Time ${formatTime(

            creature.survivalTime

        )}`,

        WORLD_OFFSET_X + 520,

        33

    );

}

/* ============================================================

   BOTTOM INFORMATION

   ============================================================ */

function drawBottomInformation(

    ctx,

    simulation

) {

    const creature =

        simulation.creature;

    const x =

        WORLD_OFFSET_X + 14;

    const y =

        WORLD_HEIGHT - 125;

    ctx.fillStyle =

        "rgba(5,8,12,0.82)";

    ctx.fillRect(

        x,

        y,

        500,

        108

    );

    ctx.fillStyle =

        "#dce7f2";

    ctx.font =

        "bold 11px Arial";

    ctx.fillText(

        "CREATURE STATE",

        x + 12,

        y + 18

    );

    const bars = [

        ["Energy", creature.energy / 100],

        ["Hunger", creature.hunger],

        ["Thirst", creature.thirst],

        ["Fear", creature.fear],

        ["Curiosity", creature.curiosity]

    ];

    bars.forEach(

        ([label, value], i) => {

            const px =

                x + 12 +

                (i % 2) * 245;

            const py =

                y + 34 +

                Math.floor(i / 2) * 23;

            ctx.fillStyle =

                "#718398";

            ctx.font =

                "9px Arial";

            ctx.fillText(

                label,

                px,

                py

            );

            drawBar(

                ctx,

                px + 60,

                py - 7,

                160,

                7,

                value

            );

        }

    );

    ctx.fillStyle =

        "#718398";

    ctx.font =

        "9px Arial";

    ctx.fillText(

        `Food: ${creature.foodConsumed}`,

        x + 12,

        y + 101

    );

    ctx.fillText(

        `Water: ${creature.waterConsumed}`,

        x + 90,

        y + 101

    );

    ctx.fillText(

        `Danger: ${creature.dangerEncounters}`,

        x + 178,

        y + 101

    );

    ctx.fillText(

        `Distance: ${Math.round(

            creature.totalDistance

        )}`,

        x + 275,

        y + 101

    );

}

/* ============================================================

   SELECTED NEURON

   ============================================================ */

function drawSelectedNeuron(

    ctx,

    simulation

) {

    if (

        selectedNeuron === null

    ) {

        return;

    }

    const neuron =

        simulation.brain.neurons.find(

            n =>

                n.id ===

                selectedNeuron

        );

    if (!neuron) {

        return;

    }

    const x = 12;

    const y = 610;

    const width = 310;

    const height = 125;

    ctx.fillStyle =

        "rgba(9,14,21,0.95)";

    ctx.fillRect(

        x,

        y,

        width,

        height

    );

    ctx.strokeStyle =

        "#334255";

    ctx.strokeRect(

        x,

        y,

        width,

        height

    );

    ctx.fillStyle =

        "#e1ebf5";

    ctx.font =

        "bold 11px Arial";

    ctx.fillText(

        `NEURON ${neuron.id}`,

        x + 10,

        y + 18

    );

    ctx.fillStyle =

        "#8799ad";

    ctx.font =

        "9px Arial";

    ctx.fillText(

        `Role: ${neuron.role || neuron.type || "Internal"}`,

        x + 10,

        y + 36

    );

    ctx.fillText(

        `Activation: ${formatNumber(

            neuron.activation ?? 0

        )}`,

        x + 10,

        y + 51

    );

    ctx.fillText(

        `Fires: ${neuron.fireCount ?? neuron.totalFires ?? 0}`,

        x + 10,

        y + 66

    );

    ctx.fillText(

        `Specialization: ${

            neuron.specialization ||

            "Undeveloped"

        }`,

        x + 10,

        y + 81

    );

    ctx.fillText(

        `Description: ${

            neuron.description ||

            "Flexible internal neuron"

        }`,

        x + 10,

        y + 98

    );

    ctx.fillText(

        "Click another neuron to inspect it.",

        x + 10,

        y + 114

    );

}

/* ============================================================

   MINI GRAPH

   ============================================================ */

function drawMiniGraph(

    ctx,

    values,

    x,

    y,

    width,

    height

) {

    if (

        !values ||

        values.length < 2

    ) {

        ctx.strokeStyle =

            "#2b394a";

        ctx.strokeRect(

            x,

            y,

            width,

            height

        );

        return;

    }

    const recent =

        values.slice(-60);

    let min =

        Math.min(

            ...recent

        );

    let max =

        Math.max(

            ...recent

        );

    if (

        max - min < 0.001

    ) {

        max += 1;

        min -= 1;

    }

    ctx.strokeStyle =

        "#344458";

    ctx.strokeRect(

        x,

        y,

        width,

        height

    );

    ctx.beginPath();

    recent.forEach(

        (value, i) => {

            const px =

                x +

                (i /

                    Math.max(

                        1,

                        recent.length - 1

                    )) *

                    width;

            const py =

                y +

                height -

                ((value - min) /

                    (max - min)) *

                    height;

            if (i === 0) {

                ctx.moveTo(

                    px,

                    py

                );

            } else {

                ctx.lineTo(

                    px,

                    py

                );

            }

        }

    );

    ctx.strokeStyle =

        "#9eafc1";

    ctx.lineWidth = 1.2;

    ctx.stroke();

}

/* ============================================================

   BARS

   ============================================================ */

function drawBar(

    ctx,

    x,

    y,

    width,

    height,

    value

) {

    value =

        Math.max(

            0,

            Math.min(

                1,

                value || 0

            )

        );

    ctx.fillStyle =

        "#1c2734";

    ctx.fillRect(

        x,

        y,

        width,

        height

    );

    ctx.fillStyle =

        "#8597aa";

    ctx.fillRect(

        x,

        y,

        width * value,

        height

    );

    ctx.strokeStyle =

        "#354454";

    ctx.strokeRect(

        x,

        y,

        width,

        height

    );

}

/* ============================================================

   TEXT HELPERS

   ============================================================ */

function drawWrappedText(

    ctx,

    text,

    x,

    y,

    maxWidth,

    lineHeight,

    maxLines

) {

    const words =

        String(text)

            .split(" ");

    let line = "";

    let lines = 0;

    for (

        let i = 0;

        i < words.length;

        i++

    ) {

        const test =

            line +

            words[i] +

            " ";

        if (

            ctx.measureText(

                test

            ).width >

                maxWidth &&

            line

        ) {

            ctx.fillText(

                line,

                x,

                y +

                    lines *

                        lineHeight

            );

            lines++;

            line =

                words[i] +

                " ";

            if (

                lines >=

                maxLines

            ) {

                return;

            }

        } else {

            line = test;

        }

    }

    if (

        lines < maxLines

    ) {

        ctx.fillText(

            line,

            x,

            y +

                lines *

                    lineHeight

        );

    }

}

/* ============================================================

   MOUSE / NEURON SELECTION

   ============================================================ */

export function handleCanvasClick(

    simulation,

    mouseX,

    mouseY

) {

    if (

        mouseX >= WORLD_OFFSET_X

    ) {

        return false;

    }

    const neuron =

        findNearestNeuron(

            simulation.brain,

            mouseX,

            mouseY

        );

    if (!neuron) {

        selectedNeuron = null;

        return false;

    }

    selectedNeuron =

        neuron.id;

    return true;

}

function findNearestNeuron(

    brain,

    mouseX,

    mouseY

) {

    const positions =

        getNeuronPositions(

            brain

        );

    let closest = null;

    let closestDistance = 12;

    brain.neurons.forEach(

        neuron => {

            const position =

                positions[

                    neuron.id

                ];

            if (!position) {

                return;

            }

            const dx =

                mouseX -

                position.x;

            const dy =

                mouseY -

                position.y;

            const distance =

                Math.sqrt(

                    dx * dx +

                    dy * dy

                );

            if (

                distance <

                closestDistance

            ) {

                closest =

                    neuron;

                closestDistance =

                    distance;

            }

        }

    );

    return closest;

}

function getNeuronPositions(

    brain

) {

    const positions = {};

    const groups = [

        [0, 5, 32],

        [6, 17, 78],

        [18, 27, 119],

        [28, 37, 160],

        [38, 45, 201],

        [46, 53, 242],

        [54, 61, 283]

    ];

    groups.forEach(

        ([start, end, x]) => {

            const count =

                end -

                start +

                1;

            for (

                let i = start;

                i <= end;

                i++

            ) {

                const local =

                    i - start;

                positions[i] = {

                    x,

                    y:

                        94 +

                        (local /

                            Math.max(

                                1,

                                count - 1

                            )) *

                            256

                };

            }

        }

    );

    for (

        let i = 62;

        i <= 77;

        i++

    ) {

        positions[i] = {

            x: 300,

            y:

                90 +

                (i - 62) * 18

        };

    }

    positions[78] = {

        x: 304,

        y: 390

    };

    positions[79] = {

        x: 304,

        y: 410

    };

    positions[80] = {

        x: 304,

        y: 430

    };

    positions[81] = {

        x: 304,

        y: 450

    };

    for (

        let i = 82;

        i < brain.neurons.length;

        i++

    ) {

        const angle =

            i * 2.399;

        const radius =

            65 +

            (i % 5) * 11;

        positions[i] = {

            x:

                170 +

                Math.cos(angle) *

                    radius,

            y:

                205 +

                Math.sin(angle) *

                    radius

        };

    }

    return positions;

}

/* ============================================================

   HELPERS

   ============================================================ */

function normalize(

    x,

    y

) {

    const length =

        Math.sqrt(

            x * x +

            y * y

        );

    if (

        length < 0.001

    ) {

        return {

            x: 0,

            y: 0

        };

    }

    return {

        x: x / length,

        y: y / length

    };

}

function formatNumber(

    value

) {

    if (

        !Number.isFinite(value)

    ) {

        return "0.00";

    }

    return Number(value)

        .toFixed(2);

}

function formatTime(

    seconds

) {

    if (

        !Number.isFinite(seconds)

    ) {

        return "0:00";

    }

    const total =

        Math.floor(seconds);

    const minutes =

        Math.floor(

            total / 60

        );

    const secs =

        total % 60;

    return `${minutes}:${String(

        secs

    ).padStart(2, "0")}`;

}

