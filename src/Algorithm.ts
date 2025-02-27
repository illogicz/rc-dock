import {pick} from "lodash";
import {
  BoxData,
  DockMode,
  DropDirection,
  FloatBase,
  LayoutData, maximePlaceHolderId,
  PanelData,
  placeHolderStyle, TabBase,
  TabData,
  TabGroup
} from "./DockData";
import {floatData, isBox, isPanel} from "./Utils";

const INF = Number.POSITIVE_INFINITY;

let _watchObjectChange: WeakMap<any, any> = new WeakMap();

export function getUpdatedObject<T>(obj: T): T {
  let result = _watchObjectChange.get(obj);
  if (result) {
    return getUpdatedObject(result);
  }
  return obj;
}

function clearObjectCache() {
  _watchObjectChange = new WeakMap();
}

function clone<T>(value: T, extra?: any): T {
  let newValue: any = {...value, ...extra};
  if (Array.isArray(newValue.tabs)) {
    newValue.tabs = newValue.tabs.concat();
  }
  if (Array.isArray(newValue.children)) {
    newValue.children = newValue.children.concat();
  }
  _watchObjectChange.set(value, newValue);
  return newValue;
}

function maxFlex(currentFlex: number, newFlex: number) {
  if (currentFlex == null) {
    return newFlex;
  }
  return Math.max(currentFlex, newFlex);
}

function mergeFlex(currentFlex: number, newFlex: number) {
  if (currentFlex == null) {
    return newFlex;
  }
  if (currentFlex === newFlex) {
    return newFlex;
  }
  if (currentFlex >= 1) {
    if (newFlex <= 1) {
      return 1;
    }
    return Math.min(currentFlex, newFlex);
  } else {
    if (newFlex >= 1) {
      return 1;
    }
    return Math.max(currentFlex, newFlex);
  }
}

let _idCount = 0;

export function nextId() {
  ++_idCount;
  return `+${_idCount}`;
}

let _zCount = 0;

export function nextZIndex(current?: number): number {
  if (current === _zCount) {
    // already the top
    return current;
  }
  return ++_zCount;
}


function findInPanel(panel: PanelData, id: string, filter: Filter): PanelData | TabData {
  if (panel.id === id && (filter & Filter.Panel)) {
    return panel;
  }
  if (filter & Filter.Tab) {
    for (let tab of panel.tabs) {
      if (tab.id === id) {
        return tab;
      }
    }
  }
  return null;
}

function findInBox(box: BoxData, id: string, filter: Filter): PanelData | TabData | BoxData {
  let result: PanelData | TabData | BoxData;
  if ((filter | Filter.Box) && box.id === id) {
    return box;
  }
  for (let child of box.children) {
    if ('children' in child) {
      if (result = findInBox(child, id, filter)) {
        break;
      }
    } else if ('tabs' in child) {
      if (result = findInPanel(child, id, filter)) {
        break;
      }
    }
  }
  return result;
}


export enum Filter {
  Tab = 1,
  Panel = 1 << 1,
  Box = 1 << 2,
  Docked = 1 << 3,
  Floated = 1 << 4,
  Windowed = 1 << 5,
  Max = 1 << 6,
  EveryWhere = Docked | Floated | Windowed | Max,
  AnyTab = Tab | EveryWhere,
  AnyPanel = Panel | EveryWhere,
  AnyTabPanel = Tab | Panel | EveryWhere,
  All = Tab | Panel | Box | EveryWhere,
}


export function find(layout: LayoutData, id: string, filter: Filter = Filter.AnyTabPanel): PanelData | TabData | BoxData {
  let result: PanelData | TabData | BoxData;

  if (filter & Filter.Docked) {
    result = findInBox(layout.dockbox, id, filter);
  }
  if (result) return result;

  if (filter & Filter.Floated) {
    result = findInBox(layout.floatbox, id, filter);
  }
  if (result) return result;

  if (filter & Filter.Windowed) {
    result = findInBox(layout.windowbox, id, filter);
  }
  if (result) return result;

  if (filter & Filter.Max) {
    result = findInBox(layout.maxbox, id, filter);
  }

  return result;
}

export function addNextToTab(layout: LayoutData, source: TabData | PanelData, target: TabData, direction: DropDirection): LayoutData {
  let pos = target.parent.tabs.indexOf(target);
  if (pos >= 0) {
    if (direction === 'after-tab') {
      ++pos;
    }
    return addTabToPanel(layout, source, target.parent, pos);
  }
  return layout;
}

export function addTabToPanel(layout: LayoutData, source: TabData | PanelData, panel: PanelData, idx = -1): LayoutData {
  if (idx === -1) {
    idx = panel.tabs.length;
  }

  let tabs: TabData[];
  let activeId: string;
  if ('tabs' in source) {
    // source is PanelData
    tabs = source.tabs;
    activeId = source.activeId;
  } else {
    // source is TabData
    tabs = [source];
  }

  if (tabs.length) {
    let newPanel = clone(panel);
    newPanel.tabs.splice(idx, 0, ...tabs);
    newPanel.activeId = tabs.at(-1).id;
    for (let tab of tabs) {
      tab.parent = newPanel;
    }
    if (activeId) {
      newPanel.activeId = activeId;
    }
    layout = replacePanel(layout, panel, newPanel);
  }

  return layout;
}

export function converToPanel(source: TabData | PanelData): PanelData {
  if ('tabs' in source) {
    // source is already PanelData
    return source;
  } else {
    let newPanel: PanelData = {tabs: [source], group: source.group, activeId: source.id};
    source.parent = newPanel;
    return newPanel;
  }
}

export function dockToPanel(layout: LayoutData, newItem: PanelData | BoxData, panel: PanelData, direction: DropDirection): LayoutData {
  let box = panel.parent;
  let dockMode: DockMode = (direction === 'left' || direction === 'right') ? 'horizontal' : 'vertical';
  let afterPanel = (direction === 'bottom' || direction === 'right');

  let pos = box.children.indexOf(panel);
  if (pos >= 0) {
    let newBox = clone(box);
    if (dockMode === box.mode) {
      if (afterPanel) {
        ++pos;
      }
      // HINT: The size remains the same, preventing flex-grow less than 1
      newItem.size = panel.size;
      newBox.children.splice(pos, 0, newItem);
    } else {

      let newChildBox: BoxData = {
        mode: dockMode,
        children: afterPanel ? [panel, newItem] : [newItem, panel],
        size: panel.size,
        ...floatData(panel)
      };

      panel.parent = newChildBox;
      panel.size = 200;
      newItem.parent = newChildBox;
      newItem.size = 200;
      newBox.children[pos] = newChildBox;
      newChildBox.parent = newBox;
    }
    return replaceBox(layout, box, newBox);
  }
  return layout;
}

export function dockToBox(layout: LayoutData, newItem: PanelData | BoxData, box: BoxData, direction: DropDirection): LayoutData {
  let parentBox = box.parent;
  let dockMode: DockMode = (direction === 'left' || direction === 'right') ? 'horizontal' : 'vertical';

  let afterPanel = (direction === 'bottom' || direction === 'right');

  if (parentBox) {
    let pos = parentBox.children.indexOf(box);
    if (pos >= 0) {
      let newParentBox = clone(parentBox);
      if (dockMode === parentBox.mode) {
        if (afterPanel) {
          ++pos;
        }
        newItem.size = box.size * 0.3;
        box.size *= 0.7;

        newParentBox.children.splice(pos, 0, newItem);
      } else {
        let newChildBox: BoxData = {
          mode: dockMode,
          children: afterPanel ? [box, newItem] : [newItem, box],
          size: box.size,
          ...floatData(box)
        };

        box.parent = newChildBox;
        box.size = 280;
        newItem.parent = newChildBox;
        newItem.size = 120;
        newParentBox.children[pos] = newChildBox;
      }
      return replaceBox(layout, parentBox, newParentBox);
    }
  } else if (box === layout.dockbox) {
    let newBox = clone(box);
    if (dockMode === box.mode) {
      let pos = 0;
      if (afterPanel) {
        pos = newBox.children.length;
      }
      newItem.size = box.size * 0.3;
      box.size *= 0.7;

      newBox.children.splice(pos, 0, newItem);
      return replaceBox(layout, box, newBox);
    } else {
      // replace root dockbox

      let newDockBox: BoxData = {mode: dockMode, children: []};
      newDockBox.size = box.size;
      if (afterPanel) {
        newDockBox.children = [newBox, newItem];
      } else {
        newDockBox.children = [newItem, newBox];
      }
      newBox.size = 280;
      newItem.size = 120;
      return replaceBox(layout, box, newDockBox);
    }
  } else if (box === layout.maxbox) {
    let newBox = clone(box);
    newBox.children.push(newItem);
    return replaceBox(layout, box, newBox);
  } else if (box === layout.floatbox) {
    console.warn("can't dock panel to floatbox, use 'floatElement' instead");
    debugger;
  }

  return layout;
}

export function floatElement(
  layout: LayoutData, data: PanelData | BoxData,
  rect?: {left: number, top: number, width: number, height: number}
): LayoutData {

  let newBox = clone(layout.floatbox);
  if (rect) {
    data.x = rect.left;
    data.y = rect.top;
    data.w = rect.width;
    data.h = rect.height;
  }
  newBox.children.push(data);
  return replaceBox(layout, layout.floatbox, newBox);
}

export function panelToWindow(
  layout: LayoutData, newPanel: PanelData
): LayoutData {
  let newBox = clone(layout.windowbox);

  newBox.children.push(newPanel);
  return replaceBox(layout, layout.windowbox, newBox);
}

export function removeFromLayout(layout: LayoutData, source: TabData | PanelData | BoxData): LayoutData {
  if (source) {
    let panelData: PanelData;
    if ('tabs' in source) {
      panelData = source;
      layout = removeChild(layout, panelData);
    } else if ('children' in source) {
      layout = removeChild(layout, source);
    } else {
      panelData = source.parent;
      layout = removeTab(layout, source);
    }
    if (panelData && panelData.parent && panelData.parent.mode === 'maximize') {
      let newPanel = layout.maxbox.children[0] as PanelData;
      if (!newPanel || (newPanel.tabs.length === 0 && !newPanel.panelLock)) {
        // max panel is gone, remove the place holder
        let placeHolder = find(layout, maximePlaceHolderId) as PanelData;
        if (placeHolder) {
          return removeChild(layout, placeHolder);
        }
      }
    }
  }
  return layout;
}

function removeChild(layout: LayoutData, child: BoxData | PanelData): LayoutData {
  let parent = child.parent;
  if (parent) {
    let pos = parent.children.indexOf(child);
    if (pos >= 0) {
      let newBox = clone(parent);
      newBox.children.splice(pos, 1);
      return replaceBox(layout, parent, newBox);
    }
  }
  return layout;
}

function removeTab(layout: LayoutData, tab: TabData): LayoutData {
  let panel = tab.parent;
  if (panel) {
    let pos = panel.tabs.indexOf(tab);
    if (pos >= 0) {
      let newPanel = clone(panel);
      newPanel.tabs.splice(pos, 1);
      if (newPanel.activeId === tab.id) {
        // update selection id
        if (newPanel.tabs.length > pos) {
          newPanel.activeId = newPanel.tabs[pos].id;
        } else if (newPanel.tabs.length) {
          newPanel.activeId = newPanel.tabs[0].id;
        }
      }
      return replacePanel(layout, panel, newPanel);
    }
  }
  return layout;
}

export function moveToFront(layout: LayoutData, source: TabData | PanelData | BoxData): LayoutData {
  if (source) {
    let data: PanelData | BoxData;
    let needUpdate = false;
    let changes: any = {};
    if (isPanel(source)) {
      data = source;
    } else if (isBox(source)) {
      console.warn("box move TODO");
      return;
    } else {
      data = source.parent;
      if (data.activeId !== source.id) {
        // move tab to front
        changes.activeId = source.id;
        needUpdate = true;
      }
    }
    if (data && data.parent && data.parent.mode === 'float') {
      // move float panel to front
      let newZ = nextZIndex(data.z);
      if (newZ !== data.z) {
        changes.z = newZ;
        needUpdate = true;
      }
    }
    if (needUpdate) {
      if (isBox(data)) {
        layout = replaceBox(layout, data, clone(data, changes));
      } else {
        layout = replacePanel(layout, data, clone(data, changes));
      }
    }
  }
  return layout;
}

// maximize or restore the panel
export function maximize(layout: LayoutData, source: TabData | PanelData): LayoutData {
  if (source) {
    if ('tabs' in source) {
      if (source.parent.mode === 'maximize') {
        return restorePanel(layout, source);
      } else {
        return maximizePanel(layout, source);
      }
    } else {
      return maximizeTab(layout, source);
    }
  }
  return layout;
}

function maximizePanel(layout: LayoutData, panel: PanelData): LayoutData {
  let maxbox = layout.maxbox;
  if (maxbox.children.length) {
    // invalid maximize
    return layout;
  }
  let placeHodlerPanel: PanelData = {
    ...panel,
    id: maximePlaceHolderId,
    tabs: [],
    panelLock: {}
  };
  layout = replacePanel(layout, panel, placeHodlerPanel);
  layout = dockToBox(layout, panel, layout.maxbox, 'middle');
  return layout;
}

function restorePanel(layout: LayoutData, panel: PanelData): LayoutData {
  layout = removeChild(layout, panel);
  let placeHolder = find(layout, maximePlaceHolderId) as PanelData;
  if (placeHolder) {
    let {x, y, z, w, h} = placeHolder;
    panel = {...panel, x, y, z, w, h};
    return replacePanel(layout, placeHolder, panel);
  } else {
    return dockToBox(layout, panel, layout.dockbox, 'right');
  }
}

function maximizeTab(layout: LayoutData, tab: TabData): LayoutData {
  // TODO to be implemented
  return layout;
}

// move float panel into the screen
export function fixFloatPos(layout: LayoutData, layoutWidth?: number, layoutHeight?: number): LayoutData {
  let layoutChanged = false;
  if (layout && layout.floatbox && layoutWidth > 200 && layoutHeight > 200) {
    let newFloatChildren = layout.floatbox.children.concat();
    for (let i = 0; i < newFloatChildren.length; ++i) {
      let data: PanelData = newFloatChildren[i] as PanelData;
      let dataChange: FloatBase = {};
      if (!(data.w > 0)) {
        dataChange.w = Math.round(layoutWidth / 3);
      } else if (data.w > layoutWidth) {
        dataChange.w = layoutWidth;
      }
      if (!(data.h > 0)) {
        dataChange.h = Math.round(layoutHeight / 3);
      } else if (data.h > layoutHeight) {
        dataChange.h = layoutHeight;
      }
      if (typeof data.y !== 'number') {
        dataChange.y = (layoutHeight - (dataChange.h || data.h)) >> 1;
      } else if (data.y > layoutHeight - 16) {
        dataChange.y = Math.max(layoutHeight - 16 - (data.h >> 1), 0);
      } else if (!(data.y >= 0)) {
        dataChange.y = 0;
      }

      if (typeof data.x !== 'number') {
        dataChange.x = (layoutWidth - (dataChange.w || data.w)) >> 1;
      } else if (data.x + data.w < 16) {
        dataChange.x = 16 - (data.w >> 1);
      } else if (data.x > layoutWidth - 16) {
        dataChange.x = layoutWidth - 16 - (data.w >> 1);
      }
      if (Object.keys(dataChange).length) {
        newFloatChildren[i] = clone(data, dataChange);
        layoutChanged = true;
      }
    }
    if (layoutChanged) {
      let newBox = clone(layout.floatbox);
      newBox.children = newFloatChildren;
      return replaceBox(layout, layout.floatbox, newBox);
    }
  }

  return layout;
}

export function fixLayoutData(layout: LayoutData, size: {width: number, height: number}, groups?: {[key: string]: TabGroup}, loadTab?: (tab: TabBase) => TabData): LayoutData {

  console.log("fix", size);


  function fixPanelOrBox(d: PanelData | BoxData) {
    if (d.id == null) {
      d.id = nextId();
    } else if (d.id.startsWith('+')) {
      let idnum = Number(d.id);
      if (idnum > _idCount) {
        // make sure generated id is unique
        _idCount = idnum;
      }
    }
    if (!(d.size >= 0)) {
      d.size = 200;
    }
    d.minWidth = 0; //d.parent ? 0 : size.width;
    d.minHeight = 0; //d.parent ? 0 : size.height;
    d.maxWidth = null; //d.parent?.maxWidth ?? size.width;
    d.maxHeight = null; //d.parent?.maxHeight ?? size.height;
    d.widthFlex = null;
    d.heightFlex = null;
  }

  function fixPanelData(panel: PanelData): PanelData {
    fixPanelOrBox(panel);
    let findActiveId = false;
    if (loadTab) {
      for (let i = 0; i < panel.tabs.length; ++i) {
        panel.tabs[i] = loadTab(panel.tabs[i]);
      }
    }
    if (panel.group == null && panel.tabs.length) {
      panel.group = panel.tabs[0].group;
    }
    let tabGroup = groups?.[panel.group];
    if (tabGroup) {
      if (tabGroup.widthFlex != null) {
        panel.widthFlex = tabGroup.widthFlex;
      }
      if (tabGroup.heightFlex != null) {
        panel.heightFlex = tabGroup.heightFlex;
      }
    }
    for (let tab of panel.tabs) {
      tab.parent = panel;
      if (tab.id === panel.activeId) {
        findActiveId = true;
      }
      if (tab.minWidth > panel.minWidth) panel.minWidth = tab.minWidth;
      if (tab.minHeight > panel.minHeight) panel.minHeight = tab.minHeight;

      if (tab.maxWidth) panel.maxWidth = Math.min(panel.maxWidth ?? INF, tab.maxWidth);
      if (tab.maxHeight) panel.maxHeight = Math.min(panel.maxHeight ?? INF, tab.maxHeight);
    }
    if (!findActiveId && panel.tabs.length) {
      panel.activeId = panel.tabs[0].id;
    }
    if (panel.minWidth <= 0) {
      panel.minWidth = 1;
    }
    if (panel.minHeight <= 0) {
      panel.minHeight = 1;
    }

    let {panelLock} = panel;
    if (panelLock) {
      if (panel.minWidth < panelLock.minWidth) {
        panel.minWidth = panelLock.minWidth;
      }
      if (panel.minHeight < panelLock.minHeight) {
        panel.minHeight = panelLock.minHeight;
      }
      if (panelLock.maxWidth && panelLock.maxWidth < (panel.maxWidth ?? INF)) {
        panel.maxWidth = panelLock.maxWidth;
      }
      if (panelLock.maxHeight && panelLock.maxHeight < (panel.maxHeight ?? INF)) {
        panel.maxHeight = panelLock.maxHeight;
      }
      if (panel.panelLock.widthFlex != null) {
        panel.widthFlex = panelLock.widthFlex;
      }
      if (panel.panelLock.heightFlex != null) {
        panel.heightFlex = panelLock.heightFlex;
      }
    }

    if (panel.z > _zCount) {
      // make sure next zIndex is on top
      _zCount = panel.z;
    }
    return panel;
  }

  function fixBoxData(box: BoxData): BoxData {
    fixPanelOrBox(box);

    let maxWidth = 0; // box.mode === "vertical" ? INF : 0;
    let maxHeight = 0; // box.mode === "horizontal" ? INF : 0;

    for (let i = 0; i < box.children.length; ++i) {
      let child = box.children[i];
      child.parent = box;
      if ('children' in child) {
        fixBoxData(child);
        if (child.children.length === 0) {
          // remove box with no child
          box.children.splice(i, 1);
          --i;
        } else if (child.children.length === 1) {
          // box with one child should be merged back to parent box
          let subChild = child.children[0];
          if ((subChild as BoxData).mode === box.mode) {
            // sub child is another box that can be merged into current box
            let totalSubSize = 0;
            for (let subsubChild of (subChild as BoxData).children) {
              totalSubSize += subsubChild.size;
            }
            let sizeScale = child.size / totalSubSize;
            for (let subsubChild of (subChild as BoxData).children) {
              subsubChild.size *= sizeScale;
            }
            // merge children up
            box.children.splice(i, 1, ...(subChild as BoxData).children);
          } else {
            // sub child can be moved up one layer
            subChild.size = child.size;
            Object.assign(subChild, floatData(child));
            box.children[i] = subChild;
          }
          --i;
        }
      } else if ('tabs' in child) {
        fixPanelData(child);
        if (child.tabs.length === 0) {
          // remove panel with no tab
          if (!child.panelLock) {
            box.children.splice(i, 1);
            --i;
          } else if (child.group === placeHolderStyle && (box.children.length > 1 || box.parent)) {
            // remove placeHolder Group
            box.children.splice(i, 1);
            --i;
          }
        }
      }

      // merge min size
      switch (box.mode) {
        case 'horizontal':
          if (child.minWidth > 0) box.minWidth += child.minWidth;
          if (child.minHeight > box.minHeight) box.minHeight = child.minHeight;

          maxWidth += child.maxWidth ?? INF;
          if (child.maxHeight && maxHeight) maxHeight = Math.max(child.maxHeight, maxHeight);

          if (child.widthFlex != null) {
            box.widthFlex = maxFlex(box.widthFlex, child.widthFlex);
          }
          if (child.heightFlex != null) {
            box.heightFlex = mergeFlex(box.heightFlex, child.heightFlex);
          }
          break;
        case 'vertical':
          if (child.minWidth > box.minWidth) box.minWidth = child.minWidth;
          if (child.minHeight > 0) box.minHeight += child.minHeight;

          maxHeight += child.maxHeight ?? INF;
          if (child.maxWidth && maxWidth) maxWidth = Math.max(child.maxWidth, maxWidth)

          if (child.heightFlex != null) {
            box.heightFlex = maxFlex(box.heightFlex, child.heightFlex);
          }
          if (child.widthFlex != null) {
            box.widthFlex = mergeFlex(box.widthFlex, child.widthFlex);
          }
          break;
      }

    }
    // add divider size
    if (box.children.length > 1) {
      switch (box.mode) {
        case 'horizontal':
          box.minWidth += (box.children.length - 1) * 4;
          maxWidth += (box.children.length - 1) * 4;
          break;
        case 'vertical':
          box.minHeight += (box.children.length - 1) * 4;
          maxHeight += (box.children.length - 1) * 4;
          break;
      }
    }

    // console.log(box.id, box.mode);
    // console.table(box.children.map(c => ({id: c.id, maxW: c.maxWidth, maxH: c.maxHeight})));
    // console.log({maxWidth, boxW: box.maxWidth, maxHeight, boxH: box.maxHeight});
    if (isFinite(maxWidth) && maxWidth > 0) box.maxWidth = maxWidth;
    if (isFinite(maxHeight) && maxHeight > 0) box.maxHeight = maxHeight;

    // switch (box.mode) {
    //   case 'horizontal':
    //     const hspace = box.maxWidth - box.minWidth;
    //     for (let i = 0; i < box.children.length; ++i) {
    //       let child = box.children[i];
    //       child.maxWidth = Math.min(child.maxWidth, hspace + child.minWidth);
    //     }
    //     break;
    //   case 'vertical':
    //     const vspace = box.maxHeight - box.minHeight;
    //     for (let i = 0; i < box.children.length; ++i) {
    //       let child = box.children[i];
    //       child.maxHeight = Math.min(child.maxHeight, vspace + child.minHeight);
    //     }
    //     break;
    // }

    if (box.parent?.mode === "float") {
      if (box.minWidth && box.w < box.minWidth) box.w = box.minWidth;
      if (box.maxWidth && box.w > box.maxWidth) box.w = box.maxWidth;
      if (box.minHeight && box.h < box.minHeight) box.h = box.minHeight;
      if (box.maxHeight && box.h < box.maxHeight) box.h = box.maxHeight;
    }

    return box;
  }

  if (layout.floatbox) {
    layout.floatbox.mode = 'float';
  } else {
    layout.floatbox = {mode: 'float', children: [], size: 1};
  }

  if (layout.windowbox) {
    layout.windowbox.mode = 'window';
  } else {
    layout.windowbox = {mode: 'window', children: [], size: 1};
  }

  if (layout.maxbox) {
    layout.maxbox.mode = 'maximize';
  } else {
    layout.maxbox = {mode: 'maximize', children: [], size: 1};
  }


  fixBoxData(layout.dockbox);
  fixBoxData(layout.floatbox);
  fixBoxData(layout.windowbox);
  fixBoxData(layout.maxbox);

  if (layout.dockbox.children.length === 0) {
    // add place holder panel when root box is empty
    let newPanel: PanelData = {id: '+0', group: placeHolderStyle, panelLock: {}, size: 200, tabs: []};
    newPanel.parent = layout.dockbox;
    layout.dockbox.children.push(newPanel);
  } else {
    // merge and replace root box when box has only one child
    while (layout.dockbox.children.length === 1 && 'children' in layout.dockbox.children[0]) {
      let newDockBox = clone(layout.dockbox.children[0] as BoxData);
      layout.dockbox = newDockBox;
      for (let child of newDockBox.children) {
        child.parent = newDockBox;
      }
    }
  }
  layout.dockbox.maxHeight = null;
  layout.dockbox.minHeight = null;

  layout.dockbox.parent = null;
  layout.floatbox.parent = null;
  layout.windowbox.parent = null;
  layout.maxbox.parent = null;
  clearObjectCache();
  return layout;
}


export function replacePanel(layout: LayoutData, panel: PanelData, newPanel: PanelData): LayoutData {
  for (let tab of newPanel.tabs) {
    tab.parent = newPanel;
  }

  let box = panel.parent;
  if (box) {
    let pos = box.children.indexOf(panel);
    if (pos >= 0) {
      let newBox = clone(box);
      newBox.children[pos] = newPanel;
      return replaceBox(layout, box, newBox);
    }
  }
  return layout;
}

function replaceBox(layout: LayoutData, box: BoxData, newBox: BoxData): LayoutData {

  for (let child of newBox.children) {
    child.parent = newBox;
  }

  let parentBox = box.parent;
  if (parentBox) {
    let pos = parentBox.children.indexOf(box);
    if (pos >= 0) {
      let newParentBox = clone(parentBox);
      newParentBox.children[pos] = newBox;
      return replaceBox(layout, parentBox, newParentBox);
    }
  } else {
    if (box.id === layout.dockbox.id || box === layout.dockbox) {
      return {...layout, dockbox: newBox};
    } else if (box.id === layout.floatbox.id || box === layout.floatbox) {
      return {...layout, floatbox: newBox};
    } else if (box.id === layout.windowbox.id || box === layout.windowbox) {
      return {...layout, windowbox: newBox};
    } else if (box.id === layout.maxbox.id || box === layout.maxbox) {
      return {...layout, maxbox: newBox};
    }
  }
  return layout;
}

export function getFloatPanelSize(panel: HTMLElement, tabGroup: TabGroup) {
  if (!panel) {
    return [300, 300];
  }
  let panelWidth = panel.offsetWidth;
  let panelHeight = panel.offsetHeight;

  let [minWidth, maxWidth] = tabGroup.preferredFloatWidth || [100, 600];
  let [minHeight, maxHeight] = tabGroup.preferredFloatHeight || [50, 500];
  if (!(panelWidth >= minWidth)) {
    panelWidth = minWidth;
  } else if (!(panelWidth <= maxWidth)) {
    panelWidth = maxWidth;
  }
  if (!(panelHeight >= minHeight)) {
    panelHeight = minHeight;
  } else if (!(panelHeight <= maxHeight)) {
    panelHeight = maxHeight;
  }

  return [panelWidth, panelHeight];
}

export function findNearestPanel(rectFrom: DOMRect, rectTo: DOMRect, direction: string): number {
  let distance = -1;
  let overlap = -1;
  let alignment = 0;
  switch (direction) {
    case 'ArrowUp': {
      distance = rectFrom.top - rectTo.bottom + rectFrom.height;
      overlap = Math.min(rectFrom.right, rectTo.right) - Math.max(rectFrom.left, rectTo.left);
      break;
    }
    case 'ArrowDown': {
      distance = rectTo.top - rectFrom.bottom + rectFrom.height;
      overlap = Math.min(rectFrom.right, rectTo.right) - Math.max(rectFrom.left, rectTo.left);
      break;
    }
    case 'ArrowLeft': {
      distance = rectFrom.left - rectTo.right + rectFrom.width;
      overlap = Math.min(rectFrom.bottom, rectTo.bottom) - Math.max(rectFrom.top, rectTo.top);
      alignment = Math.abs(rectFrom.top - rectTo.top);
      break;
    }
    case 'ArrowRight': {
      distance = rectTo.left - rectFrom.right + rectFrom.width;
      overlap = Math.min(rectFrom.bottom, rectTo.bottom) - Math.max(rectFrom.top, rectTo.top);
      alignment = Math.abs(rectFrom.top - rectTo.top);
      break;
    }
  }
  if (distance < 0 || overlap <= 0) {
    return -1;
  }

  return distance * (alignment + 1) - overlap * 0.001;
}
