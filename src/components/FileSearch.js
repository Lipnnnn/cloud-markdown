import React, { useState, useEffect, useRef } from 'react';
import useKeyPress from '../hooks/useKeyPress.js';

/**
 * FileSearch组件，是左上角用于搜索文件的组件
 * @param {title, onFileSearch}
 * title表示传入的标题 ，onFileSearch表示输入框回车之后的回调函数
 * @returns
 */
const FileSearch = ({ title, onFileSearch }) => {
  // 是否激活“输入”
  const [inputActive, setInputActive] = useState(false);
  // 输入框的值
  const [value, setValue] = useState('');
  // 监听esc键
  const escPressed = useKeyPress('Escape');
  // 监听enter键
  const enterPressed = useKeyPress('Enter');
  // 表示输入框这个dom节点，在这里是用于自动获取焦点
  let node = useRef(null);

  useEffect(() => {
    // 监听输入框的回车事件
    if (enterPressed && inputActive) {
      onFileSearch(value);
    }
    // 监听esc键的事件
    if (escPressed && inputActive) {
      setInputActive(false);
      setValue('');
    }
  });

  useEffect(() => {
    // 自动获取焦点
    if (inputActive) {
      node.current.focus();
    }
  }, [inputActive]);

  return (
    <div className="container">
      {/* 默认展示这个 */}
      {!inputActive && (
        <div className="grid grid-cols-3 items-center">
          <div className="col-span-2">{title}</div>
          <button
            className="col-span-1"
            onClick={() => {
              setInputActive(true);
            }}
          >
            <i className="iconfont icon-search"></i>
          </button>
        </div>
      )}
      {/* 点击搜索按钮后，展示搜索框 */}
      {inputActive && (
        <div className="grid grid-cols-3 items-center gap-2">
          <input
            className="col-span-2 p-1 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
            type="text"
            ref={node}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          ></input>
          <button
            className="col-span-1"
            onClick={() => {
              setInputActive(false);
              setValue('');
              onFileSearch(''); 
            }}
          >
            <i className="iconfont icon-close"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileSearch;
