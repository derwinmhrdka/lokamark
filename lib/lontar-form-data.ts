import type { ManuscriptInput } from '@/lib/manuscripts'

export type UploadedImageFile = {
  base64: string
  contentType: string
  filename: string
}

const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function text(form: FormData, key: string) {
  const value = form.get(key)
  return typeof value === 'string' ? value : ''
}

export async function parseLontarMultipartForm(request: Request): Promise<{
  fields: ManuscriptInput
  image: UploadedImageFile | null
}> {
  const form = await request.formData()
  const name = text(form, 'name')
  if (!name.trim()) {
    throw new Error('Nama wajib diisi')
  }

  const fields: ManuscriptInput = {
    id: text(form, 'id'),
    name,
    category: text(form, 'category'),
    institution: text(form, 'institution'),
    year: text(form, 'year'),
    description: text(form, 'description'),
    image: '',
  }

  const imageEntry = form.get('image')
  let image: UploadedImageFile | null = null

  if (imageEntry instanceof File && imageEntry.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(imageEntry.type)) {
      throw new Error('Gambar harus JPEG, PNG, WebP, atau GIF')
    }
    if (imageEntry.size > MAX_IMAGE_BYTES) {
      throw new Error('Ukuran gambar maksimal 4.5 MB')
    }

    const buffer = Buffer.from(await imageEntry.arrayBuffer())
    image = {
      base64: buffer.toString('base64'),
      contentType: imageEntry.type,
      filename: imageEntry.name || `lontar-image.${imageEntry.type.split('/')[1] || 'png'}`,
    }
  }

  return { fields, image }
}
