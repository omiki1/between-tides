import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";

export function ProfileCard() {
  return (
    <article className="widget-card profile-card">
      <Link href="/about/" className="profile-avatar" aria-label={`关于 ${site.nickname}`}>
        <Image src={site.avatar} alt={`${site.nickname} 的头像`} width={640} height={640} />
      </Link>
      <h2>{site.nickname}</h2>
      <i className="profile-rule" aria-hidden="true" />
      <p>{site.role}</p>
      <p className="profile-bio">{site.description}</p>
      {site.socials.length > 0 ? (
        <div className="profile-links">
          {site.socials.map((item) => (
            <a key={item.url} href={item.url} rel="me" target="_blank">
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
