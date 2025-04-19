import React from 'react';

const Loader = ({ text = '处理中' }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <span className="text-gray-600 text-sm">{text}</span>
    </div>
  </div>
);

export default Loader;
