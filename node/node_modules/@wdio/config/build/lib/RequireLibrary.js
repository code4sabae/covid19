"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequireLibrary {
    require(module) {
        return require(module);
    }
    resolve(request, options) {
        return require.resolve(request, options);
    }
}
exports.default = RequireLibrary;
