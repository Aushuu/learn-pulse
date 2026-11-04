import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Clock,
  Code2,
  HelpCircle,
  BookmarkCheck,
  FileText
} from 'lucide-react';

/**
 * Rich interactive notes reader with markdown-like parsing,
 * syntax-styled code blocks with copy-to-clipboard,
 * reading time calculation, and quick action transitions.
 */
const NotesReader = ({ lesson, isCompleted, onMarkComplete, onTakeQuiz }) => {
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const rawContent = lesson?.content || '';
  const summary = lesson?.summary || '';

  // Calculate approximate reading time
  const readingTime = useMemo(() => {
    const wordCount = (rawContent + ' ' + summary).trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 180));
  }, [rawContent, summary]);

  const handleCopyCode = (codeText, blockId) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(blockId);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  // Format inline text: bold and inline code
  const formatInlineText = (text) => {
    if (!text) return null;

    // Split on code ticks first
    const parts = text.split(/(`[^`]+`)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeContent = part.slice(1, -1);
        return (
          <code key={pIdx} className="inline-code-pill">
            {codeContent}
          </code>
        );
      }

      // Inside normal text, handle bold **text**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bIdx) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${pIdx}-${bIdx}`} className="notes-bold-text">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  // Parse structured blocks from markdown text
  const renderedContent = useMemo(() => {
    if (!rawContent) {
      return (
        <div className="notes-empty-state">
          <FileText size={32} color="#94a3b8" />
          <p>No written notes published for this module yet. Follow the video demonstration above.</p>
        </div>
      );
    }

    const lines = rawContent.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let currentCodeLines = [];
    let codeBlockCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start or end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '') || 'code';
          currentCodeLines = [];
        } else {
          // Finish code block
          inCodeBlock = false;
          const codeString = currentCodeLines.join('\n');
          const blockId = `code-block-${codeBlockCount++}`;

          elements.push(
            <div key={blockId} className="notes-code-card">
              <div className="code-card-header">
                <div className="terminal-dots">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                </div>
                <div className="code-lang-tag">
                  <Code2 size={13} />
                  <span>{codeLanguage.toUpperCase()}</span>
                </div>
                <button
                  type="button"
                  className={`btn-copy-code ${copiedCodeId === blockId ? 'copied' : ''}`}
                  onClick={() => handleCopyCode(codeString, blockId)}
                  title="Copy code to clipboard"
                >
                  {copiedCodeId === blockId ? (
                    <>
                      <Check size={14} color="#10b981" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="code-card-body">
                <code>{codeString}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeLines.push(line);
        continue;
      }

      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="notes-heading-3">
            <span className="heading-accent"></span>
            <span>{trimmed.replace(/^###\s+/, '')}</span>
          </h3>
        );
        continue;
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="notes-heading-4">
            {trimmed.replace(/^####\s+/, '')}
          </h4>
        );
        continue;
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="notes-heading-2">
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
        continue;
      }

      // Bullet list items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`bullet-${i}`} className="notes-bullet-item">
            <span className="bullet-dot"></span>
            <div className="bullet-text">{formatInlineText(bulletText)}</div>
          </div>
        );
        continue;
      }

      // Numbered list items
      if (/^\d+\.\s+/.test(trimmed)) {
        const number = trimmed.match(/^(\d+)\.\s+/)[1];
        const numText = trimmed.replace(/^\d+\.\s+/, '');
        elements.push(
          <div key={`num-${i}`} className="notes-num-item">
            <span className="number-badge">{number}</span>
            <div className="bullet-text">{formatInlineText(numText)}</div>
          </div>
        );
        continue;
      }

      // Normal paragraph
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${i}`} className="notes-paragraph">
            {formatInlineText(trimmed)}
          </p>
        );
      }
    }

    return elements;
  }, [rawContent, copiedCodeId]);

  return (
    <div className="notes-reader-wrapper">
      {/* Top Notes Meta Bar */}
      <div className="notes-reader-meta">
        <div className="notes-meta-left">
          <div className="notes-type-pill">
            <BookOpen size={15} color="#4f46e5" />
            <span>Interactive Module Notes</span>
          </div>
          <span className="notes-read-time">
            <Clock size={14} />
            <span>{readingTime} min read</span>
          </span>
        </div>

        {isCompleted && (
          <div className="notes-completed-badge">
            <CheckCircle2 size={15} color="#10b981" />
            <span>Module Completed</span>
          </div>
        )}
      </div>

      {/* Lesson Summary / Key Takeaway Banner */}
      {summary && (
        <div className="notes-summary-card">
          <div className="summary-card-header">
            <Sparkles size={18} color="#6366f1" />
            <h4>Key Takeaway & Module Brief</h4>
          </div>
          <p className="summary-card-text">{summary}</p>
        </div>
      )}

      {/* Structured Rich Notes Body */}
      <div className="notes-rendered-body">
        {renderedContent}
      </div>

      {/* Notes Bottom Action Card */}
      <div className="notes-action-footer">
        <div className="action-footer-info">
          <BookmarkCheck size={20} color="#4f46e5" />
          <div>
            <h5>Finished reading the notes?</h5>
            <p>Solidify your understanding by taking the interactive quiz for this video module.</p>
          </div>
        </div>

        <div className="action-footer-buttons">
          <button
            type="button"
            onClick={onMarkComplete}
            className={`btn ${isCompleted ? 'btn-secondary' : 'btn-success'} btn-sm`}
          >
            <CheckCircle2 size={16} />
            <span>{isCompleted ? 'Marked as Done' : 'Mark Notes as Read'}</span>
          </button>

          <button
            type="button"
            onClick={onTakeQuiz}
            className="btn btn-primary btn-sm"
          >
            <HelpCircle size={16} />
            <span>Take Interactive Quiz →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesReader;
