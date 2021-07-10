"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createWindow(url, features) {
    return window.open(url, '_blank', features);
}
exports.default = createWindow;
