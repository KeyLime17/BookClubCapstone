import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

export default function CoverUpload({ onFileSelected }: { onFileSelected: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function pickFile() {
    inputRef.current?.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileName(f ? f.name : null);
    onFileSelected(f);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setFileName(null);
    onFileSelected(null);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />

      <button
        type="button"
        onClick={pickFile}
        className="w-full flex items-center justify-center gap-2 rounded-lg border px-4 py-3 hover:bg-gray-50"
      >
        <Upload size={18} />
        <span>{fileName ? "Change cover image" : "Upload cover image"}</span>
      </button>

      {fileName && (
        <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} />
            <span className="truncate">{fileName}</span>
          </div>
          <button type="button" onClick={clear} className="hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
