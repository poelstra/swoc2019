import { point, diff, unit, angle, rad2deg } from "./point";
import * as assert from "assert";

import * as exampleFrame from "./example-frame.json";
import { MazeFrame } from "./maze";

const frame: MazeFrame = exampleFrame;

describe("points", () => {
    describe("vectors", () => {
        it("works", () => {
            const p1 = point(0, 1);
            const u1 = unit(p1);
            assert.equal(u1.x, 0);
            assert.equal(u1.y, 1);

            const fortyFive = Math.sin(Math.PI * 0.25);
            assert.deepEqual(unit(point(0, 4)), point(0, 1));
            assert.deepEqual(unit(point(1, 1)), point(fortyFive, fortyFive));

            assert.deepEqual(rad2deg(angle(point(1, 0))), 0);
            assert.deepEqual(rad2deg(angle(point(0, 1))), 90);
            assert.deepEqual(rad2deg(angle(point(-1, 0))), 180);
            assert.deepEqual(rad2deg(angle(point(0, -1))), -90);
            assert.deepEqual(rad2deg(angle(point(1, 1))), 45);
        });
    });

    describe("abs", () => {
        it("works", () => {
            const source = point(0, 0);
            const dest = point(0.5, 0.5);
            const d = diff(dest, source);
        });
    });
});
