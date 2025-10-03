export interface GenerateImageParams {
  prompt: string
  theme: string
  userId: string
}

export interface ImageGenerationResult {
  imageUrl: string
  providerMeta?: any
}

export class ImageProvider {
  async generateImage(
    params: GenerateImageParams
  ): Promise<ImageGenerationResult> {
    const { prompt, theme, userId } = params

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, theme, userId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.imageUrl) {
        throw new Error('Invalid response format')
      }

      return result as ImageGenerationResult
    } catch (error) {
      console.error('Error generating image:', error)
      throw error
    }
  }
}

// Singleton instance
export const imageProvider = new ImageProvider()
