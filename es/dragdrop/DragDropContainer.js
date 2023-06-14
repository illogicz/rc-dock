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
import { nextZIndex } from "../Algorithm";
import { DockContextType } from "../DockData";
import { DragDropDiv } from "./DragDropDiv";
import { FloatResizer } from "./FloatResizer";
import { isBox } from "../Utils";
import { DragHeader } from "./DragHeader";
export class DragDropContainer extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { dragging: false };
        this.getRef = (r) => {
            var _a, _b, _c;
            this.removeEventListeners();
            this._ref = r;
            if (((_a = this.props.data.parent) === null || _a === void 0 ? void 0 : _a.mode) === 'float') {
                r === null || r === void 0 ? void 0 : r.addEventListener('pointerdown', this.onPointerDown, true);
            }
            (_c = (_b = this.props).getRef) === null || _c === void 0 ? void 0 : _c.call(_b, r);
        };
        this.onPointerDown = () => {
            let { data } = this.props;
            if (data.z !== (data.z = nextZIndex(data.z))) {
                this.update();
            }
        };
        this.update = () => this.forceUpdate();
        this.onDragMove = (e) => {
            var _a, _b;
            (_b = (_a = this.props).onDragMoveT) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            this.forceUpdate();
        };
    }
    render() {
        var _a;
        let _b = this.props, { data, children, className, style, flex, size, dragging, getRef, onDragMoveT } = _b, rest = __rest(_b, ["data", "children", "className", "style", "flex", "size", "dragging", "getRef", "onDragMoveT"]);
        let { id, minWidth, minHeight, maxWidth, maxHeight } = data;
        const isFloating = ((_a = data.parent) === null || _a === void 0 ? void 0 : _a.mode) === 'float';
        style = Object.assign(Object.assign({}, style), { minWidth, minHeight,
            maxWidth, maxHeight, flex: `${flex * size} ${Math.max(1, flex * 1000000)} ${size}px` });
        className += ' dock-child';
        let resizer = null;
        let header = null;
        if (isFloating) {
            resizer = React.createElement(FloatResizer, { data: this.props.data, onResize: this.update });
            className += ` dock-${isBox(data) ? 'box' : 'panel'}-float`;
            style = {
                left: data.x,
                top: data.y,
                width: data.w,
                height: data.h,
                zIndex: data.z,
                position: 'absolute',
            };
            if (isBox(data)) {
                header = (React.createElement(DragHeader, { onDragStartT: () => this.setState({ dragging: true }), onDragEndT: () => this.setState({ dragging: false }), onDragMoveT: () => this.forceUpdate(), data: data, className: "dock-bar", style: { height: 20, background: "#000000", position: "absolute", top: -20, left: 0, right: 0 } },
                    React.createElement("div", null, "d")));
            }
        }
        if (dragging || this.state.dragging) {
            className += ' dragging';
        }
        return (React.createElement(DragDropDiv, Object.assign({}, rest, { className: className, style: style, "data-dockid": id, onDragMoveT: this.onDragMove, getRef: this.getRef }),
            header,
            children,
            resizer));
    }
    removeEventListeners() {
        var _a;
        (_a = this._ref) === null || _a === void 0 ? void 0 : _a.removeEventListener('pointerdown', this.onPointerDown, true);
    }
    componentWillUnmount() {
        this.removeEventListeners();
    }
}
DragDropContainer.contextType = DockContextType;
