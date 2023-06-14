import * as React from "react";
import {nextZIndex} from "../Algorithm";
import {BoxData, DockContext, DockContextType, PanelData} from "../DockData";
import {DragDropDiv, DragDropHandlers} from "./DragDropDiv";
import * as DragManager from "./DragManager";
import {FloatResizer} from "./FloatResizer";
import {isBox} from "../Utils";
import {DragHeader} from "./DragHeader";


interface Props extends DragDropHandlers, React.HTMLAttributes<HTMLDivElement> {
  data: PanelData | BoxData;
  flex: number,
  size: number,
  getRef?: (r: HTMLDivElement) => void;
  dragging?: boolean;
}

export class DragDropContainer extends React.Component<Props> {
  static contextType = DockContextType;
  context!: DockContext;

  state = {dragging: false};

  _ref?: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this.removeEventListeners();
    this._ref = r;
    if (this.props.data.parent?.mode === 'float') {
      r?.addEventListener('pointerdown', this.onPointerDown, true);
    }
    this.props.getRef?.(r);
  }

  onPointerDown = () => {
    let {data} = this.props;
    if (data.z !== (data.z = nextZIndex(data.z))) {
      this.update();
    }
  };

  update = () => this.forceUpdate();

  onDragMove = (e: DragManager.DragState) => {
    this.props.onDragMoveT?.(e);
    this.forceUpdate();
  }

  render(): React.ReactNode {
    let {data, children, className, style, flex, size, dragging, getRef, onDragMoveT, ...rest} = this.props;

    let {id, minWidth, minHeight, maxWidth, maxHeight} = data;
    const isFloating = data.parent?.mode === 'float';

    style = {
      ...style,
      minWidth, minHeight,
      maxWidth, maxHeight,
      flex: `${flex * size} ${Math.max(1, flex * 1000000)} ${size}px`
    }

    className += ' dock-child';

    let resizer: JSX.Element = null;
    let header: JSX.Element = null;
    if (isFloating) {
      resizer = <FloatResizer data={this.props.data} onResize={this.update} />
      className += ` dock-${isBox(data) ? 'box' : 'panel'}-float`;
      style = {
        left: data.x,
        top: data.y,
        width: data.w,
        height: data.h,
        zIndex: data.z,
        position: 'absolute',
      }
      if (isBox(data)) {
        header = (<DragHeader
          onDragStartT={() => this.setState({dragging: true})}
          onDragEndT={() => this.setState({dragging: false})}
          onDragMoveT={() => this.forceUpdate()} data={data} className="dock-bar" style={{height: 20, background: "#000000", position: "absolute", top: -20, left: 0, right: 0}}>
          <div >d</div>
        </DragHeader>
        )
      }
    }

    if (dragging || this.state.dragging) {
      className += ' dragging';
    }

    return (
      <DragDropDiv
        {...rest}
        className={className}
        style={style}
        data-dockid={id}
        onDragMoveT={this.onDragMove}
        getRef={this.getRef}
      >
        {header}
        {children}
        {resizer}
      </DragDropDiv>
    );
  }

  removeEventListeners() {
    this._ref?.removeEventListener('pointerdown', this.onPointerDown, true);
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

}
