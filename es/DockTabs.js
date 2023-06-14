// import * as React from "react";
// import {DockContext, DockContextType, DropDirection, PanelData, TabData} from "./DockData";
// import Tabs from 'rc-tabs';
// import Menu, {MenuItem} from 'rc-menu';
// import Dropdown from 'rc-dropdown';
// import * as DragManager from "./dragdrop/DragManager";
// import {DragDropDiv } from "./dragdrop/DragDropDiv";
// import {DockTabBar, DockTabBarProps} from "./DockTabBar";
// import DockTabPane from "./DockTabPane";
// import {getFloatPanelSize} from "./Algorithm";
// import {WindowBox} from "./WindowBox";
// import {groupClassNames} from "./Utils";
// import classNames from "classnames";
// import {RenderTabBar} from "rc-tabs/lib/interface";
// import {TabNavListProps} from "rc-tabs/lib/TabNavList";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
// function findParentPanel(element: HTMLElement) {
//   for (let i = 0; i < 10; ++i) {
//     if (!element) {
//       return null;
//     }
//     if (element.classList.contains('dock-panel')) {
//       return element;
//     }
//     element = element.parentElement;
//   }
//   return null;
// }
// function isPopupDiv(r: HTMLDivElement): boolean {
//   return (r == null || r.parentElement?.tagName === 'LI' || r.parentElement?.parentElement?.tagName === 'LI');
// }
// export class TabCache {
//   _ref: HTMLDivElement;
//   getRef = (r: HTMLDivElement) => {
//     if (isPopupDiv(r)) {
//       return;
//     }
//     this._ref = r;
//   };
//   _hitAreaRef: HTMLDivElement;
//   getHitAreaRef = (r: HTMLDivElement) => {
//     if (isPopupDiv(r)) {
//       return;
//     }
//     this._hitAreaRef = r;
//   };
//   data: TabData;
//   context: DockContext;
//   content: React.ReactElement;
//   constructor(context: DockContext) {
//     this.context = context;
//   }
//   setData(data: TabData) {
//     if (data !== this.data) {
//       this.data = data;
//       this.content = this.render();
//       return true;
//     }
//     return false;
//   }
//   onCloseClick = (e: React.MouseEvent) => {
//     this.context.dockMove(this.data, null, 'remove');
//     e.stopPropagation();
//   };
//   onDragStart = (e: DragManager.DragState) => {
//     console.log('TabCache.onDragStart', e);
//     let panel = this.data.parent;
//     if (panel.parent.mode === 'float' && panel.tabs.length === 1) {
//       // when it's the only tab in a float panel, skip this drag, let parent tab bar handle it
//       return;
//     }
//     let panelElement = findParentPanel(this._ref);
//     let tabGroup = this.context.getGroup(this.data.group);
//     let [panelWidth, panelHeight] = getFloatPanelSize(panelElement, tabGroup);
//     e.setData({tab: this.data, panelSize: [panelWidth, panelHeight], tabGroup: this.data.group}, this.context.getDockId());
//     e.startDrag(this._ref.parentElement, this._ref.parentElement);
//   };
//   onDragOver = (e: DragManager.DragState) => {
//     let dockId = this.context.getDockId();
//     let tab: TabData = DragManager.DragState.getData('tab', dockId);
//     let panel: PanelData = DragManager.DragState.getData('panel', dockId);
//     let group: string;
//     if (tab) {
//       panel = tab.parent;
//       group = tab.group;
//     } else {
//       // drag whole panel
//       if (!panel) {
//         return;
//       }
//       if (panel?.panelLock) {
//         e.reject();
//         return;
//       }
//       group = panel.group;
//     }
//     let tabGroup = this.context.getGroup(group);
//     if (group !== this.data.group) {
//       e.reject();
//     } else if (tabGroup?.floatable === 'singleTab' && this.data.parent?.parent?.mode === 'float') {
//       e.reject();
//     } else if (tab && tab !== this.data) {
//       let direction = this.getDropDirection(e);
//       this.context.setDropRect(this._hitAreaRef, direction, this);
//       e.accept('');
//     } else if (panel && panel !== this.data.parent) {
//       let direction = this.getDropDirection(e);
//       this.context.setDropRect(this._hitAreaRef, direction, this);
//       e.accept('');
//     }
//   };
//   onDragLeave = (e: DragManager.DragState) => {
//     this.context.setDropRect(null, 'remove', this);
//   };
//   onDrop = (e: DragManager.DragState) => {
//     let dockId = this.context.getDockId();
//     let panel: PanelData;
//     let tab: TabData = DragManager.DragState.getData('tab', dockId);
//     if (tab) {
//       panel = tab.parent;
//     } else {
//       panel = DragManager.DragState.getData('panel', dockId);
//     }
//     if (tab && tab !== this.data) {
//       let direction = this.getDropDirection(e);
//       this.context.dockMove(tab, this.data, direction);
//     } else if (panel && panel !== this.data.parent) {
//       let direction = this.getDropDirection(e);
//       this.context.dockMove(panel, this.data, direction);
//     }
//   };
//   getDropDirection(e: DragManager.DragState): DropDirection {
//     let rect = this._hitAreaRef.getBoundingClientRect();
//     let midx = rect.left + rect.width * 0.5;
//     return e.clientX > midx ? 'after-tab' : 'before-tab';
//   }
//   render(): React.ReactElement {
//     let {id, title, content, closable, cached, parent} = this.data;
//     let {onDragStart, onDragOver, onDrop, onDragLeave} = this;
//     if (parent.parent.mode === 'window') {
//       onDragStart = null;
//       onDragOver = null;
//       onDrop = null;
//       onDragLeave = null;
//     }
//     if (typeof content === 'function') {
//       content = content(this.data);
//     }
//     let tab = (
//       <DragDropDiv getRef={this.getRef} onDragStartT={onDragStart} role="tab" aria-selected={parent.activeId === id}
//         onDragOverT={onDragOver} onDropT={onDrop} onDragLeaveT={onDragLeave}>
//         {title}
//         {closable ?
//           <div className="dock-tab-close-btn" onClick={this.onCloseClick} onMouseDown={e => e.stopPropagation()} />
//           : null
//         }
//         <div className="dock-tab-hit-area" ref={this.getHitAreaRef} />
//       </DragDropDiv>
//     );
//     return (
//       <DockTabPane key={id} cacheId={id} cached={cached} tab={tab}>
//         {content}
//       </DockTabPane>
//     );
//   }
//   destroy() {
//     // place holder
//   }
// }
// export type RenderDockTabBar = (props: DockTabBarProps, DefaultTabBar: typeof DockTabBar) => React.ReactElement;
// interface Props {
//   panelData: PanelData;
//   onPanelDragStart: DragManager.DragHandler;
//   onPanelDragMove: DragManager.DragHandler;
//   onPanelDragEnd: DragManager.DragHandler;
//   // headerDragHandlers?: DragDropHandlers,
//   // navListProps?: TabNavListProps;
// }
// export class DockTabs extends React.PureComponent<Props> {
//   static contextType = DockContextType;
//   static readonly propKeys = ['group', 'tabs', 'activeId', 'onTabChange'];
//   context!: DockContext;
//   _cache: Map<string, TabCache> = new Map();
//   cachedTabs: TabData[];
//   updateTabs(tabs: TabData[]) {
//     if (tabs === this.cachedTabs) {
//       return;
//     }
//     this.cachedTabs = tabs;
//     let newCache = new Map<string, TabCache>();
//     let reused = 0;
//     for (let tabData of tabs) {
//       let {id} = tabData;
//       if (this._cache.has(id)) {
//         let tab = this._cache.get(id);
//         newCache.set(id, tab);
//         tab.setData(tabData);
//         ++reused;
//       } else {
//         let tab = new TabCache(this.context);
//         newCache.set(id, tab);
//         tab.setData(tabData);
//       }
//     }
//     if (reused !== this._cache.size) {
//       for (let [id, tab] of this._cache) {
//         if (!newCache.has(id)) {
//           tab.destroy();
//         }
//       }
//     }
//     this._cache = newCache;
//   }
//   onMaximizeClick = (e: React.MouseEvent) => {
//     let {panelData} = this.props;
//     this.context.dockMove(panelData, null, 'maximize');
//     // prevent the focus change logic
//     e.stopPropagation();
//   };
//   onNewWindowClick = () => {
//     let {panelData} = this.props;
//     this.context.dockMove(panelData, null, 'new-window');
//   };
//   addNewWindowMenu(element: React.ReactElement, showWithLeftClick: boolean) {
//     const nativeMenu = (
//       <Menu onClick={this.onNewWindowClick}>
//         <MenuItem>
//           New Window
//         </MenuItem>
//       </Menu>
//     );
//     let trigger = showWithLeftClick ? ['contextMenu', 'click'] : ['contextMenu'];
//     return (
//       <Dropdown
//         prefixCls="dock-dropdown"
//         overlay={nativeMenu}
//         trigger={trigger}
//         mouseEnterDelay={0.1}
//         mouseLeaveDelay={0.1}>
//         {element}
//       </Dropdown>
//     );
//   }
//   // renderTabBar: RenderTabBar = (props, TabNavList) => {
//   //   let {panelData, onPanelDragStart, onPanelDragMove, onPanelDragEnd} = this.props;
//   //   let {group: groupName, panelLock} = panelData;
//   //   let group = this.context.getGroup(groupName);
//   //   let {panelExtra, renderTabBar} = group;
//   //   let maximizable = group.maximizable;
//   //   if (panelData.parent.mode === 'window') {
//   //     maximizable = false;
//   //   }
//   //   if (panelLock) {
//   //     if (panelLock.panelExtra) {
//   //       panelExtra = panelLock.panelExtra;
//   //     }
//   //   }
//   //   let showNewWindowButton = group.newWindow && WindowBox.enabled && panelData.parent.mode === 'float';
//   //   let panelExtraContent: React.ReactElement;
//   //   if (panelExtra) {
//   //     panelExtraContent = panelExtra(panelData, this.context);
//   //   } else if (maximizable || showNewWindowButton) {
//   //     panelExtraContent = <div
//   //       className={panelData.parent.mode === 'maximize' ? "dock-panel-min-btn" : "dock-panel-max-btn"}
//   //       onClick={maximizable ? this.onMaximizeClick : null}
//   //     />;
//   //     if (showNewWindowButton) {
//   //       panelExtraContent = this.addNewWindowMenu(panelExtraContent, !maximizable);
//   //     }
//   //   }
//   renderTabBar = (props: any, TabNavList: React.ComponentType) => {
//     let {panelData, onPanelDragStart, onPanelDragMove, onPanelDragEnd} = this.props;
//     let {group: groupName, panelLock} = panelData;
//     let group = this.context.getGroup(groupName);
//     let {panelExtra, renderTabBar} = group;
//     let maximizable = group.maximizable;
//     if (panelData.parent.mode === 'window') {
//       onPanelDragStart = null;
//       maximizable = false;
//     }
//     if (panelLock) {
//       if (panelLock.panelExtra) {
//         panelExtra = panelLock.panelExtra;
//       }
//     }
//     let showNewWindowButton = group.newWindow && WindowBox.enabled && panelData.parent.mode === 'float';
//     let panelExtraContent: React.ReactElement;
//     if (panelExtra) {
//       panelExtraContent = panelExtra(panelData, this.context);
//     } else if (maximizable || showNewWindowButton) {
//       panelExtraContent = <div
//         className={panelData.parent.mode === 'maximize' ? "dock-panel-min-btn" : "dock-panel-max-btn"}
//         onClick={maximizable ? this.onMaximizeClick : null}
//       />;
//       if (showNewWindowButton) {
//         panelExtraContent = this.addNewWindowMenu(panelExtraContent, !maximizable);
//       }
//     }
//     const barProps: DockTabBarProps = {
//       //data: panelData,
//       TabNavList: TabNavList,
//       onDragStart: onPanelDragStart,
//       onDragMove: onPanelDragMove,
//       onDragEnd: onPanelDragEnd,
//       ...props,
//       isMaximized: panelData.parent.mode === 'maximize',
//       extra: panelExtraContent,
//       ///dragHandlers: headerDragHandlers,
//       // navlistProps: {
//       //   ...props,
//       //   extra: panelExtraContent
//       // }
//     }
//     return renderTabBar?.(barProps, DockTabBar) ?? <DockTabBar {...barProps} />
//     // return (
//     //   <DockTabBar onDragStart={onPanelDragStart} onDragMove={onPanelDragMove} onDragEnd={onPanelDragEnd}
//     //     TabNavList={TabNavList} isMaximized={panelData.parent.mode === 'maximize'} {...props}
//     //     extra={panelExtraContent} />
//     // );
//   };
//   onTabChange = (activeId: string) => {
//     this.props.panelData.activeId = activeId;
//     this.context.onSilentChange(activeId, 'active');
//     this.forceUpdate();
//   };
//   render(): React.ReactNode {
//     let {group, tabs, activeId} = this.props.panelData;
//     let tabGroup = this.context.getGroup(group);
//     let {animated, moreIcon} = tabGroup;
//     if (animated == null) {
//       animated = true;
//     }
//     if (!moreIcon) {
//       moreIcon = "...";
//     }
//     this.updateTabs(tabs);
//     let children: React.ReactNode[] = [];
//     for (let [id, tab] of this._cache) {
//       children.push(tab.content);
//     }
//     return (
//       <Tabs prefixCls="dock"
//         moreIcon={moreIcon}
//         animated={animated}
//         renderTabBar={this.renderTabBar}
//         activeKey={activeId}
//         onChange={this.onTabChange}
//         popupClassName={classNames(groupClassNames(group))}
//       >
//         {children}
//       </Tabs>
//     );
//   }
// }
import * as React from "react";
import { DockContextType } from "./DockData";
import Tabs from 'rc-tabs';
import Menu, { MenuItem } from 'rc-menu';
import Dropdown from 'rc-dropdown';
import * as DragManager from "./dragdrop/DragManager";
import { DragDropDiv } from "./dragdrop/DragDropDiv";
import { DockTabBar } from "./DockTabBar";
import DockTabPane from "./DockTabPane";
import { getFloatPanelSize } from "./Algorithm";
import { WindowBox } from "./WindowBox";
import { groupClassNames } from "./Utils";
import classNames from "classnames";
function findParentPanel(element) {
    for (let i = 0; i < 10; ++i) {
        if (!element) {
            return null;
        }
        if (element.classList.contains('dock-panel')) {
            return element;
        }
        element = element.parentElement;
    }
    return null;
}
function isPopupDiv(r) {
    var _a, _b, _c;
    return (r == null || ((_a = r.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === 'LI' || ((_c = (_b = r.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.tagName) === 'LI');
}
export class TabCache {
    constructor(context) {
        this.getRef = (r) => {
            if (isPopupDiv(r)) {
                return;
            }
            this._ref = r;
        };
        this.getHitAreaRef = (r) => {
            if (isPopupDiv(r)) {
                return;
            }
            this._hitAreaRef = r;
        };
        this.onCloseClick = (e) => {
            this.context.dockMove(this.data, null, 'remove');
            e.stopPropagation();
        };
        this.onDragStart = (e) => {
            let panel = this.data.parent;
            if (panel.parent.mode === 'float' && panel.tabs.length === 1) {
                // when it's the only tab in a float panel, skip this drag, let parent tab bar handle it
                return;
            }
            let panelElement = findParentPanel(this._ref);
            let tabGroup = this.context.getGroup(this.data.group);
            let [panelWidth, panelHeight] = getFloatPanelSize(panelElement, tabGroup);
            e.setData({ tab: this.data, panelSize: [panelWidth, panelHeight], tabGroup: this.data.group }, this.context.getDockId());
            e.startDrag(this._ref.parentElement, this._ref.parentElement);
        };
        this.onDragOver = (e) => {
            var _a, _b;
            let dockId = this.context.getDockId();
            let tab = DragManager.DragState.getData('tab', dockId);
            let panel = DragManager.DragState.getData('panel', dockId);
            let group;
            if (tab) {
                panel = tab.parent;
                group = tab.group;
            }
            else {
                // drag whole panel
                if (!panel) {
                    return;
                }
                if (panel === null || panel === void 0 ? void 0 : panel.panelLock) {
                    e.reject();
                    return;
                }
                group = panel.group;
            }
            let tabGroup = this.context.getGroup(group);
            if (group !== this.data.group) {
                e.reject();
            }
            else if ((tabGroup === null || tabGroup === void 0 ? void 0 : tabGroup.floatable) === 'singleTab' && ((_b = (_a = this.data.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.mode) === 'float') {
                e.reject();
            }
            else if (tab && tab !== this.data) {
                let direction = this.getDropDirection(e);
                this.context.setDropRect(this._hitAreaRef, direction, this);
                e.accept('');
            }
            else if (panel && panel !== this.data.parent) {
                let direction = this.getDropDirection(e);
                this.context.setDropRect(this._hitAreaRef, direction, this);
                e.accept('');
            }
        };
        this.onDragLeave = (e) => {
            this.context.setDropRect(null, 'remove', this);
        };
        this.onDrop = (e) => {
            let dockId = this.context.getDockId();
            let panel;
            let tab = DragManager.DragState.getData('tab', dockId);
            if (tab) {
                panel = tab.parent;
            }
            else {
                panel = DragManager.DragState.getData('panel', dockId);
            }
            if (tab && tab !== this.data) {
                let direction = this.getDropDirection(e);
                this.context.dockMove(tab, this.data, direction);
            }
            else if (panel && panel !== this.data.parent) {
                let direction = this.getDropDirection(e);
                this.context.dockMove(panel, this.data, direction);
            }
        };
        this.context = context;
    }
    setData(data) {
        if (data !== this.data) {
            this.data = data;
            this.content = this.render();
            return true;
        }
        return false;
    }
    getDropDirection(e) {
        let rect = this._hitAreaRef.getBoundingClientRect();
        let midx = rect.left + rect.width * 0.5;
        return e.clientX > midx ? 'after-tab' : 'before-tab';
    }
    render() {
        let { id, title, content, closable, cached, parent } = this.data;
        let { onDragStart, onDragOver, onDrop, onDragLeave } = this;
        if (parent.parent.mode === 'window') {
            onDragStart = null;
            onDragOver = null;
            onDrop = null;
            onDragLeave = null;
        }
        if (typeof content === 'function') {
            content = content(this.data);
        }
        let tab = (React.createElement(DragDropDiv, { getRef: this.getRef, onDragStartT: onDragStart, role: "tab", "aria-selected": parent.activeId === id, onDragOverT: onDragOver, onDropT: onDrop, onDragLeaveT: onDragLeave },
            title,
            closable ?
                React.createElement("div", { className: "dock-tab-close-btn", onClick: this.onCloseClick })
                : null,
            React.createElement("div", { className: "dock-tab-hit-area", ref: this.getHitAreaRef })));
        return (React.createElement(DockTabPane, { key: id, cacheId: id, cached: cached, tab: tab }, content));
    }
    destroy() {
        // place holder
    }
}
export class DockTabs extends React.PureComponent {
    constructor() {
        super(...arguments);
        this._cache = new Map();
        this.onMaximizeClick = (e) => {
            let { panelData } = this.props;
            this.context.dockMove(panelData, null, 'maximize');
            // prevent the focus change logic
            e.stopPropagation();
        };
        this.onNewWindowClick = () => {
            let { panelData } = this.props;
            this.context.dockMove(panelData, null, 'new-window');
        };
        this.renderTabBar = (navListProps, TabNavList) => {
            var _a, _b, _c, _d;
            let _e = this.props, { panelData, onDragStartT } = _e, restProps = __rest(_e, ["panelData", "onDragStartT"]);
            let { group: groupName, panelLock } = panelData;
            let group = this.context.getGroup(groupName);
            let { panelExtra, renderTabBar } = group;
            const isWindow = ((_a = panelData.parent) === null || _a === void 0 ? void 0 : _a.mode) === 'window';
            const isFloating = ((_b = panelData.parent) === null || _b === void 0 ? void 0 : _b.mode) === 'float';
            const isMaximized = ((_c = panelData.parent) === null || _c === void 0 ? void 0 : _c.mode) === 'maximize';
            let maximizable = group.maximizable;
            if (isWindow) {
                onDragStartT = null;
                maximizable = false;
            }
            if (panelLock === null || panelLock === void 0 ? void 0 : panelLock.panelExtra) {
                panelExtra = panelLock.panelExtra;
            }
            let showNewWindowButton = group.newWindow && WindowBox.enabled && isFloating;
            let panelExtraContent;
            if (panelExtra) {
                panelExtraContent = panelExtra(panelData, this.context);
            }
            else if (maximizable || showNewWindowButton) {
                panelExtraContent = React.createElement("div", { className: isMaximized ? "dock-panel-min-btn" : "dock-panel-max-btn", onClick: maximizable ? this.onMaximizeClick : null });
                if (showNewWindowButton) {
                    panelExtraContent = this.addNewWindowMenu(panelExtraContent, !maximizable);
                }
            }
            const props = Object.assign(Object.assign({}, restProps), { TabNavList,
                onDragStartT,
                isMaximized, data: panelData, navListProps: Object.assign(Object.assign({}, navListProps), { extra: panelExtraContent }) });
            return (_d = renderTabBar === null || renderTabBar === void 0 ? void 0 : renderTabBar(props, DockTabBar)) !== null && _d !== void 0 ? _d : React.createElement(DockTabBar, Object.assign({}, props));
            // return (
            //   <DockTabBar
            //     onDragStartT={onDragStartT}
            //     TabNavList={TabNavList}
            //     isMaximized={panelData.parent.mode === 'maximize'}
            //     panelData={panelData}
            //     {...restProps}
            //     {...barProps}
            //     extra={panelExtraContent} />
            // );
        };
        this.onTabChange = (activeId) => {
            this.props.panelData.activeId = activeId;
            this.context.onSilentChange(activeId, 'active');
            this.forceUpdate();
        };
    }
    updateTabs(tabs) {
        if (tabs === this.cachedTabs) {
            return;
        }
        this.cachedTabs = tabs;
        let newCache = new Map();
        let reused = 0;
        for (let tabData of tabs) {
            let { id } = tabData;
            if (this._cache.has(id)) {
                let tab = this._cache.get(id);
                newCache.set(id, tab);
                tab.setData(tabData);
                ++reused;
            }
            else {
                let tab = new TabCache(this.context);
                newCache.set(id, tab);
                tab.setData(tabData);
            }
        }
        if (reused !== this._cache.size) {
            for (let [id, tab] of this._cache) {
                if (!newCache.has(id)) {
                    tab.destroy();
                }
            }
        }
        this._cache = newCache;
    }
    addNewWindowMenu(element, showWithLeftClick) {
        const nativeMenu = (React.createElement(Menu, { onClick: this.onNewWindowClick },
            React.createElement(MenuItem, null, "New Window")));
        let trigger = showWithLeftClick ? ['contextMenu', 'click'] : ['contextMenu'];
        return (React.createElement(Dropdown, { prefixCls: "dock-dropdown", overlay: nativeMenu, trigger: trigger, mouseEnterDelay: 0.1, mouseLeaveDelay: 0.1 }, element));
    }
    render() {
        let { group, tabs, activeId } = this.props.panelData;
        let tabGroup = this.context.getGroup(group);
        let { animated, moreIcon } = tabGroup;
        if (animated == null) {
            animated = true;
        }
        if (!moreIcon) {
            moreIcon = "...";
        }
        this.updateTabs(tabs);
        let children = [];
        for (let [id, tab] of this._cache) {
            children.push(tab.content);
        }
        return (React.createElement(Tabs, { prefixCls: "dock", moreIcon: moreIcon, animated: animated, renderTabBar: this.renderTabBar, activeKey: activeId, onChange: this.onTabChange, popupClassName: classNames(groupClassNames(group)) }, children));
    }
}
DockTabs.contextType = DockContextType;
DockTabs.propKeys = ['group', 'tabs', 'activeId', 'onTabChange'];
