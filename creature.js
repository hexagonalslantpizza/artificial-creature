// Artificial Creature Experiment
// Creature state and movement

import {
WORLD_WIDTH,
WORLD_HEIGHT,
keepCreatureInside
} from "./world.js";

export function createCreature() {
return {
x: WORLD_WIDTH / 2,
y: WORLD_HEIGHT / 2,

energy: 50,
hunger: 0,
thirst: 0,

fear: 0,
curiosity: 0,
calm: 0,
chaos: 0
};
}

export function resetCreature(creature) {
creature.x = WORLD_WIDTH / 2;
creature.y = WORLD_HEIGHT / 2;

creature.energy = 50;
creature.hunger = 0;
creature.thirst = 0;

creature.fear = 0;
creature.curiosity = 0;
creature.calm = 0;
creature.chaos = 0;
}

export function updateCreatureNeeds(
creature
) {
creature.hunger += 0.0008;
creature.thirst += 0.0005;

creature.energy -= 0.002;

creature.fear *= 0.992;
creature.curiosity *= 0.995;
creature.calm *= 0.985;
creature.chaos *= 0.985;

creature.energy = Math.max(
0,
Math.min(100, creature.energy)
);

creature.hunger = Math.max(
0,
Math.min(10, creature.hunger)
);

creature.thirst = Math.max(
0,
Math.min(10, creature.thirst)
);

creature.fear = Math.max(
0,
Math.min(10, creature.fear)
);

creature.curiosity = Math.max(
0,
Math.min(10, creature.curiosity)
);

creature.calm = Math.max(
0,
Math.min(10, creature.calm)
);

creature.chaos = Math.max(
0,
Math.min(10, creature.chaos)
);
}

export function moveCreature(
creature,
motor,
speed = 2.5
) {
let dx =
motor.east -
motor.west;

let dy =
motor.south -
motor.north;

const strength =
Math.sqrt(
dx * dx +
dy * dy
);

if (strength > 0.001) {
dx /= strength;
dy /= strength;

const movementSpeed =
speed +
creature.fear * 1.0;

creature.x +=
dx * movementSpeed;

creature.y +=
dy * movementSpeed;
}

keepCreatureInside(creature);
}

export function eatFood(
creature
) {
const hungerBefore =
creature.hunger;

creature.energy =
Math.min(
100,
creature.energy + 10
);

creature.hunger *= 0.4;

creature.calm += 1;

return (
0.75 +
Math.min(
0.75,
hungerBefore
)
);
}

export function drinkWater(
creature
) {
const thirstBefore =
creature.thirst;

creature.thirst *= 0.25;

creature.energy =
Math.min(
100,
creature.energy + 3
);

creature.calm += 0.5;

return (
0.75 +
Math.min(
0.75,
thirstBefore
)
);
}

export function hitDanger(
creature
) {
creature.energy -= 10;

creature.chaos += 1;
creature.fear += 1;

return -1;
}
