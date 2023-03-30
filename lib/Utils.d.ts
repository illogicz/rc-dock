import { BoxData, PanelData, TabData, FloatBase, BoxChild } from "./DockData";
export declare const groupClassNames: (groupNames?: string) => string[];
export declare function isPanel(data: BoxData | PanelData | TabData | string): data is PanelData;
export declare function isBox(data: BoxData | PanelData | TabData | string): data is BoxData;
export declare function isTab(data: BoxData | PanelData | TabData | string): data is TabData;
export declare function floatData(data: PanelData | BoxData): FloatBase;
export declare function rootMode(el: BoxChild): import("./DockData").DockMode;
