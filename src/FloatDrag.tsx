import classNames from "classnames";
import * as React from "react";
import {getFloatPanelSize, nextZIndex} from "./Algorithm";
import {BoxData, DockContext, DockContextType, PanelData} from "./DockData";
import {DragDropDiv} from "./dragdrop/DragDropDiv";
import {DragState} from "./dragdrop/DragManager";
import {groupClassNames, isBox, isPanel} from "./Utils";

interface Props {
  data: PanelData | BoxData;
  onUpdate: () => void;
  //header?: HTMLElement;
}

interface State {
  //dropFromPanel: PanelData;
  draggingHeader: boolean;
}

export class FloatResizer extends React.PureComponent<Props, State> {
  static contextType = DockContextType;

  context!: DockContext;

  // used both by dragging head and corner
  _movingX: number;
  _movingY: number;
  _movingW: number;
  _movingH: number;
  _movingCorner: string;
  onCornerDragT = (e: DragState) => {
    this.onCornerDrag(e, 't');
  };
  onCornerDragB = (e: DragState) => {
    this.onCornerDrag(e, 'b');
  };
  onCornerDragL = (e: DragState) => {
    this.onCornerDrag(e, 'l');
  };
  onCornerDragR = (e: DragState) => {
    this.onCornerDrag(e, 'r');
  };
  onCornerDragTL = (e: DragState) => {
    this.onCornerDrag(e, 'tl');
  };
  onCornerDragTR = (e: DragState) => {
    this.onCornerDrag(e, 'tr');
  };
  onCornerDragBL = (e: DragState) => {
    this.onCornerDrag(e, 'bl');
  };
  onCornerDragBR = (e: DragState) => {
    this.onCornerDrag(e, 'br');
  };

  onCornerDrag(e: DragState, corner: string) {
    let {parent, x, y, w, h} = this.props.data;
    //if (parent?.mode === 'float') {
    this._movingCorner = corner;
    this._movingX = x;
    this._movingY = y;
    this._movingW = w;
    this._movingH = h;
    e.startDrag(null, null);
    //}
  }

  onCornerDragMove = (e: DragState) => {
    let {data} = this.props;
    let {dx, dy} = e;

    const l = this._movingCorner.indexOf("l") >= 0;
    const r = this._movingCorner.indexOf("r") >= 0;
    const t = this._movingCorner.indexOf("t") >= 0;
    const b = this._movingCorner.indexOf("b") >= 0;

    if (l || r) {
      const right = data.x + data.w;
      let w = this._movingW + (l ? -dx : dx);
      if (data.minWidth)
        w = Math.max(data.minWidth, w);
      else if (data.maxWidth)
        w = Math.min(data.maxHeight, w);

      data.w = w;
      if (l) data.x = right - w;
    }

    if (t || b) {
      let h = this._movingH + (t ? -dy : dy);

      if (data.minHeight)
        h = Math.max(data.minHeight, h);
      else if (data.maxHeight)
        h = Math.min(data.maxHeight, h);

      if (t) {
        let bottom = data.y + data.h;
        const layoutBottom = this.context.getLayoutSize().height - 30;
        const y = bottom - h;
        console.log({y, layoutBottom});
        if (y < 0) h = bottom;
        if (y > layoutBottom) h = bottom - layoutBottom;
        data.y = bottom - h;
      }

      data.h = h;

    }

    this.props.onUpdate();

  };
  onCornerDragEnd = (e: DragState) => {
    const activeId = isPanel(this.props.data) ? this.props.data.activeId : null;
    this.context.onSilentChange(activeId, 'move');
  };

  onPointerDown = () => {
    let {data} = this.props;
    let {z} = data;
    let newZ = nextZIndex(z);
    if (newZ !== z) {
      data.z = newZ;
      this.props.onUpdate();
    }
  };

  // onClicked = (e: React.MouseEvent) => {
  //   const target = e.nativeEvent.target;
  //   if (!this._ref.contains(this._ref.ownerDocument.activeElement) && target instanceof Node && this._ref.contains(target)) {
  //     (this._ref.querySelector('.dock-bar') as HTMLElement)?.focus();
  //   }
  // };

  render(): React.ReactNode {
    //let {draggingHeader} = this.state;
    let {data} = this.props;
    let {minWidth, minHeight, maxWidth, maxHeight, id, parent} = data;
    let styleName = "";
    let prefix = "";
    let widthFlex = 0, heightFlex = 0;
    if ('children' in data) {
      prefix = "dock-box";
    } else {
      let {group, panelLock} = data;
      prefix = "dock-panel";
      styleName = group;
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
    }
    let panelClass: string = classNames(groupClassNames(styleName))
    let isMax = parent?.mode === 'maximize';
    let isFloat = parent?.mode === 'float';
    let isHBox = parent?.mode === 'horizontal';
    let isVBox = parent?.mode === 'vertical';

    let onHeaderDragStart = null; //this.onHeaderDragStart;

    if (isMax) {
      //      dropFromPanel = null;
      onHeaderDragStart = null;
    }
    // let cls = `${prefix} ${panelClass ? panelClass : ''}${dropFromPanel ? ` ${prefix}-dropping` : ''}${draggingHeader ? ' dragging' : ''
    //   }`;
    // let flex = 1;
    // if (isHBox && widthFlex != null) {
    //   flex = widthFlex;
    // } else if (isVBox && heightFlex != null) {
    //   flex = heightFlex;
    // }
    // let flexGrow = flex * size;
    // let flexShrink = flex * 1000000;
    // if (flexShrink < 1) {
    //   flexShrink = 1;
    // }

    // let style: React.CSSProperties = {minWidth, minHeight, maxWidth: maxWidth || "", maxHeight: maxHeight || "", flex: `${flexGrow} ${flexShrink} ${size}px`};
    // if (isFloat) {
    //   style.left = data.x;
    //   style.top = data.y;
    //   style.width = data.w;
    //   style.height = data.h;
    //   style.zIndex = data.z;
    // }
    // let droppingLayer: React.ReactNode;
    // if (dropFromPanel && data.dropMode?.length !== 0) {
    //   let dropFromGroup = this.context.getGroup(dropFromPanel.group);
    //   let dockId = this.context.getDockId();
    //   if (!dropFromGroup.tabLocked || DragState.getData('tab', dockId) == null) {
    //     // not allowed locked tab to create new panel
    //     let DockDropClass = this.context.useEdgeDrop() ? DockDropEdge : DockDropLayer;
    //     droppingLayer = <DockDropClass panelData={data} panelElement={this._ref} dropFromPanel={dropFromPanel} />;
    //   }
    // }

    return <>

      <DragDropDiv key="drag-size-t" className={`${prefix}-drag-size ${prefix}-drag-size-t`}
        onDragStartT={this.onCornerDragT} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-b" className={`${prefix}-drag-size ${prefix}-drag-size-b`}
        onDragStartT={this.onCornerDragB} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-l" className={`${prefix}-drag-size ${prefix}-drag-size-l`}
        onDragStartT={this.onCornerDragL} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-r" className={`${prefix}-drag-size ${prefix}-drag-size-r`}
        onDragStartT={this.onCornerDragR} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-t-l" className={`${prefix}-drag-size ${prefix}-drag-size-t-l`}
        onDragStartT={this.onCornerDragTL} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-t-r" className={`${prefix}-drag-size ${prefix}-drag-size-t-r`}
        onDragStartT={this.onCornerDragTR} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-b-l" className={`${prefix}-drag-size ${prefix}-drag-size-b-l`}
        onDragStartT={this.onCornerDragBL} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
      <DragDropDiv key="drag-size-b-r" className={`${prefix}-drag-size ${prefix}-drag-size-b-r`}
        onDragStartT={this.onCornerDragBR} onDragMoveT={this.onCornerDragMove}
        onDragEndT={this.onCornerDragEnd} />
    </>;
  }

  _unmounted = false;

  // componentWillUnmount(): void {
  //   // if (DockPanel._droppingPanel === this) {
  //   //   DockPanel.droppingPanel = null;
  //   // }
  //   if (this._ref) {
  //     this._ref.removeEventListener('pointerdown', this.onFloatPointerDown, {capture: true});
  //   }
  //   this._unmounted = true;
  // }
}

interface FloatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  data: PanelData | BoxData;
  getRef?: (div: HTMLDivElement) => void,
  setDragging: (dragging: boolean) => void;
  onUpdate: () => void;
}

export class FloatHeader extends React.PureComponent<FloatHeaderProps, State> {

  static contextType = DockContextType;
  context!: DockContext;

  _movingX: number;
  _movingY: number;

  setDragging = (draggingHeader: boolean) => {
    this.setState({draggingHeader});
    this.props.setDragging(draggingHeader);
  }

  onDragStart = (event: DragState) => {
    const {data} = this.props;
    const {parent, x, y, z} = data;
    const dockId = this.context.getDockId();

    if (parent?.mode === 'float') {
      this._movingX = x;
      this._movingY = y;

      if (isPanel(data)) {
        // hide the panel, but not create drag layer element
        event.setData({panel: data, tabGroup: data.group}, dockId);
        event.startDrag(null, null);
      }
    } else if (isPanel(data)) {

      let tabGroup = this.context.getGroup(data.group);
      let [panelWidth, panelHeight] = getFloatPanelSize(null, tabGroup);
      event.setData({panel: data, panelSize: [panelWidth, panelHeight], tabGroup: data.group}, dockId);
      event.startDrag(null);
    }
    this.setDragging(true);
  }

  onDragMove = (e: DragState) => {
    let {data} = this.props;
    if (data.parent?.mode !== 'float') {
      return;
    }
    let {width, height} = this.context.getLayoutSize();
    data.x = this._movingX + e.dx;
    data.y = this._movingY + e.dy;
    if (width > 200 && height > 200) {
      if (data.y < 0) {
        data.y = 0;
      } else if (data.y > height - 16) {
        data.y = height - 16;
      }

      if (data.x + data.w < 16) {
        data.x = 16 - data.w;
      } else if (data.x > width - 16) {
        data.x = width - 16;
      }
    }
    this.props.onUpdate();
  };

  onDragEnd = (e: DragState) => {
    this.setDragging(false);
    if (e.dropped === false) {
      let {data} = this.props;
      if (data.parent?.mode === 'float') {
        const id = isPanel(data) ? data.activeId : undefined;
        this.context.onSilentChange(id, 'move');
      }
    }
  };

  onDragOver = (e: DragState) => {
    let {data} = this.props;
    if (isBox(data)) return e.reject();


    let dockId = this.context.getDockId();
    const tab = DragState.getData("tab", dockId);
    const panel = DragState.getData("panel", dockId) ?? tab.parent;
    if (!panel || panel.group !== data.group || panel === data) {
      e.reject();
      return;
    }
    this.context.setDropRect(e.event.target as HTMLElement);
    e.accept('');
  };

  onDrop = (e: DragState) => {
    if (e.rejected) return false;
    let {data} = this.props;
    if (isBox(data)) return e.reject();

    let dockId = this.context.getDockId();
    const tab = DragState.getData("tab", dockId);
    const panel = DragState.getData("panel", dockId);
    if (tab ?? panel) {
      this.context.dockMove(tab ?? panel, data.tabs[data.tabs.length - 1], "after-tab");
      return true;
    }
    return false;
  }

  onDragLeave = (e: DragState) => {
    this.context.setDropRect(null, 'remove', this);
  };

  onPointerDown = () => {
    let {data} = this.props;
    let {z} = data;
    let newZ = nextZIndex(z);
    if (newZ !== z) {
      data.z = newZ;
      this.props.onUpdate?.();
    }
  };

  render() {

    const isMax = this.props.data.parent?.mode === "maximize";

    return (
      <DragDropDiv
        onDragStartT={isMax ? undefined : this.onDragStart}
        onDragMoveT={this.onDragMove}
        onDragEndT={this.onDragEnd}
        onDragOverT={this.onDragOver}
        onDropT={this.onDrop}
        onKeyDown={this.props.onKeyDown}
        className={"dock-bar " + (this.props.className ?? "")}
        getRef={this.props.getRef}
        tabIndex={-1}
      >
        {this.props.children}
      </DragDropDiv>
    );
  }
}


