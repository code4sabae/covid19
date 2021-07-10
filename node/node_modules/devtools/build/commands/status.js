"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const puppeteerPath = require.resolve('puppeteer-core');
const puppeteerPkg = require(`${path_1.default.dirname(puppeteerPath)}/package.json`);
/**
 * The Status command returns information about whether a remote end is in a state
 * in which it can create new sessions and can additionally include arbitrary meta information
 * that is specific to the implementation.
 *
 * @alias browser.status
 * @see https://w3c.github.io/webdriver/#dfn-status
 * @return {Object} returning an object with the Puppeteer version being used
 */
async function status() {
    return {
        message: '',
        ready: true,
        puppeteerVersion: puppeteerPkg.version
    };
}
exports.default = status;
