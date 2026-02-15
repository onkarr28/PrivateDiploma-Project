/**
 * Diploma Storage Manager
 * Stores diplomas in localStorage for persistence
 */

export interface StoredDiploma {
  id: string
  studentName: string
  studentId: string
  certificateHash: string
  degreeType: string
  issuanceDate: string
  status: 'valid' | 'revoked' | 'pending'
  studentDataCommitment: string
  universityAddress: string
  txHash?: string
  blockNumber?: number
}

const STORAGE_KEY = 'privatediploma_diplomas'

class DiplomaStorage {
  /**
   * Get all diplomas from storage
   */
  getAllDiplomas(): StoredDiploma[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error reading diplomas from storage:', error)
      return []
    }
  }

  /**
   * Get diplomas by university address
   */
  getDiplomasByUniversity(universityAddress: string): StoredDiploma[] {
    const allDiplomas = this.getAllDiplomas()
    return allDiplomas.filter(d => d.universityAddress === universityAddress)
  }

  /**
   * Get diplomas by student ID
   */
  getDiplomasByStudent(studentId: string): StoredDiploma[] {
    const allDiplomas = this.getAllDiplomas()
    return allDiplomas.filter(d => d.studentId === studentId)
  }

  /**
   * Add new diploma
   */
  addDiploma(diploma: StoredDiploma): void {
    try {
      const diplomas = this.getAllDiplomas()
      diplomas.push(diploma)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(diplomas))
      console.log('✅ Diploma saved to storage:', diploma.id)
    } catch (error) {
      console.error('Error saving diploma:', error)
    }
  }

  /**
   * Update existing diploma
   */
  updateDiploma(id: string, updates: Partial<StoredDiploma>): void {
    try {
      const diplomas = this.getAllDiplomas()
      const index = diplomas.findIndex(d => d.id === id)
      
      if (index !== -1) {
        diplomas[index] = { ...diplomas[index], ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(diplomas))
        console.log('✅ Diploma updated:', id)
      }
    } catch (error) {
      console.error('Error updating diploma:', error)
    }
  }

  /**
   * Delete diploma
   */
  deleteDiploma(id: string): void {
    try {
      const diplomas = this.getAllDiplomas()
      const filtered = diplomas.filter(d => d.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      console.log('✅ Diploma deleted:', id)
    } catch (error) {
      console.error('Error deleting diploma:', error)
    }
  }

  /**
   * Get diploma by certificate hash
   */
  getDiplomaByCertificateHash(certificateHash: string): StoredDiploma | null {
    const diplomas = this.getAllDiplomas()
    return diplomas.find(d => d.certificateHash === certificateHash) || null
  }

  /**
   * Clear all diplomas (for testing)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
    console.log('✅ All diplomas cleared')
  }
}

// Export singleton instance
export const diplomaStorage = new DiplomaStorage()

export default diplomaStorage
