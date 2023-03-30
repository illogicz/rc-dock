"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootMode = exports.floatData = exports.isTab = exports.isBox = exports.isPanel = exports.groupClassNames = void 0;
const groupClassNames = (groupNames = '') => groupNames
    .split(' ')
    .filter((value) => value !== '')
    .map((name) => `dock-style-${name}`);
exports.groupClassNames = groupClassNames;
function isPanel(data) {
    return typeof data !== 'string' && 'tabs' in data;
}
exports.isPanel = isPanel;
function isBox(data) {
    return typeof data !== 'string' && 'children' in data;
}
exports.isBox = isBox;
function isTab(data) {
    return typeof data !== 'string' && !isPanel(data) && !isBox(data);
}
exports.isTab = isTab;
function floatData(data) {
    var _a, _b;
    if (((_a = data.parent) === null || _a === void 0 ? void 0 : _a.mode) === 'float' || ((_b = data.parent) === null || _b === void 0 ? void 0 : _b.mode) === 'window') {
        let { x, y, z, w, h } = data;
        return { x, y, z, w, h };
    }
    else {
        return {};
    }
}
exports.floatData = floatData;
function rootMode(el) {
    var _a;
    while (el === null || el === void 0 ? void 0 : el.parent)
        el = el.parent;
    return (_a = el) === null || _a === void 0 ? void 0 : _a.mode;
}
exports.rootMode = rootMode;
