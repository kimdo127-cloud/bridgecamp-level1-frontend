"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBar, CategoryThumb, PreviewBar, Chip, FlashToast, Skeleton, SlowServerHint, StatusScreen, primaryButton, type Mode } from "@/components/ui";
import { courseGroup, listCourses, openCohorts, type CourseGroup } from "@/lib/api";
import { cohortStatusLabel, formatPrice, formatRange, weeksLabel } from "@/lib/format";
import type { CourseWithCohorts } from "@/lib/types";

type State = { status: "loading" } | { status: "error" } | { status: "ready"; courses: CourseWithCohorts[] };

const GROUPS: { key: CourseGroup; title: string; desc: string }[] = [
  { key: "closing", title: "🔥 곧 개강해요", desc: "개강까지 일주일도 안 남았어요" },
  { key: "open", title: "모집 중인 과정", desc: "개강이 가까운 순서예요" },
  { key: "preparing", title: "다음 기수 준비 중", desc: "일정이 정해지면 이곳에 안내해 드려요" },
];

// 사용자 모드(/)와 운영 모드(/admin)가 같은 목록을 쓰고, 운영 모드에만 관리 버튼이 붙는다
export function CourseList({ mode }: { mode: Mode }) {
  const admin = mode === "admin";
  const [state, setState] = useState<State>({ status: "loading" });

  const load = () => {
    setState({ status: "loading" });
    listCourses()
      .then((courses) => setState({ status: "ready", courses }))
      .catch(() => setState({ status: "error" }));
  };

  useEffect(() => {
    listCourses()
      .then((courses) => setState({ status: "ready", courses }))
      .catch(() => setState({ status: "error" }));
  }, []);

  return (
    <main className={admin ? "pb-32" : "pb-10"}>
      <FlashToast />
      {!admin && <PreviewBar adminHref="/admin" />}
      {admin ? (
        <AdminBar userHref="/" />
      ) : (
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line/70 bg-surface/90 px-5 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-black text-white" aria-hidden>
            B
          </span>
          <p className="text-[17px] font-extrabold tracking-tight">브릿지캠프</p>
        </div>
      </header>
      )}

      <section className="px-5 pt-5">
        <h1 className="text-[22px] font-bold leading-snug">{admin ? "과정 관리" : "어떤 과정을 찾고 계세요?"}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {admin ? "수강 희망자에게 보이는 화면 그대로예요. 과정을 등록하거나 기수를 추가해 보세요." : "개강일, 기간, 수업 방식, 수강료를 한눈에 비교해 보세요."}
        </p>
      </section>

      {state.status === "loading" && <SlowServerHint />}
      {state.status === "loading" && (
        <ul className="mt-6 space-y-4 px-5" aria-busy="true" aria-label="과정을 불러오는 중">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-3xl bg-white">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <StatusScreen
          emoji="🔌"
          title="과정을 불러오지 못했어요"
          body={"서버와 연결이 잠시 끊겼어요.\n잠시 뒤 다시 시도해 주세요."}
          action={
            <button type="button" onClick={load} className={primaryButton}>
              다시 불러오기
            </button>
          }
        />
      )}

      {state.status === "ready" && state.courses.length === 0 && (
        <StatusScreen
          emoji="📚"
          title={admin ? "아직 등록된 과정이 없어요" : "지금 열린 과정이 없어요"}
          body={admin ? "첫 번째 과정을 등록해 보세요." : "새 과정이 열리면 이곳에 안내해 드릴게요."}
          action={
            admin && (
              <Link href="/admin/courses/new" className={primaryButton}>
                과정 등록하기
              </Link>
            )
          }
        />
      )}

      {state.status === "ready" &&
        GROUPS.map((g) => {
          const items = state.courses.filter((c) => courseGroup(c) === g.key);
          if (items.length === 0) return null;
          return (
            <section key={g.key} className="mt-8 px-5">
              <div className="mb-3">
                <h2 className="text-lg font-bold">
                  {g.title} <span className="text-brand-600">{items.length}</span>
                </h2>
                <p className="text-[13px] text-ink-soft">{g.desc}</p>
              </div>
              <ul className="space-y-4">
                {items.map((c) => (
                  <li key={c.id}>
                    <CourseCard item={c} group={g.key} admin={admin} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

      {admin && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md justify-end px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]">
          <Link
            href="/admin/courses/new"
            className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-ink pr-6 pl-5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(24,27,43,0.3)] active:scale-95"
          >
            <span className="text-xl leading-none" aria-hidden>
              +
            </span>
            과정 등록
          </Link>
        </div>
      )}
    </main>
  );
}

function CourseCard({ item, group, admin }: { item: CourseWithCohorts; group: CourseGroup; admin: boolean }) {
  const next = openCohorts(item)[0];
  const preparing = group === "preparing";

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(24,27,43,0.06)]">
    <Link
      href={admin ? `/admin/courses/${item.id}` : `/courses/${item.id}`}
      className={`block transition active:bg-surface ${preparing && !admin ? "opacity-70" : ""}`}
    >
      <div className="relative">
        <CategoryThumb category={item.category} size="card" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {preparing ? (
            <Badge tone="gray">준비 중</Badge>
          ) : (
            <>
              <Badge tone={group === "closing" ? "red" : "green"}>모집 중</Badge>
              {next && <Badge tone="dark">{cohortStatusLabel(next)}</Badge>}
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip>{item.category}</Chip>
          <Chip tone="gray">{item.level}</Chip>
          <Chip tone="gray">{item.format}</Chip>
        </div>
        <p className="mt-2 text-[17px] font-bold leading-snug">{item.title}</p>
        <p className="mt-0.5 text-[14px] text-ink-soft">{item.summary}</p>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0 text-[13px]">
            {next ? (
              <>
                <p className="font-semibold">
                  {next.cohortNo}기 · {formatRange(next.startDate, next.endDate)}
                </p>
                <p className="mt-0.5 truncate text-ink-soft">
                  {weeksLabel(next.startDate, next.endDate)}
                  {next.schedule && ` · ${next.schedule}`}
                </p>
              </>
            ) : (
              <p className="text-ink-soft">다음 기수 일정 준비 중</p>
            )}
          </div>
          <p className="shrink-0 text-[17px] font-extrabold text-brand-700">{formatPrice(item.price)}</p>
        </div>
      </div>
    </Link>
      {admin && (
        <div className="flex items-center justify-between border-t border-line bg-surface/60 px-4 py-2.5">
          <p className="text-[13px] text-ink-soft">
            기수 {item.cohorts.length}개 · 모집 중 {openCohorts(item).length}개
          </p>
          <Link href={`/admin/courses/${item.id}/cohorts/new`} className="rounded-lg bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-700 active:bg-brand-100">
            + 기수 추가
          </Link>
        </div>
      )}
    </div>
  );
}

function Badge({ tone, children }: { tone: "green" | "red" | "dark" | "gray"; children: React.ReactNode }) {
  const tones = {
    green: "bg-moss-600 text-white",
    red: "bg-[#e5484d] text-white",
    dark: "bg-ink/80 text-white",
    gray: "bg-white/90 text-ink-soft",
  };
  return <span className={`rounded-md px-2 py-1 text-[12px] font-bold backdrop-blur ${tones[tone]}`}>{children}</span>;
}
