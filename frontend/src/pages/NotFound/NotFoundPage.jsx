import { Link } from "react-router-dom";
import { Home, ArrowLeft, SearchX } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="relative mb-6">
        <div className="text-[120px] sm:text-[160px] font-black text-primary/10 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <SearchX size={56} className="text-primary/60" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-text-muted text-sm sm:text-base max-w-md mb-8">
        Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
        moved. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
        >
          <Home size={16} />
          Go to Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-surface-light text-text font-medium rounded-xl hover:bg-gray-200 transition-all"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
