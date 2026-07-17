'use client'

import { KeyRound, Search } from 'lucide-react'

type ManualInputProps = {
  onSubmit: (id: string) => void | Promise<void>
}

export function ManualInput({ onSubmit }: ManualInputProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const id = new FormData(e.currentTarget).get('manuscript-id')?.toString().trim()
    if (!id) return
    onSubmit(id)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <label
        htmlFor="manuscript-id"
        className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <KeyRound className="size-4 text-gold" aria-hidden="true" />
        Masukkan ID Naskah
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="manuscript-id"
          name="manuscript-id"
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="LKM-2026-001"
          className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm uppercase tracking-wide text-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          <Search className="size-4" aria-hidden="true" />
          Verifikasi
        </button>
      </div>
    </form>
  )
}
