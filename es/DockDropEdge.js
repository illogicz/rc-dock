import * as React from "react";
import { DockContextType } from "./DockData";
import { DragDropDiv } from "./dragdrop/DragDropDiv";
import { DragState } from "./dragdrop/DragManager";
export class DockDropEdge extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => {
            this._ref = r;
        };
        this.onDragOver = (e) => {
            let { direction, move, depth } = this.getDirection(e);
            if (move || !direction) {
                this.context.setDropRect(null, 'remove', this);
                if (!direction)
                    return;
            }
            else {
                let targetElement = this.props.panelElement;
                for (let i = 0; i < depth; ++i) {
                    targetElement = targetElement.parentElement;
                }
                let panelSize = DragState.getData('panelSize', this.context.getDockId());
                this.context.setDropRect(targetElement, direction, this, e, panelSize);
            }
            e.accept('');
        };
        this.onDragLeave = (e) => {
            this.context.setDropRect(null, 'remove', this);
        };
        this.onDrop = (e) => {
            let { direction, source, depth } = this.getDirection(e);
            if (!direction) {
                return;
            }
            let target = this.props.panelData;
            for (let i = 0; i < depth; ++i) {
                target = target.parent;
            }
            this.context.dockMove(source, target, direction);
        };
    }
    getDirectionInternal(e, group, samePanel, single) {
        let rect = this._ref.getBoundingClientRect();
        let widthRate = Math.min(rect.width, 500);
        let heightRate = Math.min(rect.height, 500);
        let left = (e.clientX - rect.left) / widthRate;
        let right = (rect.right - e.clientX) / widthRate;
        let top = (e.clientY - rect.top) / heightRate;
        let bottom = (rect.bottom - e.clientY) / heightRate;
        const { dropMode } = this.props.panelData;
        if (dropMode) {
            if (dropMode.indexOf('vertical') < 0) {
                if (dropMode.indexOf('top') < 0)
                    top = NaN;
                if (dropMode.indexOf('bottom') < 0)
                    bottom = NaN;
            }
            if (dropMode.indexOf('horizontal') < 0) {
                if (dropMode.indexOf('left') < 0)
                    left = NaN;
                if (dropMode.indexOf('right') < 0)
                    right = NaN;
            }
        }
        let min = Math.min(...[left, right, top, bottom].filter(n => !isNaN(n)));
        let depth = 0;
        if (group.disableDock) {
            // use an impossible min value to disable dock drop
            min = 1;
        }
        if (min < 0) {
            return { direction: null, depth: 0 };
        }
        else if (min < 0.075) {
            depth = 3; // depth 3 or 4
        }
        else if (min < 0.15) {
            depth = 1; // depth 1 or 2
        }
        else if (min < 0.3) {
            // default;
        }
        else if (group.floatable) {
            if (group.floatable === 'singleTab') {
                if (single) {
                    // singleTab can float only with one tab
                    return { direction: 'float', mode: 'float', depth: 0 };
                }
            }
            else {
                if (this.props.panelData.group !== this.props.dropFromPanel.group) {
                    return { direction: 'float', mode: 'float', depth: 0 };
                }
                else {
                    return { direction: "middle", depth: 0 };
                }
            }
        }
        switch (min) {
            case left: {
                return { direction: 'left', mode: 'horizontal', depth };
            }
            case right: {
                return { direction: 'right', mode: 'horizontal', depth };
            }
            case top: {
                return { direction: 'top', mode: 'vertical', depth };
            }
            case bottom: {
                return { direction: 'bottom', mode: 'vertical', depth };
            }
        }
        // probably a invalid input causing everything to be NaN?
        return { direction: null, depth: 0 };
    }
    getDirection(e) {
        var _a, _b;
        const dockId = this.context.getDockId();
        let tab = DragState.getData('tab', dockId);
        const panel = (_a = DragState.getData('panel', dockId)) !== null && _a !== void 0 ? _a : tab.parent;
        if (((_b = tab === null || tab === void 0 ? void 0 : tab.parent) === null || _b === void 0 ? void 0 : _b.tabs.length) === 1)
            tab = null;
        const source = tab !== null && tab !== void 0 ? tab : panel;
        if (!source)
            return { direction: null, source, depth: 0 };
        const from = this.props.dropFromPanel;
        const group = this.context.getGroup(from.group);
        const samePanel = this.props.panelData === source;
        let { depth: od, mode, direction } = this.getDirectionInternal(e, group, samePanel, !!tab);
        const depth = this.getActualDepth(od, mode, direction);
        console.log({ od, depth, mode, direction, samePanel, source, panelData: this.props.panelData });
        if (depth === 0 && samePanel) {
            return { direction: null, source, depth: 0 };
        }
        const move = direction === "float" && panel.parent.mode === "float";
        return { direction, source, move, depth };
    }
    getActualDepth(depth, mode, direction) {
        let afterPanel = (direction === 'bottom' || direction === 'right');
        if (!depth) {
            return depth;
        }
        let { panelData } = this.props;
        let previousTarget = panelData;
        let targetBox = panelData.parent;
        let lastDepth = 0;
        if (panelData.parent.mode === mode) {
            ++depth;
        }
        while (targetBox && lastDepth < depth) {
            if (targetBox.mode === mode) {
                if (afterPanel) {
                    if (targetBox.children.at(-1) !== previousTarget) {
                        // dont go deeper if current target is on different side of the box
                        break;
                    }
                }
                else {
                    if (targetBox.children[0] !== previousTarget) {
                        // dont go deeper if current target is on different side of the box
                        break;
                    }
                }
            }
            if (targetBox.mode === "float") {
                break;
            }
            previousTarget = targetBox;
            targetBox = targetBox.parent;
            ++lastDepth;
        }
        while (depth > lastDepth) {
            depth -= 2;
        }
        return depth;
    }
    getSource() {
        let dockId = this.context.getDockId();
        const tab = DragState.getData('tab', dockId);
        if ((tab === null || tab === void 0 ? void 0 : tab.parent.tabs.length) > 1) {
            return tab;
        }
        return DragState.getData('panel', dockId);
    }
    render() {
        return (React.createElement(DragDropDiv, { getRef: this.getRef, className: "dock-drop-edge", onDragOverT: this.onDragOver, onDragLeaveT: this.onDragLeave, onDropT: this.onDrop }));
    }
    componentWillUnmount() {
        this.context.setDropRect(null, 'remove', this);
    }
}
DockDropEdge.contextType = DockContextType;
