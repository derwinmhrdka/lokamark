'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Camera, Loader2, QrCode, ScanLine } from 'lucide-react'

type ScannerProps = {
  onScan: (id: string) => void | Promise<void>
}

const INVALID_DEMO_ID = 'LKM-9999-XXX'

export function Scanner({ onScan }: ScannerProps) {
  const [scanning, setScanning] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const emitScan = useEffectEvent((id: string) => {
    setScanning(false)
    onScan(id)
  })

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function startScan() {
    if (scanning) return
    setScanning(true)
    timer.current = setTimeout(() => {
      emitScan(INVALID_DEMO_ID)
    }, 2200)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-primary shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.gold/15%),transparent_70%)]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-primary-foreground/80">
          {scanning ? (
            <>
              <Loader2 className="size-9 animate-spin text-gold motion-reduce:animate-none" aria-hidden="true" />
              <p className="text-sm font-medium">Memindai QR Code…</p>
            </>
          ) : (
            <>
              <QrCode className="size-16 text-primary-foreground/25" aria-hidden="true" />
              <p className="max-w-[14rem] text-sm text-primary-foreground/60">
                Arahkan kamera ke QR Code pada naskah
              </p>
            </>
          )}
        </div>

        <div className="pointer-events-none absolute inset-6">
          <span className="absolute left-0 top-0 size-8 rounded-tl-lg border-l-2 border-t-2 border-gold" />
          <span className="absolute right-0 top-0 size-8 rounded-tr-lg border-r-2 border-t-2 border-gold" />
          <span className="absolute bottom-0 left-0 size-8 rounded-bl-lg border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-0 right-0 size-8 rounded-br-lg border-b-2 border-r-2 border-gold" />
        </div>

        {scanning ? (
          <div className="pointer-events-none absolute inset-x-8 top-8 bottom-8 overflow-hidden motion-reduce:hidden">
            <div className="absolute inset-x-0 h-0.5 animate-[scan_2.2s_ease-in-out_infinite] bg-gold shadow-[0_0_12px_2px_theme(colors.gold)]" />
          </div>
        ) : null}

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium text-primary-foreground/80 backdrop-blur">
          <span
            className={`size-1.5 rounded-full ${scanning ? 'animate-pulse bg-gold motion-reduce:animate-none' : 'bg-primary-foreground/40'}`}
          />
          {scanning ? 'LIVE' : 'STANDBY'}
        </div>
      </div>

      <button
        type="button"
        onClick={startScan}
        disabled={scanning}
        className="mt-6 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {scanning ? (
          <>
            <ScanLine className="size-4" aria-hidden="true" />
            Sedang Memindai…
          </>
        ) : (
          <>
            <Camera className="size-4" aria-hidden="true" />
            Mulai Pindai QR Code
          </>
        )}
      </button>
    </div>
  )
}
