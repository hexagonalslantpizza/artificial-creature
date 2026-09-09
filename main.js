import {

    createSimulation,

    updateSimulation,

    addFood,

    addWater,

    addDanger

} from "./simulation.js";

import {

    createUI,

    renderUI,

    handleUIClick

} from "./ui.js";

const canvas =

    document.getElementById(

        "simulationCanvas"

    );

const sim =

    createSimulation();

const ui =

    createUI(

        canvas,

        sim

    );

const startButton =

    document.getElementById(

        "startButton"

    );

const resetButton =

    document.getElementById(

        "resetButton"

    );

const foodButton =

    document.getElementById(

        "foodButton"

    );

const waterButton =

    document.getElementById(

        "waterButton"

    );

const dangerButton =

    document.getElementById(

        "dangerButton"

    );

const status =

    document.getElementById(

        "status"

    );

function updateStatus() {

    if (sim.running) {

        status.textContent =

            "RUNNING";

        status.classList.add(

            "running"

        );

        startButton.textContent =

            "STOP EXPERIMENT";

    } else {

        status.textContent =

            "STOPPED";

        status.classList.remove(

            "running"

        );

        startButton.textContent =

            "START EXPERIMENT";

    }

}

startButton.addEventListener(

    "click",

    () => {

        sim.running =

            !sim.running;

        if (sim.running) {

            sim.experimentNumber++;

            sim.patternTrace = [];

            sim.brain.pulses = [];

        }

        updateStatus();

    }

);

resetButton.addEventListener(

    "click",

    () => {

        sim.running = false;

        sim.creature.x =

            sim.world.food.length

                ? sim.creature.x

                : 430;

        sim.creature.y = 375;

        sim.brain.pulses = [];

        for (

            const neuron

            of sim.brain.neurons

        ) {

            neuron.potential = 0;

            neuron.refractory = 0;

            neuron.memory = 0;

            neuron.fired = false;

            neuron.activation = 0;

        }

        updateStatus();

    }

);

foodButton.addEventListener(

    "click",

    () => {

        addFood(

            sim,

            50 +

                Math.random() * 760,

            70 +

                Math.random() * 650

        );

    }

);

waterButton.addEventListener(

    "click",

    () => {

        addWater(

            sim,

            50 +

                Math.random() * 760,

            70 +

                Math.random() * 650

        );

    }

);

dangerButton.addEventListener(

    "click",

    () => {

        addDanger(

            sim,

            50 +

                Math.random() * 760,

            70 +

                Math.random() * 650

        );

    }

);

canvas.addEventListener(

    "click",

    event => {

        const rect =

            canvas.getBoundingClientRect();

        const scaleX =

            canvas.width /

            rect.width;

        const scaleY =

            canvas.height /

            rect.height;

        const x =

            (event.clientX -

                rect.left) *

            scaleX;

        const y =

            (event.clientY -

                rect.top) *

            scaleY;

        handleUIClick(

            ui,

            x,

            y

        );

    }

);

function gameLoop() {

    updateSimulation(sim);

    renderUI(ui);

    updateStatus();

    requestAnimationFrame(

        gameLoop

    );

}

updateStatus();

gameLoop();

