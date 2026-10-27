export const CATEGORIES = ["AI 활용", "데이터", "개발", "디자인", "기획·PM"] as const;
export type Category = (typeof CATEGORIES)[number];

export const LEVELS = ["입문", "초급", "중급"] as const;
export type Level = (typeof LEVELS)[number];

export const FORMATS = ["온라인", "오프라인", "하이브리드"] as const;
export type Format = (typeof FORMATS)[number];

// DB 테이블 courses 한 줄
export interface Course {
  id: number;
  title: string;
  category: Category;
  level: Level;
  format: Format;
  summary: string;
  description: string;
  price: number;
  defaultCapacity: number;
  instructorName: string;
  instructorBio: string;
  recommendedFor: string; // 한 줄에 하나씩
  curriculum: string; // 한 줄에 한 주차씩
  preparation: string;
  createdAt: string;
}

// DB 테이블 cohorts 한 줄 (courses 1 : N cohorts)
export interface Cohort {
  id: number;
  courseId: number;
  cohortNo: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  capacity: number;
  schedule: string;
}

export interface CourseWithCohorts extends Course {
  cohorts: Cohort[];
}

export interface CohortInput {
  startDate: string;
  endDate: string;
  capacity: number;
  schedule: string;
}

export type CourseInput = Omit<Course, "id" | "createdAt"> & { cohorts: CohortInput[] };

export function lines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
