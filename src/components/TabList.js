import React, { useState } from 'react';

/**
 * 标签页列表组件
 * @param {Object} props - 组件属性
 * @param {Array} props.files - 文件列表，每个文件对象包含 id 和 title
 * @param {string} props.activeId - 当前激活的标签页 ID
 * @param {Array} props.unsaveIds - 未保存文件的 ID 列表
 * @param {Function} props.onTabClick - 点击标签页时的回调函数
 * @param {Function} props.onCloseTab - 关闭标签页时的回调函数
 * @returns {JSX.Element} 标签页列表组件
 */
const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
  // 当前鼠标悬停的tab id
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <ul className="flex min-h-12 bg-gray-50">
      {files.map((file) => {
        // 判断文件是否未保存
        const unSaveFile = unsaveIds.includes(file.id);
        const isHovered = hoveredId === file.id;

        return (
          <li
            key={file.id}
            className={`px-4 py-2 transition-all cursor-pointer flex items-center justify-between ${
              activeId === file.id
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-indigo-600 hover:text-black hover:bg-indigo-200'
            }`}
            onClick={() => onTabClick(file.id)}
            onMouseEnter={() => setHoveredId(file.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex items-center">
              <span className="truncate">{file.title}</span>
            </div>
            {unSaveFile ? (
              isHovered ? (
                <i
                  className="iconfont icon-close ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                ></i>
              ) : (
                <i className="iconfont icon-circle ml-2 text-indigo-300"></i>
              )
            ) : isHovered ? (
              <i
                className="iconfont icon-close ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
              ></i>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default TabList;
