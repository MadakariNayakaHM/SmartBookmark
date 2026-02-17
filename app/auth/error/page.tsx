import Link from 'next/link'

export default function AuthError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
        <p className="mt-2 text-muted-foreground">
          Something went wrong during sign in. Please try again.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
