import type { TabNavListProps } from "rc-tabs/lib/TabNavList";
import * as React from "react";
import { PanelData } from "./DockData";
export interface DockTabBarProps extends TabNavListProps {
    data: PanelData;
    onUpdate: () => void;
    isMaximized: boolean;
    setDragging: (dragging: boolean) => void;
    TabNavList: React.ComponentType<TabNavListProps>;
}
export declare function DockTabBar(props: DockTabBarProps): JSX.Element;
