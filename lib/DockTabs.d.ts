import * as React from "react";
import { DockContext, DropDirection, PanelData, TabData } from "./DockData";
import * as DragManager from "./dragdrop/DragManager";
import { DragDropHandlers } from "./dragdrop/DragDropDiv";
import { DockTabBar, DockTabBarProps } from "./DockTabBar";
import { TabNavListProps } from "rc-tabs/lib/TabNavList";
export declare class TabCache {
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    _hitAreaRef: HTMLDivElement;
    getHitAreaRef: (r: HTMLDivElement) => void;
    data: TabData;
    context: DockContext;
    content: React.ReactElement;
    constructor(context: DockContext);
    setData(data: TabData): boolean;
    onCloseClick: (e: React.MouseEvent) => void;
    onDragStart: (e: DragManager.DragState) => void;
    onDragOver: (e: DragManager.DragState) => void;
    onDragLeave: (e: DragManager.DragState) => void;
    onDrop: (e: DragManager.DragState) => void;
    getDropDirection(e: DragManager.DragState): DropDirection;
    render(): React.ReactElement;
    destroy(): void;
}
export declare type RenderDockTabBar = (props: DockTabBarProps, DefaultTabBar: typeof DockTabBar) => React.ReactElement;
interface Props extends DragDropHandlers {
    panelData: PanelData;
}
export declare class DockTabs extends React.PureComponent<Props> {
    static contextType: React.Context<DockContext>;
    static readonly propKeys: string[];
    context: DockContext;
    _cache: Map<string, TabCache>;
    cachedTabs: TabData[];
    updateTabs(tabs: TabData[]): void;
    onMaximizeClick: (e: React.MouseEvent) => void;
    onNewWindowClick: () => void;
    addNewWindowMenu(element: React.ReactElement, showWithLeftClick: boolean): JSX.Element;
    renderTabBar: (navListProps: TabNavListProps, TabNavList: React.ComponentType<TabNavListProps>) => JSX.Element;
    onTabChange: (activeId: string) => void;
    render(): React.ReactNode;
}
export {};
