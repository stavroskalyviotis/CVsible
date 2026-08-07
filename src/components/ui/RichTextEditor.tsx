import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { Dictionary } from "../../i18n/translations";
import "./RichTextEditor.css";

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  insertUnorderedList: boolean;
}

const EMPTY_FORMATS: ActiveFormats = { bold: false, italic: false, underline: false, insertUnorderedList: false };

function readActiveFormats(): ActiveFormats {
  return {
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    insertUnorderedList: document.queryCommandState("insertUnorderedList"),
  };
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  dictionary,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dictionary: Dictionary;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(EMPTY_FORMATS);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Skip while the user is actively typing in this editor, so we don't clobber the
    // caret position with an echo of the value it just produced.
    if (document.activeElement === editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const updateActiveFormats = () => {
      const editor = editorRef.current;
      const selection = document.getSelection();
      if (!editor || !selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) {
        return;
      }
      setActiveFormats(readActiveFormats());
    };

    document.addEventListener("selectionchange", updateActiveFormats);
    return () => document.removeEventListener("selectionchange", updateActiveFormats);
  }, []);

  const emitChange = () => onChange(editorRef.current?.innerHTML ?? "");

  const runCommand = (command: keyof ActiveFormats, event: MouseEvent) => {
    event.preventDefault();
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command);
    emitChange();
    setActiveFormats(readActiveFormats());
  };

  return (
    <div className="field rich-text-field">
      <span>{label}</span>
      <div className="rich-text-editor">
        <div className="rich-text-toolbar">
          <button
            type="button"
            className={activeFormats.bold ? "active" : ""}
            title={dictionary.richText.bold}
            onMouseDown={(event) => runCommand("bold", event)}
          >
            <b>B</b>
          </button>
          <button
            type="button"
            className={activeFormats.italic ? "active" : ""}
            title={dictionary.richText.italic}
            onMouseDown={(event) => runCommand("italic", event)}
          >
            <i>I</i>
          </button>
          <button
            type="button"
            className={activeFormats.underline ? "active" : ""}
            title={dictionary.richText.underline}
            onMouseDown={(event) => runCommand("underline", event)}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={activeFormats.insertUnorderedList ? "active" : ""}
            title={dictionary.richText.bulletList}
            onMouseDown={(event) => runCommand("insertUnorderedList", event)}
          >
            •≡
          </button>
        </div>
        <div
          ref={editorRef}
          className="rich-text-input"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={emitChange}
          onKeyUp={() => setActiveFormats(readActiveFormats())}
        />
      </div>
    </div>
  );
}
