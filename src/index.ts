import "source-map-support/register";

import { Robot, Direction } from "./robot";
import { Maze, ChestType, ActionItem } from "./maze";
import { delay, never } from "./util";
import { diff, point, angle, rad2deg, Point, distance } from "./point";
import { Game } from "./game";
import { MotionController } from "./motion";
import { findPath } from "./pathfind";
import { checkServerIdentity } from "tls";

//const BOT_NAME = "Martin";
const BOT_NAME = "TeamRalph";

const robot = new Robot("localhost", 4243);
let game: Game = new Game(BOT_NAME);
let motion: MotionController = new MotionController(game, robot);

async function robotController(): Promise<never> {
    while (true) {
        try {
            await robot.connect();
            console.log(`Robot connected`);
            break;
        } catch {}
    }
    return never();
}

async function mazeController(): Promise<never> {
    const maze = new Maze("192.168.0.16", 9735);
    await maze.connect();
    maze.on("frame", frame => {
        if (game.frame.gameId !== frame.gameId) {
            console.log("##### NEW GAME #####");
            game = new Game(BOT_NAME);
            motion = new MotionController(game, robot);
        }
        game.update(frame);
        //console.log(frame);
    });
    return never();
}

let path: Point[] = [];

// async function motionController(): Promise<never> {
//     const path = [
//         point(0.4, 0.4),
//         point(0.6, 0.4),
//         point(0.6, 0.6),
//         point(0.4, 0.6),
//     ];
//     let i = 3;
//     while (true) {
//         await delay(500);

//         const reached = await motion.moveTo(path[i]);
//         console.log(
//             game.frame.gameTick,
//             i,
//             path[i],
//             game.myBot.position,
//             reached
//         );
//         if (reached) {
//             i++;
//             if (i >= path.length) {
//                 i = 0;
//             }
//         }
//     }
// }

async function motionController(): Promise<never> {
    /*const path = [
        point(0.4, 0.4),
        point(0.6, 0.4),
        point(0.6, 0.6),
        point(0.4, 0.6),
    ];
    let i = 3;*/
    while (true) {
        await delay(500);
        if (path.length === 0) {
            continue;
        }
        while (path.length > 0 && (await motion.moveTo(path[0]))) {
            console.log("REACHED");
            path.shift();
        }
        console.log(game.frame.gameTick, path[0], game.myBot.position);
        /*if (reached) {
            i++;
            if (i >= path.length) {
                i = 0;
            }
        }*/
    }
}

async function strategyController(): Promise<never> {
    let chest: ActionItem | undefined;
    while (true) {
        await delay(100);
        // Did chest disappear or change to the wrong type?
        if (chest) {
            chest = game.items.get(chest.id);
            if (!chest) {
                console.log(`target lost`);
            } else if (
                chest.chestType !== undefined &&
                chest.chestType !== ChestType.Full
            ) {
                console.log(`target lost: chest changed to wrong type`);
                chest = undefined;
            }
        }
        if (!chest) {
            const chests = game.frame.actionItems
                .filter(
                    item =>
                        item.type === "TreasureChest" &&
                        (item.chestType === undefined ||
                            item.chestType === ChestType.Full)
                )
                .sort((a, b) => distance(a, game.pos) - distance(b, game.pos));
            chest = chests.length ? chests[0] : undefined;
            if (chest) {
                console.log(`new target`, chest);
            }
        }
        if (!chest) {
            continue;
        }

        if (path.length > 0) {
            const lastCell = path[path.length - 1];
            if (distance(lastCell, chest) > 1 / game.frame.columns / 2) {
                console.log(`destination changed, reset path`, lastCell, chest);
                path = [];
            }
        }
        if (path.length > 0) {
            continue;
        }

        console.log(`new destination`, chest, "pos", game.pos);
        path = findPath(
            game.frame,
            game.pos,
            point(chest.x, chest.y),
            true
        ).map(p => point(p[0], p[1]));
        console.log(path);
    }
}

async function main(): Promise<void> {
    await Promise.all([
        robotController(),
        mazeController(),
        motionController(),
        strategyController(),
    ]);
}

function die(reason: unknown): void {
    console.error(`main failed: `, reason);
    process.exit(1);
}

main().catch(die);

process.on("SIGINT", async () => {
    console.log("Ctrl-C");
    await robot.stop();
    process.exit(0);
});
