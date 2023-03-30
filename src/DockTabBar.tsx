import type {TabNavListProps} from "rc-tabs/lib/TabNavList";
import * as React from "react";
import {DockContextType, PanelData} from "./DockData";
import {FloatHeader} from "./FloatDrag";

/**
 * @return returns true if navigation is handled in local tab move, otherwise returns false
 */
function checkLocalTabMove(key: string, tabbar: HTMLDivElement): boolean {
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    let tabs = Array.from(tabbar.querySelectorAll('.dock-tab-btn'));
    let activeTab = tabbar.querySelector('.dock-tab-active>.dock-tab-btn');
    let i = tabs.indexOf(activeTab);
    if (i >= 0) {
      if (key === 'ArrowLeft') {
        if (i > 0) {
          (tabs[i - 1] as HTMLElement).click();
          (tabs[i - 1] as HTMLElement).focus();
          return true;
        }
      } else {
        if (i < tabs.length - 1) {
          (tabs[i + 1] as HTMLElement).click();
          (tabs[i + 1] as HTMLElement).focus();
          return true;
        }
      }
    }
  }
  return false;
}


export interface DockTabBarProps extends TabNavListProps {
  data: PanelData,
  onUpdate: () => void;
  isMaximized: boolean;
  setDragging: (dragging: boolean) => void;
  TabNavList: React.ComponentType<TabNavListProps>;
}

export function DockTabBar(props: DockTabBarProps) {
  const {
    //onDragStart, onDragMove, onDragEnd, onDragOver, onDrop, 
    TabNavList, isMaximized, data, onUpdate, setDragging,
    ...restProps
  } = props;

  const layout = React.useContext(DockContextType);

  const ref = React.useRef<HTMLDivElement>();
  const getRef = (div: HTMLDivElement) => {
    ref.current = div;
  };


  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.startsWith('Arrow')) {
      if (!checkLocalTabMove(e.key, ref.current) && !isMaximized) {
        layout.navigateToPanel(ref.current, e.key);
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };
  return (
    <FloatHeader data={data} getRef={getRef} setDragging={setDragging} onUpdate={onUpdate} className="dock-bar" role="tablist" onKeyDown={onKeyDown}>
      <TabNavList {...restProps} />
    </FloatHeader>
  );
}
