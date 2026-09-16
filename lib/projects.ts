import { readFileSync } from "node:fs";
import { join } from "node:path";

/** 正文按项目 id 对应本地 Markdown，构建期读入，静态导出不访问文件系统运行时。 */
export function readProjectBody(slug: string) {
  switch (slug) {
    case "mediatlas":
      return readFileSync(join(process.cwd(), "content/projects/mediatlas.md"), "utf8");
    case "disease-graph":
      return readFileSync(join(process.cwd(), "content/projects/disease-graph.md"), "utf8");
    case "rag-lab":
      return readFileSync(join(process.cwd(), "content/projects/rag-lab.md"), "utf8");
    case "agent-studio":
      return readFileSync(join(process.cwd(), "content/projects/agent-studio.md"), "utf8");
    case "fastapi-mailcode":
      return readFileSync(join(process.cwd(), "content/projects/fastapi-mailcode.md"), "utf8");
    default:
      return "";
  }
}
