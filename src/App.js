import React, { useEffect, useState, useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import { marked } from 'marked';
import { v4 as uuidv4 } from 'uuid';
import fileHelper from './utils/fileHelper.js';
import { timestampToString } from './utils/helper.js';
import 'easymde/dist/easymde.min.css';
import './assets/styles/markdown.css'; // 添加这行
import FileSearch from './components/FileSearch.js';
import FileList from './components/FileList.js';
import LeftButton from './components/LeftButton.js';
import TabList from './components/TabList.js';
import useIpcRenderer from './hooks/useIpcRenderer.js';
import Loader from './components/Loader.js';

const remote = require('@electron/remote');
// 引入ipcRenderer模块
const { ipcRenderer } = require('electron');
const { join, basename, extname, dirname } =
  require('@electron/remote').require('path');
const Store = require('@electron/remote').require('electron-store');

const fileStore = new Store({ name: 'Files Data' });
const settingsStore = new Store({ name: 'Settings' });

const getAutoSync = () =>
  ['AccessKey', 'SecretKey', 'Bucket', 'enableAutoSync'].every((key) => {
    return !!settingsStore.get(key);
  });

// 持久化文件列表数据
const saveFilesToStore = (files) => {
  // 只需要保存文件的id、title、path、createdAt属性 不需要保存文件的 isNew 、body 属性
  const filesStore = files.map((file) => {
    return {
      id: file.id,
      title: file.title,
      path: file.path,
      createdAt: file.createdAt,
      isSynced: file.isSynced,
      updateAt: file.updateAt,
    };
  });
  fileStore.set('files', filesStore);
};

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  xhtml: true,
});

function App() {
  // 初始需要展示在左侧的文件列表
  const [files, setFiles] = useState(fileStore.get('files') || []);
  // 搜索列表文件
  const [searchFiles, setSearchFiles] = useState([]);
  // 当前激活的文件id
  const [activeFileId, setActiveFileId] = useState('');
  // 打开的文件列表，展示在右侧面板上部的文件
  const [openedFileIds, setOpenedFileIds] = useState([]);
  // 未保存的文件列表
  const [unsavedFileIds, setUnsavedFileIds] = useState([]);
  const [isLoading, setLoading] = useState(false);

  // 保存文件的位置
  const savedLocation =
    settingsStore.get('savedFileLocation') || remote.app.getPath('documents');

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
    const currentFile = files.find((file) => {
      return file.id === id;
    });
    const { title, path, isLoaded } = currentFile;
    if (!isLoaded) {
      if (getAutoSync()) {
        // 自动同步
        ipcRenderer.send('download-file', { key: `${title}.md`, path, id });
      } else {
        fileHelper.readFile(path).then((content) => {
          const newFiles = files.map((file) => {
            if (file.id === id) {
              file.body = content;
              file.isLoaded = true;
            }
            return file;
          });
          setFiles(newFiles);
        });
      }
    }

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

  // 删除文件
  const fileDelete = (id) => {
    const deleteFile = files.find((file) => {
      return file.id === id;
    });
    const withoutFileIds = files.filter((file) => {
      return file.id !== id;
    });

    if (deleteFile.isNew) {
      setFiles(withoutFileIds);
    } else {
      fileHelper.deleteFile(deleteFile.path).then(() => {
        // 如果开启了自动同步，发送删除云端文件的消息
        if (getAutoSync()) {
          ipcRenderer.send('delete-file', {
            key: `${deleteFile.title}.md`,
          });
        }
        setFiles(withoutFileIds);
        saveFilesToStore(withoutFileIds);
        closeTab(id);
      });
    }
    // 如果当前被激活的文件被关闭了，就设置一个默认的被激活的文件
    if (id === activeFileId && !withoutFileIds.includes(activeFileId)) {
      if (withoutFileIds.length <= 0) {
        setActiveFileId('');
      } else {
        // 设置一个默认被激活的文件
        setActiveFileId(withoutFileIds[0].id);
      }
    }
  };

  // 保存当前激活（正在修改）的文件
  const saveCurrentFile = () => {
    const { path, body, title } = activeFile;
    fileHelper.writeFile(path, body).then(() => {
      // 从未保存文件列表中移除
      const withoutUnsavedIds = unsavedFileIds.filter((fileId) => {
        return fileId !== activeFileId;
      });
      setUnsavedFileIds(withoutUnsavedIds);
      if (getAutoSync()) {
        // 自动同步
        ipcRenderer.send('upload-file', { key: `${title}.md`, path });
      }
    });
  };

  // 新建文件和修改文件名称
  const saveEdit = (id, value, isNew) => {
    const saveFile = files.find((file) => {
      return file.id === id;
    });
    const oldPath = saveFile.path;
    const oldTitle = saveFile.title;
    const newPath = isNew
      ? join(savedLocation, `${value}.md`)
      : join(dirname(saveFile.path), `${value}.md`);

    const newFiles = files.map((file) => {
      if (file.id === id) {
        file.title = value;
        file.isNew = false;
        file.path = newPath;
      }
      return file;
    });

    if (isNew) {
      // 新建文件
      fileHelper.writeFile(newPath, saveFile.body).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    } else {
      // 编辑修改文件名称
      fileHelper.renameFile(oldPath, newPath).then(() => {
        // 如果开启了自动同步，发送重命名云端文件的消息
        if (getAutoSync()) {
          ipcRenderer.send('rename-file', {
            oldKey: `${oldTitle}.md`,
            newKey: `${value}.md`,
          });
        }
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    }
    // 从未保存文件列表中移除
    const withoutUnsavedIds = unsavedFileIds.filter((fileId) => {
      return fileId !== id;
    });
    setUnsavedFileIds(withoutUnsavedIds);
  };

  // 文件搜索
  const fileSearch = (value) => {
    if (!value || value.trim() === '') {
      setSearchFiles([]);
    } else {
      const newFiles = files.filter((file) => {
        return file.title.toLowerCase().includes(value.toLowerCase());
      });
      setSearchFiles(newFiles);
    }
  };

  // 新建文件
  const createNewFile = () => {
    const newID = uuidv4();
    const newFile = [
      ...files,
      {
        id: newID,
        title: '',
        body: '## 请输入 Markdown',
        createdAt: Date.now(),
        isNew: true,
      },
    ];
    setFiles(newFile);
  };

  // 导入文件
  const importFiles = async () => {
    const result = await remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Markdown files', extensions: ['md'] }],
    });

    if (Array.isArray(result.filePaths)) {
      // 拿到过滤后的文件，也就是还没有被打开的文件
      const filterFiles = result.filePaths.filter((path) => {
        return !files.find((file) => file.path === path);
      });
      // 根据文件路径生成文件列表
      const importFilesArr = filterFiles.map((path) => {
        return {
          id: uuidv4(),
          title: basename(path, extname(path)),
          path,
        };
      });
      // 拿到新的需要展示在左侧面板的文件列表
      const newFiles = [...files, ...importFilesArr];
      setFiles(newFiles);
      // 持久化文件列表数据
      saveFilesToStore(newFiles);
      if (importFilesArr.length > 0) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: '导入成功',
          message: '导入成功',
          detail: `成功导入 ${importFilesArr.length} 个文件`,
        });
      }
    }
  };

  const activeFileUploaded = () => {
    // 更新文件列表
    const newFiles = files.map((file) => {
      if (file.id === activeFileId) {
        file.isSynced = true;
        file.updateAt = new Date().getTime();
      }
      return file;
    });
    setFiles(newFiles);
    // 持久化文件列表数据
    saveFilesToStore(newFiles);
  };

  const activeFileDownloaded = (event, message) => {
    const currentFile = files.find((file) => {
      return file.id === message.id;
    });
    const { id, path } = currentFile;
    fileHelper.readFile(path).then((value) => {
      let newFile;
      if (message.status === 'download-success') {
        newFile = {
          ...currentFile,
          body: value,
          isLoaded: true,
          isSynced: true,
          updateAt: new Date().getTime(),
        };
      } else {
        newFile = {
          ...currentFile,
          body: value,
          isLoaded: true,
        };
      }
      const newFiles = files.map((file) => {
        if (file.id === id) {
          return newFile;
        }
        return file;
      });
      setFiles(newFiles);
      // 持久化文件列表数据
      saveFilesToStore(newFiles);
    });
  };

  const filesUploaded = () => {
    const newFiles = files.map((file) => {
      return {
        ...file,
        isSynced: true,
        updateAt: new Date().getTime(),
      };
    });
    setFiles(newFiles);
    // 持久化文件列表数据
    saveFilesToStore(newFiles);
  };

  const filesDownloaded = (event, newFiles) => {
    // 合并现有文件和新下载的文件
    const mergedFiles = [...files];
    newFiles.forEach((newFile) => {
      const existingFileIndex = mergedFiles.findIndex(
        (file) => file.title === newFile.title,
      );
      if (existingFileIndex === -1) {
        mergedFiles.push(newFile);
      } else {
        mergedFiles[existingFileIndex] = {
          ...mergedFiles[existingFileIndex],
          ...newFile,
        };
      }
    });

    setFiles(mergedFiles);
    saveFilesToStore(mergedFiles);
  };

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    'loading-status': (message, status) => {
      setLoading(status);
    },
    'files-uploaded': filesUploaded,
    'files-downloaded': filesDownloaded,
  });

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      status: false,
      autofocus: true,
      autoRefresh: true,
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
      {isLoading && <Loader />}
      <div className="col-span-1 h-screen flex flex-col">
        <div className="bg-indigo-500 min-h-12 flex items-center p-2">
          <FileSearch title="我的云文档" onFileSearch={fileSearch} />
        </div>
        <div className="flex-1 overflow-auto">
          <FileList
            files={searchFiles.length > 0 ? searchFiles : files}
            onFileClick={fileClick}
            onFileDelete={fileDelete}
            onSaveEdit={saveEdit}
          />
        </div>
        <div className="grid grid-cols-2 mt-auto">
          <LeftButton
            text="新建"
            icon="icon-add"
            colorClass="bg-indigo-500 py-3"
            onBtnClick={createNewFile}
          />
          <LeftButton
            text="导入"
            icon="icon-quanqiuEzhanfapin"
            colorClass="bg-indigo-200 py-3"
            onBtnClick={importFiles}
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
          <div className="h-screen flex flex-col">
            <TabList
              files={openedFiles}
              activeId={activeFileId}
              unsaveIds={unsavedFileIds}
              onTabClick={tabClick}
              onCloseTab={closeTab}
            />
            <div className="flex-1 overflow-hidden flex flex-col">
              <SimpleMDE
                key={activeFile.id}
                value={activeFile.body}
                onChange={changeFile}
                options={{
                  ...editorOptions,
                  toolbar: [
                    {
                      name: 'bold',
                      className: 'sticky-toolbar',
                    },
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
                }}
                className="h-full flex flex-col"
              />
            </div>
            {activeFile.isSynced && (
              <div className="h-[50px] flex items-center px-4 bg-gray-100 text-gray-600">
                已同步，上次同步{timestampToString(activeFile.updateAt)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
