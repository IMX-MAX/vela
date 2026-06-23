"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useState, useEffect, useRef, useCallback } from 'react';
import { modifyTextAction } from '@/app/actions';
import { useAuthStore } from '@/lib/store';

export default function AiEditor({ value, onChange, placeholder = "Write something..." }) {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const menuRef = useRef(null);
  const wrapperRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Markdown,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Text is selected — show the AI menu
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const wrapperRect = wrapperRef.current?.getBoundingClientRect();
          if (wrapperRect) {
            setMenuPos({
              top: rect.top - wrapperRect.top - 8,
              left: rect.left - wrapperRect.left + rect.width / 2,
            });
          }
          setShowMenu(true);
        }
      } else {
        setShowMenu(false);
        setShowCustomPrompt(false);
      }
    },
  });

  // Keep editor content in sync if value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== editor.getText()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="h-[200px] bg-white border border-gray-200 animate-pulse rounded-xl"></div>;
  }

  const handleAiAction = async (instruction) => {
    if (isProcessing) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText) return;

    setIsProcessing(true);
    let context = "";
    if (user?.prefs) {
      context = `Job Title: ${user?.prefs?.jobName || 'Unknown'}, Company: ${user?.prefs?.company || 'Unknown'}`;
    }

    try {
      const result = await modifyTextAction(selectedText, instruction, context);
      if (result) {
        editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setShowCustomPrompt(false);
      setCustomPrompt("");
      setShowMenu(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col" ref={wrapperRef}>
      {/* Floating AI Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute z-50 flex flex-col bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[200px]"
          style={{
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
        >
          {showCustomPrompt ? (
            <div className="p-2 flex items-center gap-2 border-b border-gray-100 bg-gray-50/50">
              <input 
                autoFocus
                type="text"
                placeholder="Ask AI to modify..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customPrompt.trim()) {
                    handleAiAction(customPrompt.trim());
                  } else if (e.key === 'Escape') {
                    setShowCustomPrompt(false);
                  }
                }}
                className="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-gray-400"
              />
              <button 
                onClick={() => customPrompt.trim() && handleAiAction(customPrompt.trim())}
                className="p-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition text-xs font-bold"
              >
                {isProcessing ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : "→"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col p-1">
              <button 
                onClick={() => handleAiAction("Fix grammar and spelling")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <span className="text-blue-500">✦</span>
                Fix grammar
              </button>
              <button 
                onClick={() => handleAiAction("Expand on this")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <span className="text-green-500">↗</span>
                Expand on this
              </button>
              <button 
                onClick={() => handleAiAction("Make this sound more professional")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <span className="text-purple-500">Aa</span>
                Make professional
              </button>
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              <button 
                onClick={() => setShowCustomPrompt(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <span className="text-yellow-500">✨</span>
                Ask AI...
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all cursor-text flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
}
