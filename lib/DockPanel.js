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
exports.DockPanel = void 0;
const classnames_1 = __importDefault(require("classnames"));
const React = __importStar(require("react"));
const DockData_1 = require("./DockData");
const DockDropEdge_1 = require("./DockDropEdge");
const DockTabs_1 = require("./DockTabs");
const Utils_1 = require("./Utils");
const DragDropContainer_1 = require("./dragdrop/DragDropContainer");
const DragManager_1 = require("./dragdrop/DragManager");
class DockPanel extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => this._ref = r;
        this.state = { dropFrom: null, draggingHeader: false };
        this.onDragOver = (e) => {
            let dockId = this.context.getDockId();
            if (DockPanel._droppingPanel === this) {
                return;
            }
            let tab = DragManager_1.DragState.getData('tab', dockId);
            let panel = DragManager_1.DragState.getData('panel', dockId);
            let box = DragManager_1.DragState.getData('box', dockId);
            if (tab || panel || box) {
                DockPanel.droppingPanel = this;
            }
            if (tab) {
                if (tab.parent) {
                    this.setState({ dropFrom: tab.parent });
                }
                else {
                    // add a fake panel
                    this.setState({ dropFrom: { activeId: '', tabs: [], group: tab.group } });
                }
            }
            else if (panel) {
                this.setState({ dropFrom: panel });
            }
            else if (box) {
                this.setState({ dropFrom: box });
            }
        };
        this.onPanelClicked = (e) => {
            var _a;
            const target = e.nativeEvent.target;
            if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
                (_a = this._ref.querySelector('.dock-bar')) === null || _a === void 0 ? void 0 : _a.focus();
            }
        };
    }
    static set droppingPanel(panel) {
        if (DockPanel._droppingPanel === panel) {
            return;
        }
        if (DockPanel._droppingPanel) {
            DockPanel._droppingPanel.onDragOverOtherPanel();
        }
        DockPanel._droppingPanel = panel;
    }
    onDragOverOtherPanel() {
        if (this.state.dropFrom) {
            this.setState({ dropFrom: null });
        }
    }
    render() {
        var _a, _b, _c;
        let { dropFrom, draggingHeader } = this.state;
        let { panelData, size } = this.props;
        let { group, parent, panelLock } = panelData;
        let styleName = group;
        let tabGroup = this.context.getGroup(group);
        let panelClass = classnames_1.default(Utils_1.groupClassNames(styleName));
        let isMax = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'maximize';
        let isHBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'horizontal';
        let isVBox = (parent === null || parent === void 0 ? void 0 : parent.mode) === 'vertical';
        const flex = (isHBox && ((_a = panelLock === null || panelLock === void 0 ? void 0 : panelLock.widthFlex) !== null && _a !== void 0 ? _a : tabGroup.widthFlex)) ||
            (isVBox && ((_b = panelLock === null || panelLock === void 0 ? void 0 : panelLock.heightFlex) !== null && _b !== void 0 ? _b : tabGroup.heightFlex)) || 1;
        if (isMax) {
            dropFrom = null;
        }
        let cls = `dock-panel ${panelClass || ''}${dropFrom ? ' dock-panel-dropping' : ''}`;
        let droppingLayer;
        if (dropFrom && ((_c = panelData.dropMode) === null || _c === void 0 ? void 0 : _c.length) !== 0) {
            let dropFromGroup = Utils_1.isPanel(dropFrom) ? this.context.getGroup(dropFrom.group) : null;
            let dockId = this.context.getDockId();
            if (!(dropFromGroup === null || dropFromGroup === void 0 ? void 0 : dropFromGroup.tabLocked) || DragManager_1.DragState.getData('tab', dockId) == null) {
                // not allowed locked tab to create new panel
                //let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
                droppingLayer = React.createElement(DockDropEdge_1.DockDropEdge, { data: panelData, panelElement: this._ref, dropFrom: dropFrom });
            }
        }
        console.log({ droppingLayer, dropFrom });
        return (React.createElement(DragDropContainer_1.DragDropContainer, { getRef: this.getRef, className: cls, flex: flex, size: size, dragging: draggingHeader, onDragOverT: this.onDragOver, onClick: this.onPanelClicked, data: panelData },
            React.createElement(DockTabs_1.DockTabs, { panelData: panelData, onDragMoveT: () => this.forceUpdate(), onDragStartT: () => this.setState({ draggingHeader: true }), onDragEndT: () => this.setState({ draggingHeader: false }) }),
            droppingLayer));
    }
    componentWillUnmount() {
        if (DockPanel._droppingPanel === this) {
            DockPanel.droppingPanel = null;
        }
    }
}
exports.DockPanel = DockPanel;
DockPanel.contextType = DockData_1.DockContextType;
