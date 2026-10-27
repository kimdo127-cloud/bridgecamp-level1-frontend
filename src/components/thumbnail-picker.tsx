"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { compressImage, ImageError } from "@/lib/image";

// 대표 사진 칸: 비어 있으면 누르면 바로 사진을 고르는 업로드 칸, 사진이 있으면 미리 보기 위에 변경·삭제.
// 사진이 없으면 목록과 상세에는 분야 기본 그림이 보인다.
export function ThumbnailPicker({ id, value, onChange }: { id: string; value: string | null; onChange: (next: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => inputRef.current?.click();

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await compressImage(file));
    } catch (err) {
      setError(err instanceof ImageError ? err.message : "사진을 올리지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" />

      {value ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- 화면에서 줄인 data URL 미리 보기 */}
          <img src={value} alt="대표 사진 미리 보기" className="h-full w-full object-cover" />
          <div className="absolute right-2 bottom-2 flex gap-1.5">
            <button type="button" onClick={open} disabled={busy} className="h-9 rounded-lg bg-white/95 px-3 text-[13px] font-semibold text-ink shadow-sm active:bg-white disabled:opacity-50">
              {busy ? "바꾸는 중…" : "변경"}
            </button>
            <button type="button" onClick={() => onChange(null)} disabled={busy} className="h-9 rounded-lg bg-ink/85 px-3 text-[13px] font-semibold text-white shadow-sm active:bg-ink disabled:opacity-50">
              삭제
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={open}
          disabled={busy}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-surface text-ink-soft transition active:bg-brand-50 disabled:opacity-60"
        >
          <span className="text-2xl" aria-hidden>
            📷
          </span>
          <span className="text-[15px] font-semibold text-ink">{busy ? "사진 줄이는 중…" : "대표 사진 추가"}</span>
          <span className="text-[12px]">가로 사진 권장 · JPG, PNG, WEBP</span>
        </button>
      )}

      <p className="text-[13px] text-ink-soft">사진을 올리지 않으면 분야 기본 그림이 보여요.</p>
      {error && (
        <p role="alert" className="text-[13px] text-[#c23b3b]">
          ⚠︎ {error}
        </p>
      )}
    </div>
  );
}
