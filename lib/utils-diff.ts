import { diffWords } from "diff"

export interface DiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

export function generateDiff(originalText: string, mutatedText: string): DiffPart[] {
  const safeOriginal = originalText || '';
  const safeMutated = mutatedText || '';
  return diffWords(safeOriginal, safeMutated)
}

export function getMutationTypeColor(type: string): string {
  if (!type) {
    return "bg-gray-500/10 text-gray-500 border-gray-200/20";
  }

  if (type === 'default') {
    return "bg-gray-500/10 text-gray-500 border-gray-200/20";
  }

  try {
    if (typeof type !== 'string') {
      return "bg-gray-500/10 text-gray-500 border-gray-200/20";
    }

    const hash = type.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    const colorPalettes = [
      { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-200/20" },
      { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-200/20" },
      { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-200/20" },
      { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-200/20" },
      { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-200/20" },
      { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-200/20" },
      { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-200/20" },
      { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-200/20" },
      { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-200/20" },
      { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-200/20" },
    ]

    const index = Math.abs(hash) % colorPalettes.length
    return `${colorPalettes[index].bg} ${colorPalettes[index].text} ${colorPalettes[index].border}`
  } catch (error) {
    return "bg-gray-500/10 text-gray-500 border-gray-200/20";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "bg-green-500/10 text-green-500 border-green-200/20"
  if (score >= 6) return "bg-amber-500/10 text-amber-500 border-amber-200/20"
  return "bg-rose-500/10 text-rose-500 border-rose-200/20"
}