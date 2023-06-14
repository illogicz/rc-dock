import * as React from "react";
import {BoxData, DockContext, DockContextType, PanelData} from "../DockData";
import {isPanel} from "../Utils";
import {DragDropDiv} from "./DragDropDiv";
import {DragState} from "./DragManager";

interface Props {
  data: PanelData | BoxData;
  onResize?: () => void;
}

export class FloatResizer extends React.PureComponent<Props> {
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
        if (y < 0) h = bottom;
        if (y > layoutBottom) h = bottom - layoutBottom;
        data.y = bottom - h;
      }

      data.h = h;

    }

    this.props.onResize();

  };
  onCornerDragEnd = (e: DragState) => {
    const activeId = isPanel(this.props.data) ? this.props.data.activeId : null;
    this.context.onSilentChange(activeId, 'move');
  };

  render(): React.ReactNode {
    let {data} = this.props;
    let prefix = "";
    if ('children' in data) {
      prefix = "dock-box";
    } else {
      prefix = "dock-panel";
    }

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

}