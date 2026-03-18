import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isUser = false }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Заголовки
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-4 mt-6 text-white border-b border-primary-800/50 pb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mb-3 mt-5 text-white border-b border-primary-800/30 pb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-bold mb-3 mt-4 text-white">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-semibold mb-2 mt-3 text-white">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-base font-semibold mb-2 mt-3 text-gray-200">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-sm font-semibold mb-2 mt-2 text-gray-300">
            {children}
          </h6>
        ),

        // Параграфы
        p: ({ children }) => (
          <p className={`mb-3 leading-relaxed ${isUser ? 'text-white' : 'text-gray-100'}`}>
            {children}
          </p>
        ),

        // Жирный текст
        strong: ({ children }) => (
          <strong className="font-bold text-white">
            {children}
          </strong>
        ),

        // Курсив
        em: ({ children }) => (
          <em className="italic text-gray-200">
            {children}
          </em>
        ),

        // Встроенный код
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'text';
          
          if (inline) {
            return (
              <code className="px-2 py-0.5 bg-background-darker border border-primary-900/50 rounded text-primary-300 font-mono text-sm">
                {children}
              </code>
            );
          }

          return (
            <CodeBlock
              code={String(children).replace(/\n$/, '')}
              language={language}
            />
          );
        },

        // Блок-цитата
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary-600 pl-4 py-2 my-3 bg-primary-900/10 italic text-gray-300">
            {children}
          </blockquote>
        ),

        // Горизонтальная линия
        hr: () => (
          <hr className="my-6 border-t-2 border-primary-900/50" />
        ),

        // Ссылки
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 underline decoration-primary-600/50 hover:decoration-primary-400 transition-colors"
          >
            {children}
          </a>
        ),

        // Изображения
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg border border-primary-800/50 my-3 cursor-pointer hover:border-primary-600 transition-colors"
            onClick={() => window.open(src, '_blank')}
          />
        ),

        // Нумерованный список
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-100 pl-4">
            {children}
          </ol>
        ),

        // Маркированный список
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-3 space-y-1 text-gray-100 pl-4">
            {children}
          </ul>
        ),

        // Элемент списка
        li: ({ children }) => (
          <li className="leading-relaxed">
            {children}
          </li>
        ),

        // Таблица
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-primary-800/50 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),

        // Заголовок таблицы
        thead: ({ children }) => (
          <thead className="bg-primary-900/30">
            {children}
          </thead>
        ),

        // Тело таблицы
        tbody: ({ children }) => (
          <tbody className="divide-y divide-primary-800/30">
            {children}
          </tbody>
        ),

        // Строка таблицы
        tr: ({ children }) => (
          <tr className="hover:bg-primary-900/10 transition-colors">
            {children}
          </tr>
        ),

        // Ячейка заголовка таблицы
        th: ({ children }) => (
          <th className="px-4 py-3 text-left text-sm font-semibold text-white border-b border-primary-700/50">
            {children}
          </th>
        ),

        // Ячейка таблицы
        td: ({ children }) => (
          <td className="px-4 py-3 text-sm text-gray-200">
            {children}
          </td>
        ),

        // Чекбокс (для списков задач)
        input: ({ type, checked, disabled }) => {
          if (type === 'checkbox') {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="mr-2 accent-primary-500"
                readOnly
              />
            );
          }
          return null;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

