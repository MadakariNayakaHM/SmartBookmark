'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, Trash2, Bookmark as BookmarkIcon } from 'lucide-react'
import { format } from 'date-fns'

type BookmarkItem = {
  id: string
  url: string
  title: string
  created_at: string
  user_id: string
}

export function BookmarkList({ initialBookmarks }: { initialBookmarks: BookmarkItem[] }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  const setupRealtime = useCallback(() => {
    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          const newBookmark = payload.new as BookmarkItem
          setBookmarks((prev) => {
            if (prev.some((b) => b.id === newBookmark.id)) return prev
            return [newBookmark, ...prev]
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          const deletedId = payload.old.id as string
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId))
        },
      )
      .subscribe()

    return channel
  }, [supabase])

  useEffect(() => {
    const channel = setupRealtime()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [setupRealtime, supabase])

  async function handleDelete(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete bookmark:', error.message)
    }
    setDeletingId(null)
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <BookmarkIcon className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">No bookmarks yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Add your first bookmark using the form above.
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2" role="list">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm font-medium text-card-foreground">
              {bookmark.title}
            </span>
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate">{bookmark.url}</span>
            </a>
          </div>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            {format(new Date(bookmark.created_at), 'MMM dd, yyyy')}
          </span>
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label={`Delete bookmark: ${bookmark.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
