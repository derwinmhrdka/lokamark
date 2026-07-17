import type { Manuscript, ManuscriptInput, ManuscriptRecord, LontarStatus } from '@/lib/manuscripts'
import {
  formatLontarId,
  LONTAR_ID_PATTERN,
  LONTAR_STATUS_INACTIVE,
  LONTAR_STATUS_PENDING,
  LONTAR_STATUS_VERIFIED,
  normalizeLontarStatus,
} from '@/lib/manuscripts'
import { generateLontarQrBase64 } from '@/lib/lontar-qr'
import { nowDateTime } from '@/lib/datetime'

type AirtableAttachment = {
  url?: string
  filename?: string
}

type AirtableFields = {
  id?: string
  name?: string
  category?: string
  institution?: string
  year?: string
  description?: string
  image?: string | AirtableAttachment[]
  status?: string
  createdBy?: string
  createdDate?: string
  updatedBy?: string
  updatedDate?: string
  qr?: AirtableAttachment[]
}

type AirtableRecord = {
  id: string
  fields: AirtableFields
  createdTime?: string
}

type AirtableListResponse = {
  records?: AirtableRecord[]
  error?: { message?: string }
}

type AirtableWriteResponse = {
  records?: AirtableRecord[]
  error?: { message?: string }
}

/** Airtable table name — keep in sync with the base schema */
export const AIRTABLE_TABLE_LONTAR = 'lontar_detail'

function getConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    throw new Error('Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.')
  }

  return { apiKey, baseId, tableName: AIRTABLE_TABLE_LONTAR }
}

function escapeFormulaString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function resolveAttachmentUrl(value: string | AirtableAttachment[] | undefined): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  return value[0]?.url?.trim() || ''
}

function resolveImage(image: AirtableFields['image']): string {
  return resolveAttachmentUrl(image) || '/placeholder.svg'
}

function toAirtableFields(
  input: ManuscriptInput,
  options?: {
    status?: LontarStatus
    createdBy?: string
    createdDate?: string
    updatedBy?: string
    updatedDate?: string
  },
): AirtableFields {
  const fields: AirtableFields = {
    id: input.id.trim().toUpperCase(),
    name: input.name.trim(),
    category: input.category.trim(),
    institution: input.institution.trim(),
    year: input.year.trim(),
    description: input.description.trim(),
  }

  if (options?.status) {
    fields.status = options.status
  }

  if (options?.createdBy) fields.createdBy = options.createdBy.trim()
  if (options?.createdDate) fields.createdDate = options.createdDate
  if (options?.updatedBy) fields.updatedBy = options.updatedBy.trim()
  if (options?.updatedDate) fields.updatedDate = options.updatedDate

  // `image` is an attachment field — uploaded separately via uploadAttachment
  return fields
}

function mapRecord(record: AirtableRecord): ManuscriptRecord | null {
  const id = record.fields.id?.trim().toUpperCase()
  if (!id || !record.fields.name) return null

  const qrUrl = resolveAttachmentUrl(record.fields.qr) || undefined

  return {
    recordId: record.id,
    id,
    name: record.fields.name,
    category: record.fields.category ?? '',
    institution: record.fields.institution ?? '',
    year: record.fields.year ?? '',
    description: record.fields.description ?? '',
    image: resolveImage(record.fields.image),
    status: normalizeLontarStatus(record.fields.status),
    createdBy: record.fields.createdBy?.trim() || undefined,
    createdDate: record.fields.createdDate?.trim() || undefined,
    updatedBy: record.fields.updatedBy?.trim() || undefined,
    updatedDate: record.fields.updatedDate?.trim() || undefined,
    qrUrl,
  }
}

async function airtableFetch<T = AirtableListResponse>(
  path: string,
  init?: RequestInit,
  cache = true,
): Promise<T> {
  const config = getConfig()

  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}${path}`
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...(cache ? { next: { revalidate: 60 } } : { cache: 'no-store' }),
  })

  const data = (await response.json()) as T & { error?: { message?: string } }
  if (!response.ok) {
    const detail = data.error?.message || `HTTP ${response.status}`
    if (response.status === 404) {
      throw new Error(
        `Airtable table "${config.tableName}" not found (404). Create that table in your base, or check AIRTABLE_BASE_ID.`,
      )
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Airtable auth failed (${response.status}). Check AIRTABLE_API_KEY scopes and base access.`,
      )
    }
    throw new Error(`Airtable request failed: ${detail}`)
  }
  return data
}

export async function findManuscriptById(rawId: string): Promise<Manuscript | null> {
  const id = rawId.trim().toUpperCase()
  if (!id) return null

  const formula = encodeURIComponent(`{id}='${escapeFormulaString(id)}'`)
  const data = await airtableFetch(`?filterByFormula=${formula}&maxRecords=1`)
  const record = data.records?.[0]
  if (!record) return null
  const mapped = mapRecord(record)
  // Public verify only accepts verified lontar
  if (!mapped || mapped.status !== LONTAR_STATUS_VERIFIED) return null
  return mapped
}

export async function findManuscriptRecordById(rawId: string): Promise<ManuscriptRecord | null> {
  const id = rawId.trim().toUpperCase()
  if (!id) return null

  const formula = encodeURIComponent(`{id}='${escapeFormulaString(id)}'`)
  const data = await airtableFetch(`?filterByFormula=${formula}&maxRecords=1`, undefined, false)
  const record = data.records?.[0]
  if (!record) return null
  return mapRecord(record)
}

export async function listSampleIds(): Promise<string[]> {
  const formula = encodeURIComponent(
    `OR({status}='${LONTAR_STATUS_VERIFIED}',BLANK({status}))`,
  )
  const data = await airtableFetch(
    `?filterByFormula=${formula}&fields%5B%5D=id&maxRecords=10&sort%5B0%5D%5Bfield%5D=id`,
  )
  return (
    data.records
      ?.map((r) => r.fields.id?.trim().toUpperCase())
      .filter((value): value is string => Boolean(value)) ?? []
  )
}

export async function listVerifiedManuscripts(): Promise<Manuscript[]> {
  const formula = encodeURIComponent(
    `OR({status}='${LONTAR_STATUS_VERIFIED}',BLANK({status}))`,
  )
  const data = await airtableFetch(
    `?filterByFormula=${formula}&sort%5B0%5D%5Bfield%5D=id`,
  )
  return (
    data.records
      ?.map(mapRecord)
      .filter((r): r is ManuscriptRecord => r !== null)
      .map(({ recordId: _recordId, ...manuscript }) => manuscript) ?? []
  )
}

export async function listAllManuscripts(): Promise<ManuscriptRecord[]> {
  const data = await airtableFetch('?sort%5B0%5D%5Bfield%5D=id', undefined, false)
  return data.records?.map(mapRecord).filter((r): r is ManuscriptRecord => r !== null) ?? []
}

export async function getManuscriptByRecordId(recordId: string): Promise<ManuscriptRecord | null> {
  const config = getConfig()
  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}/${encodeURIComponent(recordId)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (response.status === 404) return null

  const data = (await response.json()) as AirtableRecord & { error?: { message?: string } }
  if (!response.ok) {
    throw new Error(data.error?.message || `Airtable request failed (${response.status})`)
  }

  return mapRecord(data)
}

export async function generateNextLontarId(year = new Date().getFullYear()): Promise<string> {
  const records = await listAllManuscripts()
  let maxSequence = 0

  for (const record of records) {
    const match = record.id.match(LONTAR_ID_PATTERN)
    if (!match) continue
    const idYear = Number(match[1])
    const sequence = Number(match[2])
    if (idYear === year && Number.isFinite(sequence) && sequence > maxSequence) {
      maxSequence = sequence
    }
  }

  return formatLontarId(year, maxSequence + 1)
}

export async function createManuscript(
  input: ManuscriptInput,
  options: {
    status?: LontarStatus
    actor: string
    image?: { base64: string; contentType: string; filename: string }
  },
): Promise<ManuscriptRecord> {
  const status = options.status ?? LONTAR_STATUS_VERIFIED
  const actor = options.actor.trim()
  const today = nowDateTime()
  const generatedId = await generateNextLontarId()
  const payload: ManuscriptInput = { ...input, id: generatedId, image: '' }

  // Rare race: if ID was taken between generate and create, retry once
  const existing = await findManuscriptRecordById(generatedId)
  if (existing) {
    payload.id = await generateNextLontarId()
  }

  const data = await airtableFetch<AirtableWriteResponse>(
    '',
    {
      method: 'POST',
      body: JSON.stringify({
        records: [
          {
            fields: toAirtableFields(payload, {
              status,
              createdBy: actor,
              createdDate: today,
              updatedBy: actor,
              updatedDate: today,
            }),
          },
        ],
      }),
    },
    false,
  )

  let mapped = data.records?.[0] ? mapRecord(data.records[0]) : null
  if (!mapped) throw new Error('Gagal membuat record lontar')

  if (options.image) {
    mapped = await uploadManuscriptImage(mapped.recordId, options.image)
  }

  if (mapped.status === LONTAR_STATUS_VERIFIED) {
    return uploadLontarQr(mapped.recordId, mapped.id)
  }

  return mapped
}

export async function uploadManuscriptImage(
  recordId: string,
  image: { base64: string; contentType: string; filename: string },
  options?: { replace?: boolean },
): Promise<ManuscriptRecord> {
  const fieldName = 'image'

  if (options?.replace) {
    await airtableFetch<AirtableWriteResponse>(
      '',
      {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{ id: recordId, fields: { image: [] } }],
        }),
      },
      false,
    )
  }

  const uploadHosts = ['https://content.airtable.com', 'https://api.airtable.com'] as const
  for (const host of uploadHosts) {
    const uploaded = await tryUploadAttachmentBytes({
      host,
      recordId,
      fieldName,
      filename: image.filename,
      file: image.base64,
      contentType: image.contentType,
    })
    if (uploaded) return uploaded
  }

  throw new Error(
    `Gagal mengunggah gambar ke Airtable. Pastikan field attachment "${fieldName}" ada di tabel ${AIRTABLE_TABLE_LONTAR}.`,
  )
}

/** Generate QR PNG for the lontar ID and store it in the Airtable attachment field `qr`. */
export async function uploadLontarQr(recordId: string, lontarId: string): Promise<ManuscriptRecord> {
  const fieldName = 'qr'
  const id = lontarId.trim().toUpperCase()
  const filename = `lokamark-${id}.png`

  // 1) Prefer direct binary upload (content host is what Airtable SDKs use)
  const file = await generateLontarQrBase64(id)
  const uploadHosts = ['https://content.airtable.com', 'https://api.airtable.com'] as const

  for (const host of uploadHosts) {
    const uploaded = await tryUploadAttachmentBytes({
      host,
      recordId,
      fieldName,
      filename,
      file,
      contentType: 'image/png',
    })
    if (uploaded) return uploaded
  }

  // 2) Fallback: Airtable pulls a public QR image URL into the attachment field
  return attachQrByPublicUrl(recordId, id, filename)
}

async function tryUploadAttachmentBytes(params: {
  host: string
  recordId: string
  fieldName: string
  filename: string
  file: string
  contentType: string
}): Promise<ManuscriptRecord | null> {
  const config = getConfig()
  const url = `${params.host}/v0/${config.baseId}/${encodeURIComponent(params.recordId)}/${encodeURIComponent(params.fieldName)}/uploadAttachment`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType: params.contentType,
      filename: params.filename,
      file: params.file,
    }),
    cache: 'no-store',
  })

  if (!response.ok) return null

  const data = (await response.json()) as AirtableRecord
  const mapped = mapRecord(data)
  if (mapped) return mapped

  return getManuscriptByRecordId(params.recordId)
}

async function attachQrByPublicUrl(
  recordId: string,
  lontarId: string,
  filename: string,
): Promise<ManuscriptRecord> {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(lontarId)}&margin=16`

  const data = await airtableFetch<AirtableWriteResponse>(
    '',
    {
      method: 'PATCH',
      body: JSON.stringify({
        records: [
          {
            id: recordId,
            fields: {
              qr: [{ url: qrImageUrl, filename }],
            },
          },
        ],
      }),
    },
    false,
  )

  const record = data.records?.[0]
  const mapped = record ? mapRecord(record) : null
  if (mapped) return mapped

  const refreshed = await getManuscriptByRecordId(recordId)
  if (!refreshed) {
    throw new Error(
      'Gagal menyimpan QR ke Airtable. Pastikan field attachment bernama "qr" ada di tabel lontar_detail.',
    )
  }
  return refreshed
}

export async function updateManuscript(
  recordId: string,
  input: ManuscriptInput,
  actor: string,
  options?: { image?: { base64: string; contentType: string; filename: string } },
): Promise<ManuscriptRecord> {
  const duplicate = await findManuscriptRecordById(input.id)
  if (duplicate && duplicate.recordId !== recordId) {
    throw new Error(`ID "${input.id.trim().toUpperCase()}" sudah digunakan record lain`)
  }

  const today = nowDateTime()
  const data = await airtableFetch<AirtableWriteResponse>(
    '',
    {
      method: 'PATCH',
      body: JSON.stringify({
        records: [
          {
            id: recordId,
            fields: toAirtableFields(
              { ...input, image: '' },
              {
                updatedBy: actor.trim(),
                updatedDate: today,
              },
            ),
          },
        ],
      }),
    },
    false,
  )

  let mapped = data.records?.[0] ? mapRecord(data.records[0]) : null
  if (!mapped) throw new Error('Gagal memperbarui record lontar')

  if (options?.image) {
    mapped = await uploadManuscriptImage(mapped.recordId, options.image, { replace: true })
  }

  return mapped
}

export async function deleteManuscript(recordId: string, actor: string): Promise<ManuscriptRecord> {
  const today = nowDateTime()
  const data = await airtableFetch<AirtableWriteResponse>(
    '',
    {
      method: 'PATCH',
      body: JSON.stringify({
        records: [
          {
            id: recordId,
            fields: {
              status: LONTAR_STATUS_INACTIVE,
              updatedBy: actor.trim(),
              updatedDate: today,
            },
          },
        ],
      }),
    },
    false,
  )

  const record = data.records?.[0]
  const mapped = record ? mapRecord(record) : null
  if (!mapped) throw new Error('Gagal menonaktifkan lontar')
  return mapped
}

export async function updateManuscriptStatus(
  recordId: string,
  status: LontarStatus,
  actor: string,
): Promise<ManuscriptRecord> {
  const today = nowDateTime()
  const data = await airtableFetch<AirtableWriteResponse>(
    '',
    {
      method: 'PATCH',
      body: JSON.stringify({
        records: [
          {
            id: recordId,
            fields: {
              status,
              updatedBy: actor.trim(),
              updatedDate: today,
            },
          },
        ],
      }),
    },
    false,
  )

  const record = data.records?.[0]
  const mapped = record ? mapRecord(record) : null
  if (!mapped) throw new Error('Gagal memperbarui status lontar')

  if (status === LONTAR_STATUS_VERIFIED) {
    return uploadLontarQr(mapped.recordId, mapped.id)
  }

  return mapped
}

export async function listPendingManuscripts(): Promise<ManuscriptRecord[]> {
  const formula = encodeURIComponent(`{status}='${LONTAR_STATUS_PENDING}'`)
  const data = await airtableFetch(
    `?filterByFormula=${formula}&sort%5B0%5D%5Bfield%5D=id`,
    undefined,
    false,
  )
  return data.records?.map(mapRecord).filter((r): r is ManuscriptRecord => r !== null) ?? []
}

export async function listManuscriptsByCreatedBy(username: string): Promise<ManuscriptRecord[]> {
  const trimmed = username.trim()
  if (!trimmed) return []

  const formula = encodeURIComponent(
    `LOWER({createdBy})=LOWER('${escapeFormulaString(trimmed)}')`,
  )
  const data = await airtableFetch(
    `?filterByFormula=${formula}&sort%5B0%5D%5Bfield%5D=id`,
    undefined,
    false,
  )
  return data.records?.map(mapRecord).filter((r): r is ManuscriptRecord => r !== null) ?? []
}
