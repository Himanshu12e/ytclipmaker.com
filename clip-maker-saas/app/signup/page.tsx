import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registration page coming soon.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
