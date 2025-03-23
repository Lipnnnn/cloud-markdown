import FileSearch from './components/FileSearch.js';

function App() {
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-1 p-4 bg-indigo-500">
        <FileSearch
          title="我的云文档"
          onFileSearch={(value) => {
            console.log(value);
          }}
        />
      </div>
      <div className="col-span-3 p-4 bg-sky-500">
        <h1>this is right</h1>
      </div>
    </div>
  );
}

export default App;
