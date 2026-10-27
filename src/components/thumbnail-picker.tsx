"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CategoryThumb } from "@/components/ui";
import { ApiError, updateThumbnail } from "@/lib/api";
import { compressImage, ImageError } from "@/lib/image";
import type { Category } from "@/lib/types";

// 대표 사진 고르기: 미리 보기 + 사진 고르기/바꾸기 + 사진 빼기. 사진이 없으면 분야 그림을 보여 준다
export function ThumbnailPicker({
  id,
  value,
  category,
  onChange,
}: {
  id: string;
  value: string | null;
  category: Category | null;
  onChange: (next: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="overflow-hidden rounded-2xl border border-line">
        {category || value ? (
          <CategoryThumb category={category ?? "AI 활용"} src={value} size="card" />
        ) : (
          <div className="flex h-32 items-center justify-center bg-surface text-[13px] text-ink-soft">분야를 고르면 기본 그림이 보여요</div>
        )}
      </div>
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="h-11 flex-1 rounded-xl border border-line bg-white text-[14px] font-semibold active:bg-brand-50 disabled:opacity-50"
        >
          {busy ? "사진 줄이는 중…" : value ? "사진 바꾸기" : "사진 고르기"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="h-11 rounded-xl px-4 text-[14px] text-ink-soft active:bg-surface">
            사진 빼기
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-[#c23b3b]">
          ⚠︎ {error}
        </p>
      )}
    </div>
  );
}

// 운영 모드 상세에서 이미 있는 과정의 대표 사진을 바로 바꾼다 (고르면 곧바로 저장)
export function ThumbnailEditor({
  courseId,
  value,
  onSaved,
}: {
  courseId: number;
  value: string | null;
  onSaved: (next: string | null, message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (next: string | null, message: string) => {
    const updated = await updateThumbnail(courseId, next);
    onSaved(updated.thumbnail, message);
  };

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await save(await compressImage(file), "대표 사진을 바꿨어요");
    } catch (err) {
      setError(err instanceof ImageError || err instanceof ApiError ? (err instanceof ApiError ? (err.errors.thumbnail ?? err.message) : err.message) : "사진을 올리지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      await save(null, "기본 그림으로 바꿨어요");
    } catch {
      setError("바꾸지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-end gap-2 bg-gradient-to-t from-black/40 to-transparent p-3 pt-10">
      {error && <p role="alert" className="rounded-lg bg-white px-3 py-1.5 text-[12px] text-[#c23b3b]">⚠︎ {error}</p>}
      <div className="flex gap-2">
        {value && (
          <button type="button" onClick={reset} disabled={busy} className="h-9 rounded-lg bg-white/90 px-3 text-[13px] font-semibold text-ink active:bg-white disabled:opacity-50">
            기본 그림으로
          </button>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="h-9 rounded-lg bg-ink px-3 text-[13px] font-semibold text-white active:bg-ink/80 disabled:opacity-50">
          {busy ? "저장하는 중…" : "📷 대표 사진 바꾸기"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="sr-only" aria-label="대표 사진 고르기" />
    </div>
  );
}
