import React from 'react';
import SimpleMDE from 'react-simplemde-editor';
import { marked } from 'marked';
import 'easymde/dist/easymde.min.css';
import './assets/styles/markdown.css';  // 添加这行
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
  xhtml: true
});

function App() {
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1">
        <div className="bg-indigo-500 min-h-12 flex items-center p-2">
          <FileSearch
            title="我的云文档"
            onFileSearch={(value) => {
              console.log(value);
            }}
          />
        </div>
        <FileList
          files={defaultFiles}
          onFileClick={(id) => console.log('click', id)}
          onFileDelete={(id) => console.log('delete', id)}
          onSaveEdit={(id, value) => console.log('save', id, value)}
        />
        <div className="grid grid-cols-2">
          <LeftButton
            text="新建"
            icon="icon-add"
            colorClass="bg-indigo-500"
            onBtnClick={() => {
              console.log('新建文件');
            }}
          />
          <LeftButton
            text="导入"
            icon="icon-quanqiuEzhanfapin"
            colorClass="bg-indigo-200"
            onBtnClick={() => {
              console.log('导入文件');
            }}
          />
        </div>
      </div>
      <div className="col-span-3">
        {/* <h1>this is right</h1> */}
        <TabList
          files={defaultFiles}
          activeId="1"
          unsaveIds={['1', '2']}
          onTabClick={(id) => console.log('click', id)}
          onCloseTab={(id) => console.log('close', id)}
        />
        <SimpleMDE
          value={defaultFiles[0].body}
          onChange={(value) => {
            console.log(value);
          }}
          options={{
            minHeight: '500px',
            spellChecker: false,
            status: false,
            toolbar: [
              'bold', 'italic', 'heading', '|',
              'quote', 'unordered-list', 'ordered-list', '|',
              'link', 'image', '|',
              'preview', 'side-by-side', 'fullscreen'
            ],
            previewRender: (plainText) => {
              return marked.parse(plainText, {
                headerIds: true,
                mangle: false
              });
            },
            sideBySideFullscreen: false
          }}
        />
      </div>
    </div>
  );
}

export default App;
