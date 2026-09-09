// main.js

// Artificial Creature Experiment

// Application controller, controls, keyboard input, mouse input,

// animation loop, and simulation/UI connection.

import {

    createSimulation,

    updateSimulation,

    resetSimulationCreature,

    resetSimulationBrain,

    fullResetSimulation,

    toggleSimulation,

    setSimulationRunning,

    spawnFood,

    spawnWater,

    spawnDanger,

    clearFood,

    clearWater,

    clearDanger,

    clearMap,

    getSimulationState

} from "./simulation.js";

import {

    createUI,

    handleCanvasClick

} from "./ui.js";

const canvas =

    document.getElementById(

        "simulationCanvas"

    );

if (!canvas) {

    throw new Error(

        "Could not find #simulationCanvas."

    );

}

const ctx =

    canvas.getContext("2d");

const simulation =

    createSimulation();

const ui =

    createUI(

        canvas,

        simulation

    );

// ------------------------------------------------------------

// DOM CONTROLS

// ------------------------------------------------------------

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

const clearFoodButton =

    document.getElementById(

        "clearFoodButton"

    );

const clearWaterButton =

    document.getElementById(

        "clearWaterButton"

    );

const clearDangerButton =

    document.getElementById(

        "clearDangerButton"

    );

const clearMapButton =

    document.getElementById(

        "clearMapButton"

    );

const resetCreatureButton =

    document.getElementById(

        "resetCreatureButton"

    );

const resetBrainButton =

    document.getElementById(

        "resetBrainButton"

    );

const fullResetButton =

    document.getElementById(

        "fullResetButton"

    );

// ------------------------------------------------------------

// MOUSE POSITION

// ------------------------------------------------------------

let mouseX = 600;

let mouseY = 375;

canvas.addEventListener(

    "mousemove",

    event => {

        const rect =

            canvas.getBoundingClientRect();

        const scaleX =

            canvas.width /

            rect.width;

        const scaleY =

            canvas.height /

            rect.height;

        mouseX =

            (event.clientX -

                rect.left) *

            scaleX;

        mouseY =

            (event.clientY -

                rect.top) *

            scaleY;

        ui.mouseX = mouseX;

        ui.mouseY = mouseY;

    }

);

// ------------------------------------------------------------

// CANVAS CLICK

// ------------------------------------------------------------

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

        handleCanvasClick(

            simulation,

            x,

            y

        );

    }

);

// ------------------------------------------------------------

// SPAWN AT MOUSE

// ------------------------------------------------------------

function getWorldMousePosition() {

    /*

        Brain panel occupies the first 340 pixels.

        World coordinates therefore begin at x = 340.

    */

    const worldX =

        mouseX - 340;

    const worldY =

        mouseY;

    return {

        x: Math.max(

            12,

            Math.min(

                848,

                worldX

            )

        ),

        y: Math.max(

            12,

            Math.min(

                738,

                worldY

            )

        )

    };

}

function spawnFoodAtMouse() {

    const position =

        getWorldMousePosition();

    spawnFood(

        simulation,

        position.x,

        position.y

    );

}

function spawnWaterAtMouse() {

    const position =

        getWorldMousePosition();

    spawnWater(

        simulation,

        position.x,

        position.y

    );

}

function spawnDangerAtMouse() {

    const position =

        getWorldMousePosition();

    spawnDanger(

        simulation,

        position.x,

        position.y

    );

}

// ------------------------------------------------------------

// START / STOP

// ------------------------------------------------------------

function updateStartButton() {

    if (!startButton) {

        return;

    }

    if (simulation.running) {

        startButton.textContent =

            "Pause";

        startButton.setAttribute(

            "aria-label",

            "Pause simulation"

        );

    } else {

        startButton.textContent =

            "Start";

        startButton.setAttribute(

            "aria-label",

            "Start simulation"

        );

    }

}

if (startButton) {

    startButton.addEventListener(

        "click",

        () => {

            toggleSimulation(

                simulation

            );

            updateStartButton();

        }

    );

}

// ------------------------------------------------------------

// RESET BUTTON

// ------------------------------------------------------------

if (resetButton) {

    resetButton.addEventListener(

        "click",

        () => {

            resetSimulationCreature(

                simulation

            );

            updateStartButton();

        }

    );

}

// ------------------------------------------------------------

// SPAWN BUTTONS

// ------------------------------------------------------------

if (foodButton) {

    foodButton.addEventListener(

        "click",

        spawnFoodAtMouse

    );

}

if (waterButton) {

    waterButton.addEventListener(

        "click",

        spawnWaterAtMouse

    );

}

if (dangerButton) {

    dangerButton.addEventListener(

        "click",

        spawnDangerAtMouse

    );

}

// ------------------------------------------------------------

// CLEAR BUTTONS

// ------------------------------------------------------------

if (clearFoodButton) {

    clearFoodButton.addEventListener(

        "click",

        () => {

            clearFood(

                simulation

            );

        }

    );

}

if (clearWaterButton) {

    clearWaterButton.addEventListener(

        "click",

        () => {

            clearWater(

                simulation

            );

        }

    );

}

if (clearDangerButton) {

    clearDangerButton.addEventListener(

        "click",

        () => {

            clearDanger(

                simulation

            );

        }

    );

}

if (clearMapButton) {

    clearMapButton.addEventListener(

        "click",

        () => {

            clearMap(

                simulation

            );

        }

    );

}

// ------------------------------------------------------------

// ADVANCED RESET BUTTONS

// ------------------------------------------------------------

if (resetCreatureButton) {

    resetCreatureButton.addEventListener(

        "click",

        () => {

            resetSimulationCreature(

                simulation

            );

        }

    );

}

if (resetBrainButton) {

    resetBrainButton.addEventListener(

        "click",

        () => {

            const confirmed =

                window.confirm(

                    "Reset the brain to its newborn state? All learned memories, specializations, connections, and brain growth will be erased."

                );

            if (!confirmed) {

                return;

            }

            resetSimulationBrain(

                simulation

            );

        }

    );

}

if (fullResetButton) {

    fullResetButton.addEventListener(

        "click",

        () => {

            const confirmed =

                window.confirm(

                    "Perform a FULL RESET? This will erase the learned brain and clear the entire map."

                );

            if (!confirmed) {

                return;

            }

            fullResetSimulation(

                simulation

            );

            updateStartButton();

        }

    );

}

// ------------------------------------------------------------

// KEYBOARD CONTROLS

// ------------------------------------------------------------

document.addEventListener(

    "keydown",

    event => {

        /*

            Don't trigger game controls while typing into

            an input field.

        */

        const tag =

            event.target?.tagName;

        if (

            tag === "INPUT" ||

            tag === "TEXTAREA" ||

            tag === "SELECT"

        ) {

            return;

        }

        const key =

            event.key.toLowerCase();

        // Food

        if (key === "f") {

            event.preventDefault();

            spawnFoodAtMouse();

        }

        // Water

        if (key === "w") {

            event.preventDefault();

            spawnWaterAtMouse();

        }

        // Danger

        if (key === "d") {

            event.preventDefault();

            spawnDangerAtMouse();

        }

        // Space = pause/start

        if (

            event.code ===

            "Space"

        ) {

            event.preventDefault();

            toggleSimulation(

                simulation

            );

            updateStartButton();

        }

        // C = clear entire map

        if (key === "c") {

            event.preventDefault();

            clearMap(

                simulation

            );

        }

    }

);

// ------------------------------------------------------------

// RESIZE HANDLING

// ------------------------------------------------------------

function resizeCanvas() {

    /*

        The simulation itself remains fixed at 1200x750.

        CSS handles visual scaling so the coordinates remain

        consistent.

    */

    canvas.width = 1200;

    canvas.height = 750;

}

window.addEventListener(

    "resize",

    resizeCanvas

);

resizeCanvas();

// ------------------------------------------------------------

// ANIMATION LOOP

// ------------------------------------------------------------

let previousTime =

    performance.now();

function animationLoop(

    currentTime

) {

    let delta =

        currentTime -

        previousTime;

    previousTime =

        currentTime;

    /*

        Prevent a giant simulation jump if the browser tab

        was hidden or the page was temporarily frozen.

    */

    delta =

        Math.min(

            delta,

            50

        );

    /*

        Convert milliseconds to approximately 60 FPS

        simulation steps.

    */

    const dt =

        delta / 16.6667;

    updateSimulation(

        simulation,

        dt

    );

    ui.render();

    requestAnimationFrame(

        animationLoop

    );

}

// ------------------------------------------------------------

// INITIAL STATE

// ------------------------------------------------------------

updateStartButton();

requestAnimationFrame(

    animationLoop

);

