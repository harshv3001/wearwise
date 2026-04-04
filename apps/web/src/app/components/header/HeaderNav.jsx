import HeaderNavLink from "./HeaderNavLink";
import styles from "./Header.module.scss";

export default function HeaderNav({ onNavigate }) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <HeaderNavLink
        href="/dashboard"
        label="Dashboard"
        onNavigate={onNavigate}
      />
      <HeaderNavLink
        href="/closet"
        label="My closet"
        onNavigate={onNavigate}
        exact={true}
      />
      <HeaderNavLink
        href="/outfit-generator"
        label="Make an Outfit"
        onNavigate={onNavigate}
      />
      <HeaderNavLink href="/year" label="Your year" onNavigate={onNavigate} />
    </nav>
  );
}
