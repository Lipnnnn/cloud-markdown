import FileSearch from './components/FileSearch.js';
import Iconfont from './components/Iconfont.js';

function App() {
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1 p-4 bg-indigo-500">
        <FileSearch title="我的云文档" onFileSearch={() => {}}></FileSearch>
      </div>
      <div className="col-span-3 p-4 bg-sky-500">
        <h1>this is right</h1>
        <Iconfont type="search" />
      </div>
    </div>
  );
}

export default App;
