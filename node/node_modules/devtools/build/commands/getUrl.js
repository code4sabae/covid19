"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUrl_1 = __importDefault(require("../scripts/getUrl"));
/**
 * The Get Current URL command returns the URL of the current top-level browsing context
 *
 * @alias browser.getUrl
 * @see https://w3c.github.io/webdriver/#dfn-get-current-url
 * @returns {String} current document URL of the top-level browsing context.
 */
async function getUrl() {
    const page = this.getPageHandle(true);
    return page.$eval('html', getUrl_1.default);
}
exports.default = getUrl;
