"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Divider = void 0;
const lodash_1 = require("lodash");
const React = __importStar(require("react"));
const DragDropDiv_1 = require("./dragdrop/DragDropDiv");
class BoxDataCache {
    constructor(data) {
        var _a, _b;
        this.beforeSize = 0;
        this.beforeMinSize = 0;
        this.beforeMaxSize = 0;
        this.afterSize = 0;
        this.afterMinSize = 0;
        this.afterMaxSize = 0;
        this.element = data.element;
        this.beforeDivider = data.beforeDivider;
        this.afterDivider = data.afterDivider;
        for (let child of this.beforeDivider) {
            this.beforeSize += child.size;
            if (child.minSize > 0) {
                this.beforeMinSize += child.minSize;
            }
            this.beforeMaxSize += (_a = child.maxSize) !== null && _a !== void 0 ? _a : Number.POSITIVE_INFINITY;
        }
        for (let child of this.afterDivider) {
            this.afterSize += child.size;
            if (child.minSize > 0) {
                this.afterMinSize += child.minSize;
            }
            this.afterMaxSize += (_b = child.maxSize) !== null && _b !== void 0 ? _b : Number.POSITIVE_INFINITY;
        }
    }
    getRange(before, after) {
        return new BoxDataCache({
            element: this.element,
            beforeDivider: this.beforeDivider.slice(before),
            afterDivider: this.afterDivider.slice(0, after + 1)
        });
    }
}
const shrinkable = (child) => { var _a; return child.size > ((_a = child.minSize) !== null && _a !== void 0 ? _a : 1); };
const growable = (child) => !child.maxSize || (child.size < child.maxSize);
// split size among children
function spiltSize(newSize, oldSize, children) {
    let reservedSize = -1;
    const filter = newSize > oldSize ? growable : shrinkable;
    const indexes = [];
    const sizes = children.map((child, i) => {
        if (filter(child)) {
            indexes.push(i);
        }
        else {
            newSize -= child.size;
            oldSize -= child.size;
        }
        return child.size;
    });
    let requiredMinSize = 0;
    while (requiredMinSize !== reservedSize) {
        reservedSize = requiredMinSize;
        requiredMinSize = 0;
        let ratio = (newSize - reservedSize) / (oldSize - reservedSize);
        if (!(ratio >= 0)) {
            // invalid input
            break;
        }
        for (let i of indexes) { //let i = 0; i < children.length; ++i) {
            let size = children[i].size * ratio;
            if (children[i].maxSize && (size > children[i].maxSize)) {
                size = children[i].maxSize;
            }
            if (size < children[i].minSize) {
                size = children[i].minSize;
                requiredMinSize += size;
            }
            sizes[i] = size;
        }
    }
    return sizes;
}
class Divider extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.startDrag = (e) => {
            this.boxData = new BoxDataCache(this.props.getDividerData(this.props.idx));
            //console.log(this.boxData);
            e.startDrag(this.boxData.element, null);
        };
        this.dragMove = (e) => {
            let { isVertical, changeSizes } = this.props;
            let d = isVertical ? e.dy : e.dx;
            let box = this.boxData;
            if (!(e.event.shiftKey || e.event.ctrlKey || e.event.altKey)) {
                const after = box.afterDivider.findIndex(d > 0 ? shrinkable : growable);
                // console.log(box.afterDivider[0]);
                const before = lodash_1.findLastIndex(box.beforeDivider, d > 0 ? growable : shrinkable);
                //console.log(before, after);
                if (before < 0 && after < 0)
                    return;
                box = box.getRange(before, after);
            }
            let { beforeSize, beforeMinSize, beforeMaxSize, afterSize, afterMinSize, afterMaxSize, beforeDivider, afterDivider } = box;
            //console.log(beforeDivider.length, afterDivider.length);
            const totalSize = beforeSize + afterSize;
            let newBeforeSize = beforeSize + d;
            let newAfterSize = afterSize - d;
            if (d > 0) {
                if (newAfterSize < afterMinSize) {
                    newAfterSize = afterMinSize;
                    newBeforeSize = totalSize - newAfterSize;
                }
                else if (newBeforeSize > beforeMaxSize) {
                    newBeforeSize = beforeMaxSize;
                    newAfterSize = totalSize - newBeforeSize;
                }
            }
            else {
                if (newBeforeSize < beforeMinSize) {
                    newBeforeSize = beforeMinSize;
                    newAfterSize = totalSize - newBeforeSize;
                }
                else if (newAfterSize > afterMaxSize) {
                    newAfterSize = afterMaxSize;
                    newBeforeSize = totalSize - newAfterSize;
                }
            }
            changeSizes([].concat(this.boxData.beforeDivider.slice(0, -beforeDivider.length).map(c => c.size), spiltSize(newBeforeSize, beforeSize, beforeDivider), spiltSize(newAfterSize, afterSize, afterDivider), this.boxData.afterDivider.slice(afterDivider.length).map(c => c.size)));
        };
        this.dragEnd = (e) => {
            let { onDragEnd } = this.props;
            this.boxData = null;
            if (onDragEnd) {
                onDragEnd();
            }
        };
    }
    render() {
        let { className } = this.props;
        if (!className) {
            className = 'dock-divider';
        }
        return (React.createElement(DragDropDiv_1.DragDropDiv, { className: className, onDragStartT: this.startDrag, onDragMoveT: this.dragMove, onDragEndT: this.dragEnd }));
    }
}
exports.Divider = Divider;
