import * as React from "react";
import { BoxData, DockContext, PanelData } from "../DockData";
import { DragDropHandlers } from "./DragDropDiv";
interface Props extends DragDropHandlers, React.HTMLAttributes<HTMLDivElement> {
    data: PanelData | BoxData;
    getRef?: (div: HTMLDivElement) => void;
}
export declare class DragHeader extends React.PureComponent<Props> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _movingX: number;
    _movingY: number;
    private onDragStart;
    private onDragMove;
    private onDragEnd;
    private onDragOver;
    private onDrop;
    private onDragLeave;
    render(): JSX.Element;
}
export {};
