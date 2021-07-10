"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const edge_1 = __importDefault(require("./edge"));
const firefox_1 = __importDefault(require("./firefox"));
exports.default = (browserName, platform) => {
    const finder = {
        firefox: firefox_1.default,
        edge: edge_1.default
    }[browserName];
    const supportedPlatforms = Object.keys(finder);
    if (!supportedPlatforms.includes(platform)) {
        throw new Error(`Operating system ("${process.platform}") is not supported`);
    }
    return finder[platform];
};
