import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoursePreview, purchaseCourse } from "../api/courseApi";
import { ApiError } from "../api/client";
import { CourseCard } from "../components/CourseCard";
import { MessageBanner } from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";

export function CourseCatalogPage() {
  const navigate = useNavigate();
  const { activeRole, userToken } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [buyingCourseId, setBuyingCourseId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await getCoursePreview();
        setCourses(response.courses || []);
        setErrorMessage("");
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Could not load courses right now.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.title.localeCompare(b.title)),
    [courses]
  );

  async function handleBuy(courseId: string) {
    if (activeRole !== "user") {
      navigate("/auth?mode=signin&role=user");
      return;
    }

    setBuyingCourseId(courseId);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await purchaseCourse({ courseId }, userToken);
      setStatusMessage(response.message || "Course purchased successfully.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Purchase failed.";
      setErrorMessage(message);
    } finally {
      setBuyingCourseId(null);
    }
  }

  return (
    <section>
      <div className="section-header">
        <h1>Course Catalog</h1>
        <p>Browse all published courses from the backend preview API.</p>
      </div>

      {activeRole === "admin" ? (
        <MessageBanner
          variant="info"
          message="Admin accounts cannot purchase courses. Sign in as user to buy."
        />
      ) : null}

      <MessageBanner variant="success" message={statusMessage} />
      <MessageBanner variant="error" message={errorMessage} />

      {loading ? <p className="muted-text">Loading courses...</p> : null}

      {!loading && sortedCourses.length === 0 ? (
        <p className="muted-text">No courses found yet.</p>
      ) : null}

      <div className="course-grid">
        {sortedCourses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            actionLabel={activeRole === "user" ? "Buy Course" : "Sign in to Buy"}
            actionDisabled={activeRole === "admin"}
            actionBusy={buyingCourseId === course._id}
            onAction={handleBuy}
          />
        ))}
      </div>
    </section>
  );
}
