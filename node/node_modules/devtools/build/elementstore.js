"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ElementStore {
    constructor() {
        this._index = 0;
        this._elementMap = new Map();
        this._frameMap = new Map();
    }
    set(elementHandle) {
        const index = `ELEMENT-${++this._index}`;
        this._elementMap.set(index, elementHandle);
        const frame = elementHandle.executionContext().frame();
        if (frame) {
            let elementIndexes = this._frameMap.get(frame);
            if (!elementIndexes) {
                elementIndexes = new Set();
                this._frameMap.set(frame, elementIndexes);
            }
            elementIndexes.add(index);
        }
        return index;
    }
    async get(index) {
        const elementHandle = this._elementMap.get(index);
        if (!elementHandle) {
            return elementHandle;
        }
        const isElementAttachedToDOM = await elementHandle.evaluate((el) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected
            return el.isConnected;
        });
        return isElementAttachedToDOM ? elementHandle : undefined;
    }
    clear(frame) {
        if (!frame) {
            this._elementMap.clear();
            this._frameMap.clear();
            return;
        }
        const elementIndexes = this._frameMap.get(frame);
        if (elementIndexes) {
            elementIndexes.forEach((elementIndex) => this._elementMap.delete(elementIndex));
            this._frameMap.delete(frame);
        }
    }
}
exports.default = ElementStore;
