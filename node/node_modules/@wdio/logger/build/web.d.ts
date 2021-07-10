declare function getLogger(component: string): Console;
declare namespace getLogger {
    var setLevel: () => void;
    var setLogLevelsConfig: () => void;
    var waitForBuffer: () => void;
    var clearLogger: () => void;
}
export default getLogger;
//# sourceMappingURL=web.d.ts.map