import { MaxPerceivedTime, MinPerceivedTime } from "../Constants";

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
            let diff = MaxPerceivedTime - MinPerceivedTime;
            let currentTime = MinPerceivedTime + (Math.random() * diff) % diff;
            this.startTime = null;
            if (spent < currentTime) {
                return Promise.resolve(data).delay(currentTime - spent);
            }
        }
        return Promise.resolve(data);
    }

    inProgress(): boolean {
        return !!this.startTime;
    }

    static start() {
        let operation = new Operation();
        operation.start();
        return operation;
    }
}