import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

// Maps Monaco languages to Piston API languages & versions
const PISTON_LANGUAGES = {
  javascript: { language: 'nodejs', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
};

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

export default function CodeEditor({ socket, sessionId }) {
  const [code, setCode] = useState('// Write your code here...\n');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  const isTyping = useRef(false);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('code-update', ({ code: newCode }) => {
      // Prevent recursive updates: only update if we aren't currently typing
      // and if the incoming code is actually different.
      if (!isTyping.current) {
        setCode(newCode);
      }
    });

    socket.on('language-update', ({ language: newLang }) => {
      setLanguage(newLang);
    });

    return () => {
      socket.off('code-update');
      socket.off('language-update');
    };
  }, [socket]);

  // Handle local changes
  const handleEditorChange = (value) => {
    setCode(value);
    isTyping.current = true;
    
    if (socket) {
      socket.emit('code-change', { sessionId, code: value });
    }

    // Reset typing flag quickly so we can receive updates
    setTimeout(() => {
      isTyping.current = false;
    }, 150);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socket) {
      socket.emit('language-change', { sessionId, language: newLang });
    }
  };

  const handleRunCode = async () => {
    if (!PISTON_LANGUAGES[language]) {
      setOutput(`Execution is not supported for ${language}.`);
      setShowOutput(true);
      return;
    }

    setIsRunning(true);
    setShowOutput(true);
    setOutput('Running...');

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: PISTON_LANGUAGES[language].language,
          version: PISTON_LANGUAGES[language].version,
          files: [{ content: code }],
        }),
      });
      const result = await response.json();
      
      if (result.run) {
        setOutput(result.run.output || 'Program exited with no output.');
      } else {
        setOutput(result.message || 'Error executing code.');
      }
    } catch (err) {
      setOutput('Failed to execute code. Please check your internet connection or try again later.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border-t border-white/5 overflow-hidden">
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-dark-900/60 backdrop-blur-xl border-b border-white/5 h-[60px] relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="font-bold text-gray-200 tracking-wide text-sm">Code Editor</span>
          </div>
          
          <div className="h-6 w-px bg-white/10"></div>
          
          <select 
            value={language}
            onChange={handleLanguageChange}
            className="bg-dark-800/50 border border-white/10 text-sm font-medium text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 cursor-pointer hover:bg-dark-800 transition-colors shadow-inner"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id} className="bg-dark-900">{lang.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          {PISTON_LANGUAGES[language] && (
            <button 
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 disabled:opacity-50 border border-emerald-400/20"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
              Run Code
            </button>
          )}

          <div className="h-6 w-px bg-white/10"></div>

          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span className={`w-2 h-2 rounded-full ${socket ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></span>
            {socket ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full bg-dark-900 border-none relative flex flex-col">
        <div className={`w-full relative transition-all duration-300 ${showOutput ? 'h-[60%]' : 'h-full'}`}>
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16, bottom: 16 },
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              wordWrap: "on",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
            }}
            loading={
              <div className="flex h-full items-center justify-center text-gray-500">
                Loading editor...
              </div>
            }
          />
        </div>

        {/* Output Panel */}
        {showOutput && (
          <div className="h-[40%] bg-black/40 backdrop-blur-xl border-t border-white/10 flex flex-col shadow-[inset_0_20px_30px_rgba(0,0,0,0.5)] shrink-0 relative z-20">
            <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02] border-b border-white/5 shrink-0">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Terminal Output
              </span>
              <button 
                onClick={() => setShowOutput(false)} 
                className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-md p-1.5 border border-white/5"
                title="Close output"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto bg-transparent font-mono text-sm leading-loose">
              {isRunning ? (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  Executing program remotely...
                </div>
              ) : (
                <pre className={`whitespace-pre-wrap ${output.includes('Error') || output.includes('Exception') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {output}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
