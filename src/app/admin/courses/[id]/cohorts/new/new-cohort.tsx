"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CohortFields } from "@/components/cohort-fields";
import { useFormErrors } from "@/components/use-form-errors";
import { BottomBar, CategoryThumb, ErrorSummary, HomeLink, SectionCard, Skeleton, StatusScreen, TopBar, primaryButton, setFlash } from "@/components/ui";
import { ApiError, addCohort, getCourse } from "@/lib/api";
import { cohortStatusLabel, formatShortDate, weeksLabel } from "@/lib/format";
import type { CourseWithCohorts } from "@/lib/types";
import { validateCohort, type CohortFormValues } from "@/lib/validation";

type Values = Omit<CohortFormValues, "key">;
type State = { status: "loading" } | { status: "missing" } | { status: "ready"; item: CourseWithCohorts };

export default function NewCohortPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [values, setValues] = useState<Values>({ startDate: "", endDate: "", capacity: "", schedule: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useFormErrors(values, validateCohort, {
    idToKey: (id) => id.replace(/^cohort-/, ""),
    keyToId: (key) => `cohort-${key}`,
  });
  const errors = form.errors;

  useEffect(() => {
    getCourse(Number(id))
      .then((item) => {
        if (!item) return setState({ status: "missing" });
        setState({ status: "ready", item });
        // 직전 기수의 정원과 수업 시간을 기본값으로 채운다
        const last = item.cohorts.at(-1);
        setValues((v) => ({ ...v, capacity: String(last?.capacity ?? item.defaultCapacity), schedule: last?.schedule ?? "" }));
      })
      .catch(() => setState({ status: "missing" }));
  }, [id]);

  if (state.status === "loading")
    return (
      <main>
        <TopBar title="기수 추가" backHref={`/admin/courses/${id}`} />
        <div className="space-y-3 p-4">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </main>
    );

  if (state.status === "missing")
    return (
      <main>
        <TopBar title="기수 추가" backHref={`/admin/courses/${id}`} />
        <StatusScreen emoji="🔍" title="찾는 과정이 없어요" body="목록에서 과정을 다시 골라 주세요." action={<HomeLink />} />
      </main>
    );

  const c = state.item;
  const nextNo = Math.max(0, ...c.cohorts.map((x) => x.cohortNo)) + 1;
  const recent = [...c.cohorts].reverse().slice(0, 4);

  const change = (patch: Partial<Values>) => {
    const next = { ...values, ...patch };
    setValues(next);
    form.clearServerErrors();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.trySubmit()) return;
    setSaving(true);
    try {
      const added = await addCohort(c.id, { startDate: values.startDate, endDate: values.endDate, capacity: Number(values.capacity), schedule: values.schedule.trim() });
      setFlash(`${added.cohortNo}기가 추가됐어요`);
      router.replace(`/admin/courses/${c.id}`);
    } catch (e) {
      setSaving(false);
      // 백엔드가 거절한 경우 칸별 안내를, 연결 문제면 전체 안내를 보여 준다
      if (e instanceof ApiError && Object.keys(e.errors).length > 0) form.showServerErrors(e.errors);
      else setFormError(e instanceof ApiError ? e.message : "저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    }
  };

  const validPeriod = values.startDate && values.endDate && values.endDate >= values.startDate;

  return (
    <main>
      <TopBar title="기수 추가" backHref={`/admin/courses/${id}`} />
      <form noValidate onSubmit={onSubmit} onBlur={form.onBlur} className="space-y-3 px-4 pt-4">
        <div className="flex items-center gap-3 rounded-3xl bg-white p-3">
          <CategoryThumb category={c.category} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{c.title}</p>
            <p className="text-[13px] text-ink-soft">
              {c.format} · 기본 정원 {c.defaultCapacity}명
            </p>
          </div>
        </div>

        <ErrorSummary errors={errors} focusSignal={form.focusSignal} onSelect={form.goTo} />
        {formError && (
          <p role="alert" className="rounded-2xl bg-[#fff4f4] px-4 py-3 text-sm text-[#a83232]">
            {formError}
          </p>
        )}

        <SectionCard title={`새 기수 · ${nextNo}기`} action={<span className="text-xs text-ink-soft">기수 번호는 자동으로 붙어요</span>}>
          <CohortFields idPrefix="cohort-" values={values} errors={errors} onChange={change} />
          {validPeriod && (
            <p className="rounded-xl bg-surface px-4 py-3 text-[13px] text-ink-soft">
              교육 기간: <b className="text-ink">{weeksLabel(values.startDate, values.endDate)}</b>
            </p>
          )}
        </SectionCard>

        <SectionCard title="최근 기수">
          {recent.length === 0 ? (
            <p className="text-sm text-ink-soft">아직 열린 기수가 없어요.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((x) => (
                <li key={x.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 text-[13px]">
                  <span>
                    <b>{x.cohortNo}기</b> · {formatShortDate(x.startDate)} ~ {formatShortDate(x.endDate)}
                  </span>
                  <span className="text-ink-soft">{cohortStatusLabel(x)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <BottomBar>
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? "추가하는 중…" : `${nextNo}기 추가하기`}
          </button>
        </BottomBar>
      </form>
    </main>
  );
}
