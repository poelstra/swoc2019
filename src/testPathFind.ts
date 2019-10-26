import { findPath } from "./pathfind";
import { MazeFrame } from "./maze";

import { point, diff, unit, angle, rad2deg } from "./point";
import * as assert from "assert";

import * as exampleFrame from "./example-frame.json";

const exampleframe = exampleFrame as MazeFrame;

describe("maze", () => {
    describe("pathfinding", () => {
        it("convertMazeToWalkingGrid", () => {
            let startPos = { x: 0, y: 0 };
            let goalPos = { x: 4, y: 5 };

            let path = findPath(exampleframe, startPos, goalPos);
            console.log(path);
        });
    });
});
