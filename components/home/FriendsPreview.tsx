/* eslint-disable @next/next/no-img-element -- remote friend avatars */
import { SectionTitle } from "@/components/ui/SectionTitle";
import { friends } from "@/data/friends";

export function FriendsPreview() {
  const linkLabel = "全部 " + String(friends.length) + " 位";
  return (
    <section className="home-section friends-section" aria-labelledby="friends-heading">
      <SectionTitle
        number="06"
        title="友链"
        english="FRIENDS"
        href="/friends/"
        link={linkLabel}
      />
      <ul className="friends-grid">
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
                width={56}
                height={56}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="friend-body">
                <span className="friend-name">
                  {f.name}
                  {f.tag ? <small>{f.tag}</small> : null}
                </span>
                <span className="friend-desc">{f.description}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
