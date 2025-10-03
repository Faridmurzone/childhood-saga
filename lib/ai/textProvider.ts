export interface MythGenerationResult {
  title: string
  story: string
  tags: string[]
}

export interface GenerateMythParams {
  seedText: string
  theme: string
  childAgeMonths: number
  childName: string
}

export class TextProvider {
  async generateMyth(params: GenerateMythParams): Promise<MythGenerationResult> {
    const { seedText, theme, childAgeMonths, childName } = params

    try {
      const response = await fetch('/api/generate-myth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seedText, theme, childAgeMonths, childName }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Validate the response
      if (!result.title || !result.story || !Array.isArray(result.tags)) {
        throw new Error('Invalid response format')
      }

      return result as MythGenerationResult
    } catch (error) {
      console.error('Error generating myth:', error)
      throw error
    }
  }
}

// Singleton instance
export const textProvider = new TextProvider()
