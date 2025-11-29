import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-stone text-parchment flex flex-col items-center justify-center">
      <h1 className="text-6xl font-cinzel text-crimson mb-4">404</h1>
      <p className="text-xl mb-8">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="px-6 py-3 bg-bronze text-dark-stone font-bold">
        Return Home
      </Link>
    </div>
  );
}
