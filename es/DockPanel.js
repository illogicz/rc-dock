import * as React from "react";
import { DockContextType } from "./DockData";
import { DockTabs } from "./DockTabs";
import { DragDropDiv } from "./dragdrop/DragDropDiv";
import { DragState } from "./dragdrop/DragManager";
import { DockDropLayer } from "./DockDropLayer";
import { nextZIndex } from "./Algorithm";
import { DockDropEdge } from "./DockDropEdge";
import { groupClassNames } from "./Utils";
import classNames from "classnames";
import { FloatResizer } from "./FloatDrag";
export class DockPanel extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => {
            this._ref = r;
            if (r) {
                let { parent } = this.props.panelData;
                if (((parent === null || parent === void 0 ? void 0 : parent.mode) === 'float')) {
                    r.addEventListener('pointerdown', this.onFloatPointerDown, { capture: true, passive: true });
                }
            }
        };
        this.state = { dropFromPanel: null, draggingHeader: false };
        this.onDragOver = (e) => {
            if (DockPanel._droppingPanel === this) {
                return;
            }
            let dockId = this.context.getDockId();
            let tab = DragState.getData('tab', dockId);
            let panel = DragState.getData('panel', dockId);
            if (tab || panel) {
                DockPanel.droppingPanel = this;
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
            let { panelData } = this.props;
            let { z } = panelData;
            let newZ = nextZIndex(z);
            if (newZ !== z) {
                panelData.z = newZ;
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
        if (this.state.dropFromPanel) {
            this.setState({ dropFromPanel: null });
        }
    }
    render() {
        var _a;
        let { dropFromPanel, draggingHeader } = this.state;
        let { panelData, size } = this.props;
        let { minWidth, minHeight, maxWidth, maxHeight, group, id, parent, panelLock } = panelData;
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
        let panelClass = classNames(groupClassNames(styleName));
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
            style.left = panelData.x;
            style.top = panelData.y;
            style.width = panelData.w;
            style.height = panelData.h;
            style.zIndex = panelData.z;
        }
        let droppingLayer;
        if (dropFromPanel && ((_a = panelData.dropMode) === null || _a === void 0 ? void 0 : _a.length) !== 0) {
            let dropFromGroup = this.context.getGroup(dropFromPanel.group);
            let dockId = this.context.getDockId();
            if (!dropFromGroup.tabLocked || DragState.getData('tab', dockId) == null) {
                // not allowed locked tab to create new panel
                let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
                droppingLayer = React.createElement(DockDropClass, { panelData: panelData, panelElement: this._ref, dropFromPanel: dropFromPanel });
            }
        }
        return (React.createElement(DragDropDiv, { getRef: this.getRef, className: cls, style: style, "data-dockid": id, onDragOverT: this.onDragOver, onClick: this.onPanelClicked },
            React.createElement(DockTabs, { panelData: panelData, setDragging: draggingHeader => this.setState({ draggingHeader }), onUpdate: () => this.forceUpdate() }),
            isFloat && React.createElement(FloatResizer, { data: this.props.panelData, onUpdate: () => this.forceUpdate() }),
            droppingLayer));
    }
    componentWillUnmount() {
        if (DockPanel._droppingPanel === this) {
            DockPanel.droppingPanel = null;
        }
        if (this._ref) {
            this._ref.removeEventListener('pointerdown', this.onFloatPointerDown, { capture: true });
        }
        this._unmounted = true;
    }
}
DockPanel.contextType = DockContextType;
