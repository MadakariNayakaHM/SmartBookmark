import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { Bookmark } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Bookmark className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
            Smart Bookmark
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            Save your favorite links in one place. Access them from anywhere, in real-time.
          </p>
        </div>
        <div className="w-full">
          <GoogleSignInButton />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Sign in with your Google account to get started. Your bookmarks are private and only visible to you.
        </p>
      </div>
    </main>
  )
}
