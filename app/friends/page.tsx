/* eslint-disable @next/next/no-img-element -- remote friend avatars */
import type { Metadata } from "next";
import { friends } from "@/data/friends";
import { SideRail } from "@/components/layout/SideRail";
import { Reveal } from "@/components/effects/Reveal";
import { CharacterArt } from "@/components/ui/CharacterArt";
import { withPageOg } from "@/lib/og";

export const metadata: Metadata = withPageOg({
  title: "友链",
  description: "本站的朋友与常去之处。",
  alternates: { canonical: "/friends/" },
});

export default function FriendsPage() {
  return (
    <main id="main" className="container inner">
      <Reveal className="page-head">
        <span className="page-eyebrow">
          <i />
          FRIENDS / 友链
        </span>
        <h1>友链</h1>
        <p>陆续收录喜欢的小站。欢迎互换链接。</p>
        <div className="page-stats">
          <span>
            <b>{friends.length}</b> 位朋友
          </span>
        </div>
        <CharacterArt name="aemeath-01" variant="head" className="char-art--mobile" sizes="(max-width: 700px) 128px, 300px"/>
      </Reveal>
      <Reveal as="section" className="home-section">
        <ul className="friends-grid friends-grid-page">
          {friends.map((f) => (
            <li key={f.id}>
              <a
                className="friend-card"
                href={f.url}
                target="_blank"
                rel="noopener noreferrer me"
              >
                <img
                  src={f.avatar}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <span className="friend-body">
                  <span className="friend-name">
                    {f.name}
                    {f.tag ? <small>{f.tag}</small> : null}
                  </span>
                  <span className="friend-desc">{f.description}</span>
                  <span className="friend-url">
                    {f.url.replace(/^https?:\/\//, "")}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
      <SideRail current="friends" />
    </main>
  );
}
