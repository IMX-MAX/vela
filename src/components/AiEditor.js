"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { Mark, mergeAttributes } from '@tiptap/core';
import { useState, useEffect, useRef, useCallback } from 'react';
import { modifyTextAction } from '@/app/actions';
import { useAuthStore } from '@/lib/store';

const AiDustMark = Mark.create({
  name: 'aiDust',
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'ai-dust' }), 0];
  },
  parseHTML() {
    return [{ tag: 'span.ai-dust' }];
  }
});

export default function AiEditor({ value, onChange, placeholder = "Write something...", borderless = false }) {
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Slash Commands Menu
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [showSlashCustomPrompt, setShowSlashCustomPrompt] = useState(false);
  const [slashCustomPrompt, setSlashCustomPrompt] = useState("");
  const slashMenuRef = useRef(null);

  const wrapperRef = useRef(null);

  const allSlashOptions = [
    { id: 'grammar', label: 'Fix grammar', subtitle: 'Correct spelling and formatting', icon: '✦', action: 'Fix grammar and spelling' },
    { id: 'expand', label: 'Expand on this', subtitle: 'Add more details and length', icon: '↗', action: 'Expand on this' },
    { id: 'professional', label: 'Make professional', subtitle: 'Write in a professional tone', icon: 'Aa', action: 'Make this sound more professional' },
    { id: 'ask', label: 'Ask AI...', subtitle: 'Prompt AI to write or edit', icon: '✨', action: 'ask' }
  ];

  const filteredOptions = allSlashOptions.filter(opt =>
    opt.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
    opt.id.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const checkSlashCommand = useCallback((editor) => {
    if (stateRef.current.showSlashCustomPrompt) return;
    const { selection } = editor.state;
    if (!selection.empty) {
      setShowSlashMenu(false);
      return;
    }
    const { $from } = selection;
    const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 20), $from.parentOffset, null, '\n');
    const slashMatch = textBefore.match(/\/(\w*)$/);
    if (slashMatch) {
      const query = slashMatch[1];
      const rect = editor.view.coordsAtPos(selection.from);
      const wrapperRect = wrapperRef.current?.getBoundingClientRect();
      if (wrapperRect) {
        setSlashMenuPos({
          top: rect.bottom - wrapperRect.top + 4,
          left: rect.left - wrapperRect.left,
        });
        setSlashQuery(query);
        setShowSlashMenu(true);
        setSelectedSlashIndex(0);
      }
    } else {
      setShowSlashMenu(false);
    }
  }, []);

  // Shared AI Action Runner
  const runAiAction = async (instruction, isCustom = false, inputPrompt = "") => {
    if (isProcessing) return;

    let { from, to } = editor.state.selection;
    let selectedText = editor.state.doc.textBetween(from, to, ' ');
    
    // Fallback to paragraph if selection is empty
    let isParagraphFallback = false;
    if (!selectedText) {
      const { $from } = editor.state.selection;
      from = $from.start();
      to = $from.end();
      selectedText = editor.state.doc.textBetween(from, to, ' ');
      isParagraphFallback = true;
    }

    const promptText = isCustom ? inputPrompt : instruction;
    if (!selectedText && !isCustom) {
      setShowSlashMenu(false);
      setShowSlashCustomPrompt(false);
      return;
    }

    setIsProcessing(true);
    let context = `Here is the full text of the email draft for context:\n\n${editor.getText()}\n\n`;
    if (user?.prefs) {
      context += `User details - Job Title: ${user?.prefs?.jobName || 'Unknown'}, Company: ${user?.prefs?.company || 'Unknown'}`;
    }

    try {
      const result = await modifyTextAction(selectedText || "", promptText, context);
      if (result) {
        const startPos = from;
        if (isParagraphFallback && !selectedText) {
          editor.chain().focus().insertContent(result).run();
        } else {
          editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
        }
        const endPos = editor.state.selection.from;
        editor.chain()
          .setTextSelection({ from: startPos, to: endPos })
          .setMark('aiDust')
          .setTextSelection(endPos)
          .removeMark('aiDust')
          .run();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setShowSlashCustomPrompt(false);
      setSlashCustomPrompt("");
      setShowSlashMenu(false);
    }
  };

  const handleSlashOptionSelect = useCallback((option) => {
    // Delete the slash command query
    const { selection } = editor.state;
    const { $from } = selection;
    const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 20), $from.parentOffset, null, '\n');
    const slashMatch = textBefore.match(/\/(\w*)$/);
    if (slashMatch) {
      const matchLength = slashMatch[0].length;
      editor.chain().focus().deleteRange({
        from: selection.from - matchLength,
        to: selection.from
      }).run();
    }

    if (option.action === 'ask') {
      setShowSlashCustomPrompt(true);
    } else {
      runAiAction(option.action);
    }
  }, [runAiAction]);

  // Keep Refs updated for Tiptap callback closures
  const stateRef = useRef({ showSlashMenu, filteredOptions, selectedSlashIndex, showSlashCustomPrompt });
  useEffect(() => {
    stateRef.current = { showSlashMenu, filteredOptions, selectedSlashIndex, showSlashCustomPrompt };
  }, [showSlashMenu, filteredOptions, selectedSlashIndex, showSlashCustomPrompt]);

  const handleSlashOptionSelectRef = useRef(handleSlashOptionSelect);
  useEffect(() => {
    handleSlashOptionSelectRef.current = handleSlashOptionSelect;
  }, [handleSlashOptionSelect]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Markdown,
      AiDustMark,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px]',
      },
      handleKeyDown(view, event) {
        const { showSlashMenu: active, filteredOptions: opts, selectedSlashIndex: idx } = stateRef.current;
        if (active) {
          if (event.key === 'ArrowDown') {
            setSelectedSlashIndex(prev => (prev + 1) % opts.length);
            return true;
          }
          if (event.key === 'ArrowUp') {
            setSelectedSlashIndex(prev => (prev - 1 + opts.length) % opts.length);
            return true;
          }
          if (event.key === 'Enter') {
            const selected = opts[idx];
            if (selected) {
              handleSlashOptionSelectRef.current(selected);
            }
            return true;
          }
          if (event.key === 'Escape') {
            setShowSlashMenu(false);
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
      checkSlashCommand(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      checkSlashCommand(editor);
    },
  });

  // Sync value if changed externally
  useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== editor.getText()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="h-[150px] bg-white border border-gray-200 animate-pulse rounded-xl"></div>;
  }

  return (
    <div className="relative w-full h-full flex flex-col" ref={wrapperRef}>
      {/* Slash commands dropdown */}
      {showSlashMenu && (
        <div
          ref={slashMenuRef}
          className="absolute z-50 flex flex-col bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden min-w-[240px]"
          style={{
            top: `${slashMenuPos.top}px`,
            left: `${slashMenuPos.left}px`,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showSlashCustomPrompt ? (
            <div className="p-2 flex items-center gap-2 border-b border-gray-100 bg-gray-50/50">
              <input 
                autoFocus
                type="text"
                placeholder="Ask AI to write..."
                value={slashCustomPrompt}
                onChange={e => setSlashCustomPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && slashCustomPrompt.trim()) {
                    runAiAction(slashCustomPrompt.trim(), true, slashCustomPrompt.trim());
                  } else if (e.key === 'Escape') {
                    setShowSlashCustomPrompt(false);
                  }
                }}
                className="w-full text-sm bg-white border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-gray-400"
              />
              <button 
                onClick={() => slashCustomPrompt.trim() && runAiAction(slashCustomPrompt.trim(), true, slashCustomPrompt.trim())}
                className="p-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition text-xs font-bold"
              >
                {isProcessing ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div> : "→"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col p-1 max-h-[280px] overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">AI Actions</div>
              {filteredOptions.map((opt, index) => (
                <button
                  key={opt.id}
                  onClick={() => handleSlashOptionSelect(opt)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                    index === selectedSlashIndex ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[16px] w-5 text-center">{opt.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold leading-tight">{opt.label}</span>
                    <span className="text-[11px] text-gray-400 leading-none mt-0.5">{opt.subtitle}</span>
                  </div>
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400 text-center">No options match</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor Canvas container */}
      <div className={`flex-1 bg-white overflow-visible cursor-text flex flex-col ${
        borderless 
          ? '' 
          : 'border border-gray-200 rounded-xl hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 transition-all'
      }`}>
        <div className="flex-1 overflow-y-auto p-4 cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
}
