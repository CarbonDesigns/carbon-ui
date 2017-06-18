import { IPage } from "carbon-core";

export interface ITile {
    w: number;
    h: number;
    pos?: number[];
    id?: number;
    item: any;
}

type Board = boolean[][];

/**
 * Places tiles on a board with a fixed size and expands them to fill possible gaps.
 */
export default class Tiler {
    private board: Board = [];

    constructor(private rows: number, private cols: number) {
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push(true);
            }
            this.board.push(row);
        }
    }

    run(tiles: ITile[]) {
        let placedTiles: ITile[] = [];
        for (let i = 0; i < tiles.length && this.hasFreeSpace(); ++i) {
            if (this.tryPlaceTile(tiles[i])) {
                placedTiles.push(tiles[i]);
            }
        }

        if (!this.hasFreeSpace()) {
            return placedTiles;
        }

        let expanded;
        do {
            expanded = false;
            for (let i = 0; i < placedTiles.length; ++i) {
                expanded = this.tryExpandTile(placedTiles[i]) || expanded;
            }
        } while (expanded && this.hasFreeSpace());

        return placedTiles;
    }

    private tryPlaceTile(tile: ITile) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.canPlace(i, j, tile.w, tile.h)) {
                    this.placeTile(tile, i, j);
                    tile.pos = [i, j];
                    return true;
                }
            }
        }

        return false;
    }

    private tryExpandTile(tile: ITile) {
        var expanded = false;

        this.cleanTile(tile);

        //right
        if (this.canPlace(tile.pos[0], tile.pos[1], tile.w + 1, tile.h)) {
            tile.w += 1;
            expanded = true;
        }
        //left
        else if (this.canPlace(tile.pos[0], tile.pos[1] - 1, tile.w + 1, tile.h)) {
            tile.w += 1;
            tile.pos[1] -= 1;
            expanded = true;
        }
        //bottom
        else if (this.canPlace(tile.pos[0], tile.pos[1], tile.w, tile.h + 1)) {
            tile.h += 1;
            expanded = true;
        }
        //top
        else if (this.canPlace(tile.pos[0] - 1, tile.pos[1], tile.w, tile.h + 1)) {
            tile.h += 1;
            tile.pos[0] -= 1;
            expanded = true;
        }

        this.placeTile(tile, tile.pos[0], tile.pos[1]);

        return expanded;
    }

    private canPlace(i: number, j: number, w: number, h: number) {
        for (let k = j; k < j + w; k++) {
            for (let l = i; l < i + h; l++) {
                let canPlace = k >= 0 && k < this.cols
                    && l >= 0 && l < this.rows
                    && this.board[l][k];

                if (!canPlace) {
                    return false;
                }
            }
        }

        return true;
    }

    private placeTile(tile: ITile, i: number, j: number) {
        for (let k = j; k < j + tile.w; k++) {
            for (let l = i; l < i + tile.h; l++) {
                this.board[l][k] = false;
            }
        }
    }

    private cleanTile(tile: ITile) {
        let i = tile.pos[0];
        let j = tile.pos[1];
        for (let k = j; k < j + tile.w; k++) {
            for (let l = i; l < i + tile.h; l++) {
                this.board[l][k] = true;
            }
        }
    }

    private hasFreeSpace() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j]) {
                    return true;
                }
            }
        }

        return false;
    }
}