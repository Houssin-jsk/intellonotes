"use client";

import { ProfessorCourseCard } from "./ProfessorCourseCard";
import type { CourseLanguage, CourseLevel, CourseStatus } from "@/lib/db/queries";

interface CourseItem {
  id: string;
  title: string;
  language: CourseLanguage;
  level: CourseLevel;
  price: number;
  status: CourseStatus;
  updated_at: string;
}

export function ProfessorCourseList({ courses }: { courses: CourseItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <ProfessorCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
