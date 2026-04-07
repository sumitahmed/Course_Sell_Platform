import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HOME_VISIT_KEY = "course_sell_home_visited";

const starterCourses = [
  {
    id: "starter-1",
    category: "Web Development",
    title: "Modern React for Project Builds",
    level: "Beginner",
    duration: "18 hours",
    students: "21,300",
    rating: "4.8",
    price: "$39",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "starter-2",
    category: "Data Science",
    title: "Practical Python for Data Analysis",
    level: "Intermediate",
    duration: "22 hours",
    students: "14,870",
    rating: "4.7",
    price: "$49",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "starter-3",
    category: "UI Design",
    title: "Figma Systems for Real Products",
    level: "Beginner",
    duration: "12 hours",
    students: "9,640",
    rating: "4.9",
    price: "$29",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "starter-4",
    category: "AI Tools",
    title: "AI Workflow Automation for Teams",
    level: "Advanced",
    duration: "16 hours",
    students: "11,220",
    rating: "4.6",
    price: "$59",
    image:
      "https://images.unsplash.com/photo-1677442135722-5f95f0fd5f6a?auto=format&fit=crop&w=900&q=80"
  }
];

export function HomePage() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const alreadyVisited = window.localStorage.getItem(HOME_VISIT_KEY);

    if (!alreadyVisited) {
      setIsFirstVisit(true);
      window.localStorage.setItem(HOME_VISIT_KEY, "yes");
    }
  }, []);

  return (
    <section>
      <div className="market-hero card">
        <div className="market-hero-copy">
          <p className="eyebrow">Learn Faster. Build Better.</p>
          <h1>Upskill with job-ready courses and guided learning paths.</h1>
          <p className="muted-text">
            Pick your role, sign in fast, and start learning or managing your
            course catalog with zero friction.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/auth?mode=signin">
              Sign In
            </Link>
            <Link className="btn btn-ghost" to="/auth?mode=signup">
              Sign Up
            </Link>
            <Link className="btn btn-ghost" to="/courses">
              Explore Catalog
            </Link>
          </div>

          <div className="trust-row">
            <div>
              <strong>45K+</strong>
              <span>Learners</span>
            </div>
            <div>
              <strong>180+</strong>
              <span>Courses</span>
            </div>
            <div>
              <strong>4.8/5</strong>
              <span>Average Rating</span>
            </div>
          </div>
        </div>

        <div className="market-hero-media">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=80"
            alt="Learners collaborating"
          />
        </div>
      </div>

      <div className="topic-chips">
        <span>Web Development</span>
        <span>Data Science</span>
        <span>Cloud</span>
        <span>Design</span>
        <span>AI & Automation</span>
      </div>

      {isFirstVisit ? (
        <p className="message message-info">
          First visit starter list: these sample courses are shown immediately
          so the home page never feels empty.
        </p>
      ) : null}

      <div className="section-header">
        <h2>Popular Starter Courses</h2>
        <p>Preview-style dummy cards for first-time experience and discovery.</p>
      </div>

      <div className="home-course-grid">
        {starterCourses.map((course) => (
          <article className="card home-course-card" key={course.id}>
            <div className="home-course-image-wrap">
              <img src={course.image} alt={course.title} className="home-course-image" />
              <span className="home-course-category">{course.category}</span>
            </div>

            <h3>{course.title}</h3>

            <div className="home-course-meta">
              <span>{course.level}</span>
              <span>{course.duration}</span>
            </div>

            <div className="home-course-footer">
              <div>
                <strong>{course.price}</strong>
                <span>{course.students} learners</span>
              </div>
              <div className="rating-pill">{course.rating} star</div>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-cards">
        <article className="card info-card role-card">
          <h3>Continue as User</h3>
          <p className="muted-text">
            Sign in as user, preview courses, purchase, and track purchases.
          </p>
          <Link className="btn btn-primary" to="/auth?mode=signin&role=user">
            Continue as User
          </Link>
        </article>

        <article className="card info-card role-card">
          <h3>Continue as Admin</h3>
          <p className="muted-text">
            Sign in as admin, create courses, update content, and manage your
            catalog.
          </p>
          <Link className="btn btn-primary" to="/auth?mode=signin&role=admin">
            Continue as Admin
          </Link>
        </article>
      </div>
    </section>
  );
}
