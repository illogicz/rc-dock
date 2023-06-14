import * as React from "react";
import {getFloatPanelSize} from "../Algorithm";
import {BoxData, DockContext, DockContextType, PanelData} from "../DockData";
import {isBox, isPanel} from "../Utils";
import {DragDropDiv, DragDropHandlers} from "./DragDropDiv";
import {DragState} from "./DragManager";


interface Props extends DragDropHandlers, React.HTMLAttributes<HTMLDivElement> {
  data: PanelData | BoxData;
  getRef?: (div: HTMLDivElement) => void,
}

export class DragHeader extends React.PureComponent<Props> {

  static contextType = DockContextType;
  context!: DockContext;

  _movingX: number;
  _movingY: number;

  private onDragStart = (e: DragState) => {
    const {data} = this.props;
    const {parent, x, y} = data;
    const dockId = this.context.getDockId();
    if (parent?.mode === 'float') {
      this._movingX = x;
      this._movingY = y;
      if (isPanel(data)) {
        // hide the panel, but not create drag layer element
        e.setData({panel: data, tabGroup: data.group}, dockId);
        e.startDrag(null, null);
      } else if (isBox(data)) {
        e.setData({box: data}, dockId);
        e.startDrag(null, null);
      }
    } else if (isPanel(data)) {

      let tabGroup = this.context.getGroup(data.group);
      let [panelWidth, panelHeight] = getFloatPanelSize(null, tabGroup);
      e.setData({panel: data, panelSize: [panelWidth, panelHeight], tabGroup: data.group}, dockId);
      e.startDrag(null);
    }
    this.props.onDragStartT?.(e);
  }

  private onDragMove = (e: DragState) => {
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
    this.props?.onDragMoveT?.(e);
  };

  private onDragEnd = (e: DragState) => {
    this.props?.onDragEndT?.(e);
    if (e.dropped === false) {
      let {data} = this.props;
      if (data.parent?.mode === 'float') {
        const id = isPanel(data) ? data.activeId : undefined;
        this.context.onSilentChange(id, 'move');
      }
    }
  };

  private onDragOver = (e: DragState) => {
    let {data} = this.props;
    if (!isBox(data)) {
      let dockId = this.context.getDockId();
      const tab = DragState.getData("tab", dockId);
      const panel = DragState.getData("panel", dockId) ?? tab?.parent;
      if (!panel || panel.group !== data.group || panel === data) {
        e.reject();
        return;
      } else {
        this.context.setDropRect(e.event.target as HTMLElement);
        e.accept('');
      }
      this.props?.onDragOverT?.(e);
    }
  };

  private onDrop = (e: DragState) => {
    if (e.rejected) return false;
    let {data} = this.props;
    if (isBox(data)) return e.reject();

    let dockId = this.context.getDockId();
    const tab = DragState.getData("tab", dockId);
    const panel = DragState.getData("panel", dockId);
    if (tab ?? panel) {
      this.context.dockMove(tab ?? panel, data.tabs[data.tabs.length - 1], "after-tab");
      this.props.onDropT?.(e);
      return true;
    } else {
      this.props.onDropT?.(e);
      return false;
    }
  }

  private onDragLeave = (e: DragState) => {
    this.context.setDropRect(null, 'remove');
    this.props?.onDragLeaveT?.(e);
  };

  render() {
    const {data, onDragStartT, onDragEndT, onDragMoveT, onDragOverT, onDragLeaveT, onDropT, children, ...rest} = this.props
    const isMax = data.parent?.mode === "maximize";


    return (
      <DragDropDiv
        {...rest}
        onDragStartT={isMax ? undefined : this.onDragStart}
        onDragMoveT={this.onDragMove}
        onDragEndT={this.onDragEnd}
        onDragOverT={this.onDragOver}
        onDragLeaveT={this.onDragLeave}
        onDropT={this.onDrop}
        onKeyDown={this.props.onKeyDown}
        tabIndex={-1}
      >
        {children}
        {/* <div style={{position: "absolute", right: 0, top: 0}}>
          {this.props.data.id}
        </div> */}

      </DragDropDiv>
    );
  }
}


