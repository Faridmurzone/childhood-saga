// Mapeo de temas a sus imágenes de placeholder (storybook covers)
export const THEME_PLACEHOLDER_IMAGES: Record<string, string> = {
  'Cozy Bedtime': '/assets/cozy-bedtime-storybook.png',
  // Agregar más placeholders temáticos cuando estén disponibles
  // 'Fantasy': '/assets/fantasy-storybook.png',
  // 'Space Adventure': '/assets/space-adventure-storybook.png',
  // etc.
}

export function getThemePlaceholder(theme: string): string {
  return THEME_PLACEHOLDER_IMAGES[theme] || '/assets/default.png'
}
