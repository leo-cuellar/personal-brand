import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-8 text-4xl font-bold">Social Assistant</h1>
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/publication-types"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Manage Publication Types
          </Link>
        </div>
      </div>
    </main>
  );
}
