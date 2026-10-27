import { Suspense } from "react";
import NewCohortPage from "./new-cohort";

export default function Page() {
  return (
    <Suspense>
      <NewCohortPage />
    </Suspense>
  );
}
