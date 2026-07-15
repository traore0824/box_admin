/**
 * Extraction des messages d'erreur renvoyés par le backend BOX (Django / DRF).
 *
 * Formats supportés (tous observés dans box_backend) :
 * - { message: "..." }
 * - { detail: "..." | [...] }
 * - { details: "..." | [...] }
 * - { error: "..." }
 * - { messag: "..." }  (typo legacy)
 * - { success: false, message/detail/error/... }
 * - { field: "msg" } ou { field: ["msg", ...] }  (ValidationError DRF)
 * - { non_field_errors: [...] }
 * - { errors: [...] }
 * - chaîne ou tableau JSON brut
 */

const PRIORITY_KEYS = [
  'non_field_errors',
  'message',
  'detail',
  'details',
  'error',
  'messag',
  'errors',
] as const

const SKIP_KEYS = new Set([
  'success',
  'code',
  'status',
  'exception_type',
  'traceback',
  'count',
  'next',
  'previous',
  'results',
])

function pushUnique(target: string[], value: string) {
  const trimmed = value.trim()
  if (!trimmed) return
  if (!target.includes(trimmed)) {
    target.push(trimmed)
  }
}

function collectErrorMessages(value: unknown, depth = 0): string[] {
  if (value == null || depth > 8) return []

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? [trimmed] : []
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectErrorMessages(item, depth + 1))
  }

  if (typeof value !== 'object') return []

  const obj = value as Record<string, unknown>
  const messages: string[] = []

  for (const key of PRIORITY_KEYS) {
    if (key in obj) {
      for (const msg of collectErrorMessages(obj[key], depth + 1)) {
        pushUnique(messages, msg)
      }
    }
  }

  if (obj.success === false && 'data' in obj) {
    for (const msg of collectErrorMessages(obj.data, depth + 1)) {
      pushUnique(messages, msg)
    }
  }

  for (const [key, nested] of Object.entries(obj)) {
    if (SKIP_KEYS.has(key)) continue
    if ((PRIORITY_KEYS as readonly string[]).includes(key)) continue
    if (key === 'data' && obj.success === false) continue

    if (typeof nested === 'string' || Array.isArray(nested)) {
      for (const msg of collectErrorMessages(nested, depth + 1)) {
        pushUnique(messages, msg)
      }
      continue
    }

    if (nested && typeof nested === 'object') {
      for (const msg of collectErrorMessages(nested, depth + 1)) {
        pushUnique(messages, msg)
      }
    }
  }

  return messages
}

/** Retourne le(s) message(s) d'erreur lisible(s), ou null si rien d'exploitable. */
export function parseApiErrorBody(data: unknown): string | null {
  const messages = collectErrorMessages(data)
  if (messages.length === 0) return null
  return messages.join('\n')
}

export async function parseResponseJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function readApiError(
  response: Response,
  fallback: string
): Promise<string> {
  const data = await parseResponseJson(response.clone())
  return parseApiErrorBody(data) ?? fallback
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

/** Lit le corps JSON/texte et lève ApiRequestError si !response.ok. */
export async function handleApiResponse<T = unknown>(
  response: Response,
  errorFallback = 'Une erreur est survenue'
): Promise<T> {
  const data = await parseResponseJson(response)
  if (!response.ok) {
    throw new ApiRequestError(
      parseApiErrorBody(data) ?? errorFallback,
      response.status,
      data
    )
  }
  return data as T
}
