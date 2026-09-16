import { site } from "@/config/site";

export function QuoteCard() {
  const quotes = site.characterTheme.quotes;
  const index = Number(site.now.updated.replace(/\D/g, "")) % quotes.length;
  return (
    <article className="widget-card quote-card">
      <span className="eyebrow">今日短句</span>
      <p>“{quotes[index]}”</p>
      <small>{site.characterTheme.chinese} · {site.characterTheme.name}</small>
    </article>
  );
}
