import { getSearchIndex } from "@/lib/search";
export const dynamic = "force-static";
export function GET(){
  return Response.json(getSearchIndex());
}
