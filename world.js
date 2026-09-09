// Artificial Creature Experiment — Alpha
// World and Environment System

export const WORLD_WIDTH = 860;
export const WORLD_HEIGHT = 750;
export const MAX_OBJECTS = 150;

export const FOOD = "food";
export const WATER = "water";
export const DANGER = "danger";

function clamp(value, min, max) {
return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
const dx = a.x - b.x;
const dy = a.y - b.y;

return Math.sqrt(dx * dx + dy * dy);
}

function createObject(type, x, y) {
return {
id: Date.now() + Math.random(),
type,
x,
y,
radius: type === DANGER ? 18 : 14,
age: 0
};
}

export function createWorld() {
return {
width: WORLD_WIDTH,
height: WORLD_HEIGHT,

food: [],
water: [],
danger: [],

totalSpawned: {
food: 0,
water: 0,
danger: 0
},

totalConsumed: {
food: 0,
water: 0
},

totalDangerHits: 0,

// Used by the learning system to notice
// unfamiliar changes in the environment.
novelty: 0,

lastEvent: "World initialized"
};
}

// ------------------------------------------------------------
// Spawning
// ------------------------------------------------------------

function validPosition(world, x, y) {
return (
Number.isFinite(x) &&
Number.isFinite(y) &&
x >= 15 &&
y >= 15 &&
x <= world.width - 15 &&
y <= world.height - 15
);
}

function addObject(world, type, x, y) {
if (!validPosition(world, x, y)) {
return null;
}

const totalObjects =
world.food.length +
world.water.length +
world.danger.length;

if (totalObjects >= MAX_OBJECTS) {
return null;
}

const object = createObject(type, x, y);

if (type === FOOD) {
world.food.push(object);
} else if (type === WATER) {
world.water.push(object);
} else if (type === DANGER) {
world.danger.push(object);
}

world.totalSpawned[type] += 1;

world.novelty = clamp(
world.novelty + 0.08,
0,
1
);

world.lastEvent =
`${type} appeared`;

return object;
}

export function spawnFood(world, x, y) {
return addObject(
world,
FOOD,
x,
y
);
}

export function spawnWater(world, x, y) {
return addObject(
world,
WATER,
x,
y
);
}

export function spawnDanger(world, x, y) {
return addObject(
world,
DANGER,
x,
y
);
}

// ------------------------------------------------------------
// Clearing map objects
// ------------------------------------------------------------

export function clearFood(world) {
const count = world.food.length;

world.food = [];

world.lastEvent =
`Cleared ${count} food objects`;

return count;
}

export function clearWater(world) {
const count = world.water.length;

world.water = [];

world.lastEvent =
`Cleared ${count} water objects`;

return count;
}

export function clearDanger(world) {
const count = world.danger.length;

world.danger = [];

world.lastEvent =
`Cleared ${count} danger objects`;

return count;
}

export function clearMap(world) {
const food = world.food.length;
const water = world.water.length;
const danger = world.danger.length;

world.food = [];
world.water = [];
world.danger = [];

world.lastEvent =
`Map cleared: ${food} food, ${water} water, ${danger} danger`;

return {
food,
water,
danger
};
}

// ------------------------------------------------------------
// Distance helpers
// ------------------------------------------------------------

export { distance };

// ------------------------------------------------------------
// Directional sensory signals
// ------------------------------------------------------------

function directionalSignal(
creature,
objects,
side,
range = 300
) {
let strongest = 0;

for (const object of objects) {
const dx = object.x - creature.x;
const dy = object.y - creature.y;

const dist =
Math.sqrt(dx * dx + dy * dy);

if (dist > range) {
continue;
}

// Ignore objects almost directly behind
// the creature for directional sensing.
if (side === "left" && dx >= 0) {
continue;
}

if (side === "right" && dx <= 0) {
continue;
}

const strength =
1 - dist / range;

strongest = Math.max(
strongest,
strength
);
}

return clamp(
strongest,
0,
1
);
}

// ------------------------------------------------------------
// Sensory information
// ------------------------------------------------------------

export function getSensoryState(
world,
creature
) {
return {
foodLeft: directionalSignal(
creature,
world.food,
"left"
),

foodRight: directionalSignal(
creature,
world.food,
"right"
),

dangerLeft: directionalSignal(
creature,
world.danger,
"left"
),

dangerRight: directionalSignal(
creature,
world.danger,
"right"
),

waterLeft: directionalSignal(
creature,
world.water,
"left"
),

waterRight: directionalSignal(
creature,
world.water,
"right"
)
};
}

// ------------------------------------------------------------
// Full local perception
// ------------------------------------------------------------

export function getEnvironmentPerception(
world,
creature
) {
const sensory =
getSensoryState(
world,
creature
);

const nearby = [];

const allObjects = [
...world.food,
...world.water,
...world.danger
];

for (const object of allObjects) {
const dist =
distance(
creature,
object
);

if (dist <= 300) {
nearby.push({
type: object.type,
distance: dist,
dx: object.x - creature.x,
dy: object.y - creature.y
});
}
}

nearby.sort(
(a, b) =>
a.distance -
b.distance
);

return {
sensory,
nearby,
nearbyCount: nearby.length,

nearestFood:
findNearest(
creature,
world.food
),

nearestWater:
findNearest(
creature,
world.water
),

nearestDanger:
findNearest(
creature,
world.danger
)
};
}

function findNearest(
creature,
objects
) {
let nearest = null;
let nearestDistance = Infinity;

for (const object of objects) {
const d =
distance(
creature,
object
);

if (d < nearestDistance) {
nearestDistance = d;

nearest = {
object,
distance: d,
dx:
object.x -
creature.x,
dy:
object.y -
creature.y
};
}
}

return nearest;
}

// ------------------------------------------------------------
// Pattern detection
// ------------------------------------------------------------

function quantize(value) {
if (value < 0.2) {
return "0";
}

if (value < 0.5) {
return "1";
}

if (value < 0.8) {
return "2";
}

return "3";
}

export function detectPattern(
world,
creature,
sensoryState = null
) {
const sensory =
sensoryState ||
getSensoryState(
world,
creature
);

const nearbyObjects =
[
...world.food,
...world.water,
...world.danger
].filter(
object =>
distance(
creature,
object
) < 120
);

let touchingPairs = 0;

for (
let i = 0;
i < nearbyObjects.length;
i++
) {
for (
let j = i + 1;
j < nearbyObjects.length;
j++
) {
if (
distance(
nearbyObjects[i],
nearbyObjects[j]
) < 45
) {
touchingPairs += 1;
}
}
}

const objectSignature =
nearbyObjects
.map(object => object.type)
.sort()
.join(",");

return [
quantize(sensory.foodLeft),
quantize(sensory.foodRight),

quantize(sensory.dangerLeft),
quantize(sensory.dangerRight),

quantize(sensory.waterLeft),
quantize(sensory.waterRight),

Math.min(
nearbyObjects.length,
5
),

Math.min(
touchingPairs,
5
),

objectSignature || "empty"
].join("|");
}

// ------------------------------------------------------------
// Collision detection
// ------------------------------------------------------------

export function findCollision(
world,
creature
) {
const collisionDistance =
creature.radius || 12;

for (const food of world.food) {
if (
distance(
creature,
food
) <=
collisionDistance +
food.radius
) {
return {
type: FOOD,
object: food
};
}
}

for (const water of world.water) {
if (
distance(
creature,
water
) <=
collisionDistance +
water.radius
) {
return {
type: WATER,
object: water
};
}
}

for (const danger of world.danger) {
if (
distance(
creature,
danger
) <=
collisionDistance +
danger.radius
) {
return {
type: DANGER,
object: danger
};
}
}

return null;
}

// ------------------------------------------------------------
// Remove consumed / hit objects
// ------------------------------------------------------------

export function removeObject(
world,
type,
objectId
) {
let collection;

if (type === FOOD) {
collection = world.food;
} else if (type === WATER) {
collection = world.water;
} else if (type === DANGER) {
collection = world.danger;
} else {
return false;
}

const index =
collection.findIndex(
object =>
object.id === objectId
);

if (index === -1) {
return false;
}

collection.splice(
index,
1
);

return true;
}

// ------------------------------------------------------------
// World statistics
// ------------------------------------------------------------

export function getWorldStats(world) {
return {
food: world.food.length,
water: world.water.length,
danger: world.danger.length,

totalObjects:
world.food.length +
world.water.length +
world.danger.length,

foodConsumed:
world.totalConsumed.food,

waterConsumed:
world.totalConsumed.water,

dangerHits:
world.totalDangerHits,

novelty:
world.novelty,

lastEvent:
world.lastEvent
};
}

// ------------------------------------------------------------
// World update
// ------------------------------------------------------------

export function updateWorld(world) {
for (const collection of [
world.food,
world.water,
world.danger
]) {
for (const object of collection) {
object.age += 1;
}
}

// Novelty naturally fades if nothing new happens.
world.novelty *= 0.995;
}

// ------------------------------------------------------------
// Creature boundary
// ------------------------------------------------------------

export function keepCreatureInside(
world,
creature
) {
const radius =
creature.radius || 12;

creature.x = clamp(
creature.x,
radius,
world.width - radius
);

creature.y = clamp(
creature.y,
radius,
world.height - radius
);
}
