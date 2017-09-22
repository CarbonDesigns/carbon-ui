/**
 * A stack where components could register themselves for handling context related actions
 * such as searching or cancellation.
 */
export class ComponentStack<T> {
    private stack = [];

    push(item: T) {
        this.stack.push(item);
    }

    isTopLevel(item: T) {
        return this.stack.length > 0 && this.stack[this.stack.length - 1] === item;
    }

    pop() {
        this.stack.pop();
    }

    peek(): T | null {
        if (this.stack.length > 0) {
            return this.stack[this.stack.length - 1];
        }
        return null;
    }
}

export interface ICancellationHandler {
    onCancel();
}
export interface ISearchHandler {
    onSearch();
}

export const cancellationStack = new ComponentStack<ICancellationHandler>();
export const searchStack = new ComponentStack<ISearchHandler>();