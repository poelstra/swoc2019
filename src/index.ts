import * as process from "process";
import { Robot, Direction } from "./robot";
import { Maze, MazeFrame, Bot, Point } from "./maze";
import { delay, never } from "./util";
import { diff, maze2point, point, angle, rad2deg } from "./point";

const BOT_NAME = "Martin";

const robot = new Robot("localhost", 4243);
let frame: MazeFrame;
let me: Bot = {
    arucoId: -1,
    color: 0,
    forward: [0, 0],
    name: "",
    position: [0, 0],
    right: [0, 0],
    score: 0,
};

const destination = point(0.5, 0.5);

async function robotController(): Promise<never> {
    await robot.connect();
    console.log(`Robot connected`);
    await robot.move(Direction.Forward, 999);
    await delay(1000);
    await robot.stop();
    return never();
}

async function mazeController(): Promise<never> {
    const maze = new Maze("192.168.0.100", 9735);
    await maze.connect();
    maze.on("frame", f => {
        frame = f;
        const meBots = frame.bots.filter(bot => bot.name === BOT_NAME);
        if (meBots.length > 0) {
            me = meBots[0];
        }
        //console.log(frame.gameTick, me.position);
    });
    return never();
}

async function motionController(): Promise<never> {
    let move: Direction = Direction.Back;
    let oldMove: Direction = move;
    while (true) {
        await delay(500);
        const direction = diff(maze2point(me.position), destination);
        const dirAngle = (rad2deg(angle(direction)) + 360) % 360;
        const botAngle = (rad2deg(-angle(maze2point(me.forward))) + 360) % 360;
        const diffAngle = (dirAngle - botAngle) % 360;
        if (diffAngle < -10) {
            move = Direction.Right;
        } else if (diffAngle > 10) {
            move = Direction.Left;
        } else {
            move = Direction.Forward;
        }
        // if (oldMove !== move) {
        //     oldMove = move;
        //     //await robot.stop();
        //     await robot.move(move, 999);
        // }
        await robot.move(move, 999);
        if (frame) {
            console.log(
                frame.gameTick,
                me.forward,
                dirAngle,
                botAngle,
                diffAngle
            );
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
