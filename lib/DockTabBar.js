"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockTabBar = void 0;
const React = __importStar(require("react"));
const DockData_1 = require("./DockData");
const DragHeader_1 = require("./dragdrop/DragHeader");
/**
 * @return returns true if navigation is handled in local tab move, otherwise returns false
 */
function checkLocalTabMove(key, tabbar) {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        let tabs = Array.from(tabbar.querySelectorAll('.dock-tab-btn'));
        let activeTab = tabbar.querySelector('.dock-tab-active>.dock-tab-btn');
        let i = tabs.indexOf(activeTab);
        if (i >= 0) {
            if (key === 'ArrowLeft') {
                if (i > 0) {
                    tabs[i - 1].click();
                    tabs[i - 1].focus();
                    return true;
                }
            }
            else {
                if (i < tabs.length - 1) {
                    tabs[i + 1].click();
                    tabs[i + 1].focus();
                    return true;
                }
            }
        }
    }
    return false;
}
function DockTabBar(props) {
    const { TabNavList, isMaximized, navListProps } = props, rest = __rest(props, ["TabNavList", "isMaximized", "navListProps"]);
    const layout = React.useContext(DockData_1.DockContextType);
    const ref = React.useRef();
    const getRef = (div) => {
        ref.current = div;
    };
    const onKeyDown = (e) => {
        if (e.key.startsWith('Arrow')) {
            if (!checkLocalTabMove(e.key, ref.current) && !isMaximized) {
                layout.navigateToPanel(ref.current, e.key);
            }
            e.stopPropagation();
            e.preventDefault();
        }
    };
    // return (
    //   <DragDropDiv onDragStartT={onDragStartT}
    //     onDragMoveT={onDragMoveT}
    //     onDragEndT={onDragEndT}
    //     role="tablist"
    //     className="dock-bar"
    //     onKeyDown={onKeyDown}
    //     getRef={getRef}
    //     tabIndex={-1}
    //   >
    //     <TabNavList {...navListProps} />
    //   </DragDropDiv>
    // );
    return (React.createElement(DragHeader_1.DragHeader, Object.assign({}, rest, { getRef: getRef, className: "dock-bar", role: "tablist", onKeyDown: onKeyDown, tabIndex: -1 }),
        React.createElement(TabNavList, Object.assign({}, navListProps))));
}
exports.DockTabBar = DockTabBar;
