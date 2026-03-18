import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ language, text }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-sm my-4 border border-gray-200">
      <div className="bg-gray-800 text-gray-200 px-4 py-2 text-xs font-mono uppercase border-b border-gray-700 flex justify-between items-center">
        <span>{language || 'code'}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(text)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Copy code"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={language?.toLowerCase() || 'javascript'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem' }}
        showLineNumbers={true}
      >
        {text}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;