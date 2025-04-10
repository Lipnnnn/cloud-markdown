import React, { use, useState, useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import { marked } from 'marked';
import 'easymde/dist/easymde.min.css';
import './assets/styles/markdown.css'; // 添加这行
import FileSearch from './components/FileSearch.js';
import FileList from './components/FileList.js';
import defaultFiles from './utils/defaultFiles.js';
import LeftButton from './components/LeftButton.js';
import TabList from './components/TabList.js';

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  xhtml: true,
});

function App() {
  // 初始需要展示在左侧的文件列表
  const [files, setFiles] = useState(defaultFiles);
  // 当前激活的文件id
  const [activeFileId, setActiveFileId] = useState('');
  // 打开的文件列表，展示在右侧面板上部的文件
  const [openedFileIds, setOpenedFileIds] = useState([]);
  // 未保存的文件列表
  const [unsavedFileIds, setUnsavedFileIds] = useState([]);

  const openedFiles = openedFileIds.map((openId) => {
    return files.find((file) => {
      return file.id === openId;
    });
  });

  const activeFile = files.find((file) => {
    return file.id === activeFileId;
  });

  // 点击左侧的文件列表中的某一个文件
  const fileClick = (id) => {
    // 将该文件添加进 打开的文件 列表
    if (!openedFileIds.includes(id)) {
      setOpenedFileIds([...openedFileIds, id]);
    }
    // 将该文件设置为 当前激活 的文件
    setActiveFileId(id);
  };

  // 点击右侧面板上部的文件列表中的某一个
  const tabClick = (id) => {
    // 将该文件设置为 当前激活 的文件
    setActiveFileId(id);
  };

  // 点击右侧面板上部的关闭文件按钮
  const closeTab = (id) => {
    const withoutFileIds = openedFileIds.filter((fileId) => {
      return fileId !== id;
    });
    setOpenedFileIds(withoutFileIds);
    // 如果当前被激活的文件被关闭了，就设置一个默认的被激活的文件
    if (!withoutFileIds.includes(activeFileId)) {
      if (withoutFileIds.length <= 0) {
        setActiveFileId('');
      } else {
        // 设置一个默认被激活的文件
        setActiveFileId(withoutFileIds[0]);
      }
    }
  };

  // 编辑器的内容发生改变时触发
  const changeFile = (value) => {
    // 更新文件的内容
    const newFiles = files.map((file) => {
      if (file.id === activeFileId) {
        file.body = value;
      }
      return file;
    });
    setFiles(newFiles);
    // 将改变的文件添加到未保存文件列表
    if (!unsavedFileIds.includes(activeFileId)) {
      setUnsavedFileIds([...unsavedFileIds, activeFileId]);
    }
  };

  const editorOptions = useMemo(() => {
    return {
      minHeight: '500px',
      spellChecker: false,
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
      ],
      previewRender: (plainText) => {
        return marked.parse(plainText, {
          headerIds: true,
          mangle: false,
        });
      },
      sideBySideFullscreen: false,
    };
  }, []);

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1 h-screen flex flex-col">
        <div className="bg-indigo-500 min-h-12 flex items-center p-2">
          <FileSearch
            title="我的云文档"
            onFileSearch={(value) => {
              console.log(value);
            }}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <FileList
            files={files}
            onFileClick={fileClick}
            onFileDelete={(id) => console.log('delete', id)}
            onSaveEdit={(id, value) => console.log('save', id, value)}
          />
        </div>
        <div className="grid grid-cols-2 mt-auto">
          <LeftButton
            text="新建"
            icon="icon-add"
            colorClass="bg-indigo-500 py-3"
            onBtnClick={() => {
              console.log('新建文件');
            }}
          />
          <LeftButton
            text="导入"
            icon="icon-quanqiuEzhanfapin"
            colorClass="bg-indigo-200 py-3"
            onBtnClick={() => {
              console.log('导入文件');
            }}
          />
        </div>
      </div>
      <div className="col-span-3">
        {!activeFile && (
          <div className="h-screen flex items-center justify-center">
            <div className="text-4xl text-gray-300 select-none">
              选择或者创建新的 Markdown 文档
            </div>
          </div>
        )}
        {activeFile && (
          <>
            <TabList
              files={openedFiles}
              activeId={activeFileId}
              unsaveIds={unsavedFileIds}
              onTabClick={tabClick}
              onCloseTab={closeTab}
            />
            <SimpleMDE
              value={activeFile.body}
              onChange={changeFile}
              options={editorOptions}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
