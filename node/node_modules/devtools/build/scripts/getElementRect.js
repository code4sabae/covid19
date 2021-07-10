"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * get element rect
 */
function getElementRect(html, elem) {
    const { x, y, width, height } = elem.getBoundingClientRect();
    return { x, y, width, height };
}
exports.default = getElementRect;
