import { useState } from 'react'
import { Send, X } from 'lucide-react'

interface DiplomaIssuanceFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  universityAddress: string
}

export default function DiplomaIssuanceForm({
  onSubmit,
  onCancel,
  universityAddress,
}: DiplomaIssuanceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    degreeType: '',
    department: '',
    marks: {
      subject1: '0',
      subject2: '0',
      subject3: '0',
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      onSubmit({
        ...formData,
        certificateHash: `0x${Math.random().toString(16).slice(2)}`,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Error issuing diploma:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student ID */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Student ID
        </label>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleInputChange}
          placeholder="e.g., STU-2026-001"
          className="input-field"
          required
        />
      </div>

      {/* Student Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Student Name
        </label>
        <input
          type="text"
          name="studentName"
          value={formData.studentName}
          onChange={handleInputChange}
          placeholder="Full name"
          className="input-field"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Will be hashed and committed (not stored on-chain)
        </p>
      </div>

      {/* Degree Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Degree Type
        </label>
        <select
          name="degreeType"
          value={formData.degreeType}
          onChange={handleInputChange}
          className="input-field"
          required
        >
          <option value="">Select degree type...</option>
          <option value="Bachelor of Science in Computer Science">
            B.Sc. Computer Science
          </option>
          <option value="Bachelor of Science in Engineering">
            B.Sc. Engineering
          </option>
          <option value="Bachelor of Science in Mathematics">
            B.Sc. Mathematics
          </option>
          <option value="Master of Science in Computer Science">
            M.Sc. Computer Science
          </option>
        </select>
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Department
        </label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          placeholder="Department of Computer Science"
          className="input-field"
          required
        />
      </div>

      {/* Divider */}
      <div className="border-t border-white border-opacity-20 my-4"></div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
        {isLoading ? 'Issuing Diploma...' : 'Issue Diploma'}
      </button>

      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <X size={18} />
        Cancel
      </button>

      {/* Privacy Notice */}
      <div className="info-message text-xs">
        <strong>Privacy Notice:</strong> Student grades and name will be cryptographically hashed and committed. No sensitive data will be exposed on the public ledger.
      </div>
    </form>
  )
}
