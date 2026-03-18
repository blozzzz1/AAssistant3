import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between bg-gray-700 px-4 py-2 rounded-t-lg">
        <span className="text-sm text-gray-300 font-medium">{language}</span>
        <button
          onClick={copyToClipboard}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
          title="Копировать код"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900 p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
};