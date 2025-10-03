// Mapeo de temas a sus backgrounds correspondientes
export const THEME_BACKGROUNDS: Record<string, string> = {
  'Fantasy': '/assets/fantasy.png',
  'Epic': '/assets/epic.png',
  'Space Adventure': '/assets/space-adventure.png',
  'Forest Friends': '/assets/forest-friends.png',
  'Ocean Wonders': '/assets/ocean-wonders.png',
  'Dinosaur Time': '/assets/dinosaur-time.png',
  'Kind Robots': '/assets/kind-robots.png',
  'Magic School': '/assets/magic-school.png',
  'Fairy Garden': '/assets/fairy-garden.png',
  'Friendly Monsters': '/assets/friendly-monsters.png',
  'Pirate Islands': '/assets/pirate-islands.png',
  'Snowy World': '/assets/snowy-world.png',
  'City Explorers': '/assets/city-explorers.png',
  'Cozy Bedtime': '/assets/cozy-bedtime.png',
}

export function getThemeBackground(theme: string): string {
  return THEME_BACKGROUNDS[theme] || '/assets/default.png'
}
