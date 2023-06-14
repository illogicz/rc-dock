import * as React from "react";
import { BoxData, DockContext, PanelData } from "../DockData";
import { DragState } from "./DragManager";
interface Props {
    data: PanelData | BoxData;
    onResize?: () => void;
}
export declare class FloatResizer extends React.PureComponent<Props> {
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
    render(): React.ReactNode;
}
export {};
