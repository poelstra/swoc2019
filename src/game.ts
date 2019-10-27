import { MazeFrame, EMPTY_FRAME, ActionItem, Bot, ChestType } from "./maze";
import { EventEmitter } from "events";
import { Point, point, maze2point, diff, distance } from "./point";

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

    public items: Map<number, ActionItem> = new Map();

    constructor(public myName: string) {
        super();
    }

    update(frame: MazeFrame): void {
        this.lastFrame = this.frame;
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
        const removedItems = new Set<ActionItem>(this.items.values());
        const newItems = new Set<ActionItem>();
        for (const item of items) {
            const existingItem = this.items.get(item.id);
            if (existingItem) {
                // already known
                removedItems.delete(existingItem);
                continue;
            }
            newItems.add(item);
        }

        for (const r of removedItems) {
            console.log("remove", r);
            const p = point(r.x, r.y);
            const bots = [...this.frame.bots];
            bots.sort(
                (a, b) =>
                    distance(maze2point(a.position), p) -
                    distance(maze2point(b.position), p)
            );
            if (bots.length > 0) {
                const closest = bots[0];
                const closestPrev = this.lastFrame.bots.find(
                    bot => bot.arucoId === closest.arucoId
                );
                if (closestPrev) {
                    const scoreDiff = closest.score - closestPrev.score;
                    console.log(`\t`, closest, `scoreDiff=${scoreDiff}`);
                    if (r.type === "TreasureChest") {
                        const chestType =
                            scoreDiff === 10
                                ? ChestType.Full
                                : scoreDiff === -5
                                ? ChestType.Mimick
                                : scoreDiff === 0
                                ? ChestType.Empty
                                : ChestType.Unknown;
                        if (
                            chestType !== ChestType.Unknown &&
                            r.chestType !== chestType
                        ) {
                            console.log(
                                `\tdetected chest=${ChestType[chestType]}`
                            );
                            r.chestType = chestType;
                        }
                    }
                }
            }
        }

        // Detect respawns of chests
        const newChests = [...newItems.values()].filter(
            item => item.type === "TreasureChest"
        );
        const removedChests = [...removedItems.values()].filter(
            item => item.type === "TreasureChest"
        );
        if (newChests.length === 1 && removedChests.length === 1) {
            const n = newChests[0];
            const r = removedChests[0];
            if (n.type === r.type) {
                if (n.type === "TreasureChest") {
                    n.chestType = r.chestType;
                }
                console.log("respawn", r, "->", n);
            }
        }

        for (const r of removedItems) {
            this.items.delete(r.id);
        }
        for (const n of newItems) {
            this.items.set(n.id, n);
            console.log("add", n);
        }
    }
}
