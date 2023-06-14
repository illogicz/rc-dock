import {cloneDeep} from "lodash";
import * as React from "react";
import {
  BoxData,
  DockContext,
  DockContextType,
  DockMode,
  DropDirection,
  PanelData,
  TabData,
  TabGroup
} from "./DockData";
import {DragDropDiv} from "./dragdrop/DragDropDiv";
import {DragState} from "./dragdrop/DragManager";
import {isBox, isPanel} from "./Utils";

interface DockDropEdgeProps {
  data: PanelData;
  panelElement: HTMLElement;
  dropFrom: PanelData | BoxData;
}

export class DockDropEdge extends React.PureComponent<DockDropEdgeProps, any> {
  static contextType = DockContextType;

  context!: DockContext;

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
  };


  private getDirectionInternal(e: DragState, group: TabGroup | undefined, samePanel: boolean, single: boolean): {direction: DropDirection, mode?: DockMode, depth: number} {

    let rect = this._ref.getBoundingClientRect();
    let widthRate = Math.min(rect.width, 500);
    let heightRate = Math.min(rect.height, 500);
    let left = (e.clientX - rect.left) / widthRate;
    let right = (rect.right - e.clientX) / widthRate;
    let top = (e.clientY - rect.top) / heightRate;
    let bottom = (rect.bottom - e.clientY) / heightRate;

    const {dropMode} = this.props.data;
    if (dropMode) {
      if (dropMode.indexOf('vertical') < 0) {
        if (dropMode.indexOf('top') < 0) top = NaN;
        if (dropMode.indexOf('bottom') < 0) bottom = NaN;
      }
      if (dropMode.indexOf('horizontal') < 0) {
        if (dropMode.indexOf('left') < 0) left = NaN;
        if (dropMode.indexOf('right') < 0) right = NaN;
      }
    }

    let min = Math.min(...[left, right, top, bottom].filter(n => !isNaN(n)));

    let depth = 0;
    if (group?.disableDock) {
      // use an impossible min value to disable dock drop
      min = 1;
    }
    if (min < 0) {
      return {direction: null, depth: 0};
    } else if (min < 0.075) {
      depth = 3; // depth 3 or 4
    } else if (min < 0.15) {
      depth = 1; // depth 1 or 2
    } else if (min < 0.3) {
      // default;
    } else if (isBox(this.props.dropFrom)) {
      return {direction: 'float', mode: 'float', depth: 0};

    } else if (group?.floatable) {
      if (group.floatable === 'singleTab') {
        if (single) {
          // singleTab can float only with one tab
          return {direction: 'float', mode: 'float', depth: 0};
        }
      } else {
        if (this.props.data.group !== this.props.dropFrom.group) {
          return {direction: 'float', mode: 'float', depth: 0};
        } else {
          return {direction: "middle", depth: 0};
        }
      }
    }

    switch (min) {
      case left: {
        return {direction: 'left', mode: 'horizontal', depth};
      }
      case right: {
        return {direction: 'right', mode: 'horizontal', depth};
      }
      case top: {
        return {direction: 'top', mode: 'vertical', depth};
      }
      case bottom: {
        return {direction: 'bottom', mode: 'vertical', depth};
      }
    }
    // probably a invalid input causing everything to be NaN?
    return {direction: null, depth: 0};
  }

  getDirection(e: DragState): {direction: DropDirection, depth: number; source?: PanelData | TabData | BoxData, move?: boolean} {
    const dockId = this.context.getDockId();
    let tab: TabData = DragState.getData('tab', dockId);
    const panel: PanelData = DragState.getData('panel', dockId) ?? tab?.parent;
    const box: BoxData = DragState.getData('box', dockId);
    if (tab?.parent?.tabs.length === 1) tab = null;
    const source = tab ?? panel ?? box;
    if (!source) return {direction: null, source, depth: 0};

    const from = this.props.dropFrom;
    const group = isPanel(from) ? this.context.getGroup(from.group) : undefined;
    const samePanel = this.props.data === source;

    let {depth: od, mode, direction} = this.getDirectionInternal(e, group, samePanel, !!tab);
    const depth = this.getActualDepth(od, mode, direction);

    console.log({od, depth, mode, direction, samePanel, source, data: this.props.data});

    if (depth === 0 && samePanel) {
      return {direction: null, source, depth: 0};
    }

    const move = direction === "float" && (panel ?? box)?.parent.mode === "float" && !tab;

    return {direction, source, move, depth};
  }

  getActualDepth(depth: number, mode: DockMode, direction: DropDirection): number {
    let afterPanel = (direction === 'bottom' || direction === 'right');
    if (!depth) {
      return depth;
    }
    let {data} = this.props;
    let previousTarget: BoxData | PanelData = data;
    let targetBox: BoxData = data.parent;
    let lastDepth = 0;
    if (data.parent.mode === mode) {
      ++depth;
    }
    while (targetBox && lastDepth < depth) {
      if (targetBox.mode === mode) {
        if (afterPanel) {
          if (targetBox.children.at(-1) !== previousTarget) {
            // dont go deeper if current target is on different side of the box
            break;
          }
        } else {
          if (targetBox.children[0] !== previousTarget) {
            // dont go deeper if current target is on different side of the box
            break;
          }
        }
      }
      if (targetBox.mode === "float") {
        break;
      }
      previousTarget = targetBox;
      targetBox = targetBox.parent;
      ++lastDepth;
    }
    while (depth > lastDepth) {
      depth -= 2;
    }
    return depth;
  }

  onDragOver = (e: DragState) => {
    let {direction, move, depth} = this.getDirection(e);

    console.log({direction, move, depth})

    if (move || !direction) {
      this.context.setDropRect(null, 'remove', this);
      if (!direction) return;
    } else {
      let targetElement = this.props.panelElement;
      for (let i = 0; i < depth; ++i) {
        targetElement = targetElement.parentElement;
      }
      let panelSize: [number, number] = DragState.getData('panelSize', this.context.getDockId());
      this.context.setDropRect(targetElement, direction, this, e, panelSize);
    }
    e.accept('');
  };

  onDragLeave = (e: DragState) => {
    this.context.setDropRect(null, 'remove', this);
  };

  onDrop = (e: DragState) => {
    let {direction, source, move, depth} = this.getDirection(e);
    if (!direction || move) {
      return;
    }

    let target: PanelData | BoxData = this.props.data;
    for (let i = 0; i < depth; ++i) {
      target = target.parent;
    }
    this.context.dockMove(source, target, direction);
  };

  render(): React.ReactNode {
    return (
      <DragDropDiv getRef={this.getRef} className="dock-drop-edge"
        onDragOverT={this.onDragOver} onDragLeaveT={this.onDragLeave} onDropT={this.onDrop} />
    );
  }

  componentWillUnmount()
    :
    void {
    this.context.setDropRect(null, 'remove', this);
  }
}
