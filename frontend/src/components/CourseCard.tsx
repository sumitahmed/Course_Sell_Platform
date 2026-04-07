import { useMemo, useState } from "react";
import type { Course } from "../types";

interface CourseCardProps {
  course: Course;
  actionLabel?: string;
  onAction?: (courseId: string) => void;
  actionDisabled?: boolean;
  actionBusy?: boolean;
  footerNote?: string;
}

export function CourseCard({
  course,
  actionLabel,
  onAction,
  actionDisabled,
  actionBusy,
  footerNote
}: CourseCardProps) {
  const [hasImageError, setHasImageError] = useState(false);

  const displayPrice = useMemo(() => {
    if (Number.isNaN(Number(course.price))) {
      return "NA";
    }

    return `$${Number(course.price).toFixed(2)}`;
  }, [course.price]);

  return (
    <article className="card course-card">
      <div className="course-image-wrap">
        {course.imageUrl && !hasImageError ? (
          <img
            className="course-image"
            src={course.imageUrl}
            alt={course.title}
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="course-image-placeholder">No Image</div>
        )}
      </div>

      <div className="course-body">
        <h3>{course.title}</h3>
        <p>{course.description}</p>
      </div>

      <div className="course-footer">
        <div>
          <strong>{displayPrice}</strong>
          <span>{course.content?.length || 0} content item(s)</span>
        </div>

        {actionLabel && onAction ? (
          <button
            className="btn btn-primary"
            disabled={actionDisabled || actionBusy}
            onClick={() => onAction(course._id)}
          >
            {actionBusy ? "Please wait..." : actionLabel}
          </button>
        ) : null}
      </div>

      {footerNote ? <p className="course-note">{footerNote}</p> : null}
    </article>
  );
}
