import {BoxData, PanelData, TabData, FloatBase, BoxChild} from "./DockData";

export const groupClassNames = (groupNames: string = ''): string[] =>
  groupNames
    .split(' ')
    .filter((value) => value !== '')
    .map((name) => `dock-style-${name}`);

export function isPanel(data: BoxData | PanelData | TabData | string): data is PanelData {
  return typeof data !== 'string' && 'tabs' in data;
}

export function isBox(data: BoxData | PanelData | TabData | string): data is BoxData {
  return typeof data !== 'string' && 'children' in data;
}

export function isTab(data: BoxData | PanelData | TabData | string): data is TabData {
  return typeof data !== 'string' && !isPanel(data) && !isBox(data);
}

export function floatData(data: PanelData | BoxData): FloatBase {
  if (data.parent?.mode === 'float' || data.parent?.mode === 'window') {
    let {x, y, z, w, h} = data;
    return {x, y, z, w, h};
  } else {
    return {}
  }
}

export function rootMode(el: BoxChild) {
  while (el?.parent) el = el.parent;
  return (el as BoxData)?.mode;
}