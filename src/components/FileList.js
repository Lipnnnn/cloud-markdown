import React, { useState, useEffect } from 'react';
import useKeyPress from '../hooks/useKeyPress.js';

/**
 * FileList组件，是左侧的文件列表组件
 * @param {files, onFileClick, onSaveEdit, onFileDelete}
 * files表示传入的文件列表 ，onFileClick表示点击编辑按钮之后的回调函数，onSaveEdit表示保存编辑之后的回调函数，onFileDelete表示点击删除按钮之后的回调函数
 * @returns
 */
const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  // 编辑状态，用于记录是哪个文件处于编辑状态，初始值为-1，表示没有文件处于编辑状态
  const [editStatus, setEditStatus] = useState('-1');
  // 输入框的值（也就是重命名的内容），用于记录输入框的值，初始值为空字符串
  const [value, setValue] = useState('');
  // 监听键盘事件，当按下Enter键时，执行保存编辑的操作
  const enterPressed = useKeyPress('Enter');

  useEffect(() => {
    // 监听输入框的回车事件
    if (enterPressed && editStatus !== '-1') {
      // 找到当前处于编辑状态的文件
      const editItem = files.find((file) => file.id === editStatus);
      onSaveEdit(editItem.id, value);
      setEditStatus('-1');
      setValue('');
    }
  });

  return (
    <ul className="w-full max-w-sm bg-white shadow-lg rounded-lg">
      {files.map((file) => {
        return (
          <li
            className="grid grid-cols-8 items-center p-2 border-b last:border-b-0 hover:bg-gray-100"
            key={file.id}
          >
            {
              // 非编辑状态下，展示文件名
              editStatus !== file.id && (
                <>
                  <i className="col-span-1 iconfont icon-a-business-MYbank"></i>
                  <span
                    className="col-span-5 text-sm"
                    onClick={() => {
                      onFileClick(file.id);
                    }}
                  >
                    {file.title}
                  </span>
                  <i
                    className="col-span-1 iconfont icon-edit"
                    onClick={() => {
                      setEditStatus(file.id);
                      setValue(file.title);
                    }}
                  ></i>
                  <i
                    className="col-span-1 iconfont icon-delete"
                    onClick={() => {
                      onFileDelete(file.id);
                    }}
                  ></i>
                </>
              )
            }
            {
              // 编辑状态下，展示输入框
              editStatus === file.id && (
                <>
                  <input
                    className="col-span-6 p-1 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                  ></input>
                  <button
                    className="col-span-2"
                    onClick={() => {
                      setEditStatus(false);
                      setValue('');
                    }}
                  >
                    <i className="iconfont icon-close"></i>
                  </button>
                </>
              )
            }
          </li>
        );
      })}
    </ul>
  );
};

export default FileList;
