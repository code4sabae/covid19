"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getElementCSSValue(_, elem, propertyName) {
    /**
     * Have to cast to any due to https://github.com/Microsoft/TypeScript/issues/17827
     */
    return window.getComputedStyle(elem)[propertyName];
}
exports.default = getElementCSSValue;
