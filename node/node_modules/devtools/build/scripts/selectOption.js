"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function selectOption(html, elem) {
    elem.selected = true;
    let parent = elem.parentElement;
    while (parent && parent.tagName.toLowerCase() !== 'select') {
        parent = parent.parentElement;
    }
    parent.dispatchEvent(new Event('input', { bubbles: true }));
    parent.dispatchEvent(new Event('change', { bubbles: true }));
}
exports.default = selectOption;
