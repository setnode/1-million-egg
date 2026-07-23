'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import toast from 'react-hot-toast';
import { BOSS_RAID_ADDRESS, BOSS_RAID_ABI, RaidStatus } from '@/constants/bossRaidContract';

const HIT_OPTIONS = [1, 10, 20, 50, 100] as const;
type HitOption = typeof HIT_OPTIONS[number];

// Status badge helpers
const STATUS_LABEL: Record<number, string> = {
  0: 'None',
  1: 'Active',
  2: 'Completed',
  3: 'Cancelled',
  4: 'Expired',
};

const STATUS_COLOR: Record<number, string> = {
  0: '#6b7280',
  1: '#22c55e',
  2: '#f59e0b',
  3: '#ef4444',
  4: '#8b5cf6',
};

function useCountdown(deadline: number) {
  const [remaining, setRemaining] = useState(Math.max(0, deadline - Math.floor(Date.now() / 1000)));
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, deadline - Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { remaining, d, h, m, s };
}

function HealthBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const color = pct > 60 ? '#ef4444' : pct > 30 ? '#f97316' : '#eab308';
  const glow = pct > 60 ? 'rgba(239,68,68,0.5)' : pct > 30 ? 'rgba(249,115,22,0.5)' : 'rgba(234,179,8,0.5)';

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: '8px', fontSize: '0.85rem',
      }}>
        <span style={{ color: '#9ca3af', fontWeight: 600 }}>Boss HP</span>
        <span style={{ color, fontWeight: 800 }}>
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div style={{
        height: '20px', background: '#1a1d24', borderRadius: '10px',
        border: '1px solid #2e3340', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow: `0 0 16px ${glow}`,
          borderRadius: '10px',
          transition: 'width 0.6s ease, background 0.6s ease',
          position: 'relative',
        }}>
          {/* shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear',
          }} />
        </div>
        {/* HP % text */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 800, color: '#fff',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        }}>
          {pct.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export function BossRaidScreen() {
  const { address, isConnected } = useAccount();
  const [selectedHits, setSelectedHits] = useState<HitOption>(10);

  // ── Read active raid ────────────────────────────────────────────────────────
  const { data: reads, refetch } = useReadContracts({
    contracts: [
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'activeRaidId' },
    ],
    query: { refetchInterval: 10_000 },
  });

  const activeRaidId = reads?.[0]?.result ? Number(reads[0].result) : 0;

  const { data: raidReads, refetch: refetchRaid } = useReadContracts({
    contracts: activeRaidId > 0 ? [
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'getRaid', args: [BigInt(activeRaidId)] } as const,
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'getTopFive', args: [BigInt(activeRaidId)] } as const,
    ] : [],
    query: { enabled: activeRaidId > 0, refetchInterval: 15_000 },
  });

  const { data: myDamageRead } = useReadContracts({
    contracts: activeRaidId > 0 && address ? [
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'damageByUser', args: [BigInt(activeRaidId), address] } as const,
    ] : [],
    query: { enabled: activeRaidId > 0 && !!address, refetchInterval: 15_000 },
  });

  const raid = raidReads?.[0]?.result as any;
  const topFive = raidReads?.[1]?.result as { 0: readonly `0x${string}`[], 1: readonly bigint[] } | undefined;
  const myDamage = myDamageRead?.[0]?.result ? Number(myDamageRead[0].result) : 0;


  const health = raid ? Number(raid.health) : 0;
  const remainingHealth = raid ? Number(raid.remainingHealth) : 0;
  const tapFeeWei = raid ? BigInt(raid.tapFeeWei) : BigInt(0);
  const status = raid ? Number(raid.status) : 0;
  const deadline = raid ? Number(raid.raidDeadline) : 0;
  const prizePool = raid ? Number(raid.prizePool) : 0;

  const countdown = useCountdown(deadline);

  // ── Boss Tap Write ──────────────────────────────────────────────────────────
  const { data: tapHash, writeContract, isPending } = useWriteContract();
  const { isSuccess: tapConfirmed, isLoading: tapConfirming } = useWaitForTransactionReceipt({ hash: tapHash });

  useEffect(() => {
    if (tapConfirmed) {
      toast.success(`⚔️ ${selectedHits}x hit landed! Boss HP reduced.`);
      refetch();
      refetchRaid();
    }
  }, [tapConfirmed]);

  const handleBossTap = useCallback(() => {
    if (!isConnected) { toast.error('Connect your wallet first!'); return; }
    if (status !== RaidStatus.Active) { toast.error('No active raid!'); return; }
    if (selectedHits > remainingHealth) {
      toast.error(`Boss only has ${remainingHealth} HP left!`);
      return;
    }

    const totalCost = tapFeeWei * BigInt(selectedHits);
    toast(`Sending ${selectedHits}x hit...`, { icon: '⚔️' });

    writeContract({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'bossTap',
      args: [BigInt(activeRaidId), selectedHits],
      value: totalCost,
      gas: BigInt(300000),
    }, {
      onError: (err: any) => {
        const msg = err?.shortMessage || err?.message || '';
        if (!msg.includes('User rejected')) {
          toast.error(msg || 'Transaction failed');
        }
      }
    });
  }, [isConnected, status, selectedHits, remainingHealth, tapFeeWei, activeRaidId, writeContract]);

  // ── Claim Prize ─────────────────────────────────────────────────────────────
  const { writeContract: writeClaim, isPending: isClaiming } = useWriteContract();

  const handleClaimPrize = useCallback(() => {
    if (!isConnected) { toast.error('Connect your wallet first!'); return; }
    writeClaim({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'claimPrize',
      args: [BigInt(activeRaidId)],
      gas: BigInt(200000),
    }, {
      onSuccess: () => toast.success('🏆 Prize claimed!'),
      onError: (err: any) => {
        const msg = err?.shortMessage || err?.message || '';
        if (!msg.includes('User rejected')) toast.error(msg || 'Claim failed');
      }
    });
  }, [isConnected, activeRaidId, writeClaim]);

  // ── Refund ──────────────────────────────────────────────────────────────────
  const { writeContract: writeRefund, isPending: isRefunding } = useWriteContract();

  const handleClaimRefund = useCallback(() => {
    if (!isConnected) { toast.error('Connect your wallet first!'); return; }
    writeRefund({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'claimRefund',
      args: [BigInt(activeRaidId)],
      gas: BigInt(200000),
    }, {
      onSuccess: () => toast.success('↩️ Refund claimed!'),
      onError: (err: any) => {
        const msg = err?.shortMessage || err?.message || '';
        if (!msg.includes('User rejected')) toast.error(msg || 'Refund failed');
      }
    });
  }, [isConnected, activeRaidId, writeRefund]);

  // ── No Contract Configured ──────────────────────────────────────────────────
  if (BOSS_RAID_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '16px', padding: '60px 20px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem' }}>🔧</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
          Boss Raid Coming Soon
        </div>
        <div style={{ fontSize: '0.9rem', color: '#6b7280', maxWidth: '280px' }}>
          The BossRaidManager contract is being deployed. Check back soon!
        </div>
      </div>
    );
  }

  // ── No Active Raid ───────────────────────────────────────────────────────────
  if (!activeRaidId || status === RaidStatus.None) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '16px', padding: '60px 20px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem' }}>🐣</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
          No Boss Active
        </div>
        <div style={{ fontSize: '0.9rem', color: '#6b7280', maxWidth: '280px', lineHeight: 1.6 }}>
          The next Boss Raid hasn't started yet. Follow{' '}
          <a href="https://warpcast.com/~/channel/1millionegg" target="_blank" rel="noreferrer"
            style={{ color: '#a78bfa', textDecoration: 'none' }}>
            /1millionegg
          </a>{' '}
          on Farcaster for announcements!
        </div>
      </div>
    );
  }

  const isActive = status === RaidStatus.Active;
  const isCompleted = status === RaidStatus.Completed;
  const isRefundable = status === RaidStatus.Cancelled || status === RaidStatus.Expired;
  const hitCostEth = tapFeeWei > 0 ? parseFloat(formatEther(tapFeeWei * BigInt(selectedHits))) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '120px' }}>

      {/* ── Boss Header ───────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a0a0a 0%, #0f0a1a 100%)',
        border: '1px solid #3f1515', borderRadius: '20px', padding: '20px',
      }}>
        {/* ambient glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)', filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>
              Boss Raid #{activeRaidId}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
              🐉 Ancient Dragon
            </div>
          </div>
          <div style={{
            background: STATUS_COLOR[status] + '22',
            border: `1px solid ${STATUS_COLOR[status]}55`,
            color: STATUS_COLOR[status],
            padding: '4px 10px', borderRadius: '8px',
            fontSize: '0.75rem', fontWeight: 700,
          }}>
            {STATUS_LABEL[status]}
          </div>
        </div>

        {/* Health Bar */}
        <HealthBar current={remainingHealth} max={health} />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
          {[
            { label: 'Prize Pool', value: `${(prizePool / 1e6).toFixed(0)} USDC` },
            { label: 'Per Hit', value: `${tapFeeWei > 0 ? parseFloat(formatEther(tapFeeWei)).toFixed(6) : '—'} ETH` },
            { label: 'My Damage', value: myDamage.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
              padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Countdown ─────────────────────────────────────────────────── */}
      {isActive && deadline > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Raid Ends In
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {[
              { val: countdown.d, label: 'Days' },
              { val: countdown.h, label: 'Hours' },
              { val: countdown.m, label: 'Mins' },
              { val: countdown.s, label: 'Secs' },
            ].map(({ val, label }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  background: '#1a1d24', border: '1px solid #2e3340',
                  borderRadius: '10px', padding: '8px 12px',
                  fontSize: '1.4rem', fontWeight: 900, color: '#fff',
                  minWidth: '52px', textAlign: 'center',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {String(val).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: '4px', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Attack Panel ──────────────────────────────────────────────── */}
      {isActive && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(0,0,0,0) 100%)',
          border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '20px',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#ef4444', textTransform: 'uppercase', marginBottom: '14px' }}>
            ⚔️ Choose Attack
          </div>

          {/* Hit selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {HIT_OPTIONS.map(h => (
              <button
                key={h}
                onClick={() => setSelectedHits(h)}
                disabled={h > remainingHealth}
                style={{
                  flex: 1, padding: '10px 0',
                  background: selectedHits === h
                    ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)'
                    : '#1a1d24',
                  border: selectedHits === h ? '1px solid #ef4444' : '1px solid #2e3340',
                  borderRadius: '10px',
                  color: selectedHits === h ? '#fff' : h > remainingHealth ? '#4b5563' : '#9ca3af',
                  fontWeight: 800, fontSize: '0.85rem',
                  cursor: h > remainingHealth ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: selectedHits === h ? '0 4px 12px rgba(239,68,68,0.4)' : 'none',
                }}
              >
                {h}x
              </button>
            ))}
          </div>

          {/* Cost display */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '14px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Cost for {selectedHits}x hits</span>
            <span style={{ color: '#fff', fontWeight: 800 }}>{hitCostEth.toFixed(6)} ETH</span>
          </div>

          {/* Attack button */}
          <button
            onClick={handleBossTap}
            disabled={isPending || tapConfirming || !isConnected}
            style={{
              width: '100%', padding: '16px',
              background: (isPending || tapConfirming)
                ? '#374151'
                : 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
              border: 'none', borderRadius: '14px',
              color: '#fff', fontSize: '1rem', fontWeight: 900,
              cursor: (isPending || tapConfirming) ? 'wait' : 'pointer',
              letterSpacing: '0.05em',
              boxShadow: (isPending || tapConfirming) ? 'none' : '0 6px 20px rgba(239,68,68,0.4)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isPending ? '⏳ Waiting for wallet...' :
              tapConfirming ? '⏳ Confirming...' :
                `⚔️ ATTACK ${selectedHits}x`}
          </button>

          <p style={{
            fontSize: '0.7rem', color: '#6b7280', textAlign: 'center',
            marginTop: '10px', lineHeight: 1.5,
          }}>
            Boss Raid taps do not earn normal eggs — only Boss Damage points.
            {isRefundable ? '' : ' ETH is refundable if the raid expires or is cancelled.'}
          </p>
        </div>
      )}

      {/* ── Completed: Claim Prize ─────────────────────────────────────── */}
      {isCompleted && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(0,0,0,0) 100%)',
          border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>
            Boss Defeated!
          </div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '16px', lineHeight: 1.5 }}>
            If you're in the Top 5, claim your USDC prize before the deadline.
          </div>
          <button
            onClick={handleClaimPrize}
            disabled={isClaiming}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%)',
              border: 'none', borderRadius: '12px',
              color: '#000', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            {isClaiming ? '⏳ Claiming...' : '🏆 Claim Prize'}
          </button>
        </div>
      )}

      {/* ── Refundable: Claim Refund ───────────────────────────────────── */}
      {isRefundable && myDamage > 0 && (
        <div style={{
          background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: '16px', padding: '16px',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '12px' }}>
            This raid ended without defeating the boss. You can recover your ETH.
          </div>
          <button
            onClick={handleClaimRefund}
            disabled={isRefunding}
            style={{
              width: '100%', padding: '12px',
              background: '#8b5cf6', border: 'none', borderRadius: '10px',
              color: '#fff', fontWeight: 800, cursor: 'pointer',
            }}
          >
            {isRefunding ? '⏳ Refunding...' : '↩️ Claim ETH Refund'}
          </button>
        </div>
      )}

      {/* ── Top 5 Leaderboard ─────────────────────────────────────────── */}
      {topFive && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px', padding: '20px',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '14px' }}>
            🏅 Top Attackers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topFive[0].map((player, i) => {
              if (!player || player === '0x0000000000000000000000000000000000000000') return null;
              const dmg = Number(topFive[1][i]);
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
              const isMe = address?.toLowerCase() === player.toLowerCase();
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: '12px',
                  background: isMe ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isMe ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{medals[i]}</span>
                    <span style={{ fontSize: '0.85rem', color: isMe ? '#f59e0b' : '#9ca3af', fontWeight: isMe ? 700 : 400 }}>
                      {player.slice(0, 6)}...{player.slice(-4)} {isMe ? '(You)' : ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                    {dmg.toLocaleString()} dmg
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Info Box ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '16px', padding: '16px',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '8px' }}>ℹ️ How It Works</div>
        <ul style={{ margin: 0, paddingLeft: '16px', color: '#6b7280', fontSize: '0.8rem', lineHeight: '1.8' }}>
          <li>Tap the boss to deal damage and climb the leaderboard.</li>
          <li>Top 5 players split the USDC prize pool when the boss dies.</li>
          <li>If the boss survives 30 days, your ETH is fully refundable.</li>
          <li>Boss taps do <strong style={{ color: '#9ca3af' }}>not</strong> earn normal eggs.</li>
        </ul>
      </div>

    </div>
  );
}
