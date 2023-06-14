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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatHeader = exports.FloatResizer = void 0;
const classnames_1 = __importDefault(require("classnames"));
const React = __importStar(require("react"));
const Algorithm_1 = require("./Algorithm");
const DockData_1 = require("./DockData");
const DragDropDiv_1 = require("./dragdrop/DragDropDiv");
const DragManager_1 = require("./dragdrop/DragManager");
const Utils_1 = require("./Utils");
class FloatResizer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onCornerDragT = (e) => {
            this.onCornerDrag(e, 't');
        };
        this.onCornerDragB = (e) => {
            this.onCornerDrag(e, 'b');
        };
        this.onCornerDragL = (e) => {
            this.onCornerDrag(e, 'l');
        };
        this.onCornerDragR = (e) => {
            this.onCornerDrag(e, 'r');
        };
        this.onCornerDragTL = (e) => {
            this.onCornerDrag(e, 'tl');
        };
        this.onCornerDragTR = (e) => {
            this.onCornerDrag(e, 'tr');
        };
        this.onCornerDragBL = (e) => {
            this.onCornerDrag(e, 'bl');
        };
        this.onCornerDragBR = (e) => {
            this.onCornerDrag(e, 'br');
        };
        this.onCornerDragMove = (e) => {
            let { data } = this.props;
            let { dx, dy } = e;
            const l = this._movingCorner.indexOf("l") >= 0;
            const r = this._movingCorner.indexOf("r") >= 0;
            const t = this._movingCorner.indexOf("t") >= 0;
            const b = this._movingCorner.indexOf("b") >= 0;
            if (l || r) {
                const right = data.x + data.w;
                let w = this._movingW + (l ? -dx : dx);
                if (data.minWidth)
                    w = Math.max(data.minWidth, w);
                else if (data.maxWidth)
                    w = Math.min(data.maxHeight, w);
                data.w = w;
                if (l)
                    data.x = right - w;
            }
            if (t || b) {
                let h = this._movingH + (t ? -dy : dy);
                if (data.minHeight)
                    h = Math.max(data.minHeight, h);
                else if (data.maxHeight)
                    h = Math.min(data.maxHeight, h);
                if (t) {
                    let bottom = data.y + data.h;
                    const layoutBottom = this.context.getLayoutSize().height - 30;
                    const y = bottom - h;
                    console.log({ y, layoutBottom });
                    if (y < 0)
                        h = bottom;
                    if (y > layoutBottom)
                        h = bottom - layoutBottom;
                    data.y = bottom - h;
                }
                data.h = h;
            }
            this.props.onUpdate();
        };
        this.onCornerDragEnd = (e) => {
            const activeId = Utils_1.isPanel(this.props.data) ? this.props.data.activeId : null;
            this.context.onSilentChange(activeId, 'move');
        };
        this.onPointerDown = () => {
            let { data } = this.props;
            let { z } = data;
            let newZ = Algorithm_1.nextZIndex(z);
            if (newZ !== z) {
                data.z = newZ;
                this.props.onUpdate();
            }
        };
        this._unmounted = false;
        // componentWillUnmount(): void {
        //   // if (DockPanel._droppingPanel === this) {
        //   //   DockPanel.droppingPanel = null;
        //   // }
        //   if (this._ref) {
        //     this._ref.removeEventListener('pointerdown', this.onFloatPointerDown, {capture: true});
        //   }
        //   this._unmounted = true;
        // }
    }
    onCornerDrag(e, corner) {
        let { parent, x, y, w, h } = this.props.data;
        //if (parent?.mode === 'float') {
        this._movingCorner = corner;
        this._movingX = x;
        this._movingY = y;
        this._movingW = w;
        this._movingH = h;
        e.startDrag(null, null);
        //}
    }
    // onClicked = (e: React.MouseEvent) => {
    //   const target = e.nativeEvent.target;
    //   if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
    //     (this._ref.querySelector('.dock-bar') as HTMLElement)?.focus();
    //   }
    // };
    render() {
        //let {draggingHeader} = this.state;
        let { data } = this.props;
        let { minWidth, minHeight, maxWidth, maxHeight, id, parent } = data;
        let styleName = "";
        let prefix = "";
        let widthFlex = 0, heightFlex = 0;
        if ('children' in data) {
            prefix = "dock-box";
        }
        else {
            let { group, panelLock } = data;
            prefix = "dock-panel";
            styleName = group;
            let tabGroup = this.context.getGroup(group);
            let { widthFlex, heightFlex } = tabGroup;
            if (panelLock) {
                let { panelStyle, widthFlex: panelWidthFlex, heightFlex: panelHeightFlex } = panelLock;
                if (panelStyle) {
                    styleName = panelStyle;
                }
                if (typeof panelWidthFlex === 'number') {
                    widthFlex = panelWidthFlex;
                }
                if (typeof panelHeightFlex === 'number') {
                    heightFlex = panelHeightFlex;
                }
            }
        }
        let panelClass = classnames_1.default(Utils_1.groupClassNames(styleName));
        let isMax = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'maximize';
        let isFloat = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'float';
        let isHBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'horizontal';
        let isVBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'vertical';
        let onHeaderDragStart = null; //this.onHeaderDragStart;
        if (isMax) {
            //      dropFromPanel = null;
            onHeaderDragStart = null;
        }
        // let cls = `${prefix} ${panelClass ? panelClass : ''}${dropFromPanel ? ` ${prefix}-dropping` : ''}${draggingHeader ? ' dragging' : ''
        //   }`;
        // let flex = 1;
        // if (isHBox && widthFlex != null) {
        //   flex = widthFlex;
        // } else if (isVBox && heightFlex != null) {
        //   flex = heightFlex;
        // }
        // let flexGrow = flex * size;
        // let flexShrink = flex * 1000000;
        // if (flexShrink < 1) {
        //   flexShrink = 1;
        // }
        // let style: React.CSSProperties = {minWidth, minHeight, maxWidth: maxWidth || "", maxHeight: maxHeight || "", flex: `${flexGrow} ${flexShrink} ${size}px`};
        // if (isFloat) {
        //   style.left = data.x;
        //   style.top = data.y;
        //   style.width = data.w;
        //   style.height = data.h;
        //   style.zIndex = data.z;
        // }
        // let droppingLayer: React.ReactNode;
        // if (dropFromPanel && data.dropMode?.length !== 0) {
        //   let dropFromGroup = this.context.getGroup(dropFromPanel.group);
        //   let dockId = this.context.getDockId();
        //   if (!dropFromGroup.tabLocked || DragState.getData('tab', dockId) == null) {
        //     // not allowed locked tab to create new panel
        //     let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
        //     droppingLayer = <DockDropClass panelData={data} panelElement={this._ref} dropFromPanel={dropFromPanel} />;
        //   }
        // }
        return React.createElement(React.Fragment, null,
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-t", className: `${prefix}-drag-size ${prefix}-drag-size-t`, onDragStartT: this.onCornerDragT, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-b", className: `${prefix}-drag-size ${prefix}-drag-size-b`, onDragStartT: this.onCornerDragB, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-l", className: `${prefix}-drag-size ${prefix}-drag-size-l`, onDragStartT: this.onCornerDragL, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-r", className: `${prefix}-drag-size ${prefix}-drag-size-r`, onDragStartT: this.onCornerDragR, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-t-l", className: `${prefix}-drag-size ${prefix}-drag-size-t-l`, onDragStartT: this.onCornerDragTL, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-t-r", className: `${prefix}-drag-size ${prefix}-drag-size-t-r`, onDragStartT: this.onCornerDragTR, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-b-l", className: `${prefix}-drag-size ${prefix}-drag-size-b-l`, onDragStartT: this.onCornerDragBL, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }),
            React.createElement(DragDropDiv_1.DragDropDiv, { key: "drag-size-b-r", className: `${prefix}-drag-size ${prefix}-drag-size-b-r`, onDragStartT: this.onCornerDragBR, onDragMoveT: this.onCornerDragMove, onDragEndT: this.onCornerDragEnd }));
    }
}
exports.FloatResizer = FloatResizer;
FloatResizer.contextType = DockData_1.DockContextType;
class FloatHeader extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.setDragging = (draggingHeader) => {
            this.setState({ draggingHeader });
            this.props.setDragging(draggingHeader);
        };
        this.onDragStart = (event) => {
            const { data } = this.props;
            const { parent, x, y, z } = data;
            const dockId = this.context.getDockId();
            if ((parent === null || parent === void 0 ? void 0 : parent.mode) === 'float') {
                this._movingX = x;
                this._movingY = y;
                if (Utils_1.isPanel(data)) {
                    // hide the panel, but not create drag layer element
                    event.setData({ panel: data, tabGroup: data.group }, dockId);
                    event.startDrag(null, null);
                }
            }
            else if (Utils_1.isPanel(data)) {
                let tabGroup = this.context.getGroup(data.group);
                let [panelWidth, panelHeight] = Algorithm_1.getFloatPanelSize(null, tabGroup);
                event.setData({ panel: data, panelSize: [panelWidth, panelHeight], tabGroup: data.group }, dockId);
                event.startDrag(null);
            }
            this.setDragging(true);
        };
        this.onDragMove = (e) => {
            var _a;
            let { data } = this.props;
            if (((_a = data.parent) === null || _a === void 0 ? void 0 : _a.mode) !== 'float') {
                return;
            }
            let { width, height } = this.context.getLayoutSize();
            data.x = this._movingX + e.dx;
            data.y = this._movingY + e.dy;
            if (width > 200 && height > 200) {
                if (data.y < 0) {
                    data.y = 0;
                }
                else if (data.y > height - 16) {
                    data.y = height - 16;
                }
                if (data.x + data.w < 16) {
                    data.x = 16 - data.w;
                }
                else if (data.x > width - 16) {
                    data.x = width - 16;
                }
            }
            this.props.onUpdate();
        };
        this.onDragEnd = (e) => {
            var _a;
            this.setDragging(false);
            if (e.dropped === false) {
                let { data } = this.props;
                if (((_a = data.parent) === null || _a === void 0 ? void 0 : _a.mode) === 'float') {
                    const id = Utils_1.isPanel(data) ? data.activeId : undefined;
                    this.context.onSilentChange(id, 'move');
                }
            }
        };
        this.onDragOver = (e) => {
            var _a;
            let { data } = this.props;
            if (Utils_1.isBox(data))
                return e.reject();
            let dockId = this.context.getDockId();
            const tab = DragManager_1.DragState.getData("tab", dockId);
            const panel = (_a = DragManager_1.DragState.getData("panel", dockId)) !== null && _a !== void 0 ? _a : tab.parent;
            if (!panel || panel.group !== data.group || panel === data) {
                e.reject();
                return;
            }
            this.context.setDropRect(e.event.target);
            e.accept('');
        };
        this.onDrop = (e) => {
            if (e.rejected)
                return false;
            let { data } = this.props;
            if (Utils_1.isBox(data))
                return e.reject();
            let dockId = this.context.getDockId();
            const tab = DragManager_1.DragState.getData("tab", dockId);
            const panel = DragManager_1.DragState.getData("panel", dockId);
            if (tab !== null && tab !== void 0 ? tab : panel) {
                this.context.dockMove(tab !== null && tab !== void 0 ? tab : panel, data.tabs[data.tabs.length - 1], "after-tab");
                return true;
            }
            return false;
        };
        this.onDragLeave = (e) => {
            this.context.setDropRect(null, 'remove', this);
        };
        this.onPointerDown = () => {
            var _a, _b;
            let { data } = this.props;
            let { z } = data;
            let newZ = Algorithm_1.nextZIndex(z);
            if (newZ !== z) {
                data.z = newZ;
                (_b = (_a = this.props).onUpdate) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
        };
    }
    render() {
        var _a, _b;
        const isMax = ((_a = this.props.data.parent) === null || _a === void 0 ? void 0 : _a.mode) === "maximize";
        return (React.createElement(DragDropDiv_1.DragDropDiv, { onDragStartT: isMax ? undefined : this.onDragStart, onDragMoveT: this.onDragMove, onDragEndT: this.onDragEnd, onDragOverT: this.onDragOver, onDropT: this.onDrop, onKeyDown: this.props.onKeyDown, className: "dock-bar " + ((_b = this.props.className) !== null && _b !== void 0 ? _b : ""), getRef: this.props.getRef, tabIndex: -1 }, this.props.children));
    }
}
exports.FloatHeader = FloatHeader;
FloatHeader.contextType = DockData_1.DockContextType;
