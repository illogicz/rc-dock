export const groupClassNames = (groupNames = '') => groupNames
    .split(' ')
    .filter((value) => value !== '')
    .map((name) => `dock-style-${name}`);
export function isPanel(data) {
    return typeof data !== 'string' && 'tabs' in data;
}
export function isBox(data) {
    return typeof data !== 'string' && 'children' in data;
}
export function isTab(data) {
    return typeof data !== 'string' && !isPanel(data) && !isBox(data);
}
export function floatData(data) {
    var _a, _b;
    if (((_a = data.parent) === null || _a === void 0 ? void 0 : _a.mode) === 'float' || ((_b = data.parent) === null || _b === void 0 ? void 0 : _b.mode) === 'window') {
        let { x, y, z, w, h } = data;
        return { x, y, z, w, h };
    }
    else {
        return {};
    }
}
export function rootMode(el) {
    var _a;
    while (el === null || el === void 0 ? void 0 : el.parent)
        el = el.parent;
    return (_a = el) === null || _a === void 0 ? void 0 : _a.mode;
}
