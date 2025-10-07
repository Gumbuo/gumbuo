import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      <p>Welcome to the Gumbuo dashboard. Choose your mission:</p>
      <ul>
        <li><a href="/presale">Presale</a></li>
        <li><a href="/staking">Staking</a></li>
        <li><a href="/leaderboard">Leaderboard</a></li>
        <li><a href="/wallet/0xABC123">Wallet Status</a></li>
        <li><a href="/teaser">Mascot Teaser</a></li>
      </ul>
    </Layout>
  );
}
<img src="/media/alien.mp4" alt="preload" style={{ display: "none" }} />
