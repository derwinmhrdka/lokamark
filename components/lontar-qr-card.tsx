'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, QrCode } from 'lucide-react'

type LontarQrCardProps = {
  id: string
  name: string
  /** Airtable-stored QR URL when available */
  qrUrl?: string
  className?: string
}

export function LontarQrCard({ id, name, qrUrl, className = '' }: LontarQrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(qrUrl ?? null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(null)

    if (qrUrl) {
      setQrDataUrl(qrUrl)
      return
    }

    setQrDataUrl(null)
    QRCode.toDataURL(id, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
      color: { dark: '#1c1b19', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setError('Gagal membuat QR code')
      })

    return () => {
      cancelled = true
    }
  }, [id, qrUrl])

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      // Always generate locally for the composite download (avoids canvas CORS from Airtable CDN)
      const localQr = await QRCode.toDataURL(id, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 512,
        color: { dark: '#1c1b19', light: '#ffffff' },
      })
      const blob = await buildSaveImage({ id, name, qrDataUrl: localQr })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lokamark-${id}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Gagal menyimpan gambar QR')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-foreground">
          <QrCode className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">QR Code</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code untuk ${id}`}
            className="size-44 rounded-xl border border-border bg-white p-2"
          />
        ) : (
          <div className="flex size-44 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
            Membuat QR…
          </div>
        )}

        <div className="w-full text-center">
          <p className="font-mono text-xs font-semibold tracking-wide text-gold">{id}</p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium text-foreground">{name}</p>
        </div>

        <button
          type="button"
          disabled={!qrDataUrl || saving}
          onClick={handleSave}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-gold-foreground transition hover:brightness-95 disabled:opacity-60"
        >
          <Download className="size-4" aria-hidden="true" />
          {saving ? 'Menyimpan…' : 'Simpan ke Ponsel'}
        </button>
      </div>
    </div>
  )
}

async function buildSaveImage(params: {
  id: string
  name: string
  qrDataUrl: string
}): Promise<Blob> {
  const width = 720
  const height = 960
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas tidak tersedia')

  // Background
  ctx.fillStyle = '#faf8f4'
  ctx.fillRect(0, 0, width, height)

  // Header bar
  ctx.fillStyle = '#2a2824'
  ctx.fillRect(0, 0, width, 120)

  ctx.fillStyle = '#d4a84b'
  ctx.font = 'bold 28px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('LOKAMARK', width / 2, 52)

  ctx.fillStyle = '#f5f0e6'
  ctx.font = '14px sans-serif'
  ctx.fillText('QR Verifikasi Naskah Lontar', width / 2, 84)

  // ID label + value
  ctx.textAlign = 'left'
  ctx.fillStyle = '#7a7468'
  ctx.font = '13px sans-serif'
  ctx.fillText('ID', 56, 180)

  ctx.fillStyle = '#1c1b19'
  ctx.font = 'bold 26px ui-monospace, monospace'
  wrapText(ctx, params.id, 56, 216, width - 112, 32)

  // Name label + value
  ctx.fillStyle = '#7a7468'
  ctx.font = '13px sans-serif'
  ctx.fillText('NAME', 56, 280)

  ctx.fillStyle = '#1c1b19'
  ctx.font = 'bold 28px Georgia, serif'
  const nameBottom = wrapText(ctx, params.name, 56, 318, width - 112, 36)

  // QR
  const qr = await loadImage(params.qrDataUrl)
  const qrSize = 420
  const qrX = (width - qrSize) / 2
  const qrY = Math.max(nameBottom + 36, 380)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)
  ctx.strokeStyle = '#e8e2d6'
  ctx.lineWidth = 2
  ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32)
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

  // Footer
  ctx.fillStyle = '#7a7468'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Scan QR ini di beranda LOKAMARK untuk verifikasi', width / 2, height - 40)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Gagal membuat file gambar'))
    }, 'image/png')
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/)
  let line = ''
  let cursorY = y

  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY)
      line = word
      cursorY += lineHeight
    } else {
      line = test
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY)
    cursorY += lineHeight
  }
  return cursorY
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat QR'))
    img.src = src
  })
}
