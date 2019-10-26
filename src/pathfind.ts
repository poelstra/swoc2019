import { MazeFrame } from "./maze";
import { AStarFinder } from "astar-typescript";
import { IPoint } from "astar-typescript/dist/interfaces/astar-interfaces";
import { Point, diff, length } from "./point";

const cellTemplate = [
    {
        // Celltype 0
        0: [0, 0],
        90: [0, 0],
        180: [0, 0],
        270: [0, 0],
    },
    {
        // Celltype 1
        0: [0, 0],
        90: [0, 0],
        180: [1, 0],
        270: [0, 1],
    },
    {
        // Celltype 2
        0: [1, 0],
        90: [0, 1],
        180: [1, 0],
        270: [0, 1],
    },
    {
        // Celltype 3
        0: [0, 1],
        90: [0, 0],
        180: [1, 0],
        270: [1, 1],
    },
    {
        // Celltype 4
        0: [1, 1],
        90: [0, 1],
        180: [1, 0],
        270: [1, 1],
    },
];

function hasSpike(frame: MazeFrame, x: number, y: number): boolean {
    let spikeDetected: boolean = false;

    frame.actionItems.forEach(item => {
        if (item.type == "SpikeTrap") {
            let spikePoint: Point = {
                x: item.x,
                y: item.y,
            };
            let cellPoint: Point = {
                x: toFrameXCoordinate(frame, x),
                y: toFrameYCoordinate(frame, y),
            };

            let p: Point = diff(spikePoint, cellPoint);
            let len = length(p);
            if (len <= 0.5 / Math.min(frame.columns, frame.rows)) {
                spikeDetected = true;
            }
        }
    });

    return spikeDetected;
}

function convertWalkingGrid(frame: MazeFrame, avoidSpike: boolean): number[][] {
    let walkingGrid: number[][] = [];
    let rowNumber: number = 0;

    frame.data.forEach(row => {
        let toRight: number[] = [];
        let toTop: number[] = [];

        row.forEach(cell => {
            let template = cellTemplate[cell.type][cell.orientation];

            //console.log("Templ:" + template);

            // Center of the cell
            if (avoidSpike && hasSpike(frame, toRight.length, rowNumber)) {
                toRight.push(1);
            } else toRight.push(0);

            toRight.push(template[0]); // Walkability to right of the cell depends on the maze template
            toTop.push(template[1]); // Walkability to top of the cell depends on the maze template
            toTop.push(1); // Bottom right corner is always a wall
        });

        walkingGrid.push(toRight);
        walkingGrid.push(toTop);
        rowNumber += 2;
    });

    return walkingGrid;
}

function toFrameXCoordinate(frame: MazeFrame, x: number): number {
    return x / (frame.columns * 2) + 0.5 / frame.columns;
}

function toFrameYCoordinate(frame: MazeFrame, y: number): number {
    return y / (frame.rows * 2) + 0.5 / frame.rows;
}

function fromFrameCoordinate(frame: MazeFrame, p: IPoint): IPoint {
    return {
        x: fromFrameXCoordinate(frame, p.x),
        y: fromFrameYCoordinate(frame, p.y),
    };
}

function fromFrameXCoordinate(frame: MazeFrame, x: number): number {
    return Math.round((x - 0.5 / frame.columns) * (frame.columns * 2));
}

function fromFrameYCoordinate(frame: MazeFrame, y: number): number {
    return Math.round((y - 0.5 / frame.rows) * (frame.rows * 2));
}

export function findPath(
    frame: MazeFrame,
    start: IPoint,
    end: IPoint,
    avoidSpike: boolean
): number[][] {
    const walkingGrid = convertWalkingGrid(frame, avoidSpike);
    //console.log(walkingGrid);

    let aStarInstance: AStarFinder;

    aStarInstance = new AStarFinder({
        grid: {
            matrix: walkingGrid,
        },
    });

    let myPathway = aStarInstance.findPath(
        fromFrameCoordinate(frame, start),
        fromFrameCoordinate(frame, end)
    );

    let path = myPathway.map(coord => [
        toFrameXCoordinate(frame, coord[0]),
        toFrameYCoordinate(frame, coord[1]),
    ]);

    return path;
}
