import * as React from "react";
import { DockBox } from "./DockBox";
import { DockPanel } from "./DockPanel";
export class FloatBox extends React.PureComponent {
    render() {
        let { children } = this.props.boxData;
        let childrenRender = [];
        for (let child of children) {
            if ('tabs' in child) {
                childrenRender.push(React.createElement(DockPanel, { size: child.size, panelData: child, key: child.id }));
            }
            else if ('children' in child) {
                childrenRender.push(React.createElement(DockBox, { size: child.size, boxData: child, key: child.id }));
            }
        }
        return (React.createElement("div", { className: 'dock-box dock-fbox' }, childrenRender));
    }
}
