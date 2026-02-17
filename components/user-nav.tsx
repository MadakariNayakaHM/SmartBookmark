'use client'

import { signOut } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

type UserNavProps = {
  email: string
  avatarUrl?: string | null
  fullName?: string | null
}

export function UserNav({ email, avatarUrl, fullName }: UserNavProps) {
  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName || email}
          className="h-8 w-8 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {(fullName || email).charAt(0).toUpperCase()}
        </div>
      )}
      <div className="hidden flex-col sm:flex">
        {fullName && <span className="text-sm font-medium text-foreground">{fullName}</span>}
        <span className="text-xs text-muted-foreground">{email}</span>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
