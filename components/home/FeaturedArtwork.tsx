import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredArtwork } from "@/data/gallery";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function FeaturedArtwork() {
  const photo = featuredArtwork;
  return (
    <section className="home-section featured-work">
      <SectionTitle number="00" title="精选" english="FEATURED" href="/gallery/character/" link="角色相册"/>
      <Link href={`/gallery/character/#${photo.id}`} className="featured-work-layout">
        <span className="featured-work-frame">
          <Image src={photo.src} alt={photo.title} width={photo.width} height={photo.height} sizes="(max-width:700px) 70vw, 280px"/>
        </span>
        <span className="featured-work-meta">
          <small>OFFICIAL ART · KURO GAMES</small>
          <h2>{photo.title}</h2>
          <p>鸣潮 2 · 潮声庆典。Kuro Games 公开宣传图，版权归原作者所有，本站仅作个人非商业展示。</p>
          <span className="text-link">打开这张图<ArrowUpRight size={15}/></span>
        </span>
      </Link>
    </section>
  );
}
