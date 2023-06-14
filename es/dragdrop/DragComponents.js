import * as React from "react";
import { getFloatPanelSize, nextZIndex } from "../Algorithm";
import { DockContextType } from "../DockData";
import { DragDropDiv } from "./DragDropDiv";
import { DragState } from "./DragManager";
import { isBox, isPanel } from "../Utils";
export class FloatHeader extends React.PureComponent {
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
                if (isPanel(data)) {
                    // hide the panel, but not create drag layer element
                    event.setData({ panel: data, tabGroup: data.group }, dockId);
                    event.startDrag(null, null);
                }
            }
            else if (isPanel(data)) {
                let tabGroup = this.context.getGroup(data.group);
                let [panelWidth, panelHeight] = getFloatPanelSize(null, tabGroup);
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
                    const id = isPanel(data) ? data.activeId : undefined;
                    this.context.onSilentChange(id, 'move');
                }
            }
        };
        this.onDragOver = (e) => {
            var _a;
            let { data } = this.props;
            if (isBox(data))
                return e.reject();
            let dockId = this.context.getDockId();
            const tab = DragState.getData("tab", dockId);
            const panel = (_a = DragState.getData("panel", dockId)) !== null && _a !== void 0 ? _a : tab.parent;
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
            if (isBox(data))
                return e.reject();
            let dockId = this.context.getDockId();
            const tab = DragState.getData("tab", dockId);
            const panel = DragState.getData("panel", dockId);
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
            let newZ = nextZIndex(z);
            if (newZ !== z) {
                data.z = newZ;
                (_b = (_a = this.props).onUpdate) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
        };
    }
    render() {
        var _a, _b;
        const isMax = ((_a = this.props.data.parent) === null || _a === void 0 ? void 0 : _a.mode) === "maximize";
        return (React.createElement(DragDropDiv, { onDragStartT: isMax ? undefined : this.onDragStart, onDragMoveT: this.onDragMove, onDragEndT: this.onDragEnd, onDragOverT: this.onDragOver, onDropT: this.onDrop, onKeyDown: this.props.onKeyDown, className: "dock-bar " + ((_b = this.props.className) !== null && _b !== void 0 ? _b : ""), getRef: this.props.getRef, tabIndex: -1 }, this.props.children));
    }
}
FloatHeader.contextType = DockContextType;
