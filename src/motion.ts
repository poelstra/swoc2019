import { Game } from "./game";
import { Point, diff, rad2deg, angle, length } from "./point";
import { Direction, Robot } from "./robot";
import { delay } from "./util";

export class MotionController {
    private _game: Game;
    private _robot: Robot;

    constructor(game: Game, robot: Robot) {
        this._game = game;
        this._robot = robot;
    }

    async moveTo(destination: Point): Promise<boolean> {
        const direction = diff(this._game.pos, destination);
        const close = 1 / this._game.frame.columns / 3;

        if (length(direction) <= close) {
            return true;
        }

        const dirAngle = (rad2deg(angle(direction)) + 360) % 360;
        const botAngle = (rad2deg(angle(this._game.direction)) + 360) % 360;
        const diffAngle = (dirAngle - botAngle) % 360;

        let move: Direction;
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
        await this._robot.move(move, 999);
        return false;
    }
}
