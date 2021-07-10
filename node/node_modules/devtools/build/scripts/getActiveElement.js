"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * returns active element of document
 */
function getActiveElement(_, dataProperty) {
    if (!document.activeElement) {
        return false;
    }
    document.activeElement.setAttribute(dataProperty, 'true');
    return true;
}
exports.default = getActiveElement;
