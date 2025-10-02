import Anthropic from '@anthropic-ai/sdk'

export interface MythGenerationResult {
  title: string
  story: string
  tags: string[]
}

export interface GenerateMythParams {
  seedText: string
  theme: string
  childAgeMonths: number
}

const SYSTEM_PROMPT = `You are a gentle myth-weaver for toddlers (ages 2–4).
Write in warm, simple Rioplatense Spanish, 150–300 words, with cozy wonder.
Avoid fear, violence, or harsh conflict. Keep imagery concrete and kind.`

// Mock fallback data when API key is not available
const MOCK_RESPONSES = [
  {
    title: 'La Aventura del Jardín Mágico',
    story:
      'Había una vez un pequeño héroe que descubrió un jardín lleno de flores que cantaban. Cada flor tenía una voz diferente: algunas sonaban como campanitas, otras como pajaritos felices. El pequeño héroe caminó entre las flores, escuchando sus canciones. Una rosa rosada le contó sobre el arcoíris que vive en las gotas de agua. Un girasol amarillo le mostró cómo seguir al sol durante el día. Y una violeta tímida le susurró secretos sobre las estrellas de la noche. El pequeño héroe se sentó en el pasto suave y verde, rodeado de sus nuevas amigas las flores. Juntos, crearon una sinfonía de colores y sonidos que llenó el jardín de alegría. Cuando llegó la hora de volver a casa, las flores le prometieron que siempre estarían allí, esperando para cantar con él otra vez.',
    tags: ['Jardín', 'Flores', 'Música', 'Alegría'],
  },
  {
    title: 'El Día que Llovió Estrellas',
    story:
      'Una tarde especial, comenzaron a caer estrellitas del cielo. No eran estrellas comunes: eran suaves como algodón y brillaban con una luz tibia. El pequeño héroe salió al patio y vio cómo las estrellitas bailaban en el aire antes de posarse suavemente en el suelo. Cada vez que tocaba una, hacía un sonido como de risita feliz. Algunas estrellitas se quedaron en su mano, haciéndole cosquillas. Otras se posaron en las plantas, haciendo que brillaran con luz de luna. El pequeño héroe juntó algunas en un frasco transparente para iluminar su habitación. Las estrellitas le contaron historias sobre viajes por el espacio, sobre planetas de diferentes colores y lunas que cantan. Cuando cayó la noche, las estrellitas volvieron al cielo, pero dejaron un poquito de su brillo en el corazón del pequeño héroe.',
    tags: ['Estrellas', 'Magia', 'Noche', 'Luz'],
  },
  {
    title: 'Los Amigos del Bosque Cantarín',
    story:
      'En el bosque cerca de casa, los árboles tenían una costumbre especial: cada mañana cantaban juntos. El pequeño héroe fue a visitarlos y descubrió que cada árbol tenía su propia canción. Los pinos altos cantaban notas profundas como el sonido del viento. Los sauces hacían melodías suaves como el agua de un arroyo. Y los arbustos pequeños agregaban ritmos alegres como tamborcitos. Un colibrí verde se posó en el hombro del pequeño héroe y le explicó que los árboles cantaban para saludar al día nuevo. Pronto, otros animales del bosque se unieron: ardillas con maracas de bellotas, conejos que zapatean el piso, y mariposas que revolotean al ritmo de la música. El pequeño héroe aprendió la canción del bosque y ahora, cada vez que la tararea, recuerda a sus amigos cantarines.',
    tags: ['Bosque', 'Árboles', 'Animales', 'Música'],
  },
]

let mockIndex = 0

export class TextProvider {
  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (apiKey) {
      this.client = new Anthropic({
        apiKey,
      })
    } else {
      console.warn(
        '⚠️  ANTHROPIC_API_KEY not found. Using mock text generation.'
      )
    }
  }

  async generateMyth(params: GenerateMythParams): Promise<MythGenerationResult> {
    const { seedText, theme, childAgeMonths } = params

    // Use mock data if no API key
    if (!this.client) {
      return this.getMockResponse(theme)
    }

    try {
      const userPrompt = `Seed: "${seedText}"
Theme: "${theme}"
AgeMonths: ${childAgeMonths}

Write JSON only:
{
  "title": "<short poetic title>",
  "story": "<single-paragraph story in Spanish>",
  "tags": ["<1-4 simple tags>"]
}`

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })

      // Extract text content from response
      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse the JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response')
      }

      const result = JSON.parse(jsonMatch[0]) as MythGenerationResult

      // Validate the response
      if (!result.title || !result.story || !Array.isArray(result.tags)) {
        throw new Error('Invalid response format from Claude')
      }

      return result
    } catch (error) {
      console.error('Error generating myth with Claude:', error)
      console.warn('Falling back to mock response')
      return this.getMockResponse(theme)
    }
  }

  private getMockResponse(theme: string): MythGenerationResult {
    // Cycle through mock responses
    const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]
    mockIndex++

    return {
      ...response,
      tags: [...response.tags, theme],
    }
  }
}

// Singleton instance
export const textProvider = new TextProvider()
