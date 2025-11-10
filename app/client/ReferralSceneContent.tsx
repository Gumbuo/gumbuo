"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAlienPoints as useAlienPointsEconomy } from "../context/AlienPointsEconomy";

interface ReferralReward {
  id: string;
  amount: string;
  status: "pending" | "paid";
  createdAt: number;
  paidAt?: number;
  txHash?: string;
  note?: string;
}

export default function ReferralSceneContent() {
  const { address, isConnected } = useAccount();
  const { userBalances } = useAlienPointsEconomy();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get alien points for the current user
  const alienPoints = address && userBalances[address.toLowerCase()] !== undefined
    ? userBalances[address.toLowerCase()]
    : 0;

  useEffect(() => {
    if (address && isConnected) {
      loadStats();
      // Check eligibility when component mounts and alien points change
      if (alienPoints > 0) {
        checkEligibility();
      }
    }
  }, [address, isConnected, alienPoints]);

  const checkEligibility = async () => {
    if (!address || alienPoints === 0) return;

    try {
      await fetch("/api/referral/check-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, alienPoints }),
      });
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const loadStats = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/referral?wallet=${address}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${address}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected || !address) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#888',
        fontSize: '1.2rem'
      }}>
        <p style={{ marginBottom: '20px' }}>Connect your wallet to view your referral stats</p>
        <p style={{ fontSize: '3rem' }}>🔌</p>
      </div>
    );
  }

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : "https://gumbuo.io"}?ref=${address}`;

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      padding: '20px',
    }}>
      {/* Referral Link Section */}
      <div style={{
        marginBottom: '30px',
        background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.1), rgba(142, 68, 173, 0.1))',
        backdropFilter: 'blur(10px)',
        border: '2px solid #00ff99',
        borderRadius: '1rem',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0, 255, 153, 0.2)',
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '15px',
          color: '#00ff99',
          fontFamily: "'Orbitron', sans-serif",
        }}>
          Your Referral Link
        </h3>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '15px' }}>
          Share your link & earn ETH rewards:
        </p>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1,
              padding: '15px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid #333',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '1rem',
              fontFamily: 'monospace',
            }}
          />
          <button
            onClick={copyReferralLink}
            style={{
              padding: '15px 25px',
              background: copied ? '#00ff99' : 'linear-gradient(135deg, #00ff99, #00cc7a)',
              color: '#000',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Eligibility Notice */}
        <div style={{
          padding: '15px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '2px solid #ffd700',
          borderRadius: '0.75rem',
          marginTop: '15px',
        }}>
          <p style={{ color: '#ffd700', fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '5px' }}>
            ⚠️ Eligibility Requirement
          </p>
          <p style={{ color: '#ddd', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Each person you refer must earn <strong style={{ color: '#00ff99' }}>25,000 Alien Points</strong> to count as an eligible referral. This prevents bot activity and ensures genuine participation.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', fontSize: '1.2rem' }}>Loading stats...</p>
      ) : stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            <div style={{
              padding: '30px',
              background: 'rgba(0, 255, 153, 0.1)',
              borderRadius: '1rem',
              border: '2px solid #00ff99',
              textAlign: 'center',
            }}>
              <p style={{ color: '#888', fontSize: '1rem', marginBottom: '10px' }}>
                Total Referrals
              </p>
              <p style={{ color: '#00ff99', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {stats.totalReferrals}
              </p>
            </div>

            <div style={{
              padding: '30px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '1rem',
              border: '2px solid #ffd700',
              textAlign: 'center',
            }}>
              <p style={{ color: '#888', fontSize: '1rem', marginBottom: '10px' }}>
                Pending Rewards
              </p>
              <p style={{ color: '#ffd700', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {stats.pendingRewards} ETH
              </p>
            </div>

            <div style={{
              padding: '30px',
              background: 'rgba(29, 161, 242, 0.1)',
              borderRadius: '1rem',
              border: '2px solid #1da1f2',
              textAlign: 'center',
            }}>
              <p style={{ color: '#888', fontSize: '1rem', marginBottom: '10px' }}>
                Paid Rewards
              </p>
              <p style={{ color: '#1da1f2', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {stats.paidRewards} ETH
              </p>
            </div>
          </div>

          {/* Eligible Referrals */}
          {stats.eligibleReferrals && stats.eligibleReferrals.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.05), rgba(142, 68, 173, 0.05))',
              border: '2px solid rgba(0, 255, 153, 0.3)',
              borderRadius: '1rem',
              padding: '30px',
            }}>
              <h3 style={{
                color: '#00ff99',
                fontSize: '1.3rem',
                marginBottom: '15px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
              }}>
                ✅ Eligible Referrals ({stats.eligibleReferrals.length})
              </h3>
              <p style={{ color: '#ddd', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
                These users have reached 25,000 AP and count as valid referrals:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                {stats.eligibleReferrals.map((referral: any) => {
                  const walletShort = `${referral.referredWallet.slice(0, 6)}...${referral.referredWallet.slice(-4)}`;
                  const userAP = userBalances[referral.referredWallet.toLowerCase()] || 0;

                  return (
                    <div
                      key={referral.referredWallet}
                      style={{
                        padding: '20px',
                        background: 'rgba(0, 255, 153, 0.1)',
                        border: '2px solid #00ff99',
                        borderRadius: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                            {walletShort}
                          </p>
                          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>
                            Joined {new Date(referral.timestamp).toLocaleDateString()}
                          </p>
                          {referral.eligibleAt && (
                            <p style={{ color: '#00ff99', fontSize: '0.8rem', marginTop: '3px' }}>
                              ✓ Eligible since {new Date(referral.eligibleAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#00ff99', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {userAP.toLocaleString()}
                          </p>
                          <p style={{ color: '#888', fontSize: '0.85rem' }}>
                            Alien Points
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Referrals */}
          {stats.pendingReferrals && stats.pendingReferrals.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.05), rgba(255, 215, 0, 0.05))',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '1rem',
              padding: '30px',
            }}>
              <h3 style={{
                color: '#ffd700',
                fontSize: '1.3rem',
                marginBottom: '15px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
              }}>
                ⏳ Pending Referrals ({stats.pendingReferrals.length})
              </h3>
              <p style={{ color: '#ddd', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
                These users signed up via your link but haven't reached 25,000 AP yet:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                {stats.pendingReferrals.map((referral: any) => {
                  const walletShort = `${referral.referredWallet.slice(0, 6)}...${referral.referredWallet.slice(-4)}`;
                  const userAP = userBalances[referral.referredWallet.toLowerCase()] || 0;
                  const progress = Math.min((userAP / 25000) * 100, 100);

                  return (
                    <div
                      key={referral.referredWallet}
                      style={{
                        padding: '20px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        border: '2px solid #ffd700',
                        borderRadius: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                        <div>
                          <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                            {walletShort}
                          </p>
                          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>
                            Joined {new Date(referral.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#ffd700', fontSize: '1.3rem', fontWeight: 'bold' }}>
                            {userAP.toLocaleString()}
                          </p>
                          <p style={{ color: '#888', fontSize: '0.85rem' }}>
                            / 25,000 AP
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #ffd700, #ffed4e)',
                          borderRadius: '6px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '8px', textAlign: 'center' }}>
                        {progress.toFixed(1)}% Complete
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Rewards */}
          {stats.recentRewards && stats.recentRewards.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.05), rgba(142, 68, 173, 0.05))',
              border: '2px solid rgba(0, 255, 153, 0.3)',
              borderRadius: '1rem',
              padding: '30px',
            }}>
              <h3 style={{
                color: '#00ff99',
                fontSize: '1.3rem',
                marginBottom: '20px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
              }}>
                Recent Rewards
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
                {stats.recentRewards.map((reward: ReferralReward) => (
                  <div
                    key={reward.id}
                    style={{
                      padding: '20px',
                      background: reward.status === "paid" ? 'rgba(29, 161, 242, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                      border: `2px solid ${reward.status === "paid" ? '#1da1f2' : '#ffd700'}`,
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {reward.amount} ETH
                      </span>
                      <span
                        style={{
                          color: reward.status === "paid" ? '#1da1f2' : '#ffd700',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {reward.status === "paid" ? '✓ PAID' : '⏳ PENDING'}
                      </span>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>
                      {new Date(reward.createdAt).toLocaleDateString()}
                      {reward.note && ` - ${reward.note}`}
                    </div>
                    {reward.txHash && (
                      <div style={{ marginTop: '10px' }}>
                        <a
                          href={`https://basescan.org/tx/${reward.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#00ff99',
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                          }}
                        >
                          View Transaction →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>
            Rewards are manually distributed by the Gumbuo team
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.05), rgba(142, 68, 173, 0.05))',
          border: '2px solid rgba(0, 255, 153, 0.3)',
          borderRadius: '1rem',
        }}>
          <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '10px' }}>
            Share your link to start earning!
          </p>
          <p style={{ fontSize: '3rem' }}>🎁</p>
        </div>
      )}
    </div>
  );
}
