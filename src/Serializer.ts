import {
  BoxData,
  LayoutData,
  PanelData, BoxBase, LayoutBase, PanelBase, TabBase,
  TabData,
  maximePlaceHolderId,
  FloatBase
} from "./DockData";
import {floatData} from "./Utils";

interface DefaultLayoutCache {
  panels: Map<string, PanelData>;
  tabs: Map<string, TabData>;
}

function addPanelToCache(panelData: PanelData, cache: DefaultLayoutCache) {
  cache.panels.set(panelData.id, panelData);
  for (let tab of panelData.tabs) {
    cache.tabs.set(tab.id, tab);
  }
}

function addBoxToCache(boxData: BoxData, cache: DefaultLayoutCache) {
  for (let child of boxData.children) {
    if ('tabs' in child) {
      addPanelToCache(child, cache);
    } else if ('children' in child) {
      addBoxToCache(child, cache);
    }
  }
}


export function createLayoutCache(defaultLayout: LayoutData | BoxData): DefaultLayoutCache {
  let cache: DefaultLayoutCache = {
    panels: new Map(),
    tabs: new Map(),
  };
  if (defaultLayout) {
    if ('children' in defaultLayout) {
      // BoxData
      addBoxToCache(defaultLayout, cache);
    } else {
      // LayoutData
      if ('dockbox' in defaultLayout) {
        addBoxToCache(defaultLayout.dockbox, cache);
      }
      if ('floatbox' in defaultLayout) {
        addBoxToCache(defaultLayout.floatbox, cache);
      }
    }
  }

  return cache;
}

export function saveLayoutData(
  layout: LayoutData,
  saveTab?: (tab: TabData) => TabBase,
  afterPanelSaved?: (savedPanel: PanelBase, panel: PanelData) => void
): LayoutBase {
  function saveTabData(tabData: TabData): TabBase {
    return saveTab ? saveTab(tabData) : {id: tabData.id};
  }

  function savePanelData(panelData: PanelData): PanelBase {
    let tabs: TabBase[] = [];
    for (let tab of panelData.tabs) {
      let savedTab = saveTabData(tab);
      if (savedTab) {
        tabs.push(savedTab);
      }
    }
    let {id, size, activeId, dropMode, group} = panelData;
    let savedPanel: PanelBase = {
      id, size, tabs, group, dropMode, activeId,
      ...floatData(panelData),
    };
    if (afterPanelSaved) {
      afterPanelSaved(savedPanel, panelData);
    }
    return savedPanel;
  }

  function saveBoxData(boxData: BoxData): BoxBase {
    let children: (BoxBase | PanelBase)[] = [];
    for (let child of boxData.children) {
      if ('tabs' in child) {
        children.push(savePanelData(child));
      } else if ('children' in child) {
        children.push(saveBoxData(child));
      }
    }
    let {id, size, mode} = boxData;
    return {id, size, mode, children, ...floatData(boxData)};
  }

  return {
    dockbox: saveBoxData(layout.dockbox),
    floatbox: saveBoxData(layout.floatbox),
    windowbox: saveBoxData(layout.windowbox),
    maxbox: saveBoxData(layout.maxbox),
  };
}

export function loadLayoutData(
  savedLayout: LayoutBase,
  defaultLayout: LayoutData,
  loadTab?: (savedTab: TabBase) => TabData,
  afterPanelLoaded?: (savedPanel: PanelBase, panel: PanelData) => void
): LayoutData {
  let cache = createLayoutCache(defaultLayout);

  function loadTabData(savedTab: TabBase): TabData {
    if (loadTab) {
      return loadTab(savedTab);
    }
    let {id} = savedTab;
    if (cache.tabs.has(id)) {
      return cache.tabs.get(id);
    }
    return null;
  }

  function loadPanelData(savedPanel: PanelBase): PanelData {
    let {id, size, activeId, dropMode, x, y, z, w, h, group} = savedPanel;

    let tabs: TabData[] = [];
    for (let savedTab of savedPanel.tabs) {
      let tabData = loadTabData(savedTab);
      if (tabData) {
        tabs.push(tabData);
      }
    }
    let panelData: PanelData;
    if (w || h || x || y || z) {
      panelData = {id, size, activeId, dropMode, group, x, y, z, w, h, tabs};
    } else {
      panelData = {id, size, activeId, dropMode, group, tabs};
    }
    if (savedPanel.id === maximePlaceHolderId) {
      panelData.panelLock = {};
    } else if (afterPanelLoaded) {
      afterPanelLoaded(savedPanel, panelData);
    } else if (cache.panels.has(id)) {
      panelData = {...cache.panels.get(id), ...panelData};
    }
    return panelData;
  }

  function loadBoxData(savedBox: BoxBase): BoxData {
    if (!savedBox) {
      return null;
    }
    let children: (BoxData | PanelData)[] = [];
    for (let child of savedBox.children) {
      if ('tabs' in child) {
        children.push(loadPanelData(child));
      } else if ('children' in child) {
        children.push(loadBoxData(child));
      }
    }
    let {id, size, mode, w, h, x, y, z} = savedBox;
    return {id, size, mode, children, w, h, x, y, z};
  }

  return {
    dockbox: loadBoxData(savedLayout.dockbox),
    floatbox: loadBoxData(savedLayout.floatbox ?? {mode: 'float', children: [], size: 0}),
    windowbox: loadBoxData(savedLayout.windowbox ?? {mode: 'window', children: [], size: 0}),
    maxbox: loadBoxData(savedLayout.maxbox ?? {mode: 'maximize', children: [], size: 1}),
  };
}
