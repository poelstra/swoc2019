import { findPath } from "./pathfind";
import { MazeFrame } from "./maze";

import { point, diff, unit, angle, rad2deg } from "./point";
import * as assert from "assert";

import * as exampleFrame from "./example-frame.json";

const exampleframe = exampleFrame as MazeFrame;

describe("maze", () => {
    describe("pathfinding", () => {
        it("findPath", () => {
            let startPos = { x: 0.05, y: 0.05 };
            let goalPos = { x: 0.95, y: 0.45 };

            let path = findPath(exampleframe, startPos, goalPos, true);
            console.log(path);

            let path2 = findPath(exampleframe, startPos, goalPos, false);
            console.log(path2);

            assert.notDeepStrictEqual(path, path2);
        });
    });
});
