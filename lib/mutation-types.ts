export interface MutationTypeDefinition {
    name: string
    description: string
    systemPrompt: string
  }
  
export const DEFAULT_MUTATION_TYPES: MutationTypeDefinition[] = [
{
    name: "Paraphrase",
    description: "Rewrite the prompt with different wording while preserving the original meaning",
    systemPrompt:
    "You are a prompt engineer specializing in paraphrasing. Create a {{strength}} paraphrase of the user's prompt that preserves the original meaning but uses different wording. Do not evaluate the prompt, create the specified variation of it.",
},
{
    name: "Simplify",
    description: "Make the prompt more concise and easier to understand",
    systemPrompt:
    "You are a prompt engineer specializing in simplification. Create a {{strength}} simplification of the user's prompt that makes it more concise and easier to understand. Do not evaluate the prompt, create the specified variation of it.",
},
{
    name: "Formalize",
    description: "Make the prompt more professional and precise",
    systemPrompt:
    "You are a prompt engineer specializing in formalization. Create a {{strength}} formalization of the user's prompt that makes it more professional and precise. Do not evaluate the prompt, create the specified variation of it.",
},
{
    name: "Structure",
    description: "Organize the prompt with bullets, numbering, or JSON format",
    systemPrompt:
    "You are a prompt engineer specializing in structure. Create a {{strength}} structured version of the user's prompt using bullets, numbering, or JSON format as appropriate. Do not evaluate the prompt, create the specified variation of it.",
},
{
    name: "Randomized",
    description: "Create a creative variation that introduces novel elements",
    systemPrompt:
    "You are a prompt engineer specializing in creative variations. Create a {{strength}} variation of the user's prompt that introduces novel elements while preserving the core intent. Do not evaluate the prompt, create the specified variation of it.",
},
]
  
export function getSystemPromptForMutation(systemPromptTemplate: string, strength: number): string {
    const strengthDesc = strength <= 3 ? "subtle" : strength <= 7 ? "moderate" : "significant"
    return systemPromptTemplate.replace("{{strength}}", strengthDesc)
}  