import type DevToolsDriver from '../devtoolsdriver';
interface Action {
    duration?: number;
    type: string;
    value?: string;
    x?: number;
    y?: number;
    button?: number;
    origin?: any;
}
interface ActionsParameter {
    type?: string;
    actions: Action[];
    parameters?: {
        pointerType?: string;
    };
}
/**
 * The Perform Actions command is used to execute complex user actions.
 * See [spec](https://github.com/jlipps/simple-wd-spec#perform-actions) for more details.
 *
 * @alias browser.performActions
 * @see https://w3c.github.io/webdriver/#dfn-perform-actions
 * @param {object[]} actions  A list of objects, each of which represents an input source and its associated actions.
 */
export default function performActions(this: DevToolsDriver, { actions }: {
    actions: ActionsParameter[];
}): Promise<void>;
export {};
//# sourceMappingURL=performActions.d.ts.map