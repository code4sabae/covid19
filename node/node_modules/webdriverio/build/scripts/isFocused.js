"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * checks if given element is focused
 * @param  {HTMLElement} elem  element to check
 * @return {Boolean}           true if element is focused
 */
function isFocused(elem) {
    return elem === document.activeElement;
}
exports.default = isFocused;
