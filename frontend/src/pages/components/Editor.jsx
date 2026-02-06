import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const Editor = ({ value, onChange, height,canEdit=true }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      readOnly: !canEdit,
      modules: canEdit ? {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
      }:{toolbar:false},
    });

    quillRef.current.on("text-change", () => {
      const html = quillRef.current.root.innerHTML;
      onChangeRef.current?.(html);
    });
  }, [canEdit]);

  useEffect(() => {
  if (!quillRef.current) return;

  const quill = quillRef.current;
  const html = quill.root.innerHTML;

  if (value === "") {
    if (html !== "<p><br></p>") {
      quill.setText("");
    }
    return;
  }

  if (value && value !== html) {
    quill.clipboard.dangerouslyPasteHTML(value);
  }
}, [value]);

  return (
    <div style={{ marginTop: "20px" }}>
      <div 
        ref={editorRef}
        style={{ height: height ? `${height}`:"calc(100vh - 360px)", marginBottom: "20px" }}
      ></div>
    </div>
  );
};

export default Editor;
