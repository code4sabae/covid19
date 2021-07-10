"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Back command causes the browser to traverse one step backward
 * in the joint session history of the current top-level browsing context.
 * This is equivalent to pressing the back button in the browser chrome or calling `window.history.back`.
 *
 * @alias browser.back
 * @see https://w3c.github.io/webdriver/#dfn-back
 */
async function back() {
    delete this.currentFrame;
    const page = this.getPageHandle();
    await page.goBack();
    return null;
}
exports.default = back;
