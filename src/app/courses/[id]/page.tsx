import { Suspense } from "react";
import CourseDetailPage, { DetailSkeleton } from "./course-detail";

export default function Page() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CourseDetailPage />
    </Suspense>
  );
}
