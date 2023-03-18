import * as React from "react";
import { DockContext, DockMode, DropDirection, PanelData, TabGroup } from "./DockData";
import { DragState } from "./dragdrop/DragManager";
interface DockDropEdgeProps {
    panelData: PanelData;
    panelElement: HTMLElement;
    dropFromPanel: PanelData;
}
export declare class DockDropEdge extends React.PureComponent<DockDropEdgeProps, any> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    private getDirectionInternal;
    getDirection(e: DragState, group: TabGroup, samePanel: boolean, tabLength: number): {
        direction: DropDirection;
        mode?: DockMode;
        depth: number;
    };
    getActualDepth(depth: number, mode: DockMode, direction: DropDirection): number;
    onDragOver: (e: DragState) => void;
    onDragLeave: (e: DragState) => void;
    onDrop: (e: DragState) => void;
    private getSource;
    render(): React.ReactNode;
    componentWillUnmount(): void;
}
export {};
