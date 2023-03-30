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
exports.DockBox = void 0;
const React = __importStar(require("react"));
const DockData_1 = require("./DockData");
const Divider_1 = require("./Divider");
const DockPanel_1 = require("./DockPanel");
const FloatDrag_1 = require("./FloatDrag");
class DockBox extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => {
            this._ref = r;
        };
        this.getDividerData = (idx) => {
            if (!this._ref) {
                return null;
            }
            let { children, mode } = this.props.boxData;
            let nodes = this._ref.childNodes;
            if (nodes.length < children.length * 2 - 1) {
                return;
            }
            let dividerChildren = [];
            for (let i = 0; i < children.length; ++i) {
                if (mode === 'vertical') {
                    dividerChildren.push({ size: nodes[i * 2].offsetHeight, minSize: children[i].minHeight, maxSize: children[i].maxHeight });
                }
                else {
                    dividerChildren.push({ size: nodes[i * 2].offsetWidth, minSize: children[i].minWidth, maxSize: children[i].maxWidth });
                }
            }
            return {
                element: this._ref,
                beforeDivider: dividerChildren.slice(0, idx),
                afterDivider: dividerChildren.slice(idx)
            };
        };
        this.changeSizes = (sizes) => {
            console.log(sizes);
            let { children } = this.props.boxData;
            if (children.length !== sizes.length) {
                return;
            }
            for (let i = 0; i < children.length; ++i) {
                children[i].size = sizes[i];
            }
            this.forceUpdate();
        };
        this.onDragEnd = () => {
            this.context.onSilentChange(null, 'move');
        };
    }
    render() {
        let { boxData } = this.props;
        let { minWidth, minHeight, maxWidth, maxHeight, size, children, mode, id, widthFlex, heightFlex, parent } = boxData;
        let isVertical = mode === 'vertical';
        let childrenRender = [];
        for (let i = 0; i < children.length; ++i) {
            if (i > 0) {
                childrenRender.push(React.createElement(Divider_1.Divider, { idx: i, key: i, isVertical: isVertical, onDragEnd: this.onDragEnd, getDividerData: this.getDividerData, changeSizes: this.changeSizes }));
            }
            let child = children[i];
            if ('tabs' in child) {
                childrenRender.push(React.createElement(DockPanel_1.DockPanel, { size: child.size, panelData: child, key: child.id }));
                // render DockPanel
            }
            else if ('children' in child) {
                childrenRender.push(React.createElement(DockBox, { size: child.size, boxData: child, key: child.id }));
            }
        }
        let cls;
        let flex = 1;
        if (mode === 'vertical') {
            cls = 'dock-box dock-vbox';
            if (widthFlex != null) {
                flex = widthFlex;
            }
        }
        else {
            // since special boxes dont reuse this render function, this can only be horizontal box
            cls = 'dock-box dock-hbox';
            if (heightFlex != null) {
                flex = heightFlex;
            }
        }
        let flexGrow = flex * size;
        let flexShrink = flex * 1000000;
        if (flexShrink < 1) {
            flexShrink = 1;
        }
        const style = { minWidth, minHeight, maxWidth, maxHeight, flex: `${flexGrow} ${flexShrink} ${size}px` };
        const isFloat = (parent === null || parent === void 0 ? void 0 : parent.mode) === "float";
        if (isFloat) {
            style.left = boxData.x;
            style.top = boxData.y;
            style.width = boxData.w;
            style.height = boxData.h;
            style.zIndex = boxData.z;
            style.position = "absolute";
            cls += " dock-box-float";
            childrenRender.unshift();
        }
        return (React.createElement("div", { ref: this.getRef, className: cls, "data-dockid": id, style: style },
            childrenRender,
            isFloat && React.createElement(FloatDrag_1.FloatResizer, { data: this.props.boxData, onUpdate: () => this.forceUpdate() })));
    }
}
exports.DockBox = DockBox;
DockBox.contextType = DockData_1.DockContextType;
