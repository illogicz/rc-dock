import type { TabNavListProps } from "rc-tabs/lib/TabNavList";
import * as React from "react";
import { PanelData } from "./DockData";
import { DragDropHandlers } from "./dragdrop/DragDropDiv";
export interface DockTabBarProps extends DragDropHandlers {
    data: PanelData;
    isMaximized: boolean;
    navListProps: TabNavListProps;
    TabNavList: React.ComponentType<TabNavListProps>;
}
export declare function DockTabBar(props: DockTabBarProps): JSX.Element;
