import { MazeFrame, EMPTY_FRAME, ActionItem, Bot } from "./maze";
import { EventEmitter } from "events";
import { Point, point, maze2point } from "./point";

export class Game extends EventEmitter {
    public frame: MazeFrame = EMPTY_FRAME;
    public lastFrame: MazeFrame = EMPTY_FRAME;
    public myBot: Bot = {
        arucoId: -1,
        color: 0,
        forward: [0, 0],
        name: "",
        position: [0, 0],
        right: [0, 0],
        score: 0,
    };
    public pos: Point = point(0, 0);
    public direction: Point = point(0, 1);

    private _lastItemsHash: string = "";

    constructor(public myName: string) {
        super();
    }

    update(frame: MazeFrame): void {
        this.lastFrame = frame;
        this.frame = frame;
        const newItemsHash = JSON.stringify(this.frame.actionItems);
        if (newItemsHash !== this._lastItemsHash) {
            this._lastItemsHash = newItemsHash;
            this._itemsChanged(this.frame.actionItems);
        }

        const meBots = this.frame.bots.filter(bot => bot.name === this.myName);
        if (meBots.length > 0) {
            this.myBot = meBots[0];
        }
        this.pos = maze2point(this.myBot.position);
        this.direction = maze2point(this.myBot.forward);
    }

    private _itemsChanged(items: ActionItem[]): void {
        this.emit("items", this.frame.actionItems, this.lastFrame.actionItems);
    }
}
