'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Fingerprint,
  Tags,
  X,
} from 'lucide-react'
import type { Manuscript } from '@/lib/manuscripts'

type VerifiedLontarCatalogProps = {
  manuscripts: Manuscript[]
}

function imageSrc(src: string) {
  return src?.trim() || '/placeholder.svg'
}

function isRemoteImage(src: string) {
  return src.startsWith('http://') || src.startsWith('https://')
}

export function VerifiedLontarCatalog({ manuscripts }: VerifiedLontarCatalogProps) {
  const [selected, setSelected] = useState<Manuscript | null>(null)

  if (manuscripts.length === 0) {
    return (
      <section className="border-t border-border pt-10">
        <SectionHeader count={0} />
        <p className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground">
          Belum ada lontar terverifikasi yang dapat ditampilkan.
        </p>
      </section>
    )
  }

  return (
    <section className="border-t border-border pt-10">
      <SectionHeader count={manuscripts.length} />

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {manuscripts.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setSelected(item)}
              className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                <Image
                  src={imageSrc(item.image)}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  unoptimized={isRemoteImage(imageSrc(item.image))}
                />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-success/95 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success-foreground">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Verified
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3 sm:p-3.5">
                <p className="font-mono text-[10px] font-semibold tracking-wide text-gold sm:text-[11px]">
                  {item.id}
                </p>
                <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug text-foreground sm:text-base">
                  {item.name}
                </h3>
                <p className="mt-auto line-clamp-1 pt-1 text-xs text-muted-foreground">
                  {item.category || item.institution || 'Lontar terverifikasi'}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <LontarDetailModal manuscript={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  )
}

function SectionHeader({ count }: { count: number }) {
  return (
    <div className="text-center sm:text-left">
      <h2 className="font-serif text-2xl font-bold text-foreground">Koleksi Terverifikasi</h2>
      <p className="mt-1 text-sm text-muted-foreground">
          {count > 0 ? `${count} lontar` : 'Belum ada data'}
      </p>
    </div>
  )
}

function LontarDetailModal({
  manuscript,
  onClose,
}: {
  manuscript: Manuscript
  onClose: () => void
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const src = imageSrc(manuscript.image)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-primary/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-xl duration-200 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 bg-muted sm:aspect-[5/3]">
          <Image
            src={src}
            alt={`Foto naskah ${manuscript.name}`}
            fill
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover"
            unoptimized={isRemoteImage(src)}
            priority
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-sm backdrop-blur transition hover:bg-card"
            aria-label="Tutup detail"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Terverifikasi Asli
          </span>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <p className="font-mono text-xs font-semibold tracking-wide text-gold">{manuscript.id}</p>
          <h3 id={titleId} className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground text-balance">
            {manuscript.name}
          </h3>

          <dl className="mt-5 grid gap-3 text-sm">
            <DetailRow icon={Tags} label="Kategori" value={manuscript.category} />
            <DetailRow icon={Building2} label="Institusi" value={manuscript.institution} />
            <DetailRow icon={CalendarClock} label="Perkiraan Usia" value={manuscript.year} />
            <DetailRow icon={Fingerprint} label="ID Naskah" value={manuscript.id} mono />
          </dl>

          {manuscript.description ? (
            <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              {manuscript.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function DetailRow({
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
      <Icon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className={`font-medium text-foreground ${mono ? 'font-mono' : ''}`}>
          {value || '—'}
        </dd>
      </div>
    </div>
  )
}
