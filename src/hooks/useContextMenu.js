import { useEffect, useRef } from 'react';
const remote = require('@electron/remote');
const { Menu, MenuItem } = remote;

const useContextMenu = (itemArr, targetSelector) => {
  let clickedElement = useRef(null);
  useEffect(() => {
    const menu = new Menu();
    itemArr.forEach((item) => {
      menu.append(new MenuItem(item));
    });
    const handleContextMenu = (e) => {
      // 只在特定区域才出现弹窗
      if (document.querySelector(targetSelector).contains(e.target)) {
        clickedElement.current = e.target;
        menu.popup({ window: remote.getCurrentWindow() });
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  });
  return clickedElement;
};

export default useContextMenu;
