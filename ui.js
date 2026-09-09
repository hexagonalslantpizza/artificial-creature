// Artificial Creature Experiment

// User interface and rendering

import {

    neuronType,

    neuronDescription

} from "./brain.js";

export function createUI(canvas, sim) {

    const ctx = canvas.getContext("2d");

    return {

        canvas,

        ctx,

        sim

    };

}

function drawButton(

    ctx,

    x,

    y,

    width,

    height,

    text,

    active = false

) {

    ctx.fillStyle = active

        ? "#405070"

        : "#252b38";

    ctx.fillRect(

        x,

        y,

        width,

        height

    );

    ctx.strokeStyle = "#667085";

    ctx.strokeRect(

        x,

        y,

        width,

        height

    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "14px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(

        text,

        x + width / 2,

        y + height / 2

    );

    ctx.textAlign = "left";

    ctx.textBaseline = "alphabetic";

}

function drawBrainPanel(ui) {

    const {

        ctx,

        canvas,

        sim

    } = ui;

    const width = 340;

    ctx.fillStyle = "#11151c";

    ctx.fillRect(

        0,

        0,

        width,

        canvas.height

    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 20px Arial";

    ctx.fillText(

        "ARTIFICIAL BRAIN",

        20,

        24

    );

    drawButton(

        ctx,

        20,

        40,

        145,

        32,

        sim.running

            ? "STOP"

            : "START",

        sim.running

    );

    drawButton(

        ctx,

        175,

        40,

        145,

        32,

        "RESET"

    );

    ctx.fillStyle = "#9aa4b2";

    ctx.font = "12px Arial";

    ctx.fillText(

        `${sim.brain.neurons.length} neurons`,

        20,

        92

    );

    ctx.fillText(

        `${sim.brain.connections.length} connections`,

        150,

        92

    );

    drawConnections(ui);

    drawPulses(ui);

    drawNeurons(ui);

    drawInspector(ui);

}

function neuronPosition(

    index,

    width,

    height

) {

    const margin = 18;

    // Arrange the 82 neurons into

    // a loose neural-network layout.

    if (index <= 5) {

        return {

            x: margin + 5,

            y:

                120 +

                index * 45

        };

    }

    if (index >= 78) {

        return {

            x: width - margin - 5,

            y:

                120 +

                (index - 78) * 80

        };

    }

    const internal =

        index - 6;

    const columns = 8;

    const rows = 9;

    const column =

        internal % columns;

    const row =

        Math.floor(

            internal / columns

        );

    return {

        x:

            65 +

            column * 32,

        y:

            115 +

            row * 48

    };

}

function drawConnections(ui) {

    const {

        ctx,

        sim

    } = ui;

    for (

        const connection

        of sim.brain.connections

    ) {

        const source =

            neuronPosition(

                connection.source,

                340,

                ui.canvas.height

            );

        const target =

            neuronPosition(

                connection.target,

                340,

                ui.canvas.height

            );

        if (

            sim.selectedNeuron !== null &&

            connection.source !==

                sim.selectedNeuron &&

            connection.target !==

                sim.selectedNeuron

        ) {

            ctx.globalAlpha = 0.08;

        } else {

            ctx.globalAlpha = 0.22;

        }

        ctx.strokeStyle =

            connection.weight >= 0

                ? "#718096"

                : "#4b5563";

        ctx.lineWidth =

            0.5 +

            Math.abs(

                connection.weight

            );

        ctx.beginPath();

        ctx.moveTo(

            source.x,

            source.y

        );

        ctx.lineTo(

            target.x,

            target.y

        );

        ctx.stroke();

    }

    ctx.globalAlpha = 1;

}

function drawPulses(ui) {

    const {

        ctx,

        sim

    } = ui;

    for (

        const pulse

        of sim.brain.pulses

    ) {

        const source =

            neuronPosition(

                pulse.source,

                340,

                ui.canvas.height

            );

        const target =

            neuronPosition(

                pulse.target,

                340,

                ui.canvas.height

            );

        const x =

            source.x +

            (target.x - source.x) *

                pulse.progress;

        const y =

            source.y +

            (target.y - source.y) *

                pulse.progress;

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(

            x,

            y,

            3,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

}

function drawNeurons(ui) {

    const {

        ctx,

        sim

    } = ui;

    for (

        let i = 0;

        i < sim.brain.neurons.length;

        i++

    ) {

        const neuron =

            sim.brain.neurons[i];

        const position =

            neuronPosition(

                i,

                340,

                ui.canvas.height

            );

        const radius =

            4 +

            neuron.memory * 7;

        ctx.beginPath();

        ctx.arc(

            position.x,

            position.y,

            radius,

            0,

            Math.PI * 2

        );

        ctx.fillStyle =

            neuron.fired

                ? "#ffffff"

                : "#7d8797";

        ctx.fill();

        if (

            sim.selectedNeuron === i

        ) {

            ctx.strokeStyle =

                "#ffd166";

            ctx.lineWidth = 2;

            ctx.stroke();

        }

    }

}

function drawInspector(ui) {

    const {

        ctx,

        sim,

        canvas

    } = ui;

    const y =

        canvas.height - 165;

    ctx.fillStyle = "#171c24";

    ctx.fillRect(

        8,

        y,

        324,

        155

    );

    if (

        sim.selectedNeuron === null

    ) {

        ctx.fillStyle = "#9aa4b2";

        ctx.font = "13px Arial";

        ctx.fillText(

            "Click a neuron to inspect it.",

            18,

            y + 25

        );

        return;

    }

    const index =

        sim.selectedNeuron;

    const neuron =

        sim.brain.neurons[index];

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 14px Arial";

    ctx.fillText(

        `Neuron ${index}`,

        18,

        y + 22

    );

    ctx.fillStyle = "#9aa4b2";

    ctx.font = "12px Arial";

    ctx.fillText(

        `Type: ${neuronType(index)}`,

        18,

        y + 42

    );

    ctx.fillText(

        `Potential: ${neuron.potential.toFixed(3)}`,

        18,

        y + 59

    );

    ctx.fillText(

        `Activation: ${neuron.activation.toFixed(3)}`,

        18,

        y + 76

    );

    ctx.fillText(

        `Memory: ${neuron.memory.toFixed(3)}`,

        18,

        y + 93

    );

    ctx.fillText(

        `Firing: ${neuron.fired ? "YES" : "NO"}`,

        18,

        y + 110

    );

    ctx.fillText(

        neuronDescription(index),

        18,

        y + 132

    );

}

function drawWorld(ui) {

    const {

        ctx,

        canvas,

        sim

    } = ui;

    const left = 340;

    ctx.fillStyle = "#0b0e12";

    ctx.fillRect(

        left,

        0,

        canvas.width - left,

        canvas.height

    );

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 20px Arial";

    ctx.fillText(

        "CREATURE WORLD",

        left + 20,

        28

    );

    ctx.fillStyle = "#9aa4b2";

    ctx.font = "13px Arial";

    ctx.fillText(

        "F = food   W = water   D = danger",

        left + 20,

        50

    );

    drawObjects(ui);

    drawCreature(ui);

    drawWorldStats(ui);

}

function drawObjects(ui) {

    const {

        ctx,

        sim

    } = ui;

    for (

        const food of sim.world.food

    ) {

        ctx.fillStyle = "#55c878";

        ctx.beginPath();

        ctx.arc(

            340 + food.x,

            food.y,

            7,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

    for (

        const water of sim.world.water

    ) {

        ctx.fillStyle = "#4da6ff";

        ctx.beginPath();

        ctx.arc(

            340 + water.x,

            water.y,

            7,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

    for (

        const danger of sim.world.danger

    ) {

        ctx.fillStyle = "#e05252";

        ctx.beginPath();

        ctx.arc(

            340 + danger.x,

            danger.y,

            8,

            0,

            Math.PI * 2

        );

        ctx.fill();

    }

}

function drawCreature(ui) {

    const {

        ctx,

        sim

    } = ui;

    if (!sim.running) {

        return;

    }

    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.arc(

        340 + sim.creature.x,

        sim.creature.y,

        10,

        0,

        Math.PI * 2

    );

    ctx.fill();

    ctx.strokeStyle = "#ffffff";

    ctx.globalAlpha = 0.25;

    ctx.beginPath();

    ctx.arc(

        340 + sim.creature.x,

        sim.creature.y,

        18,

        0,

        Math.PI * 2

    );

    ctx.stroke();

    ctx.globalAlpha = 1;

}

function drawWorldStats(ui) {

    const {

        ctx,

        sim,

        canvas

    } = ui;

    const x = 365;

    let y = 85;

    ctx.fillStyle = "#d8dee9";

    ctx.font = "14px Arial";

    const lines = [

        `Experiment: ${sim.experimentNumber}`,

        `Energy: ${sim.creature.energy.toFixed(1)}`,

        `Hunger: ${sim.creature.hunger.toFixed(2)}`,

        `Thirst: ${sim.creature.thirst.toFixed(2)}`,

        `Fear: ${sim.creature.fear.toFixed(2)}`,

        `Food eaten: ${sim.totalFoodEaten}`,

        `Water drunk: ${sim.totalWaterDrunk}`,

        `Danger hits: ${sim.totalDangerHits}`,

        `Pattern: ${sim.currentPattern}`

    ];

    for (

        const line of lines

    ) {

        ctx.fillText(

            line,

            x,

            y

        );

        y += 19;

    }

    ctx.fillStyle = "#7f8a9a";

    ctx.fillText(

        "Neural activity",

        x,

        y + 15

    );

    y += 35;

    for (

        const event

        of sim.activityEvents

    ) {

        ctx.globalAlpha =

            Math.max(

                0,

                event.life / 45

            );

        ctx.fillStyle =

            "#b8c0cc";

        ctx.fillText(

            event.text,

            x,

            y

        );

        y += 17;

        if (y > canvas.height - 20) {

            break;

        }

    }

    ctx.globalAlpha = 1;

}

export function renderUI(ui) {

    const {

        ctx,

        canvas

    } = ui;

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    drawWorld(ui);

    drawBrainPanel(ui);

    ctx.strokeStyle = "#303744";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(340, 0);

    ctx.lineTo(

        340,

        canvas.height

    );

    ctx.stroke();

}

export function handleUIClick(

    ui,

    mouseX,

    mouseY

) {

    const {

        sim

    } = ui;

    // Start / stop

    if (

        mouseX >= 20 &&

        mouseX <= 165 &&

        mouseY >= 40 &&

        mouseY <= 72

    ) {

        sim.running =

            !sim.running;

        return true;

    }

    // Reset

    if (

        mouseX >= 175 &&

        mouseX <= 320 &&

        mouseY >= 40 &&

        mouseY <= 72

    ) {

        sim.running = false;

        return true;

    }

    // Brain neuron selection

    if (

        mouseX <= 340 &&

        mouseY >= 100

    ) {

        let closest = null;

        let closestDistance = 15;

        for (

            let i = 0;

            i < sim.brain.neurons.length;

            i++

        ) {

            const position =

                neuronPosition(

                    i,

                    340,

                    ui.canvas.height

                );

            const dx =

                position.x -

                mouseX;

            const dy =

                position.y -

                mouseY;

            const distance =

                Math.sqrt(

                    dx * dx +

                    dy * dy

                );

            if (

                distance <

                closestDistance

            ) {

                closestDistance =

                    distance;

                closest = i;

            }

        }

        sim.selectedNeuron =

            closest;

        return true;

    }

    return false;

}

