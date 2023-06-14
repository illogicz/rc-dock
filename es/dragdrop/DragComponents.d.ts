import * as React from "react";
import { BoxData, DockContext, PanelData } from "../DockData";
import { DragState } from "./DragManager";
interface State {
    draggingHeader: boolean;
}
interface FloatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    data: PanelData | BoxData;
    getRef?: (div: HTMLDivElement) => void;
    setDragging: (dragging: boolean) => void;
    onUpdate: () => void;
}
export declare class FloatHeader extends React.PureComponent<FloatHeaderProps, State> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _movingX: number;
    _movingY: number;
    setDragging: (draggingHeader: boolean) => void;
    onDragStart: (event: DragState) => void;
    onDragMove: (e: DragState) => void;
    onDragEnd: (e: DragState) => void;
    onDragOver: (e: DragState) => void;
    onDrop: (e: DragState) => boolean | void;
    onDragLeave: (e: DragState) => void;
    onPointerDown: () => void;
    render(): JSX.Element;
}
export {};
