import classNames from "classnames";
import * as React from "react";
import {BoxData, DockContext, DockContextType, PanelData, TabData} from "./DockData";
import {DockDropEdge} from "./DockDropEdge";
import {DockDropLayer} from "./DockDropLayer";
import {DockTabs} from "./DockTabs";
import {groupClassNames, isPanel} from "./Utils";
import {DragDropContainer} from "./dragdrop/DragDropContainer";
import {DragState} from "./dragdrop/DragManager";
import {getFloatPanelSize} from "./Algorithm";

interface Props {
  panelData: PanelData;
  size: number;
}

interface State {
  dropFrom: PanelData | BoxData;
  draggingHeader: boolean;
}

export class DockPanel extends React.PureComponent<Props, State> {
  static contextType = DockContextType;

  context!: DockContext;

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => this._ref = r;

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

  state: State = {dropFrom: null, draggingHeader: false};

  onDragOver = (e: DragState) => {
    let dockId = this.context.getDockId();
    if (DockPanel._droppingPanel === this) {
      return;
    }
    let tab: TabData = DragState.getData('tab', dockId);
    let panel: PanelData = DragState.getData('panel', dockId);
    let box: BoxData = DragState.getData('box', dockId);
    if (tab || panel || box) {
      DockPanel.droppingPanel = this;
    }
    if (tab) {
      if (tab.parent) {
        this.setState({dropFrom: tab.parent});
      } else {
        // add a fake panel
        this.setState({dropFrom: {activeId: '', tabs: [], group: tab.group}});
      }
    } else if (panel) {
      this.setState({dropFrom: panel});
    } else if (box) {
      this.setState({dropFrom: box});
    }
  };

  onDragOverOtherPanel() {
    if (this.state.dropFrom) {
      this.setState({dropFrom: null});
    }
  }

  onPanelClicked = (e: React.MouseEvent) => {
    const target = e.nativeEvent.target;
    if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
      (this._ref.querySelector('.dock-bar') as HTMLElement)?.focus();
    }
  };


  render(): React.ReactNode {
    let {dropFrom, draggingHeader} = this.state;
    let {panelData, size} = this.props;
    let {group, parent, panelLock} = panelData;
    let styleName = group;
    let tabGroup = this.context.getGroup(group);

    let panelClass = classNames(
      groupClassNames(styleName)
    );
    let isMax = parent?.mode === 'maximize';
    let isHBox = parent?.mode === 'horizontal';
    let isVBox = parent?.mode === 'vertical';

    const flex =
      (isHBox && (panelLock?.widthFlex ?? tabGroup.widthFlex)) ||
      (isVBox && (panelLock?.heightFlex ?? tabGroup.heightFlex)) || 1

    if (isMax) {
      dropFrom = null;
    }
    let cls = `dock-panel ${panelClass || ''}${dropFrom ? ' dock-panel-dropping' : ''}`

    let droppingLayer: React.ReactNode;
    if (dropFrom && panelData.dropMode?.length !== 0) {
      let dropFromGroup = isPanel(dropFrom) ? this.context.getGroup(dropFrom.group) : null;
      let dockId = this.context.getDockId();
      if (!dropFromGroup?.tabLocked || DragState.getData('tab', dockId) == null) {
        // not allowed locked tab to create new panel
        //let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
        droppingLayer = <DockDropEdge data={panelData} panelElement={this._ref} dropFrom={dropFrom} />;
      }
    }

    console.log({droppingLayer, dropFrom});

    return (
      <DragDropContainer
        getRef={this.getRef}
        className={cls}
        flex={flex}
        size={size}
        dragging={draggingHeader}
        onDragOverT={this.onDragOver}
        onClick={this.onPanelClicked}
        data={panelData}
      >
        <DockTabs panelData={panelData}
          onDragMoveT={() => this.forceUpdate()}
          onDragStartT={() => this.setState({draggingHeader: true})}
          onDragEndT={() => this.setState({draggingHeader: false})}
        />
        {droppingLayer}
      </DragDropContainer>
    );
  }

  componentWillUnmount(): void {
    if (DockPanel._droppingPanel === this) {
      DockPanel.droppingPanel = null;
    }
  }
}
