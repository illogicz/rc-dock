import * as React from "react";
import {BoxData, DockContext, DockContextType} from "./DockData";
import {Divider, DividerChild} from "./Divider";
import {DockPanel} from "./DockPanel";
import {FloatResizer} from "./FloatDrag";

interface Props {
  size: number;
  boxData: BoxData;
}

export class DockBox extends React.PureComponent<Props, any> {
  static contextType = DockContextType;

  context!: DockContext;

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
  };

  getDividerData = (idx: number) => {
    if (!this._ref) {
      return null;
    }
    let {children, mode} = this.props.boxData;
    let nodes = this._ref.childNodes;
    if (nodes.length < children.length * 2 - 1) {
      return;
    }
    let dividerChildren: DividerChild[] = [];
    for (let i = 0; i < children.length; ++i) {
      if (mode === 'vertical') {
        dividerChildren.push({size: (nodes[i * 2] as HTMLElement).offsetHeight, minSize: children[i].minHeight, maxSize: children[i].maxHeight});
      } else {
        dividerChildren.push({size: (nodes[i * 2] as HTMLElement).offsetWidth, minSize: children[i].minWidth, maxSize: children[i].maxWidth});
      }
    }
    return {
      element: this._ref,
      beforeDivider: dividerChildren.slice(0, idx),
      afterDivider: dividerChildren.slice(idx)
    };
  };
  changeSizes = (sizes: number[]) => {
    console.log(sizes);
    let {children} = this.props.boxData;
    if (children.length !== sizes.length) {
      return;
    }
    for (let i = 0; i < children.length; ++i) {
      children[i].size = sizes[i];
    }
    this.forceUpdate();
  };

  onDragEnd = () => {
    this.context.onSilentChange(null, 'move');
  };

  render(): React.ReactNode {
    let {boxData} = this.props;
    let {minWidth, minHeight, maxWidth, maxHeight, size, children, mode, id, widthFlex, heightFlex, parent} = boxData;
    let isVertical = mode === 'vertical';
    let childrenRender: React.ReactNode[] = [];
    for (let i = 0; i < children.length; ++i) {
      if (i > 0) {
        childrenRender.push(
          <Divider idx={i} key={i} isVertical={isVertical} onDragEnd={this.onDragEnd}
            getDividerData={this.getDividerData} changeSizes={this.changeSizes} />
        );
      }
      let child = children[i];
      if ('tabs' in child) {
        childrenRender.push(<DockPanel size={child.size} panelData={child} key={child.id} />);
        // render DockPanel
      } else if ('children' in child) {
        childrenRender.push(<DockBox size={child.size} boxData={child} key={child.id} />);
      }
    }
    let cls: string;
    let flex = 1;
    if (mode === 'vertical') {
      cls = 'dock-box dock-vbox';
      if (widthFlex != null) {
        flex = widthFlex;
      }
    } else {
      // since special boxes dont reuse this render function, this can only be horizontal box
      cls = 'dock-box dock-hbox';
      if (heightFlex != null) {
        flex = heightFlex;
      }
    }

    let flexGrow = flex * size;
    let flexShrink = flex * 1000000;
    if (flexShrink < 1) {
      flexShrink = 1;
    }
    const style: React.CSSProperties = {minWidth, minHeight, maxWidth, maxHeight, flex: `${flexGrow} ${flexShrink} ${size}px`}
    const isFloat = parent?.mode === "float";
    if (isFloat) {
      style.left = boxData.x;
      style.top = boxData.y;
      style.width = boxData.w;
      style.height = boxData.h;
      style.zIndex = boxData.z;
      style.position = "absolute";
      cls += " dock-box-float";
      childrenRender.unshift()
    }

    return (
      <div ref={this.getRef} className={cls} data-dockid={id} style={style}>
        {childrenRender}
        {isFloat && <FloatResizer
          data={this.props.boxData}
          onUpdate={() => this.forceUpdate()}
        />}
      </div>
    );
  }
}
