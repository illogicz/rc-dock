import * as React from "react";
import { BoxData, DockContext, PanelData } from "../DockData";
import { DragDropHandlers } from "./DragDropDiv";
import * as DragManager from "./DragManager";
interface Props extends DragDropHandlers, React.HTMLAttributes<HTMLDivElement> {
    data: PanelData | BoxData;
    flex: number;
    size: number;
    getRef?: (r: HTMLDivElement) => void;
    dragging?: boolean;
}
export declare class DragDropContainer extends React.Component<Props> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    state: {
        dragging: boolean;
    };
    _ref?: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    onPointerDown: () => void;
    update: () => void;
    onDragMove: (e: DragManager.DragState) => void;
    render(): React.ReactNode;
    removeEventListeners(): void;
    componentWillUnmount(): void;
}
export {};
