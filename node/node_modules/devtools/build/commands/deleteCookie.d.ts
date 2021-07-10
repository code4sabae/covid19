import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Delete Cookie command allows you to delete either a single cookie by parameter name,
 * or all the cookies associated with the active document's address if name is undefined.
 *
 * @alias browser.deleteCookie
 * @see https://w3c.github.io/webdriver/#dfn-delete-cookie
 * @param {string} name  name of the cookie to delete
 */
export default function deleteCookie(this: DevToolsDriver, { name }: {
    name: string;
}): Promise<null>;
//# sourceMappingURL=deleteCookie.d.ts.map