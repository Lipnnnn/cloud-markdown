import FileSearch from './components/FileSearch.js';
import FileList from './components/FileList.js';
import defaultFiles from './utils/defaultFiles.js';
import LeftButton from './components/LeftButton.js';
import TabList from './components/TabList.js';

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
      </div>
    </div>
  );
}

export default App;
