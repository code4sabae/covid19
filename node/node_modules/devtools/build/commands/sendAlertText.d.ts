import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Send Alert Text command sets the text field of a window.prompt user prompt to the given value.
 *
 * @alias browser.sendAlertText
 * @see https://w3c.github.io/webdriver/#dfn-send-alert-text
 * @param {string} text  string to set the prompt to
 */
export default function sendAlertText(this: DevToolsDriver, { text }: {
    text: string;
}): Promise<null>;
//# sourceMappingURL=sendAlertText.d.ts.map