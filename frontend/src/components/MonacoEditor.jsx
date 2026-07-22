import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function MonacoEditorWrapper({ value, onChange, currentLine, errorLine, errorMsg, onLoadProgram, onResetProgram }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register Custom Assembly Language Syntax Highlighting
    monaco.languages.register({ id: 'custom-asm' });

    monaco.languages.setMonarchTokensProvider('custom-asm', {
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*:/, 'custom-label'],
          [/(LOAD|STORE|MOV|PUSH|POP|ADD|SUB|MUL|DIV|INC|DEC|CMP|AND|OR|XOR|NOT|SHL|SHR|JMP|JZ|JNZ|CALL|RET|NOP|HLT)/, 'keyword'],
          [/(R[0-7]|SP|ACC|PC|IR)/, 'variable'],
          [/0b[01]+/, 'number.binary'],
          [/0x[0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],
          [/;.*$/, 'comment'],
          [/#.*$/, 'comment'],
        ]
      }
    });

    monaco.editor.defineTheme('vs-dark-asm', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'variable', foreground: 'f472b6', fontStyle: 'bold' },
        { token: 'custom-label', foreground: 'fbbf24', fontStyle: 'bold' },
        { token: 'number', foreground: '34d399' },
        { token: 'number.hex', foreground: 'a78bfa' },
        { token: 'number.binary', foreground: '34d399' },
        { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#161b22',
        'editor.foreground': '#f0f6fc',
        'editor.lineHighlightBackground': '#21262d',
        'editorGutter.background': '#161b22',
        'editorLineNumber.foreground': '#6e7681',
        'editorLineNumber.activeForeground': '#38bdf8',
      }
    });

    monaco.editor.setTheme('vs-dark-asm');

    // Autocomplete provider for CPU opcodes & registers
    monaco.languages.registerCompletionItemProvider('custom-asm', {
      provideCompletionItems: () => {
        const opcodes = ["LOAD", "STORE", "MOV", "PUSH", "POP", "ADD", "SUB", "MUL", "DIV", "INC", "DEC", "CMP", "AND", "OR", "XOR", "NOT", "SHL", "SHR", "JMP", "JZ", "JNZ", "CALL", "RET", "NOP", "HLT"];
        const suggestions = opcodes.map(op => ({
          label: op,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: op + ' ',
          documentation: `8-Bit CPU Instruction: ${op}`
        }));
        return { suggestions };
      }
    });
  };

  // Update line highlighting for active Program Counter & Error markers
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = [];

    if (currentLine && currentLine > 0) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'active-pc-line',
          glyphMarginClassName: 'active-pc-glyph',
          linesDecorationsClassName: 'active-pc-line-decoration'
        }
      });
    }

    if (errorLine && errorLine > 0) {
      newDecorations.push({
        range: new monaco.Range(errorLine, 1, errorLine, 1),
        options: {
          isWholeLine: true,
          className: 'error-code-line',
          linesDecorationsClassName: 'error-code-decoration'
        }
      });

      monaco.editor.setModelMarkers(editor.getModel(), 'assembly', [{
        startLineNumber: errorLine,
        startColumn: 1,
        endLineNumber: errorLine,
        endColumn: 100,
        message: errorMsg || 'Syntax error',
        severity: monaco.MarkerSeverity.Error
      }]);
    } else {
      monaco.editor.setModelMarkers(editor.getModel(), 'assembly', []);
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [currentLine, errorLine, errorMsg]);

  return (
    <div className="card-panel" style={{ height: '100%' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>📝 main.asm</span>
          <span className="badge badge-blue">8-Bit Assembly</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={onLoadProgram}>
            ▶ Assemble & Load
          </button>
          <button className="btn" onClick={onResetProgram}>
            🔄 Clear
          </button>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0, overflow: 'hidden' }}>
        <style>{`
          .active-pc-line { background-color: rgba(56, 189, 248, 0.15) !important; border-left: 3px solid #38bdf8; }
          .active-pc-line-decoration { background: #38bdf8; width: 4px !important; }
          .error-code-line { background-color: rgba(248, 113, 113, 0.2) !important; border-left: 3px solid #f87171; }
          .error-code-decoration { background: #f87171; width: 4px !important; }
        `}</style>
        <Editor
          height="100%"
          language="custom-asm"
          value={value}
          onChange={onChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
