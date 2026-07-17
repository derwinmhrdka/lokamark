'use client'

import Image from 'next/image'
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Fingerprint,
  Tags,
  XCircle,
} from 'lucide-react'
import type { Manuscript } from '@/lib/manuscripts'

export type ScanResult =
  | { status: 'verified'; manuscript: Manuscript }
  | { status: 'invalid'; id: string }

export function ResultCard({ result }: { result: ScanResult }) {
  if (result.status === 'invalid') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border-2 border-danger/40 bg-danger/5 shadow-sm duration-300">
        <div className="flex items-center gap-3 bg-danger px-5 py-4 text-danger-foreground">
          <XCircle className="size-7 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-base font-bold tracking-wide">TIDAK TERVERIFIKASI / PALSU</p>
            <p className="text-xs text-danger-foreground/80">
              Naskah tidak terdaftar dalam basis data
            </p>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Fingerprint className="size-4 text-danger" aria-hidden="true" />
            <span className="text-muted-foreground">ID dipindai:</span>
            <span className="font-mono font-semibold">{result.id}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            ID naskah ini tidak ditemukan pada arsip resmi LOKAMARK. Naskah kemungkinan tidak
            asli atau belum terdaftar. Silakan hubungi institusi terkait untuk verifikasi lebih
            lanjut.
          </p>
        </div>
      </div>
    )
  }

  const m = result.manuscript

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border-2 border-success/40 bg-success/5 shadow-sm duration-300">
      <div className="flex items-center gap-3 bg-success px-5 py-4 text-success-foreground">
        <CheckCircle2 className="size-7 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-base font-bold tracking-wide">TERVERIFIKASI ASLI</p>
          <p className="text-xs text-success-foreground/80">
            Naskah terdaftar resmi dalam basis data
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[7rem_1fr]">
        <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-xl border border-border bg-muted sm:w-auto">
          <Image
            src={m.image || '/placeholder.svg'}
            alt={`Foto naskah ${m.name}`}
            fill
            sizes="(max-width: 640px) 112px, 7rem"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gold">
              Nama Lontar
            </p>
            <h3 className="font-serif text-xl font-bold leading-tight text-foreground text-balance">
              {m.name}
            </h3>
          </div>

          <dl className="grid gap-2.5 text-sm">
            <Detail icon={Tags} label="Kategori" value={m.category} />
            <Detail icon={Building2} label="Asal Institusi" value={m.institution} />
            <Detail icon={CalendarClock} label="Perkiraan Usia" value={m.year} />
            <Detail icon={Fingerprint} label="ID Naskah" value={m.id} mono />
          </dl>
        </div>
      </div>

      <p className="border-t border-success/20 px-5 py-3 text-sm leading-relaxed text-muted-foreground">
        {m.description}
      </p>
    </div>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-gold" />
      <div className="flex flex-col">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={`font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value}</dd>
      </div>
    </div>
  )
}
