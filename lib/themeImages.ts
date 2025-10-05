// Mapeo de temas a sus imágenes de placeholder (storybook covers)
export const THEME_PLACEHOLDER_IMAGES: Record<string, string> = {
  'Fantasy': '/assets/fantasy-storybook.png',
  'Epic': '/assets/epic-storybook.png',
  'Space Adventure': '/assets/space-adventure-storybook.png',
  'Forest Friends': '/assets/forest-friends-storybook.png',
  'Ocean Wonders': '/assets/ocean-wonders-storybook.png',
  'Dinosaur Time': '/assets/dinosaur-time-storybook.png',
  'Kind Robots': '/assets/kind-robots-storybook.png',
  'Magic School': '/assets/magic-school-storybook.png',
  'Fairy Garden': '/assets/fairy-garden-storybook.png',
  'Friendly Monsters': '/assets/friendly-monsters-storybook.png',
  'Pirate Islands': '/assets/pirate-islands-storybook.png',
  'Snowy World': '/assets/snowy-world-storybook.png',
  'City Explorers': '/assets/city-explorers-storybook.png',
  'Cozy Bedtime': '/assets/cozy-bedtime-storybook.png',
}

export function getThemePlaceholder(theme: string): string {
  return THEME_PLACEHOLDER_IMAGES[theme] || '/assets/default.png'
}
