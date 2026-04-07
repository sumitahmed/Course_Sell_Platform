import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addAdminCourseContent,
  createAdminCourse,
  deleteAdminCourse,
  getAdminCourses,
  updateAdminCourse
} from "../api/adminApi";
import { ApiError } from "../api/client";
import { MessageBanner } from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";
import type { Course } from "../types";

interface CourseFormState {
  title: string;
  description: string;
  imageUrl: string;
  price: string;
}

const emptyCourseForm: CourseFormState = {
  title: "",
  description: "",
  imageUrl: "",
  price: ""
};

function toForm(course: Course): CourseFormState {
  return {
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    price: String(course.price)
  };
}

export function AdminDashboardPage() {
  const { activeRole, adminToken } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDrafts, setCourseDrafts] = useState<Record<string, CourseFormState>>(
    {}
  );
  const [contentDrafts, setContentDrafts] = useState<Record<string, string>>({});
  const [createForm, setCreateForm] = useState<CourseFormState>(emptyCourseForm);

  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.title.localeCompare(b.title)),
    [courses]
  );

  async function loadCourses() {
    setLoading(true);

    try {
      const response = await getAdminCourses(adminToken);
      const nextCourses = response.courses || [];
      const nextDrafts: Record<string, CourseFormState> = {};

      nextCourses.forEach((course) => {
        nextDrafts[course._id] = toForm(course);
      });

      setCourses(nextCourses);
      setCourseDrafts(nextDrafts);
      setErrorMessage("");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not load admin courses right now.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeRole === "admin") {
      loadCourses();
    } else {
      setLoading(false);
    }
  }, [activeRole]);

  function parsePrice(rawPrice: string): number {
    const value = Number(rawPrice);

    if (Number.isNaN(value) || value < 0) {
      return 0;
    }

    return value;
  }

  async function handleCreateCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusyKey("create");
    setErrorMessage("");
    setStatusMessage("");

    try {
      await createAdminCourse(
        {
          title: createForm.title,
          description: createForm.description,
          imageUrl: createForm.imageUrl,
          price: parsePrice(createForm.price)
        },
        adminToken
      );

      setCreateForm(emptyCourseForm);
      setStatusMessage("Course created successfully.");
      await loadCourses();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Course creation failed.";
      setErrorMessage(message);
    } finally {
      setBusyKey("");
    }
  }

  async function handleUpdateCourse(courseId: string) {
    const draft = courseDrafts[courseId];

    if (!draft) {
      return;
    }

    setBusyKey(`update-${courseId}`);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await updateAdminCourse(
        {
          courseId,
          title: draft.title,
          description: draft.description,
          imageUrl: draft.imageUrl,
          price: parsePrice(draft.price)
        },
        adminToken
      );

      setStatusMessage("Course updated successfully.");
      await loadCourses();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Course update failed.";
      setErrorMessage(message);
    } finally {
      setBusyKey("");
    }
  }

  async function handleDeleteCourse(courseId: string) {
    setBusyKey(`delete-${courseId}`);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await deleteAdminCourse(courseId, adminToken);
      setStatusMessage("Course deleted successfully.");
      setCourses((current) => current.filter((course) => course._id !== courseId));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Course delete failed.";
      setErrorMessage(message);
    } finally {
      setBusyKey("");
    }
  }

  async function handleAddContent(courseId: string) {
    const contentText = contentDrafts[courseId]?.trim();

    if (!contentText) {
      setErrorMessage("Content text is required before adding.");
      return;
    }

    setBusyKey(`content-${courseId}`);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await addAdminCourseContent(courseId, contentText, adminToken);
      setStatusMessage("Content added successfully.");
      setContentDrafts((current) => ({ ...current, [courseId]: "" }));
      await loadCourses();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Adding content failed.";
      setErrorMessage(message);
    } finally {
      setBusyKey("");
    }
  }

  if (activeRole !== "admin") {
    return (
      <section className="page-centered">
        <div className="card">
          <h1>Admin Sign In Required</h1>
          <p className="muted-text">
            Please sign in with an admin account to manage courses.
          </p>
          <Link className="btn btn-primary" to="/admin/auth">
            Go to Admin Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <h1>Admin Dashboard</h1>
        <p>
          Manage your own courses using /admin/course, /admin/course/bulk,
          /admin/course/:courseId and /admin/course/:courseId/content.
        </p>
      </div>

      <MessageBanner variant="success" message={statusMessage} />
      <MessageBanner variant="error" message={errorMessage} />

      <div className="admin-layout">
        <article className="card">
          <h2>Create Course</h2>

          <form className="form-grid" onSubmit={handleCreateCourse}>
            <label>
              Title
              <input
                value={createForm.title}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    title: event.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                required
                rows={3}
              />
            </label>

            <label>
              Image URL
              <input
                value={createForm.imageUrl}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    imageUrl: event.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={createForm.price}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    price: event.target.value
                  }))
                }
                required
              />
            </label>

            <button className="btn btn-primary" disabled={busyKey === "create"}>
              {busyKey === "create" ? "Creating..." : "Create Course"}
            </button>
          </form>
        </article>

        <article>
          <h2>My Courses</h2>
          {loading ? <p className="muted-text">Loading courses...</p> : null}

          {!loading && sortedCourses.length === 0 ? (
            <p className="muted-text">You have not created any course yet.</p>
          ) : null}

          <div className="admin-course-list">
            {sortedCourses.map((course) => {
              const draft = courseDrafts[course._id] || toForm(course);
              const contentDraft = contentDrafts[course._id] || "";

              return (
                <div className="card admin-course-card" key={course._id}>
                  <h3>{course.title}</h3>

                  <label>
                    Title
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setCourseDrafts((current) => ({
                          ...current,
                          [course._id]: {
                            ...draft,
                            title: event.target.value
                          }
                        }))
                      }
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      rows={3}
                      value={draft.description}
                      onChange={(event) =>
                        setCourseDrafts((current) => ({
                          ...current,
                          [course._id]: {
                            ...draft,
                            description: event.target.value
                          }
                        }))
                      }
                    />
                  </label>

                  <label>
                    Image URL
                    <input
                      value={draft.imageUrl}
                      onChange={(event) =>
                        setCourseDrafts((current) => ({
                          ...current,
                          [course._id]: {
                            ...draft,
                            imageUrl: event.target.value
                          }
                        }))
                      }
                    />
                  </label>

                  <label>
                    Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.price}
                      onChange={(event) =>
                        setCourseDrafts((current) => ({
                          ...current,
                          [course._id]: {
                            ...draft,
                            price: event.target.value
                          }
                        }))
                      }
                    />
                  </label>

                  <div className="inline-actions">
                    <button
                      className="btn btn-primary"
                      disabled={busyKey === `update-${course._id}`}
                      onClick={() => handleUpdateCourse(course._id)}
                      type="button"
                    >
                      {busyKey === `update-${course._id}` ? "Updating..." : "Update"}
                    </button>
                    <button
                      className="btn btn-danger"
                      disabled={busyKey === `delete-${course._id}`}
                      onClick={() => handleDeleteCourse(course._id)}
                      type="button"
                    >
                      {busyKey === `delete-${course._id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  <div className="content-add-row">
                    <input
                      placeholder="New content item"
                      value={contentDraft}
                      onChange={(event) =>
                        setContentDrafts((current) => ({
                          ...current,
                          [course._id]: event.target.value
                        }))
                      }
                    />
                    <button
                      className="btn btn-ghost"
                      disabled={busyKey === `content-${course._id}`}
                      onClick={() => handleAddContent(course._id)}
                      type="button"
                    >
                      {busyKey === `content-${course._id}`
                        ? "Adding..."
                        : "Add Content"}
                    </button>
                  </div>

                  <p className="muted-text">
                    Existing content count: {course.content?.length || 0}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
