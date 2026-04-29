import Link from "next/link";
import styles from "./page.module.css";

const FEATURED = [
  {
    id: "1",
    name: "VOID CANDLE",
    desc: "Scented like petrichor and existential dread.",
    price: 389,
    weird: 92,
    tags: ["dark", "premium"],
  },
  {
    id: "2",
    name: "CHAOS DRONE KIT",
    desc: "Semi-legal. Very loud. No refunds.",
    price: 2890,
    weird: 98,
    tags: ["unhinged", "tech"],
  },
  {
    id: "3",
    name: "THE LAST BOOK",
    desc: "A novel about a novel about nothing.",
    price: 249,
    weird: 75,
    tags: ["art", "playful"],
  },
  {
    id: "4",
    name: "MYSTERY BOX Ⅰ",
    desc: "You have no idea what this is. Neither do we.",
    price: 499,
    weird: 100,
    tags: ["mystery"],
  },
];

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>SINTRA12</div>
        <nav className={styles.nav}>
          <Link href="/products">ALL</Link>
          <Link href="/products?vibe=mystery">MYSTERY</Link>
          <Link href="/products?vibe=dark">DARK</Link>
          <Link href="/checkout">CART</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          PRODUCTS FOR
          <br />
          THE UNHINGED.
        </h1>
        <p className={styles.heroSub}>
          No pop-ups. No "10% off for your email." No bullshit.
        </p>
        <Link href="/products" className={styles.heroCta}>
          ENTER THE STORE
        </Link>
      </section>

      <section className={styles.featured}>
        <div className={styles.featuredLabel}>// FEATURED //</div>
        <div className={styles.grid}>
          {FEATURED.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className={styles.card}>
              <div className={styles.cardWeird} style={{ opacity: p.weird / 100 }}>
                WEIRD {p.weird}
              </div>
              <div className={styles.cardName}>{p.name}</div>
              <div className={styles.cardDesc}>{p.desc}</div>
              <div className={styles.cardFooter}>
                <span className={styles.price}>kr {p.price},-</span>
                <span className={styles.tags}>{p.tags.join(" · ")}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <span>No tracking. No accounts required. No "sign up for 10% off".</span>
        <span style={{ color: "var(--pink)" }}>We ship weird.</span>
      </footer>
    </main>
  );
}
