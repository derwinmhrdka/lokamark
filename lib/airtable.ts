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

/** Attachment field name on `lontar_detail` for stored QR PNGs */
export const AIRTABLE_FIELD_QR = 'qr'

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

  const image = input.image.trim()
  if (image) {
    fields.image = [{ url: image }]
  }

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
  options: { status?: LontarStatus; actor: string },
): Promise<ManuscriptRecord> {
  const status = options.status ?? LONTAR_STATUS_VERIFIED
  const actor = options.actor.trim()
  const today = nowDateTime()
  const generatedId = await generateNextLontarId()
  const payload: ManuscriptInput = { ...input, id: generatedId }

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

  const record = data.records?.[0]
  const mapped = record ? mapRecord(record) : null
  if (!mapped) throw new Error('Gagal membuat record lontar')

  if (mapped.status === LONTAR_STATUS_VERIFIED) {
    return uploadLontarQr(mapped.recordId, mapped.id)
  }

  return mapped
}

/** Generate QR PNG for the lontar ID and store it in Airtable attachment field `qr`. */
export async function uploadLontarQr(recordId: string, lontarId: string): Promise<ManuscriptRecord> {
  const config = getConfig()
  const file = await generateLontarQrBase64(lontarId)
  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(recordId)}/${encodeURIComponent(AIRTABLE_FIELD_QR)}/uploadAttachment`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType: 'image/png',
      filename: `lokamark-${lontarId.trim().toUpperCase()}.png`,
      file,
    }),
    cache: 'no-store',
  })

  const data = (await response.json()) as AirtableRecord & { error?: { message?: string } }
  if (!response.ok) {
    const detail = data.error?.message || `HTTP ${response.status}`
    throw new Error(
      `Gagal menyimpan QR ke Airtable: ${detail}. Pastikan field attachment "${AIRTABLE_FIELD_QR}" ada di tabel ${AIRTABLE_TABLE_LONTAR}.`,
    )
  }

  const mapped = mapRecord(data)
  if (mapped) return mapped

  const refreshed = await getManuscriptByRecordId(recordId)
  if (!refreshed) throw new Error('QR tersimpan tetapi gagal memuat ulang record')
  return refreshed
}

export async function updateManuscript(
  recordId: string,
  input: ManuscriptInput,
  actor: string,
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
            fields: toAirtableFields(input, {
              updatedBy: actor.trim(),
              updatedDate: today,
            }),
          },
        ],
      }),
    },
    false,
  )

  const record = data.records?.[0]
  const mapped = record ? mapRecord(record) : null
  if (!mapped) throw new Error('Gagal memperbarui record lontar')
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
