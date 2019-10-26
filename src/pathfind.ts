import { MazeFrame } from "./maze";
import { AStarFinder } from "astar-typescript";
import { IPoint } from "astar-typescript/dist/interfaces/astar-interfaces";

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

function convertWalkingGrid(frame: MazeFrame): number[][] {
    let walkingGrid: number[][] = [];

    frame.data.forEach(row => {
        let toRight: number[] = [];
        let toTop: number[] = [];

        row.forEach(cell => {
            let template = cellTemplate[cell.type][cell.orientation];

            //console.log("Templ:" + template);

            toRight.push(0); // Center of the cell is always walkable
            toRight.push(template[0]); // Walkability to right of the cell depends on the maze template
            toTop.push(template[1]); // Walkability to top of the cell depends on the maze template
            toTop.push(1); // Bottom right corner is always a wall
        });

        walkingGrid.push(toRight);
        walkingGrid.push(toTop);
    });

    return walkingGrid;
}

export function findPath(
    frame: MazeFrame,
    start: IPoint,
    end: IPoint
): number[][] {
    const walkingGrid = convertWalkingGrid(frame);
    //console.log(walkingGrid);
    //assert.deepEqual(rad2deg(angle(point(1, 1))), 45);

    let aStarInstance: AStarFinder;

    aStarInstance = new AStarFinder({
        grid: {
            matrix: walkingGrid,
        },
    });

    let myPathway = aStarInstance.findPath(start, end);

    let path = myPathway.map(coord => [
        coord[0] / (frame.columns * 2) + 0.5 / frame.columns,
        coord[1] / (frame.rows * 2) + 0.5 / frame.rows,
    ]);

    return path;
}
