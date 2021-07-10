"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnyEdgeStable = exports.getAnyEdgeLatest = exports.getEdgeCanaryPath = exports.getEdgeBetaPath = exports.getEdgeDevPath = exports.getEdgePath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const which_1 = __importDefault(require("which"));
let platform = process.platform;
function getEdgeLinux(binaryNames) {
    if (process.platform !== "linux") {
        return null;
    }
    if (!Array.isArray(binaryNames)) {
        binaryNames = [binaryNames];
    }
    let paths = [];
    for (let name of binaryNames) {
        try {
            let path = which_1.default.sync(name);
            return path;
        }
        catch (e) {
            paths.push(name);
        }
    }
    throw {
        package: "edge-paths",
        message: "Edge browser not found. Please recheck your installation. \
      Here are list of executable we tried to search",
        paths,
    };
}
function getEdgeExe(edgeDirName) {
    if (process.platform !== "win32") {
        return null;
    }
    let paths = [];
    let suffix = `\\Microsoft\\${edgeDirName}\\Application\\msedge.exe`;
    let prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"]].filter((v) => !!v);
    for (let prefix of prefixes) {
        let edgePath = path_1.default.join(prefix, suffix);
        paths.push(edgePath);
        if (fs_1.default.existsSync(edgePath)) {
            return edgePath;
        }
    }
    throw {
        package: "edge-paths",
        message: "Edge browser not found. Please recheck your installation.",
        paths,
    };
}
function getEdgeDarwin(defaultPath) {
    if (process.platform !== "darwin") {
        return null;
    }
    if (fs_1.default.existsSync(defaultPath)) {
        return defaultPath;
    }
    throw {
        package: "edge-paths",
        message: `Edge browser not found. Please recheck your installation. Path ${defaultPath}`,
        path: defaultPath,
    };
}
function getEdgePath() {
    let edge = {
        linux: getEdgeLinux(["edge"]),
        darwin: getEdgeDarwin("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
        win32: getEdgeExe("Edge"),
    };
    if (platform && platform in edge) {
        return edge[platform];
    }
    throwInvalidPlatformError();
}
exports.getEdgePath = getEdgePath;
function getEdgeDevPath() {
    let edgeDev = {
        linux: getEdgeLinux("microsoft-edge-dev"),
        darwin: getEdgeDarwin("/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev"),
        win32: getEdgeExe("Edge Dev"),
    };
    if (platform && platform in edgeDev) {
        return edgeDev[platform];
    }
    throwInvalidPlatformError();
}
exports.getEdgeDevPath = getEdgeDevPath;
function getEdgeBetaPath() {
    let edgeBeta = {
        darwin: getEdgeDarwin("/Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta"),
        win32: getEdgeExe("Edge Beta"),
    };
    if (platform && platform in edgeBeta) {
        return edgeBeta[platform];
    }
    throwInvalidPlatformError();
}
exports.getEdgeBetaPath = getEdgeBetaPath;
function getEdgeCanaryPath() {
    let edgeCanary = {
        darwin: getEdgeDarwin("/Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary"),
        win32: getEdgeExe("Edge SxS"),
    };
    if (platform && platform in edgeCanary) {
        return edgeCanary[platform];
    }
    throwInvalidPlatformError();
}
exports.getEdgeCanaryPath = getEdgeCanaryPath;
function getAnyEdgeLatest() {
    try {
        return getEdgeCanaryPath();
    }
    catch (e) { }
    try {
        return getEdgeDevPath();
    }
    catch (e) { }
    try {
        return getEdgeBetaPath();
    }
    catch (e) { }
    try {
        return getEdgeDevPath();
    }
    catch (e) { }
    throw {
        package: "edge-paths",
        message: `Unable to find any path`,
    };
}
exports.getAnyEdgeLatest = getAnyEdgeLatest;
function getAnyEdgeStable() {
    try {
    }
    catch (e) {
        return getEdgePath();
    }
    try {
        return getEdgeBetaPath();
    }
    catch (e) { }
    try {
        return getEdgeDevPath();
    }
    catch (e) { }
    try {
        return getEdgeCanaryPath();
    }
    catch (e) { }
    throw {
        package: "edge-paths",
        message: `Unable to find any path`,
    };
}
exports.getAnyEdgeStable = getAnyEdgeStable;
function throwInvalidPlatformError() {
    throw {
        package: "edge-paths",
        message: "Your platform is not supported. Only mac and windows are supported currently",
    };
}
if (require.main === module) {
    function findEdge(func) {
        try {
            let path = func();
            console.log("Found path", path);
        }
        catch (e) {
            console.log("Error on finding path", e);
        }
    }
    findEdge(() => getEdgeBetaPath());
    findEdge(() => getEdgeCanaryPath());
    findEdge(() => getEdgeDevPath());
    findEdge(() => getEdgePath());
}
