"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryThumb, Chip, FlashToast, Skeleton, SlowServerHint, StatusScreen, primaryButton } from "@/components/ui";
import { listCourses, openCohorts } from "@/lib/api";
import { cohortStatusLabel, formatDot } from "@/lib/format";
import type { CourseWithCohorts } from "@/lib/types";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; courses: CourseWithCohorts[] };

export default function AdminPage() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    listCourses()
      .then((courses) => setState({ status: "ready", courses }))
      .catch(() => setState({ status: "error" }));
  }, []);

  return (
    <main className="pb-32">
      <FlashToast />
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-ink px-5 pt-[env(safe-area-inset-top)] text-white">
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-bold">브릿지캠프</p>
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[12px] font-semibold">운영자</span>
        </div>
        <Link href="/" className="text-[13px] font-medium text-white/80 underline-offset-4 active:underline">
          사용자 화면 보기
        </Link>
      </header>

      <section className="px-5 pt-5">
        <h1 className="text-xl font-bold">과정 관리</h1>
        <p className="mt-1 text-sm text-ink-soft">과정을 등록하고 다음 기수를 열어요. 등록한 내용은 사용자 화면에 바로 보여요.</p>
      </section>

      {state.status === "loading" && <SlowServerHint />}
      {state.status === "loading" && (
        <div className="mt-5 space-y-3 px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {state.status === "error" && <StatusScreen emoji="🔌" title="과정을 불러오지 못했어요" body="잠시 뒤 다시 시도해 주세요." />}

      {state.status === "ready" && state.courses.length === 0 && (
        <StatusScreen
          emoji="📚"
          title="아직 등록된 과정이 없어요"
          body="첫 번째 과정을 등록해 보세요."
          action={
            <Link href="/admin/courses/new" className={primaryButton}>
              과정 등록하기
            </Link>
          }
        />
      )}

      {state.status === "ready" && state.courses.length > 0 && (
        <ul className="mt-5 space-y-3 px-5">
          {state.courses.map((c) => {
            const next = openCohorts(c)[0];
            return (
              <li key={c.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(24,27,43,0.06)]">
                <div className="flex gap-3">
                  <CategoryThumb category={c.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold">{c.title}</p>
                    <p className="text-[12px] text-ink-soft">
                      {c.category} · {c.level} · {c.format} · 기수 {c.cohorts.length}개
                    </p>
                    <div className="mt-1.5">
                      {next ? (
                        <Chip tone="moss">
                          {next.cohortNo}기 {formatDot(next.startDate)} · {cohortStatusLabel(next)}
                        </Chip>
                      ) : (
                        <Chip tone="gray">모집 중인 기수 없음</Chip>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href={`/courses/${c.id}`} className="flex h-10 items-center justify-center rounded-xl border border-line text-[13px] font-semibold active:bg-surface">
                    사용자 화면 보기
                  </Link>
                  <Link href={`/admin/courses/${c.id}/cohorts/new`} className="flex h-10 items-center justify-center rounded-xl bg-brand-50 text-[13px] font-semibold text-brand-700 active:bg-brand-100">
                    + 기수 추가
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md justify-end px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]">
        <Link
          href="/admin/courses/new"
          className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-brand-600 pr-6 pl-5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(74,74,224,0.35)] active:scale-95"
        >
          <span className="text-xl leading-none" aria-hidden>
            +
          </span>
          과정 등록
        </Link>
      </div>
    </main>
  );
}
