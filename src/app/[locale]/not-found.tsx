import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl shadow-xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="hidden lg:flex w-1/2 relative bg-slate-100">
          <Image
            src="/assets/images/cover/cover-image.webp"
            alt="Not found illustration"
            fill
            className="object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-10 bg-white">
          <div className="w-full max-w-md text-center">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="bg-amber-gold/20 rounded-full p-4 mb-4">
                <svg
                  className="w-14 h-14 text-amber-gold"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-semibold text-charcoal-blue mb-2">
                Oops! Page Not Found
              </h1>
            </div>

            <p className="text-slate-gray text-base mb-8 leading-relaxed">
              We can’t seem to find the page you’re looking for. It might have
              been moved, deleted, or never existed.
            </p>

            <Link
              href="/"
              className="bg-amber-gold hover:bg-amber-500 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 hover:scale-105"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
