import * as React from "react";
import { BoxData, DockContext, PanelData } from "./DockData";
import { DragState } from "./dragdrop/DragManager";
interface Props {
    panelData: PanelData;
    size: number;
}
interface State {
    dropFrom: PanelData | BoxData;
    draggingHeader: boolean;
}
export declare class DockPanel extends React.PureComponent<Props, State> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => HTMLDivElement;
    static _droppingPanel: DockPanel;
    static set droppingPanel(panel: DockPanel);
    state: State;
    onDragOver: (e: DragState) => void;
    onDragOverOtherPanel(): void;
    onPanelClicked: (e: React.MouseEvent) => void;
    render(): React.ReactNode;
    componentWillUnmount(): void;
}
export {};
