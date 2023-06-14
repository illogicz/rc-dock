var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { getFloatPanelSize } from "../Algorithm";
import { DockContextType } from "../DockData";
import { isBox, isPanel } from "../Utils";
import { DragDropDiv } from "./DragDropDiv";
import { DragState } from "./DragManager";
export class DragHeader extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onDragStart = (e) => {
            var _a, _b;
            const { data } = this.props;
            const { parent, x, y } = data;
            const dockId = this.context.getDockId();
            if ((parent === null || parent === void 0 ? void 0 : parent.mode) === 'float') {
                this._movingX = x;
                this._movingY = y;
                if (isPanel(data)) {
                    // hide the panel, but not create drag layer element
                    e.setData({ panel: data, tabGroup: data.group }, dockId);
                    e.startDrag(null, null);
                }
                else if (isBox(data)) {
                    e.setData({ box: data }, dockId);
                    e.startDrag(null, null);
                }
            }
            else if (isPanel(data)) {
                let tabGroup = this.context.getGroup(data.group);
                let [panelWidth, panelHeight] = getFloatPanelSize(null, tabGroup);
                e.setData({ panel: data, panelSize: [panelWidth, panelHeight], tabGroup: data.group }, dockId);
                e.startDrag(null);
            }
            (_b = (_a = this.props).onDragStartT) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        };
        this.onDragMove = (e) => {
            var _a, _b, _c;
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
            (_c = (_b = this.props) === null || _b === void 0 ? void 0 : _b.onDragMoveT) === null || _c === void 0 ? void 0 : _c.call(_b, e);
        };
        this.onDragEnd = (e) => {
            var _a, _b, _c;
            (_b = (_a = this.props) === null || _a === void 0 ? void 0 : _a.onDragEndT) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            if (e.dropped === false) {
                let { data } = this.props;
                if (((_c = data.parent) === null || _c === void 0 ? void 0 : _c.mode) === 'float') {
                    const id = isPanel(data) ? data.activeId : undefined;
                    this.context.onSilentChange(id, 'move');
                }
            }
        };
        this.onDragOver = (e) => {
            var _a, _b, _c;
            let { data } = this.props;
            if (!isBox(data)) {
                let dockId = this.context.getDockId();
                const tab = DragState.getData("tab", dockId);
                const panel = (_a = DragState.getData("panel", dockId)) !== null && _a !== void 0 ? _a : tab === null || tab === void 0 ? void 0 : tab.parent;
                if (!panel || panel.group !== data.group || panel === data) {
                    e.reject();
                    return;
                }
                else {
                    this.context.setDropRect(e.event.target);
                    e.accept('');
                }
                (_c = (_b = this.props) === null || _b === void 0 ? void 0 : _b.onDragOverT) === null || _c === void 0 ? void 0 : _c.call(_b, e);
            }
        };
        this.onDrop = (e) => {
            var _a, _b, _c, _d;
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
                (_b = (_a = this.props).onDropT) === null || _b === void 0 ? void 0 : _b.call(_a, e);
                return true;
            }
            else {
                (_d = (_c = this.props).onDropT) === null || _d === void 0 ? void 0 : _d.call(_c, e);
                return false;
            }
        };
        this.onDragLeave = (e) => {
            var _a, _b;
            this.context.setDropRect(null, 'remove');
            (_b = (_a = this.props) === null || _a === void 0 ? void 0 : _a.onDragLeaveT) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        };
    }
    render() {
        var _a;
        const _b = this.props, { data, onDragStartT, onDragEndT, onDragMoveT, onDragOverT, onDragLeaveT, onDropT, children } = _b, rest = __rest(_b, ["data", "onDragStartT", "onDragEndT", "onDragMoveT", "onDragOverT", "onDragLeaveT", "onDropT", "children"]);
        const isMax = ((_a = data.parent) === null || _a === void 0 ? void 0 : _a.mode) === "maximize";
        return (React.createElement(DragDropDiv, Object.assign({}, rest, { onDragStartT: isMax ? undefined : this.onDragStart, onDragMoveT: this.onDragMove, onDragEndT: this.onDragEnd, onDragOverT: this.onDragOver, onDragLeaveT: this.onDragLeave, onDropT: this.onDrop, onKeyDown: this.props.onKeyDown, tabIndex: -1 }), children));
    }
}
DragHeader.contextType = DockContextType;
