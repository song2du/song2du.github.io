import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <p className="text-sm font-medium tabular-nums text-faint">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="mt-8 inline-block text-accent hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
