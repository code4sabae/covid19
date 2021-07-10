"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.INTRO_MESSAGE = exports.STATIC_RETURNS = void 0;
exports.STATIC_RETURNS = {
    driver: '[WebdriverIO REPL client]',
    browser: '[WebdriverIO REPL client]',
    $: '[Function: findElement]',
    $$: '[Function: findElements]'
};
exports.INTRO_MESSAGE = `
The execution has stopped!
You can now go into the browser or use the command line as REPL
(To exit, press ^C again or type .exit)
`;
exports.DEFAULT_CONFIG = {
    commandTimeout: 5000,
    prompt: '\u203A ',
    useGlobal: true,
    useColor: true
};
