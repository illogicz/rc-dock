import * as React from "react";
import { BoxData, DockContext, PanelData } from "../DockData";
import { DragState } from "./DragManager";
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    data: PanelData | BoxData;
    size: number;
    getRef: (r: HTMLDivElement) => void;
}
interface State {
    dropFromPanel: PanelData;
    draggingHeader: boolean;
}
export declare class DragDropContainer extends React.PureComponent<Props, State> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    state: State;
    onDragOver: (e: DragState) => void;
    onDragOverOtherPanel(): void;
    onFloatPointerDown: () => void;
    onPanelClicked: (e: React.MouseEvent) => void;
    render(): React.ReactNode;
    _unmounted: boolean;
    static _droppingPanel: DragDropContainer;
    static set droppingPanel(panel: DragDropContainer);
    componentWillUnmount(): void;
}
export {};
