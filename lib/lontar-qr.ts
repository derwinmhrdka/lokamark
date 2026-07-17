import QRCode from 'qrcode'

/** Generate a PNG QR encoding the lontar ID (base64, no data-URL prefix). */
export async function generateLontarQrBase64(lontarId: string): Promise<string> {
  const buffer = await QRCode.toBuffer(lontarId.trim().toUpperCase(), {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: { dark: '#1c1b19', light: '#ffffff' },
  })
  return buffer.toString('base64')
}
