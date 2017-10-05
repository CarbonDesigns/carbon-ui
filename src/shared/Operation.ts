import { MinPerceivedTime } from "../Constants";

export class Operation {
    private startTime: Date = null;

    constructor(public immediate = false) {
    }

    start(): Promise<void> {
        this.startTime = new Date();
        return Promise.resolve();
    }

    stop<T>(data?: T): Promise<T> {
        if (!this.immediate) {
            let spent = new Date().getTime() - this.startTime.getTime();
            this.startTime = null;
            if (spent < MinPerceivedTime) {
                return Promise.resolve(data).delay(MinPerceivedTime - spent);
            }
        }
        return Promise.resolve(data);
    }

    inProgress(): boolean {
        return !!this.startTime;
    }
}