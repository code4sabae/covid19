/*!
 * https://github.com/gilmoreorless/css-shorthand-properties
 * MIT Licensed: https://gilmoreorless.mit-license.org/
 */
(function (exports) {
    /**
     * Data collated from multiple W3C specs: https://www.w3.org/Style/CSS/current-work
     * Only specs that are Candidate Recommendations or better are counted, with the
     * exception of some Working Drafts that have a lot of traction in browser implementations.
     * So far the WD specs included here are Animation and Transitions.
     *
     * @type {Object}
     */
    var props = exports.shorthandProperties = {
        // CSS 2.1: https://www.w3.org/TR/CSS2/propidx.html
        'list-style':      ['-type', '-position', '-image'],
        'margin':          ['-top', '-right', '-bottom', '-left'],
        'outline':         ['-width', '-style', '-color'],
        'padding':         ['-top', '-right', '-bottom', '-left'],

        // CSS Backgrounds and Borders Module Level 3: https://www.w3.org/TR/css3-background/
        'background':           ['-image', '-position', '-size', '-repeat', '-origin', '-clip', '-attachment', '-color'],
        'background-position':  ['-x', '-y'],  // Not found in the spec, but already implemented by every stable browser
        'border':               ['-width', '-style', '-color'],
        'border-color':         ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
        'border-style':         ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
        'border-width':         ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
        'border-top':           ['-width', '-style', '-color'],
        'border-right':         ['-width', '-style', '-color'],
        'border-bottom':        ['-width', '-style', '-color'],
        'border-left':          ['-width', '-style', '-color'],
        'border-radius':        ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
        'border-image':         ['-source', '-slice', '-width', '-outset', '-repeat'],

        // CSS Fonts Module Level 3: https://www.w3.org/TR/css3-fonts/
        'font':            ['-style', '-variant', '-weight', '-stretch', '-size', 'line-height', '-family'],
        'font-variant':    ['-ligatures', '-alternates', '-caps', '-numeric', '-east-asian'],

        // CSS Flexible Box Layout Module Level 1: https://www.w3.org/TR/css3-flexbox-1/
        'flex':            ['-grow', '-shrink', '-basis'],
        'flex-flow':       ['flex-direction', 'flex-wrap'],

        // CSS Grid Layout Module Level 1: https://www.w3.org/TR/css-grid-1/
        'grid':            ['-template-rows', '-template-columns', '-template-areas', '-auto-rows', '-auto-columns', '-auto-flow'],
        'grid-template':   ['-rows', '-columns', '-areas'],
        'grid-row':        ['-start', '-end'],
        'grid-column':     ['-start', '-end'],
        'grid-area':       ['grid-row-start', 'grid-column-start', 'grid-row-end', 'grid-column-end'],
        'grid-gap':        ['grid-row-gap', 'grid-column-gap'],

        // CSS Masking Module Level 1: https://www.w3.org/TR/css-masking/
        'mask':            ['-image', '-mode', '-position', '-size', '-repeat', '-origin', '-clip'],
        'mask-border':     ['-source', '-slice', '-width', '-outset', '-repeat', '-mode'],

        // CSS Multi-column Layout Module: https://www.w3.org/TR/css3-multicol/
        'columns':         ['column-width', 'column-count'],
        'column-rule':     ['-width', '-style', '-color'],

        // CSS Scroll Snap Module Level 1: https://www.w3.org/TR/css-scroll-snap-1/
        'scroll-padding':            ['-top', '-right', '-bottom', '-left'],
        'scroll-padding-block':      ['-start', '-end'],
        'scroll-padding-inline':     ['-start', '-end'],
        'scroll-snap-margin':        ['-top', '-right', '-bottom', '-left'],
        'scroll-snap-margin-block':  ['-start', '-end'],
        'scroll-snap-margin-inline': ['-start', '-end'],

        // CSS Speech Module: https://www.w3.org/TR/css3-speech/
        'cue':             ['-before', '-after'],
        'pause':           ['-before', '-after'],
        'rest':            ['-before', '-after'],

        // CSS Text Decoration Module Level 3: https://www.w3.org/TR/css-text-decor-3/
        'text-decoration': ['-line', '-style', '-color'],
        'text-emphasis':   ['-style', '-color'],

        // CSS Animations (WD): https://www.w3.org/TR/css3-animations
        'animation':       ['-name', '-duration', '-timing-function', '-delay', '-iteration-count', '-direction', '-fill-mode', '-play-state'],

        // CSS Transitions (WD): https://www.w3.org/TR/css3-transitions/
        'transition':      ['-property', '-duration', '-timing-function', '-delay'],
    };

    /**
     * Check if a CSS property is a shorthand value
     * @param  {string} property CSS property name
     * @return {boolean} True if the property is a shorthand value
     */
    exports.isShorthand = function (property) {
        return props.hasOwnProperty(property);
    };

    /**
     * Expand a shorthand property into an array of longhand properties
     * @param  {string} property CSS property name
     * @param  {boolean} recurse Expand sub-properties, when applicable - default false
     * @return {array}           List of longhand properties, or the original property if it's not a shorthand
     */
    exports.expand = function (property, recurse) {
        if (!props.hasOwnProperty(property)) {
            return [property];
        }
        return props[property].map(function (p) {
            var longhand = p.substr(0, 1) === '-' ? property + p : p;
            return recurse ? exports.expand(longhand, recurse) : longhand;
        });
    };
})((function (root) {
    // CommonJS
    if (typeof module !== 'undefined' && module.exports !== undefined) return module.exports;
    // Global `cssShorthandProps`
    return (root.cssShorthandProps = {});
})(this));
