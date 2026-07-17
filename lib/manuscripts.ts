export type LontarStatus = 'verified' | 'waiting for approval' | 'inactive'

export const LONTAR_STATUS_VERIFIED: LontarStatus = 'verified'
export const LONTAR_STATUS_PENDING: LontarStatus = 'waiting for approval'
export const LONTAR_STATUS_INACTIVE: LontarStatus = 'inactive'

export type Manuscript = {
  id: string
  name: string
  category: string
  institution: string
  year: string
  description: string
  image: string
  status: LontarStatus
  createdBy?: string
  createdDate?: string
  updatedBy?: string
  updatedDate?: string
  /** Public URL of QR attachment stored in Airtable */
  qrUrl?: string
}

export type ManuscriptRecord = Manuscript & {
  recordId: string
}

export type ManuscriptInput = {
  id: string
  name: string
  category: string
  institution: string
  year: string
  description: string
  image: string
}

export const EMPTY_MANUSCRIPT: ManuscriptInput = {
  id: '',
  name: '',
  category: '',
  institution: '',
  year: '',
  description: '',
  image: '',
}

/** ID format: LKM-{year}-{sequence} e.g. LKM-2026-001 */
export const LONTAR_ID_PATTERN = /^LKM-(\d{4})-(\d+)$/i

export function normalizeLontarStatus(value: string | undefined): LontarStatus {
  const normalized = value?.trim().toLowerCase()
  if (normalized === LONTAR_STATUS_PENDING) return LONTAR_STATUS_PENDING
  if (normalized === LONTAR_STATUS_INACTIVE) return LONTAR_STATUS_INACTIVE
  return LONTAR_STATUS_VERIFIED
}

export function formatLontarId(year: number, sequence: number) {
  return `LKM-${year}-${String(sequence).padStart(3, '0')}`
}
