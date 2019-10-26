import * as net from "net";
import { once, EventEmitter } from "events";
import { MazePoint } from "./point";

type ActionItemType =
    | "Coin"
    | "TreasureChest"
    | "SpikeTrap"
    | "Bottle"
    | "TestTube";

type Orientation = 0 | 90 | 180 | 270;

export interface ActionItem {
    id: number;
    type: ActionItemType;
    x: number;
    y: number;
}

export interface Bot {
    arucoId: number;
    color: number;
    forward: MazePoint;
    position: MazePoint;
    right: MazePoint;
    name: string;
    score: number;
}

export interface Cell {
    orientation: Orientation;
    type: number;
}

export interface MazeFrame {
    actionItems: ActionItem[];
    bots: Bot[];
    data: Cell[][];
    columns: number;
    rows: number;
    gameId: number;
    gameState: number;
    gameTick: number;
}

export class Maze extends EventEmitter {
    private _socket: net.Socket | undefined;
    private _host: string;
    private _port: number;

    constructor(host: string, port: number) {
        super();
        this._host = host;
        this._port = port;
    }

    async connect(): Promise<void> {
        if (this._socket) {
            return;
        }
        this._socket = net.createConnection(this._port, this._host);
        await once(this._socket, "connect");
        let buf = Buffer.alloc(0);
        this._socket.on("data", chunk => {
            buf = Buffer.concat([buf, chunk]);
            const eol = buf.indexOf("\n");
            if (eol < 0) {
                return;
            }
            const line = buf.slice(0, eol).toString();
            //console.log(line);
            buf = buf.slice(eol + 1);
            const frame = JSON.parse(line) as MazeFrame;
            this.emit("frame", frame);
        });
    }

    on(event: "frame", listener: (frame: MazeFrame) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }
}
