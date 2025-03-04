import React, { useState } from 'react';

const FileSearch = ({ title, onFileSearch }) => {
  // 是否激活“输入”
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState('');

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
            value={value}
          ></input>
          <button
            className="col-span-1"
            onClick={() => {
              setInputActive(false);
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
