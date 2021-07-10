"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Get Window Handle command returns the window handle for the current top-level browsing context.
 * It can be used as an argument to Switch To Window.
 *
 * @alias browser.getWindowHandle
 * @see https://w3c.github.io/webdriver/#dfn-get-window-handle
 * @return {string}  Returns a string which is the window handle for the current top-level browsing context.
 */
async function getWindowHandle() {
    return this.currentWindowHandle;
}
exports.default = getWindowHandle;
