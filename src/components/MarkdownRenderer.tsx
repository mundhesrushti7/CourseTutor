import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre: ({ node, children, ...props }) => <>{children}</>,
          p: ({ node, children, ...props }) => {
            const hasBlock = React.Children.toArray(children).some((child) => {
              if (React.isValidElement(child)) {
                const type = child.type;
                if (typeof type === 'string') {
                  return ['div', 'pre', 'table', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(type);
                }
                return true;
              }
              return false;
            });
            if (hasBlock) {
              return <div className="mb-3.5 last:mb-0" {...props}>{children}</div>;
            }
            return <p className="mb-3.5 last:mb-0" {...props}>{children}</p>;
          },
          table: ({ node, ...props }) => (
            <div className="table-wrapper my-3 overflow-x-auto rounded-lg border border-app-border shadow-sm">
              <table className="min-w-full divide-y divide-app-border text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-app-surface-subtle text-app-text-secondary font-semibold" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-app-text-muted border-b border-app-border" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 text-app-text border-b border-app-border leading-normal" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="bg-app-surface-subtle text-app-accent-text border border-app-accent-border px-1.5 py-0.5 rounded text-xs font-mono font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 overflow-hidden rounded-lg border border-app-code-border bg-app-code-bg text-app-code-text shadow-sm">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/90 text-[11px] font-mono text-slate-400 border-b border-slate-700">
                  <span>code</span>
                </div>
                <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-app-code-text bg-app-code-bg">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
