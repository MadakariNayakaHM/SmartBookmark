import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddBookmarkForm } from '@/components/add-bookmark-form'
import { BookmarkList } from '@/components/bookmark-list'
import { UserNav } from '@/components/user-nav'
import { Bookmark } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bookmark className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Smart Bookmark</span>
          </div>
          <UserNav
            email={user.email || ''}
            avatarUrl={user.user_metadata?.avatar_url}
            fullName={user.user_metadata?.full_name}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex flex-col gap-6">
          <AddBookmarkForm userId={user.id} />
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Your Bookmarks
              {bookmarks && bookmarks.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({bookmarks.length})
                </span>
              )}
            </h2>
            <BookmarkList initialBookmarks={bookmarks || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
