import * as React from "react";
import {BoxData, DockContext, DockContextType} from "./DockData";
import {Divider, DividerChild} from "./Divider";
import {DockPanel} from "./DockPanel";
import {FloatResizer} from "./dragdrop/FloatResizer";
import {DragDropContainer} from "./dragdrop/DragDropContainer";

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

    const nodes = Array.from(this._ref.children).filter(el => el.classList.contains('dock-child'));
    if (nodes.length !== children.length) {
      console.warn("children size dont match");
      debugger;
      return;
    }


    //childNodes
    let dividerChildren: DividerChild[] = [];
    for (let i = 0; i < children.length; ++i) {
      if (mode === 'vertical') {
        dividerChildren.push({size: (nodes[i] as HTMLElement).offsetHeight, minSize: children[i].minHeight, maxSize: children[i].maxHeight});
      } else {
        dividerChildren.push({size: (nodes[i] as HTMLElement).offsetWidth, minSize: children[i].minWidth, maxSize: children[i].maxWidth});
      }
    }
    return {
      element: this._ref,
      beforeDivider: dividerChildren.slice(0, idx),
      afterDivider: dividerChildren.slice(idx)
    };
  };
  changeSizes = (sizes: number[]) => {
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
    let {boxData, size} = this.props;
    let {children, mode, id, widthFlex, heightFlex} = boxData;
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

    const cls = 'dock-box ' + (isVertical ? 'dock-vbox' : 'dock-hbox');
    const flex = (isVertical ? heightFlex : widthFlex) ?? 1;

    return (
      <DragDropContainer
        data={boxData}
        getRef={this.getRef}
        className={cls}
        data-dockid={id}
        flex={flex}
        size={size}>
        {childrenRender}
      </DragDropContainer>
    );
  }
}
