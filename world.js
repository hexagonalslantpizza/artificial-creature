// Artificial Creature Experiment

// World / environment system

export const WORLD_WIDTH = 860;

export const WORLD_HEIGHT = 750;

export const MAX_OBJECTS = 100;

export function createWorld() {

    return {

        food: [],

        water: [],

        danger: []

    };

}

function randomPosition() {

    return {

        x: 30 + Math.random() * (WORLD_WIDTH - 60),

        y: 30 + Math.random() * (WORLD_HEIGHT - 60)

    };

}

export function spawnFood(world, x = null, y = null) {

    const position =

        x === null || y === null

            ? randomPosition()

            : { x, y };

    if (world.food.length >= MAX_OBJECTS) {

        return;

    }

    world.food.push({

        x: position.x,

        y: position.y

    });

}

export function spawnWater(world, x = null, y = null) {

    const position =

        x === null || y === null

            ? randomPosition()

            : { x, y };

    if (world.water.length >= MAX_OBJECTS) {

        return;

    }

    world.water.push({

        x: position.x,

        y: position.y

    });

}

export function spawnDanger(world, x = null, y = null) {

    const position =

        x === null || y === null

            ? randomPosition()

            : { x, y };

    if (world.danger.length >= MAX_OBJECTS) {

        return;

    }

    world.danger.push({

        x: position.x,

        y: position.y,

        cooldown: 0

    });

}

export function distance(x1, y1, x2, y2) {

    const dx = x2 - x1;

    const dy = y2 - y1;

    return Math.sqrt(

        dx * dx + dy * dy

    );

}

function directionalSignal(

    creature,

    objects

) {

    let left = 0;

    let right = 0;

    let nearestLeft = Infinity;

    let nearestRight = Infinity;

    for (const object of objects) {

        const dx = object.x - creature.x;

        const dy = object.y - creature.y;

        const dist =

            Math.sqrt(

                dx * dx +

                dy * dy

            );

        if (dist > 300) {

            continue;

        }

        const strength =

            1 - dist / 300;

        if (dx < 0) {

            left += strength;

            nearestLeft =

                Math.min(

                    nearestLeft,

                    dist

                );

        } else {

            right += strength;

            nearestRight =

                Math.min(

                    nearestRight,

                    dist

                );

        }

    }

    return {

        left: Math.min(left, 1),

        right: Math.min(right, 1),

        nearestLeft,

        nearestRight

    };

}

export function getSensoryState(

    world,

    creature

) {

    const food =

        directionalSignal(

            creature,

            world.food

        );

    const danger =

        directionalSignal(

            creature,

            world.danger

        );

    const water =

        directionalSignal(

            creature,

            world.water

        );

    return [

        food.left,

        food.right,

        danger.left,

        danger.right,

        water.left,

        water.right

    ];

}

export function detectPattern(

    world,

    creature

) {

    const senses =

        getSensoryState(

            world,

            creature

        );

    function quantize(value) {

        if (value < 0.10) return 0;

        if (value < 0.35) return 1;

        if (value < 0.65) return 2;

        if (value < 0.90) return 3;

        return 4;

    }

    const nearby = [];

    const allObjects = [

        ...world.food,

        ...world.water,

        ...world.danger

    ];

    for (const object of allObjects) {

        if (

            distance(

                creature.x,

                creature.y,

                object.x,

                object.y

            ) <= 120

        ) {

            nearby.push(object);

        }

    }

    const objectCount =

        Math.min(

            nearby.length,

            4

        );

    let touchingPairs = 0;

    for (

        let i = 0;

        i < nearby.length;

        i++

    ) {

        for (

            let j = i + 1;

            j < nearby.length;

            j++

        ) {

            if (

                distance(

                    nearby[i].x,

                    nearby[i].y,

                    nearby[j].x,

                    nearby[j].y

                ) < 28

            ) {

                touchingPairs++;

            }

        }

    }

    touchingPairs =

        Math.min(

            touchingPairs,

            3

        );

    const maxSense =

        Math.max(...senses);

    if (

        objectCount === 0 &&

        maxSense < 0.10

    ) {

        return "NONE";

    }

    const values = [

        ...senses.map(quantize),

        objectCount,

        touchingPairs

    ];

    return JSON.stringify(values);

}

export function updateDangerCooldowns(

    world

) {

    for (const danger of world.danger) {

        if (danger.cooldown > 0) {

            danger.cooldown--;

        }

    }

}

export function findCollision(

    creature,

    objects,

    radius = 14

) {

    for (

        let i = 0;

        i < objects.length;

        i++

    ) {

        const object = objects[i];

        if (

            distance(

                creature.x,

                creature.y,

                object.x,

                object.y

            ) < radius

        ) {

            return i;

        }

    }

    return -1;

}

export function keepCreatureInside(

    creature

) {

    creature.x = Math.max(

        10,

        Math.min(

            WORLD_WIDTH - 10,

            creature.x

        )

    );

    creature.y = Math.max(

        10,

        Math.min(

            WORLD_HEIGHT - 10,

            creature.y

        )

    );

}

