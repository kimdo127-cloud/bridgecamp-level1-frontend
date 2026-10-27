import { cohortStatus, daysBetween, todayString } from "./format";
import type { Cohort, CohortInput, CourseInput, CourseWithCohorts } from "./types";

// 백엔드(NestJS) 주소. 로컬은 .env.local, 배포는 Vercel 설정값 NEXT_PUBLIC_API_URL로 정한다.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100").replace(/\/$/, "");

// 백엔드가 입력을 거절하면 칸별 안내 문구(errors)를 함께 돌려준다
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("서버와 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.", 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.message ?? "요청을 처리하지 못했어요.", res.status, body.errors);
  return body as T;
}

// 모집 중(개강 전)인 기수, 개강이 빠른 순
export function openCohorts(c: CourseWithCohorts) {
  return c.cohorts.filter((x) => cohortStatus(x) === "upcoming");
}

export const CLOSING_SOON_DAYS = 7;

// 수강 희망자 목록의 묶음: 마감 임박(개강 7일 이내) / 모집 중 / 다음 기수 준비 중
export type CourseGroup = "closing" | "open" | "preparing";

export function courseGroup(c: CourseWithCohorts): CourseGroup {
  const next = openCohorts(c)[0];
  if (!next) return "preparing";
  return daysBetween(todayString(), next.startDate) <= CLOSING_SOON_DAYS ? "closing" : "open";
}

export async function listCourses(): Promise<CourseWithCohorts[]> {
  const list = await request<CourseWithCohorts[]>("/courses");
  // 개강이 가까운 과정이 위로, 모집 중인 기수가 없으면 맨 뒤
  const key = (c: CourseWithCohorts) => openCohorts(c)[0]?.startDate ?? "9999";
  return list.sort((a, b) => key(a).localeCompare(key(b)));
}

export async function getCourse(id: number): Promise<CourseWithCohorts | null> {
  try {
    return await request<CourseWithCohorts>(`/courses/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function createCourse(input: CourseInput): Promise<CourseWithCohorts> {
  return request<CourseWithCohorts>("/courses", { method: "POST", body: JSON.stringify(input) });
}

// 기수 번호는 백엔드가 그 과정의 마지막 기수 + 1로 붙여서 돌려준다
export async function addCohort(courseId: number, input: CohortInput): Promise<Cohort> {
  return request<Cohort>(`/courses/${courseId}/cohorts`, { method: "POST", body: JSON.stringify(input) });
}
