"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * cleans up temporary attribute that is used to query element
 * with puppeteer
 */
function cleanUp(elem, dataProperty) {
    const elems = Array.isArray(elem) ? elem : [elem];
    for (const el of elems) {
        el.removeAttribute(dataProperty);
    }
}
exports.default = cleanUp;
