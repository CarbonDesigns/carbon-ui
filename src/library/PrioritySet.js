export default class PrioritySet{
    constructor(count){
        this._array = new Array(count);
        this._head = -1;
        this._overflow = false;
    }

    push(element){
        var shift = this._shiftIfNecessary(element);
        if (!shift){
            if (++this._head === this._array.length){
                this._head = 0;
                this._overflow = true;
            }
        }
        this._array[this._head] = element;
    }

    findById(id){
        for (var x of this.asEnumerable()){
            if (x.id === id){
                return x;
            }
        }
        return null;
    }

    *asEnumerable(forward, cb){
        if (this._head === -1){
            return;
        }
        var tail = this._tail();
        if (forward){
            let i = tail;
            do{
                yield this._array[i];
                if (cb){
                    cb(this._array[i], i);
                }
                if (i === this._head){
                    break;
                }
                if (++i === this._array.length){
                    i = 0;
                }
            } while (i !== tail);
        }
        else{
            let i = this._head;
            do{
                yield this._array[i];
                if (cb){
                    cb(this._array[i], i);
                }
                if (i === tail){
                    break;
                }
                if (--i < 0){
                    i = this._array.length - 1;
                }
            } while (i !== this._head);
        }
    }

    toArray(forward){
        var array = [];
        for (var x of this.asEnumerable(forward)){
            array.push(x);
        }
        return array;
    }

    _tail(){
        if (!this._overflow){
            return 0;
        }
        var tail = this._head + 1;
        if (tail === this._array.length){
            tail = 0;
        }
        return tail;
    }

    _shiftIfNecessary(element){
        var shift = false;
        var lastIndex = -1;
        var generator = this.asEnumerable(true, (e, i) => {
            if (shift){
                this._array[lastIndex] = e;
            }
            else if (element.id === e.id){
                shift = true;
            }
            lastIndex = i;
        });
        while (!generator.next().done);
        return shift;
    }
}