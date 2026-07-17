'use client'

import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import { Camera, ImageUp, Loader2, QrCode, Square } from 'lucide-react'
import type { Html5Qrcode } from 'html5-qrcode'

type ScannerProps = {
  onScan: (id: string) => void | Promise<void>
}

function extractLontarId(raw: string): string {
  const text = raw.trim()
  if (!text) return ''

  // Prefer explicit LKM ids even if QR embeds a URL/query
  const match = text.match(/LKM-\d{4}-\d+/i)
  if (match) return match[0].toUpperCase()

  try {
    const url = new URL(text)
    const fromQuery = url.searchParams.get('id')?.trim()
    if (fromQuery) return fromQuery.toUpperCase()
    const pathPart = url.pathname.split('/').filter(Boolean).pop()
    if (pathPart) return pathPart.toUpperCase()
  } catch {
    // not a URL
  }

  return text.toUpperCase()
}

export function Scanner({ onScan }: ScannerProps) {
  const reactId = useId().replace(/:/g, '')
  const readerId = `qr-reader-${reactId}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handlingRef = useRef(false)

  const [active, setActive] = useState(false)
  const [starting, setStarting] = useState(false)
  const [decodingFile, setDecodingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDecoded = useEffectEvent(async (raw: string) => {
    if (handlingRef.current) return
    const id = extractLontarId(raw)
    if (!id) return

    handlingRef.current = true
    setError(null)

    try {
      await stopCamera()
      await onScan(id)
    } finally {
      handlingRef.current = false
    }
  })

  async function stopCamera() {
    const scanner = scannerRef.current
    if (!scanner) {
      setActive(false)
      return
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }
    } catch {
      // already stopped
    }

    try {
      scanner.clear()
    } catch {
      // ignore
    }

    scannerRef.current = null
    setActive(false)
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current
      if (!scanner) return
      scannerRef.current = null
      if (scanner.isScanning) {
        void scanner.stop().catch(() => undefined)
      }
      try {
        scanner.clear()
      } catch {
        // ignore
      }
    }
  }, [])

  async function startCamera() {
    if (active || starting) return

    setStarting(true)
    setError(null)

    try {
      await stopCamera()

      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(readerId, { verbose: false })
      scannerRef.current = scanner

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras.length) {
        throw new Error('Tidak ada kamera terdeteksi di perangkat ini')
      }

      // Prefer rear camera on phones; fall back to first available device
      const backCamera =
        cameras.find((c) => /back|rear|environment|belakang/i.test(c.label)) ?? cameras[cameras.length - 1]

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)
          return { width: edge, height: edge }
        },
        aspectRatio: 1,
      }

      try {
        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            void handleDecoded(decodedText)
          },
          () => undefined,
        )
      } catch {
        await scanner.start(
          backCamera.id,
          config,
          (decodedText) => {
            void handleDecoded(decodedText)
          },
          () => undefined,
        )
      }

      setActive(true)
    } catch (err) {
      scannerRef.current = null
      setActive(false)

      const message = err instanceof Error ? err.message : 'Gagal membuka kamera'
      if (/NotAllowedError|Permission|denied|NotAllowed/i.test(message)) {
        setError('Izin kamera ditolak. Izinkan akses kamera di browser, lalu coba lagi.')
      } else if (/NotFoundError|DevicesNotFound|tidak ada kamera/i.test(message)) {
        setError('Kamera tidak ditemukan. Gunakan unggah gambar QR sebagai alternatif.')
      } else if (/secure|https|insecure/i.test(message)) {
        setError('Kamera membutuhkan HTTPS atau localhost.')
      } else {
        setError(message || 'Gagal membuka kamera')
      }
    } finally {
      setStarting(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setDecodingFile(true)
    setError(null)

    try {
      await stopCamera()

      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(readerId, { verbose: false })
      scannerRef.current = scanner

      const decoded = await scanner.scanFile(file, false)
      await handleDecoded(decoded)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membaca QR dari gambar'
      setError(
        /No QR|not found|QR code parse/i.test(message)
          ? 'QR Code tidak ditemukan pada gambar. Pastikan foto jelas dan tidak terpotong.'
          : message,
      )
    } finally {
      try {
        scannerRef.current?.clear()
      } catch {
        // ignore
      }
      scannerRef.current = null
      setDecodingFile(false)
    }
  }

  const busy = starting || decodingFile

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-primary shadow-lg">
        <div
          id={readerId}
          className={`absolute inset-0 overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover ${
            active ? 'z-10' : 'z-0 opacity-0'
          }`}
        />

        {!active ? (
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-primary text-center text-primary-foreground/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.gold/15%),transparent_70%)]" />
            {busy ? (
              <>
                <Loader2
                  className="relative size-9 animate-spin text-gold motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <p className="relative text-sm font-medium">
                  {starting ? 'Membuka kamera…' : 'Membaca gambar…'}
                </p>
              </>
            ) : (
              <>
                <QrCode className="relative size-16 text-primary-foreground/25" aria-hidden="true" />
                <p className="relative max-w-[14rem] text-sm text-primary-foreground/60">
                  Buka kamera atau unggah gambar QR Code
                </p>
              </>
            )}
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-6 z-20">
          <span className="absolute left-0 top-0 size-8 rounded-tl-lg border-l-2 border-t-2 border-gold" />
          <span className="absolute right-0 top-0 size-8 rounded-tr-lg border-r-2 border-t-2 border-gold" />
          <span className="absolute bottom-0 left-0 size-8 rounded-bl-lg border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-0 right-0 size-8 rounded-br-lg border-b-2 border-r-2 border-gold" />
        </div>

        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-primary-foreground/90 backdrop-blur">
          <span
            className={`size-1.5 rounded-full ${
              active ? 'animate-pulse bg-gold motion-reduce:animate-none' : 'bg-primary-foreground/40'
            }`}
          />
          {active ? 'LIVE' : 'STANDBY'}
        </div>
      </div>

      {error ? (
        <div className="mt-4 w-full max-w-sm rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        {active ? (
          <button
            type="button"
            onClick={() => void stopCamera()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-gold/50"
          >
            <Square className="size-4" aria-hidden="true" />
            Stop Kamera
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void startCamera()}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {starting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Membuka…
              </>
            ) : (
              <>
                <Camera className="size-4" aria-hidden="true" />
                Buka Kamera
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {decodingFile ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Membaca…
            </>
          ) : (
            <>
              <ImageUp className="size-4" aria-hidden="true" />
              Unggah QR
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>
    </div>
  )
}
