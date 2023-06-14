import * as React from "react";
import { DockContextType } from "./DockData";
import { Divider } from "./Divider";
import { DockPanel } from "./DockPanel";
import { DragDropContainer } from "./dragdrop/DragDropContainer";
export class DockBox extends React.PureComponent {
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
            const nodes = Array.from(this._ref.children).filter(el => el.classList.contains('dock-child'));
            if (nodes.length !== children.length) {
                console.warn("children size dont match");
                debugger;
                return;
            }
            //childNodes
            let dividerChildren = [];
            for (let i = 0; i < children.length; ++i) {
                if (mode === 'vertical') {
                    dividerChildren.push({ size: nodes[i].offsetHeight, minSize: children[i].minHeight, maxSize: children[i].maxHeight });
                }
                else {
                    dividerChildren.push({ size: nodes[i].offsetWidth, minSize: children[i].minWidth, maxSize: children[i].maxWidth });
                }
            }
            return {
                element: this._ref,
                beforeDivider: dividerChildren.slice(0, idx),
                afterDivider: dividerChildren.slice(idx)
            };
        };
        this.changeSizes = (sizes) => {
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
        var _a;
        let { boxData, size } = this.props;
        let { children, mode, id, widthFlex, heightFlex } = boxData;
        let isVertical = mode === 'vertical';
        let childrenRender = [];
        for (let i = 0; i < children.length; ++i) {
            if (i > 0) {
                childrenRender.push(React.createElement(Divider, { idx: i, key: i, isVertical: isVertical, onDragEnd: this.onDragEnd, getDividerData: this.getDividerData, changeSizes: this.changeSizes }));
            }
            let child = children[i];
            if ('tabs' in child) {
                childrenRender.push(React.createElement(DockPanel, { size: child.size, panelData: child, key: child.id }));
                // render DockPanel
            }
            else if ('children' in child) {
                childrenRender.push(React.createElement(DockBox, { size: child.size, boxData: child, key: child.id }));
            }
        }
        const cls = 'dock-box ' + (isVertical ? 'dock-vbox' : 'dock-hbox');
        const flex = (_a = (isVertical ? heightFlex : widthFlex)) !== null && _a !== void 0 ? _a : 1;
        return (React.createElement(DragDropContainer, { data: boxData, getRef: this.getRef, className: cls, "data-dockid": id, flex: flex, size: size }, childrenRender));
    }
}
DockBox.contextType = DockContextType;
