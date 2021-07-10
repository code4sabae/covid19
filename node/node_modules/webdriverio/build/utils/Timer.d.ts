/**
 * Promise-based Timer. Execute fn every tick.
 * When fn is resolved — timer will stop
 * @param {Number} delay - delay between ticks
 * @param {Number} timeout - after that time timer will stop
 * @param {Function} fn - function that returns promise. will execute every tick
 * @param {Boolean} leading - should be function invoked on start
 * @return {promise} Promise-based Timer.
 */
declare class Timer {
    private _delay;
    private _timeout;
    private _fn;
    private _leading;
    private _conditionExecutedCnt;
    private _resolve;
    private _reject;
    private _startTime?;
    private _ticks;
    private _timeoutId?;
    private _mainTimeoutId?;
    private _lastError?;
    constructor(_delay: number, _timeout: number, _fn: Function, _leading?: boolean);
    private _start;
    private _stop;
    private _stopMain;
    private _tick;
    private _checkCondition;
    private _hasTime;
    private _wasConditionExecuted;
}
export default Timer;
//# sourceMappingURL=Timer.d.ts.map