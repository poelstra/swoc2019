import "source-map-support/register";

import { Robot, Direction } from "./robot";
import { Maze } from "./maze";
import { delay, never } from "./util";
import { diff, point, angle, rad2deg } from "./point";
import { Game } from "./game";
import { MotionController } from "./motion";

const BOT_NAME = "Martin";

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
    });
    return never();
}

async function motionController(): Promise<never> {
    const path = [
        point(0.4, 0.4),
        point(0.6, 0.4),
        point(0.6, 0.6),
        point(0.4, 0.6),
    ];
    let i = 0;
    while (true) {
        await delay(500);
        const reached = await motion.moveTo(path[i]);
        console.log(
            game.frame.gameTick,
            i,
            path[i],
            game.myBot.position,
            reached
        );
        if (reached) {
            i++;
            if (i >= path.length) {
                i = 0;
            }
        }
    }
}

async function main(): Promise<void> {
    await Promise.all([
        robotController(),
        mazeController(),
        motionController(),
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
