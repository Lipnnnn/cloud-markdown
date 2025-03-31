import React from 'react';

/**
 * LeftButton组件，是左下角的两个按钮组件
 * @param {text, icon, colorClass, onBtnClick}
 * text表示按钮的文本 ，icon表示按钮的图标，colorClass表示按钮的背景颜色，onBtnClick表示点击按钮之后的回调函数
 * @returns
 */
const LeftButton = ({ text, icon, colorClass, onBtnClick }) => {
  return (
    <button
      className={colorClass}
      onClick={() => {
        onBtnClick();
      }}
    >
      <i className={`iconfont ${icon}`}></i>
      {text}
    </button>
  );
};

export default LeftButton;
