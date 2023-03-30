import * as React from "react";
import {DockContext, DockContextType, PanelData, TabData} from "./DockData";
import {DockTabs} from "./DockTabs";
import {DragDropDiv} from "./dragdrop/DragDropDiv";
import {DragState} from "./dragdrop/DragManager";
import {DockDropLayer} from "./DockDropLayer";
import {getFloatPanelSize, nextZIndex} from "./Algorithm";
import {DockDropEdge} from "./DockDropEdge";
import {groupClassNames} from "./Utils";
import classNames from "classnames";
import {FloatResizer} from "./FloatDrag";

interface Props {
  panelData: PanelData;
  size: number;
}

interface State {
  dropFromPanel: PanelData;
  draggingHeader: boolean;
}

export class DockPanel extends React.PureComponent<Props, State> {
  static contextType = DockContextType;

  context!: DockContext;

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
    if (r) {
      let {parent} = this.props.panelData;
      if ((parent?.mode === 'float')) {
        r.addEventListener('pointerdown', this.onFloatPointerDown, {capture: true, passive: true});
      }
    }
  };

  static _droppingPanel: DockPanel;
  static set droppingPanel(panel: DockPanel) {
    if (DockPanel._droppingPanel === panel) {
      return;
    }
    if (DockPanel._droppingPanel) {
      DockPanel._droppingPanel.onDragOverOtherPanel();
    }
    DockPanel._droppingPanel = panel;
  }

  state: State = {dropFromPanel: null, draggingHeader: false};

  onDragOver = (e: DragState) => {
    if (DockPanel._droppingPanel === this) {
      return;
    }
    let dockId = this.context.getDockId();
    let tab: TabData = DragState.getData('tab', dockId);
    let panel: PanelData = DragState.getData('panel', dockId);
    if (tab || panel) {
      DockPanel.droppingPanel = this;
    }
    if (tab) {
      if (tab.parent) {
        this.setState({dropFromPanel: tab.parent});
      } else {
        // add a fake panel
        this.setState({dropFromPanel: {activeId: '', tabs: [], group: tab.group}});
      }
    } else if (panel) {
      this.setState({dropFromPanel: panel});
    }
  };

  onDragOverOtherPanel() {
    if (this.state.dropFromPanel) {
      this.setState({dropFromPanel: null});
    }
  }

  onFloatPointerDown = () => {
    let {panelData} = this.props;
    let {z} = panelData;
    let newZ = nextZIndex(z);
    if (newZ !== z) {
      panelData.z = newZ;
      this.forceUpdate();
    }
  };

  onPanelClicked = (e: React.MouseEvent) => {
    const target = e.nativeEvent.target;
    if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
      (this._ref.querySelector('.dock-bar') as HTMLElement)?.focus();
    }
  };

  render(): React.ReactNode {
    let {dropFromPanel, draggingHeader} = this.state;
    let {panelData, size} = this.props;
    let {minWidth, minHeight, maxWidth, maxHeight, group, id, parent, panelLock} = panelData;
    let styleName = group;
    let tabGroup = this.context.getGroup(group);
    let {widthFlex, heightFlex} = tabGroup;
    if (panelLock) {
      let {panelStyle, widthFlex: panelWidthFlex, heightFlex: panelHeightFlex} = panelLock;
      if (panelStyle) {
        styleName = panelStyle;
      }
      if (typeof panelWidthFlex === 'number') {
        widthFlex = panelWidthFlex;
      }
      if (typeof panelHeightFlex === 'number') {
        heightFlex = panelHeightFlex;
      }
    }
    let panelClass: string = classNames(groupClassNames(styleName))
    let isMax = parent?.mode === 'maximize';
    let isFloat = parent?.mode === 'float';
    let isHBox = parent?.mode === 'horizontal';
    let isVBox = parent?.mode === 'vertical';

    //let onPanelHeaderDragStart = this.onPanelHeaderDragStart;

    if (isMax) {
      dropFromPanel = null;
      //onPanelHeaderDragStart = null;
    }
    let cls = `dock-panel ${panelClass ? panelClass : ''}${dropFromPanel ? ' dock-panel-dropping' : ''}${draggingHeader ? ' dragging' : ''
      }`;
    let flex = 1;
    if (isHBox && widthFlex != null) {
      flex = widthFlex;
    } else if (isVBox && heightFlex != null) {
      flex = heightFlex;
    }
    let flexGrow = flex * size;
    let flexShrink = flex * 1000000;
    if (flexShrink < 1) {
      flexShrink = 1;
    }

    let style: React.CSSProperties = {minWidth, minHeight, maxWidth: maxWidth || "", maxHeight: maxHeight || "", flex: `${flexGrow} ${flexShrink} ${size}px`};
    if (isFloat) {
      style.left = panelData.x;
      style.top = panelData.y;
      style.width = panelData.w;
      style.height = panelData.h;
      style.zIndex = panelData.z;
    }
    let droppingLayer: React.ReactNode;
    if (dropFromPanel && panelData.dropMode?.length !== 0) {
      let dropFromGroup = this.context.getGroup(dropFromPanel.group);
      let dockId = this.context.getDockId();
      if (!dropFromGroup.tabLocked || DragState.getData('tab', dockId) == null) {
        // not allowed locked tab to create new panel
        let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
        droppingLayer = <DockDropClass panelData={panelData} panelElement={this._ref} dropFromPanel={dropFromPanel} />;
      }
    }

    return (
      <DragDropDiv getRef={this.getRef} className={cls} style={style} data-dockid={id}
        onDragOverT={this.onDragOver} onClick={this.onPanelClicked}>
        <DockTabs
          panelData={panelData}
          setDragging={draggingHeader => this.setState({draggingHeader})}
          onUpdate={() => this.forceUpdate()}
        />
        {isFloat && <FloatResizer data={this.props.panelData} onUpdate={() => this.forceUpdate()} />}
        {droppingLayer}
      </DragDropDiv>
    );
  }

  _unmounted = false;

  componentWillUnmount(): void {
    if (DockPanel._droppingPanel === this) {
      DockPanel.droppingPanel = null;
    }
    if (this._ref) {
      this._ref.removeEventListener('pointerdown', this.onFloatPointerDown, {capture: true});
    }
    this._unmounted = true;
  }
}
