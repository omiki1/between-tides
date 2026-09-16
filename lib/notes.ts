import notesData from "@/content/notes/notes.json";
export type Note = { id:string; date:string; text:string; image?:string; tags:string[] };
export function getNotes(): Note[] {
  return (notesData as Note[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
}
export function getNoteTags(): string[] {
  return [...new Set(getNotes().flatMap(n=>n.tags))];
}
