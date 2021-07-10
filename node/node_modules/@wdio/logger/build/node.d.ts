import log from 'loglevel';
declare function getLogger(name: string): log.Logger;
declare namespace getLogger {
    var waitForBuffer: () => Promise<void>;
    var setLevel: (name: string, level: log.LogLevelDesc) => void;
    var clearLogger: () => void;
    var setLogLevelsConfig: (logLevels?: Record<string, log.LogLevelDesc>, wdioLogLevel?: log.LogLevelDesc) => void;
}
export default getLogger;
export declare type Logger = log.Logger;
//# sourceMappingURL=node.d.ts.map