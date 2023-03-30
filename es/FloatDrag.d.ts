import * as React from "react";
import { BoxData, DockContext, PanelData } from "./DockData";
import { DragState } from "./dragdrop/DragManager";
interface Props {
    data: PanelData | BoxData;
    onUpdate: () => void;
}
interface State {
    draggingHeader: boolean;
}
export declare class FloatResizer extends React.PureComponent<Props, State> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _movingX: number;
    _movingY: number;
    _movingW: number;
    _movingH: number;
    _movingCorner: string;
    onCornerDragT: (e: DragState) => void;
    onCornerDragB: (e: DragState) => void;
    onCornerDragL: (e: DragState) => void;
    onCornerDragR: (e: DragState) => void;
    onCornerDragTL: (e: DragState) => void;
    onCornerDragTR: (e: DragState) => void;
    onCornerDragBL: (e: DragState) => void;
    onCornerDragBR: (e: DragState) => void;
    onCornerDrag(e: DragState, corner: string): void;
    onCornerDragMove: (e: DragState) => void;
    onCornerDragEnd: (e: DragState) => void;
    onPointerDown: () => void;
    render(): React.ReactNode;
    _unmounted: boolean;
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
