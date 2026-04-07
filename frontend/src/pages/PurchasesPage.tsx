import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserPurchases } from "../api/userApi";
import { ApiError } from "../api/client";
import { CourseCard } from "../components/CourseCard";
import { MessageBanner } from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";

export function PurchasesPage() {
  const { activeRole, userToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPurchases() {
      if (activeRole !== "user") {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserPurchases(userToken);
        setCourses(response.coursesData || []);
        setErrorMessage("");
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Could not load purchases right now.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
  }, [activeRole, userToken]);

  if (activeRole !== "user") {
    return (
      <section className="page-centered">
        <div className="card">
          <h1>User Sign In Required</h1>
          <p className="muted-text">
            Please sign in with a user account to view your purchases.
          </p>
          <Link className="btn btn-primary" to="/user/auth">
            Go to User Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <h1>My Purchases</h1>
        <p>Loaded from GET /user/purchases.</p>
      </div>

      <MessageBanner variant="error" message={errorMessage} />

      {loading ? <p className="muted-text">Loading purchases...</p> : null}

      {!loading && courses.length === 0 ? (
        <p className="muted-text">
          You have not purchased any course yet. Visit the catalog to buy one.
        </p>
      ) : null}

      <div className="course-grid">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} footerNote="Purchased" />
        ))}
      </div>
    </section>
  );
}
