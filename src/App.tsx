import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Scissors, 
  Trash2, 
  Undo2, 
  Redo2, 
  Globe, 
  CheckSquare, 
  Clipboard, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  CornerDownLeft, 
  FileCode, 
  Check, 
  Layers, 
  Smartphone, 
  BookOpen,
  Info,
  Pin,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ClipboardEntry {
  id: string;
  text: string;
  isPinned: boolean;
  timestamp: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'files' | 'setup'>('simulator');
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Editor and Session Clipboard state
  const [editorText, setEditorText] = useState<string>(
    "Productivity Keyboard V2 – Premium UI + Session Clipboard\n\nExperience the upgraded tablet interface: a dedicated in-memory clipboard manager in the centre panel, rich high-contrast dark theme with cyan accents, and preserved high-speed editing tools.\n\nTry copying, cutting, pinning clips, or pasting with the DPAD navigation below!"
  );
  const [history, setHistory] = useState<string[]>([
    "Productivity Keyboard V2 – Premium UI + Session Clipboard\n\nExperience the upgraded tablet interface: a dedicated in-memory clipboard manager in the centre panel, rich high-contrast dark theme with cyan accents, and preserved high-speed editing tools.\n\nTry copying, cutting, pinning clips, or pasting with the DPAD navigation below!"
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  // Session-only clipboard (Max 20, in-memory)
  const [clipboardItems, setClipboardItems] = useState<ClipboardEntry[]>([
    { id: '1', text: 'Productivity Keyboard V2', isPinned: true, timestamp: Date.now() - 3000 },
    { id: '2', text: 'android:permission.BIND_INPUT_METHOD', isPinned: false, timestamp: Date.now() - 2000 },
    { id: '3', text: 'com.productivity.keyboard', isPinned: false, timestamp: Date.now() - 1000 },
  ]);
  const [selectedClipId, setSelectedClipId] = useState<string>('1');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Keyboard V2 ready. Session clipboard active (3/20).");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateHistory = (newText: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditorText(newText);
  };

  const addSessionClip = (text: string) => {
    if (!text.trim()) return;

    setClipboardItems((prev) => {
      const existing = prev.find((item) => item.text === text);
      const wasPinned = existing ? existing.isPinned : false;
      const filtered = prev.filter((item) => item.text !== text);

      if (filtered.length >= 20) {
        // Find oldest unpinned
        const oldestUnpinnedIndex = filtered.findIndex((item) => !item.isPinned);
        if (oldestUnpinnedIndex !== -1) {
          filtered.splice(oldestUnpinnedIndex, 1);
        } else {
          setStatusMessage("⚠️ Clipboard full (20 pinned): Unpin or delete an entry to add more.");
          return prev;
        }
      }

      const newEntry: ClipboardEntry = {
        id: Math.random().toString(36).substring(2, 9),
        text,
        isPinned: wasPinned,
        timestamp: Date.now(),
      };

      const updated = [newEntry, ...filtered].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.timestamp - a.timestamp;
      });

      setSelectedClipId(newEntry.id);
      return updated;
    });
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClipboardItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      );
      return updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.timestamp - a.timestamp;
      });
    });
    setStatusMessage("Toggled clip pin status.");
  };

  const handleDeleteClip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClipboardItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (selectedClipId === id) {
        setSelectedClipId(filtered[0]?.id || '');
      }
      return filtered;
    });
    setStatusMessage("Deleted clip from session storage.");
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    } else {
      setClipboardItems([]);
      setSelectedClipId('');
      setConfirmClear(false);
      setStatusMessage("Cleared all session clipboard items.");
    }
  };

  const handlePasteEntry = (entry: ClipboardEntry) => {
    setSelectedClipId(entry.id);
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = editorText.substring(0, start) + entry.text + editorText.substring(end);
      updateHistory(newText);
      const newPos = start + entry.text.length;
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newPos;
          textareaRef.current.selectionEnd = newPos;
          textareaRef.current.focus();
        }
      }, 0);
      setStatusMessage(`Pasted from clipboard: "${entry.text.slice(0, 20)}..."`);
    }
  };

  // Editing Button handlers
  const handleCopy = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const selected = editorText.substring(start, end);
        addSessionClip(selected);
        setStatusMessage(`Copied to clipboard: "${selected.slice(0, 20)}..."`);
      } else {
        setStatusMessage("Copy executed (no text selected)");
      }
      textareaRef.current.focus();
    }
  };

  const handleCut = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const selected = editorText.substring(start, end);
        addSessionClip(selected);
        const newText = editorText.substring(0, start) + editorText.substring(end);
        updateHistory(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start;
            textareaRef.current.selectionEnd = start;
            textareaRef.current.focus();
          }
        }, 0);
        setStatusMessage(`Cut to clipboard: "${selected.slice(0, 20)}..."`);
      } else {
        setStatusMessage("Cut executed (no text selected)");
      }
    }
  };

  const handleDelete = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const newText = editorText.substring(0, start) + editorText.substring(end);
        updateHistory(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start;
            textareaRef.current.selectionEnd = start;
            textareaRef.current.focus();
          }
        }, 0);
        setStatusMessage("Executed: commitText(\"\", 1) on selection");
      } else if (start > 0) {
        const newText = editorText.substring(0, start - 1) + editorText.substring(start);
        updateHistory(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start - 1;
            textareaRef.current.selectionEnd = start - 1;
            textareaRef.current.focus();
          }
        }, 0);
        setStatusMessage("Executed: deleteSurroundingText(1, 0)");
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setEditorText(history[nextIndex]);
      setStatusMessage("Executed: KeyEvent KEYCODE_Z with META_CTRL_ON (Undo)");
    } else {
      setStatusMessage("Undo: beginning of history");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setEditorText(history[nextIndex]);
      setStatusMessage("Executed: KeyEvent KEYCODE_Z with META_CTRL_ON | META_SHIFT_ON (Redo)");
    } else {
      setStatusMessage("Redo: newest change");
    }
  };

  // Right Panel handlers
  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      setStatusMessage("Executed: performContextMenuAction(android.R.id.selectAll)");
    }
  };

  const handlePasteButton = () => {
    const selectedItem = clipboardItems.find((c) => c.id === selectedClipId);
    const itemToPaste = selectedItem || clipboardItems[0];
    if (itemToPaste) {
      handlePasteEntry(itemToPaste);
    } else {
      setStatusMessage("Paste: session clipboard empty, falling back to system paste");
    }
  };

  const handleArrow = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    let pos = el.selectionStart;

    if (direction === 'left') {
      pos = Math.max(0, pos - 1);
      el.setSelectionRange(pos, pos);
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_LEFT)");
    } else if (direction === 'right') {
      pos = Math.min(editorText.length, pos + 1);
      el.setSelectionRange(pos, pos);
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_RIGHT)");
    } else if (direction === 'up') {
      const prevLineBreak = editorText.lastIndexOf('\n', pos - 1);
      if (prevLineBreak !== -1) {
        const lineBeforeBreak = editorText.lastIndexOf('\n', prevLineBreak - 1);
        const col = pos - prevLineBreak;
        const targetLineStart = lineBeforeBreak === -1 ? 0 : lineBeforeBreak + 1;
        const newPos = Math.min(targetLineStart + col, prevLineBreak);
        el.setSelectionRange(newPos, newPos);
      } else {
        el.setSelectionRange(0, 0);
      }
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_UP)");
    } else if (direction === 'down') {
      const nextLineBreak = editorText.indexOf('\n', pos);
      if (nextLineBreak !== -1) {
        const prevLineBreak = editorText.lastIndexOf('\n', pos - 1);
        const col = pos - (prevLineBreak === -1 ? 0 : prevLineBreak + 1);
        const lineAfterNext = editorText.indexOf('\n', nextLineBreak + 1);
        const targetLineEnd = lineAfterNext === -1 ? editorText.length : lineAfterNext;
        const newPos = Math.min(nextLineBreak + 1 + col, targetLineEnd);
        el.setSelectionRange(newPos, newPos);
      } else {
        el.setSelectionRange(editorText.length, editorText.length);
      }
      setStatusMessage("Executed: sendDownUpKeyEvents(KeyEvent.KEYCODE_DPAD_DOWN)");
    }
  };

  const handleEnter = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = editorText.substring(0, start) + "\n" + editorText.substring(end);
      updateHistory(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = start + 1;
          textareaRef.current.focus();
        }
      }, 0);
      setStatusMessage("Executed: sendDefaultEditorAction() / KEYCODE_ENTER");
    }
  };

  const files = [
    {
      name: "ProductivityKeyboardService.kt",
      path: "app/src/main/java/com/productivity/keyboard/ProductivityKeyboardService.kt",
      type: "Modified (V2)",
      desc: "Enhanced InputMethodService with in-memory session clipboard manager (max 20), sensitive clipboard protection, pin sorting, smart paste."
    },
    {
      name: "keyboard_view.xml",
      path: "app/src/main/res/layout/keyboard_view.xml",
      type: "Modified (V2)",
      desc: "Upgraded 3-panel landscape XML layout (25% / 45% / 30%) with RecyclerView, empty state view, high-contrast dark palette, and bottom switch button."
    },
    {
      name: "item_clipboard.xml",
      path: "app/src/main/res/layout/item_clipboard.xml",
      type: "New File",
      desc: "Clipboard item row layout with text preview, pin toggle button, delete button, and selection state background."
    },
    {
      name: "bg_keyboard_button.xml",
      path: "app/src/main/res/drawable/bg_keyboard_button.xml",
      type: "New File",
      desc: "Custom slate button selector with pressed state and 8dp rounded corners."
    },
    {
      name: "bg_keyboard_button_accent.xml",
      path: "app/src/main/res/drawable/bg_keyboard_button_accent.xml",
      type: "New File",
      desc: "Vibrant cyan/teal button selector for prominent actions (Switch Keyboard, Paste, Enter)."
    },
    {
      name: "bg_panel.xml",
      path: "app/src/main/res/drawable/bg_panel.xml",
      type: "New File",
      desc: "Dark charcoal/navy panel background with 10dp rounded corners and subtle border."
    },
    {
      name: "ic_launcher.xml",
      path: "app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml",
      type: "New File",
      desc: "Professional adaptive launcher icon with navy background, keyboard symbol, and cyan checkmark detail."
    },
    {
      name: "AndroidManifest.xml",
      path: "app/src/main/AndroidManifest.xml",
      type: "Updated",
      desc: "Manifest declaring service with BIND_INPUT_METHOD, InputMethod action, and new app launcher icons."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur sticky top-0 z-20 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Productivity Keyboard
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                V2 PREMIUM + CLIPBOARD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tablet Landscape &bull; In-Memory Session Storage &bull; No Internet/No DB &bull; Min SDK 21+
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            V2 Live Simulator
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'files'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            V2 Files &amp; Resources
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Upgrade Guide
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-5">
            {/* Editor card */}
            <div className="bg-[#121926] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-[#16202C] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Active Focused Target Editor (<code className="text-cyan-300 font-mono">currentInputConnection</code>)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  History: {historyIndex + 1}/{history.length} &bull; Chars: {editorText.length}
                </span>
              </div>
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={editorText}
                  onChange={(e) => updateHistory(e.target.value)}
                  className="w-full h-32 bg-[#0B0F17] text-slate-100 p-3 rounded-xl border border-slate-800 font-mono text-sm leading-relaxed focus:outline-none focus:border-cyan-500/60 resize-none"
                  placeholder="Focus here to test editing and clipboard pasting..."
                />
              </div>
              <div className="bg-[#0E1520] px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-mono truncate">
                  <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate">{statusMessage}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0 ml-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Session In-Memory (Zero DB/No Cloud)</span>
                </div>
              </div>
            </div>

            {/* Simulated Tablet Android Landscape Keyboard V2 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Tablet Landscape 3-Panel Layout (25% / 45% / 30%)
                </span>
                <span>
                  High-Contrast Dark Navy Palette &bull; Session Max: 20 Items
                </span>
              </div>

              {/* Native Android Keyboard Container Frame */}
              <div className="bg-[#0F172A] p-2.5 rounded-2xl border-2 border-slate-700/60 shadow-2xl">
                <div className="flex flex-row gap-2.5 h-72 md:h-80 w-full">
                  
                  {/* LEFT PANEL: EDITING TOOLS (25%) */}
                  <div className="w-1/4 flex flex-col gap-1.5 p-2 bg-[#16202C] rounded-xl border border-[#243345]">
                    <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400 text-center pb-1 border-b border-slate-800">
                      EDITING (25%)
                    </div>
                    <div className="flex-1 flex flex-col justify-between gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="flex-1 bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-[#35465C] transition-all cursor-pointer"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        COPY
                      </button>

                      <button
                        onClick={handleCut}
                        className="flex-1 bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-[#35465C] transition-all cursor-pointer"
                        title="Cut"
                      >
                        <Scissors className="w-3.5 h-3.5 text-amber-400" />
                        CUT
                      </button>

                      <button
                        onClick={handleDelete}
                        className="flex-1 bg-[#233041] hover:bg-[#2C3C52] active:bg-red-900/60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-[#35465C] transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        DELETE
                      </button>

                      <button
                        onClick={handleUndo}
                        className="flex-1 bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-[#35465C] transition-all cursor-pointer"
                        title="Undo (Ctrl+Z)"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-purple-400" />
                        UNDO
                      </button>

                      <button
                        onClick={handleRedo}
                        className="flex-1 bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-[#35465C] transition-all cursor-pointer"
                        title="Redo (Ctrl+Shift+Z)"
                      >
                        <Redo2 className="w-3.5 h-3.5 text-purple-400" />
                        REDO
                      </button>
                    </div>
                  </div>

                  {/* CENTRE PANEL: SESSION CLIPBOARD MANAGER (45%) */}
                  <div className="w-[45%] flex flex-col p-2 bg-[#16202C] rounded-xl border border-[#243345]">
                    {/* Header: Title and Clear All */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold text-cyan-400 tracking-wide">
                          CLIPBOARD
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({clipboardItems.length}/20)
                        </span>
                      </div>
                      {clipboardItems.length > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="px-2 py-0.5 rounded bg-[#362026] hover:bg-red-900/80 active:bg-red-800 text-[#FCA5A5] text-[10px] font-bold border border-[#5C2B35] transition-all cursor-pointer"
                        >
                          {confirmClear ? "CONFIRM CLEAR?" : "CLEAR ALL"}
                        </button>
                      )}
                    </div>

                    {/* Scrollable Clipboard List or Empty State */}
                    <div className="flex-1 overflow-y-auto my-1.5 space-y-1.5 pr-0.5">
                      {clipboardItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <Clipboard className="w-7 h-7 text-slate-600 mb-2" />
                          <div className="text-xs font-bold text-slate-400">
                            Your clipboard is empty
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Copy text to see it here.
                          </div>
                        </div>
                      ) : (
                        clipboardItems.map((item) => {
                          const isSelected = item.id === selectedClipId;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handlePasteEntry(item)}
                              className={`p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-[#1A334A] border-cyan-400 shadow-md ring-1 ring-cyan-500/30'
                                  : item.isPinned
                                  ? 'bg-[#192A3A] border-sky-600/80'
                                  : 'bg-[#1A2533] border-[#2B3A4D] hover:bg-[#202E3E]'
                              }`}
                            >
                              {/* Pin Toggle */}
                              <button
                                onClick={(e) => handleTogglePin(item.id, e)}
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                                  item.isPinned
                                    ? 'text-cyan-400 hover:text-cyan-300'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                                title={item.isPinned ? "Unpin item" : "Pin item to top"}
                              >
                                {item.isPinned ? "★" : "☆"}
                              </button>

                              {/* Text Preview */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-white line-clamp-2 leading-tight select-none">
                                  {item.text}
                                </div>
                              </div>

                              {/* Delete Item */}
                              <button
                                onClick={(e) => handleDeleteClip(item.id, e)}
                                className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs transition-colors"
                                title="Delete item"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Switch Keyboard button at bottom of centre panel */}
                    <button
                      onClick={() => setStatusMessage("Executed: InputMethodManager.showInputMethodPicker()")}
                      className="w-full h-9 bg-gradient-to-r from-[#0E7490] to-[#0891B2] hover:from-[#0891B2] hover:to-[#06B6D4] active:from-[#0E7490] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow border border-cyan-400/50 transition-all cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      SWITCH KEYBOARD
                    </button>
                  </div>

                  {/* RIGHT PANEL: NAVIGATION & ACTIONS (30%) */}
                  <div className="w-[30%] flex flex-col gap-1.5 p-2 bg-[#16202C] rounded-xl border border-[#243345]">
                    <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400 text-center pb-1 border-b border-slate-800">
                      NAVIGATION (30%)
                    </div>

                    <div className="flex-1 flex flex-col justify-between gap-1.5">
                      {/* Top Row: Select All & Paste */}
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleSelectAll}
                          className="bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#35465C]"
                          title="Select All"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                          SELECT ALL
                        </button>
                        <button
                          onClick={handlePasteButton}
                          className="bg-[#0E7490] hover:bg-[#0891B2] active:bg-[#06B6D4] text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border border-cyan-400/60 shadow-sm"
                          title="Paste selected clipboard entry"
                        >
                          <Clipboard className="w-3.5 h-3.5 text-white" />
                          PASTE
                        </button>
                      </div>

                      {/* Middle Row: DPAD Navigation */}
                      <div className="flex-1 grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => handleArrow('left')}
                          className="bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-[#35465C]"
                          title="Arrow Left"
                        >
                          <ArrowLeft className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleArrow('up')}
                          className="bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-[#35465C]"
                          title="Arrow Up"
                        >
                          <ArrowUp className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleArrow('down')}
                          className="bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-[#35465C]"
                          title="Arrow Down"
                        >
                          <ArrowDown className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleArrow('right')}
                          className="bg-[#233041] hover:bg-[#2C3C52] active:bg-cyan-900/60 text-white rounded-lg font-bold text-sm flex items-center justify-center border border-[#35465C]"
                          title="Arrow Right"
                        >
                          <ArrowRight className="w-4 h-4 text-cyan-400" />
                        </button>
                      </div>

                      {/* Bottom Row: Enter */}
                      <div className="flex-1 flex">
                        <button
                          onClick={handleEnter}
                          className="w-full bg-[#0E7490] hover:bg-[#0891B2] active:bg-[#06B6D4] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 border border-cyan-400/60 shadow-sm"
                          title="Enter"
                        >
                          <CornerDownLeft className="w-4 h-4" />
                          ENTER
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                Project Files &amp; Resources
              </div>
              {files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                    selectedFile === idx
                      ? 'bg-[#16202C] border-cyan-400 text-white shadow-md'
                      : 'bg-[#121926]/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between text-slate-200">
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                      {file.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {file.path}
                  </div>
                </button>
              ))}
            </div>

            <div className="md:col-span-3 bg-[#121926] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {files[selectedFile].name}
                  </h3>
                  <p className="text-xs font-mono text-cyan-300 mt-0.5">
                    {files[selectedFile].path}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {files[selectedFile].type}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {files[selectedFile].desc}
              </p>
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="font-semibold text-slate-200">
                  Android Implementation Note:
                </div>
                <p className="text-[11px] leading-relaxed">
                  All 8 project files have been created directly in the project filesystem under <code className="text-cyan-300">app/src/main/</code> and committed to the Git repository.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="max-w-3xl mx-auto w-full bg-[#121926] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                V2 Upgrade &amp; Verification Guide
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Overview of the V2 session-only clipboard architecture and tablet UI improvements.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#16202C] rounded-xl border border-slate-800">
                <h3 className="font-bold text-cyan-300 text-sm">Session-Only Clipboard Architecture</h3>
                <p className="text-slate-300 mt-1.5 leading-relaxed">
                  The clipboard manager stores entries in an in-memory Kotlin collection (<code className="text-cyan-200">mutableListOf&lt;ClipboardEntry&gt;()</code>). It has a hard maximum of 20 items. When full, the oldest unpinned item is removed. If all 20 are pinned, a message alerts the user to unpin or delete. No entries are ever written to Room, SQLite, SharedPreferences, or files.
                </p>
              </div>

              <div className="p-3.5 bg-[#16202C] rounded-xl border border-slate-800">
                <h3 className="font-bold text-cyan-300 text-sm">Sensitive Content &amp; Focus Safety</h3>
                <p className="text-slate-300 mt-1.5 leading-relaxed">
                  On Android 13+ (API 33), <code className="text-cyan-200">ClipDescription.EXTRA_IS_SENSITIVE</code> is checked to automatically ignore sensitive data such as passwords and OTPs. All clipboard item controls have <code className="text-cyan-200">focusable="false"</code> to ensure that tapping clipboard clips pastes into the editor without losing target input connection.
                </p>
              </div>

              <div className="p-3.5 bg-[#16202C] rounded-xl border border-slate-800">
                <h3 className="font-bold text-cyan-300 text-sm">Preserved V1 Core Logic</h3>
                <p className="text-slate-300 mt-1.5 leading-relaxed">
                  All button IDs (<code className="text-cyan-200">btn_copy</code>, <code className="text-cyan-200">btn_cut</code>, <code className="text-cyan-200">btn_delete</code>, <code className="text-cyan-200">btn_undo</code>, <code className="text-cyan-200">btn_redo</code>, <code className="text-cyan-200">btn_select_all</code>, <code className="text-cyan-200">btn_paste</code>, arrows, enter, switch) maintain identical functionality, with Paste intelligently targeting selected clipboard items.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
