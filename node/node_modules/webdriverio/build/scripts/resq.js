"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.react$$ = exports.react$ = exports.waitToLoadReact = void 0;
const waitToLoadReact = function waitToLoadReact() {
    window.resq.waitToLoadReact();
};
exports.waitToLoadReact = waitToLoadReact;
const react$ = function react$(selector, props, state, reactElement) {
    props = props || {};
    state = state || {};
    let element = window.resq.resq$(selector, reactElement);
    if (Object.keys(props).length) {
        // not yet typed https://github.com/baruchvlz/resq/issues/69
        element = element.byProps(props);
    }
    if (Object.keys(state).length) {
        // not yet typed https://github.com/baruchvlz/resq/issues/69
        element = element.byState(state);
    }
    if (!element.name) {
        return { message: `React element with selector "${selector}" wasn't found` };
    }
    // resq returns an array of HTMLElements if the React component is a fragment
    // if the element is a fragment, we return the first child to be passed into the driver
    return element.isFragment && element.node
        ? element.node[0]
        : element.node;
};
exports.react$ = react$;
const react$$ = function react$$(selector, props, state, reactElement) {
    let elements = window.resq.resq$$(selector, reactElement);
    if (Object.keys(props).length) {
        // not yet typed https://github.com/baruchvlz/resq/issues/69
        elements = elements.byProps(props);
    }
    if (Object.keys(state).length) {
        // not yet typed https://github.com/baruchvlz/resq/issues/69
        elements = elements.byState(state);
    }
    if (!elements.length) {
        return [];
    }
    // resq returns an array of HTMLElements if the React component is a fragment
    // this avoids having nested arrays of nodes which the driver does not understand
    // [[div, div], [div, div]] => [div, div, div, div]
    let nodes = [];
    elements.forEach(element => {
        const { node, isFragment } = element;
        if (isFragment) {
            nodes = nodes.concat(node || []);
        }
        else if (node) {
            nodes.push(node);
        }
    });
    return [...nodes];
};
exports.react$$ = react$$;
