export type Point = {
    x: number;
    y: number;
};

export type MazePoint = [number, number];

export function maze2point(mp: MazePoint): Point {
    return {
        x: mp[0],
        y: mp[1],
    };
}

export function point(x: number, y: number) {
    return { x, y };
}

export function distance(p1: Point, p2: Point): number {
    return length(diff(p1, p2));
}

export function diff(p1: Point, p2: Point): Point {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
    };
}

/*export function abs(p1: Point): Point {
    //return
}
*/
export function length(p: Point): number {
    return Math.sqrt(p.x * p.x + p.y * p.y);
}

export function unit(p: Point): Point {
    const l = length(p);
    return {
        x: p.x / l,
        y: p.y / l,
    };
}

export function angle(p: Point): number {
    return Math.atan2(p.y, p.x);
}

export function rad2deg(rad: number): number {
    return (rad / (Math.PI * 2)) * 360;
}

export function deg2rad(deg: number): number {
    return (deg / 360) * Math.PI * 2;
}
