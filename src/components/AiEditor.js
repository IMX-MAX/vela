"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { useState, useEffect } from 'react';
import { modifyTextAction } from '@/app/actions';
import { useAuthStore } from '@/lib/store';
import { Sparkle, MagicWand, Check, CornersOut, TextAa } from '@phosphor-icons/react';

export default function AiEditor({ value, onChange, placeholder = "Write something..." }) {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

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
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="flex flex-col bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[200px]"
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
                className="p-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
              >
                {isProcessing ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : <Check size={14} weight="bold" />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col p-1">
              <button 
                onClick={() => handleAiAction("Fix grammar and spelling")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <MagicWand size={16} className="text-blue-500" />
                Fix grammar
              </button>
              <button 
                onClick={() => handleAiAction("Expand on this")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <CornersOut size={16} className="text-green-500" />
                Expand on this
              </button>
              <button 
                onClick={() => handleAiAction("Make this sound more professional")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <TextAa size={16} className="text-purple-500" />
                Make professional
              </button>
              <div className="h-px bg-gray-100 my-1 mx-2"></div>
              <button 
                onClick={() => setShowCustomPrompt(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg text-left disabled:opacity-50"
              >
                <Sparkle size={16} className="text-yellow-500" weight="fill" />
                Ask AI...
              </button>
            </div>
          )}
        </BubbleMenu>
      )}

      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all cursor-text flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
      
      {/* Tiptap styles usually need to be added globally or via Tailwind Typography plugin */}
    </div>
  );
}
