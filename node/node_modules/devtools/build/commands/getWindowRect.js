"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
/**
 * The Get Window Rect command returns the size and position on the screen of the operating system window
 * corresponding to the current top-level browsing context.
 *
 * @alias browser.getWindowRect
 * @see https://w3c.github.io/webdriver/#dfn-get-window-rect
 * @return {object}  A JSON representation of a "window rect" object. This has 4 properties: `x`, `y`, `width` and `height`.
 */
async function getWindowRect() {
    const page = this.getPageHandle();
    const viewport = await page.viewport() || {};
    return Object.assign({ width: constants_1.DEFAULT_WIDTH, height: constants_1.DEFAULT_HEIGHT, x: 0, y: 0 }, viewport);
}
exports.default = getWindowRect;
