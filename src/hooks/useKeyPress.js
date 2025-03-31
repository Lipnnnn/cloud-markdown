import { useState, useEffect } from 'react';

/**
 * useKeyPress是一个自定义的hook，用于监听键盘事件，当按下指定的键时，执行指定的回调函数
 * @param {title, onFileSearch}
 * title表示传入的标题 ，onFileSearch表示输入框回车之后的回调函数
 * @returns
 */

const useKeyPress = (targetKey) => {
  // 状态变量，用于记录是否按下了指定的键，初始值为false
  const [keyPressed, setKeyPressed] = useState(false);

  // 监听键盘事件，当按下指定的键时，执行指定的回调函数
  const downHandler = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  };

  //   监听键盘事件，当松开指定的键时，执行指定的回调函数
  const upHandler = ({ key }) => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };

  //   绑定键盘事件，当组件挂载时，绑定键盘事件，当组件卸载时，移除键盘事件
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  //   返回keyPressed状态变量，用于在组件中使用，判断该键是否被按下
  return keyPressed;
};

export default useKeyPress;
