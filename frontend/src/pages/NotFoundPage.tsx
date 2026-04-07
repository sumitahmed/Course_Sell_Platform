import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-centered">
      <div className="card">
        <h1>Page Not Found</h1>
        <p className="muted-text">The route you requested does not exist.</p>
        <Link className="btn btn-primary" to="/">
          Go to Catalog
        </Link>
      </div>
    </section>
  );
}
