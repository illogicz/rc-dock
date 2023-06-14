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
exports.DragDropContainer = void 0;
const React = __importStar(require("react"));
const DockData_1 = require("../DockData");
const DragDropDiv_1 = require("./DragDropDiv");
const DragManager_1 = require("./DragManager");
const DockDropLayer_1 = require("../DockDropLayer");
const Algorithm_1 = require("../Algorithm");
const DockDropEdge_1 = require("../DockDropEdge");
const Utils_1 = require("../Utils");
const classnames_1 = __importDefault(require("classnames"));
const FloatResizer_1 = require("./FloatResizer");
class DragDropContainer extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => {
            this._ref = r;
            if (r) {
                let { parent } = this.props.data;
                if (((parent === null || parent === void 0 ? void 0 : parent.mode) === 'float')) {
                    r.addEventListener('pointerdown', this.onFloatPointerDown, { capture: true, passive: true });
                }
            }
            this.props.getRef;
        };
        this.state = { dropFromPanel: null, draggingHeader: false };
        this.onDragOver = (e) => {
            if (DragDropContainer._droppingPanel === this) {
                return;
            }
            let dockId = this.context.getDockId();
            let tab = DragManager_1.DragState.getData('tab', dockId);
            let panel = DragManager_1.DragState.getData('panel', dockId);
            if (tab || panel) {
                DragDropContainer.droppingPanel = this;
            }
            if (tab) {
                if (tab.parent) {
                    this.setState({ dropFromPanel: tab.parent });
                }
                else {
                    // add a fake panel
                    this.setState({ dropFromPanel: { activeId: '', tabs: [], group: tab.group } });
                }
            }
            else if (panel) {
                this.setState({ dropFromPanel: panel });
            }
        };
        this.onFloatPointerDown = () => {
            let { data } = this.props;
            let { z } = data;
            let newZ = Algorithm_1.nextZIndex(z);
            if (newZ !== z) {
                data.z = newZ;
                this.forceUpdate();
            }
        };
        this.onPanelClicked = (e) => {
            var _a;
            const target = e.nativeEvent.target;
            if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
                (_a = this._ref.querySelector('.dock-bar')) === null || _a === void 0 ? void 0 : _a.focus();
            }
        };
        this._unmounted = false;
    }
    onDragOverOtherPanel() {
        if (this.state.dropFromPanel) {
            this.setState({ dropFromPanel: null });
        }
    }
    render() {
        var _a;
        let { dropFromPanel, draggingHeader } = this.state;
        let { data, size } = this.props;
        let { minWidth, minHeight, maxWidth, maxHeight, group, id, parent, panelLock } = data;
        let styleName = group;
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
        let panelClass = classnames_1.default(Utils_1.groupClassNames(styleName));
        let isMax = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'maximize';
        let isFloat = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'float';
        let isHBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'horizontal';
        let isVBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'vertical';
        //let onPanelHeaderDragStart = this.onPanelHeaderDragStart;
        if (isMax) {
            dropFromPanel = null;
            //onPanelHeaderDragStart = null;
        }
        let cls = `dock-panel ${panelClass ? panelClass : ''}${dropFromPanel ? ' dock-panel-dropping' : ''}${draggingHeader ? ' dragging' : ''}`;
        let flex = 1;
        if (isHBox && widthFlex != null) {
            flex = widthFlex;
        }
        else if (isVBox && heightFlex != null) {
            flex = heightFlex;
        }
        let flexGrow = flex * size;
        let flexShrink = flex * 1000000;
        if (flexShrink < 1) {
            flexShrink = 1;
        }
        let style = { minWidth, minHeight, maxWidth: maxWidth || "", maxHeight: maxHeight || "", flex: `${flexGrow} ${flexShrink} ${size}px` };
        if (isFloat) {
            style.left = data.x;
            style.top = data.y;
            style.width = data.w;
            style.height = data.h;
            style.zIndex = data.z;
        }
        let droppingLayer;
        if (Utils_1.isPanel(data) && dropFromPanel && ((_a = data.dropMode) === null || _a === void 0 ? void 0 : _a.length) !== 0) {
            let dropFromGroup = this.context.getGroup(dropFromPanel.group);
            let dockId = this.context.getDockId();
            if (!dropFromGroup.tabLocked || DragManager_1.DragState.getData('tab', dockId) == null) {
                let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge_1.DockDropEdge : DockDropLayer_1.DockDropLayer;
                droppingLayer = React.createElement(DockDropClass, { panelData: data, panelElement: this._ref, dropFromPanel: dropFromPanel });
            }
        }
        return (React.createElement(DragDropDiv_1.DragDropDiv, { getRef: this.getRef, className: cls, style: style, "data-dockid": id, onDragOverT: this.onDragOver, onClick: this.onPanelClicked },
            this.props.children,
            isFloat && React.createElement(FloatResizer_1.FloatResizer, { data: this.props.data, onUpdate: () => this.forceUpdate() }),
            droppingLayer));
    }
    static set droppingPanel(panel) {
        if (DragDropContainer._droppingPanel === panel) {
            return;
        }
        if (DragDropContainer._droppingPanel) {
            DragDropContainer._droppingPanel.onDragOverOtherPanel();
        }
        DragDropContainer._droppingPanel = panel;
    }
    componentWillUnmount() {
        if (DragDropContainer._droppingPanel === this) {
            DragDropContainer.droppingPanel = null;
        }
        if (this._ref) {
            this._ref.removeEventListener('pointerdown', this.onFloatPointerDown, { capture: true });
        }
        this._unmounted = true;
    }
}
exports.DragDropContainer = DragDropContainer;
DragDropContainer.contextType = DockData_1.DockContextType;
