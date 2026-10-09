import { site } from "@/config/site";
import { buildHas } from "./flags";
/* 站名的真实文字。粒子聚字只是叠在它上面的一层画布，结束后露出这行字。
 * 构建时未开启 wordmark 时不输出任何东西，不影响现有版面。 */
export function FxWordmark() {
  if (!buildHas("wordmark")) return null;
  return <p className="fx-wordmark" data-fx-wordmark=""><span className="fx-wordmark-text">{site.name}</span></p>;
}
