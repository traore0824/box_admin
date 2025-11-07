/**
 * Utilitaires de sécurité pour l'application admin
 */

/**
 * Valide qu'un montant est positif et dans une plage valide
 */
export function validateAmount(amount: number | string, min: number = 0, max: number = 999999999): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(numAmount) && numAmount >= min && numAmount <= max
}

/**
 * Valide un ID utilisateur
 */
export function validateUserId(userId: number | string): boolean {
  const id = typeof userId === 'string' ? parseInt(userId, 10) : userId
  return !isNaN(id) && id > 0 && Number.isInteger(id)
}

/**
 * Valide un type de fichier image
 */
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  if (file.size > maxSize) {
    return false
  }
  
  return true
}

/**
 * Sanitize une chaîne pour éviter les injections
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Retirer les balises HTML
    .trim()
    .substring(0, 1000) // Limiter la longueur
}

/**
 * Valide un email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un numéro de téléphone (format international)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

