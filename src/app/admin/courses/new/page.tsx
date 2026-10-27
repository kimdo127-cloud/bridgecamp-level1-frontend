import { Suspense } from "react";
import NewCoursePage from "./new-course";

export default function Page() {
  return (
    <Suspense>
      <NewCoursePage />
    </Suspense>
  );
}
