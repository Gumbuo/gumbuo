import WalletDashboard from "@/components/fighters/WalletDashboard";
import FighterShop from "@/components/fighters/FighterShop";
import Inventory from "@/components/fighters/Inventory";
import BattleArena from "@/components/fighters/BattleArena";
import AlienBalance from "@/components/AlienBalance";

import WalletHUD from "@/components/WalletHUD";
export default function GumbuoFightersPage() {
  return (
    <>
      <AlienBalance wallet={"0xYourWalletAddress"} />
      <main className="min-h-screen bg-black text-white p-8 space-y-10">
        <h1 className="text-5xl font-bold text-green-400 text-center">🛡️ Gumbuo Fighters</h1>
        <WalletDashboard />
        <FighterShop />
        <Inventory />
        <BattleArena />
      </main>
    </>
  );
}
