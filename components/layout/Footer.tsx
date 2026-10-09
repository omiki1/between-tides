import Link from "next/link";
import { site } from "@/config/site";
import { WaveMark } from "@/components/ui/Logo";
import { FooterVisits } from "./FooterVisits";
import { TideDivider } from "@/components/effects/TideDivider";
import { TimeProgress } from "./TimeProgress";
import { FooterPeek } from "./FooterPeek";
import { FooterArt } from "./FooterArt";

export function Footer() {
  return (
    <footer className="footer">
      <FooterArt />
      <TideDivider tone="footer" palette="tide" />
      <div className="footer container">
        <FooterPeek />
        <p className="footer-tide-line">{site.tagline}</p>
        <TimeProgress />
        <div className="footer-top">
          <Link href="/" className="footer-brand">
            <WaveMark />
            {site.name}
            <span>慢慢来也没关系。</span>
          </Link>
          <div>
            {site.github ? (
              <a href={site.github} target="_blank" rel="me noreferrer">
                GitHub
              </a>
            ) : null}
            {site.bilibili ? (
              <a href={site.bilibili} rel="me" target="_blank">
                哔哩哔哩
              </a>
            ) : null}
            <Link href="/anime/">追番 ↗</Link>
            <a href="/rss.xml">RSS ↗</a>
            <Link href="/about/">关于这个小站 ↗</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.nickname} · Made with curiosity.
          </span>
          <FooterVisits />
          <span>Next.js · React · A little resonance</span>
        </div>
        <p className="copyright">{site.copyright}</p>
      </div>
    </footer>
  );
}