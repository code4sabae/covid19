"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * check if element is within the viewport
 * https://gist.github.com/davidtheclark/5515733#gistcomment-2113205
 *
 * Please update `isElementClickable.js` if the script is updated!
 * @param  {HTMLElement} elem  element to check
 * @return {Boolean}           true if element is within viewport
 */
function isElementInViewport(elem) {
    if (!elem.getBoundingClientRect) {
        return false;
    }
    const rect = elem.getBoundingClientRect();
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) > 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) > 0);
    return (vertInView && horInView);
}
exports.default = isElementInViewport;
