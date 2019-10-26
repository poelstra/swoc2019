import * as net from "net";
import { once } from "events";
import { promisify } from "util";

export enum Direction {
    Forward,
    Back,
    Left,
    Right,
}

const directions = {
    [Direction.Forward]: "f",
    [Direction.Back]: "b",
    [Direction.Left]: "w",
    [Direction.Right]: "c",
};

export class Robot {
    private _socket: net.Socket | undefined;
    private _host: string;
    private _port: number;

    constructor(host: string, port: number) {
        this._host = host;
        this._port = port;
    }

    async connect(): Promise<void> {
        if (this._socket) {
            return;
        }
        this._socket = net.createConnection(this._port, this._host);
        await once(this._socket, "connect");
    }

    private async _send(command: string): Promise<void> {
        await promisify<void>(callback => {
            process.stdout.write(command);
            if (!this._socket) {
                throw new Error("not connected");
            }
            this._socket.write(`${command}\n`, callback as any);
        })();
        process.stdout.write("\n");
    }

    public async move(direction: Direction, distance: number): Promise<void> {
        return this._send(`${directions[direction]}:${distance}`);
    }

    public async stop(): Promise<void> {
        return this._send(`s`);
    }
}
