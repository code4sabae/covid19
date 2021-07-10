import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Element Send Keys command scrolls into view the form control element and then sends
 * the provided keys to the element. In case the element is not keyboard-interactable,
 * an element not interactable error is returned. The key input state used for input
 * may be cleared mid-way through "typing" by sending the null key, which is U+E000 (NULL)
 *
 * @alias browser.elementSendKeys
 * @see https://w3c.github.io/webdriver/#dfn-element-send-keys
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @param {string} text       string to send as keystrokes to the element
 */
export default function elementSendKeys(this: DevToolsDriver, { elementId, text }: {
    elementId: string;
    text: string;
}): Promise<null>;
//# sourceMappingURL=elementSendKeys.d.ts.map