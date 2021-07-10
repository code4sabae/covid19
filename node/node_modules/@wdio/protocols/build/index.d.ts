import { Protocol } from './types';
import AppiumCommands from './commands/appium';
import ChromiumCommands from './commands/chromium';
import JSONWPCommands from './commands/jsonwp';
import MJSONWPCommands from './commands/mjsonwp';
import SauceLabsCommands from './commands/saucelabs';
import SeleniumCommands from './commands/selenium';
import WebDriverCommands from './commands/webdriver';
declare const WebDriverProtocol: Protocol;
declare const MJsonWProtocol: Protocol;
declare const JsonWProtocol: Protocol;
declare const AppiumProtocol: Protocol;
declare const ChromiumProtocol: Protocol;
declare const SauceLabsProtocol: Protocol;
declare const SeleniumProtocol: Protocol;
declare type WebDriverCommandsAsync = {
    [K in keyof WebDriverCommands]: (...args: Parameters<WebDriverCommands[K]>) => Promise<ReturnType<WebDriverCommands[K]>>;
};
declare type AppiumCommandsAsync = {
    [K in keyof AppiumCommands]: (...args: Parameters<AppiumCommands[K]>) => Promise<ReturnType<AppiumCommands[K]>>;
};
declare type ChromiumCommandsAsync = {
    [K in keyof ChromiumCommands]: (...args: Parameters<ChromiumCommands[K]>) => Promise<ReturnType<ChromiumCommands[K]>>;
};
declare type JSONWPCommandsAsync = {
    [K in keyof JSONWPCommands]: (...args: Parameters<JSONWPCommands[K]>) => Promise<ReturnType<JSONWPCommands[K]>>;
};
declare type MJSONWPCommandsAsync = {
    [K in keyof MJSONWPCommands]: (...args: Parameters<MJSONWPCommands[K]>) => Promise<ReturnType<MJSONWPCommands[K]>>;
};
declare type SauceLabsCommandsAsync = {
    [K in keyof SauceLabsCommands]: (...args: Parameters<SauceLabsCommands[K]>) => Promise<ReturnType<SauceLabsCommands[K]>>;
};
declare type SeleniumCommandsAsync = {
    [K in keyof SeleniumCommands]: (...args: Parameters<SeleniumCommands[K]>) => Promise<ReturnType<SeleniumCommands[K]>>;
};
export interface ProtocolCommands extends WebDriverCommands, Omit<JSONWPCommands, keyof WebDriverCommands>, AppiumCommands, ChromiumCommands, Omit<MJSONWPCommands, keyof AppiumCommands | keyof ChromiumCommands>, SauceLabsCommands, SeleniumCommands {
}
export interface ProtocolCommandsAsync extends WebDriverCommandsAsync, Omit<JSONWPCommandsAsync, keyof WebDriverCommandsAsync>, AppiumCommandsAsync, ChromiumCommandsAsync, Omit<MJSONWPCommandsAsync, keyof AppiumCommandsAsync | keyof ChromiumCommandsAsync>, SauceLabsCommandsAsync, SeleniumCommandsAsync {
}
export * from './types';
export { WebDriverProtocol, MJsonWProtocol, JsonWProtocol, AppiumProtocol, ChromiumProtocol, SauceLabsProtocol, SeleniumProtocol, AppiumCommands, ChromiumCommands, JSONWPCommands, MJSONWPCommands, SauceLabsCommands, SeleniumCommands, WebDriverCommands, WebDriverCommandsAsync, AppiumCommandsAsync, ChromiumCommandsAsync, JSONWPCommandsAsync, MJSONWPCommandsAsync, SauceLabsCommandsAsync, SeleniumCommandsAsync };
//# sourceMappingURL=index.d.ts.map