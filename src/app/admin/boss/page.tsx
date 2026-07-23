'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits, formatEther } from 'viem';
import toast, { Toaster } from 'react-hot-toast';
import {
  BOSS_RAID_ADDRESS,
  BOSS_RAID_ABI,
  SEPOLIA_USDC_ADDRESS,
  ERC20_APPROVE_ABI,
  RaidStatus,
} from '@/constants/bossRaidContract';
import sdk from '@farcaster/frame-sdk';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { useConnect } from 'wagmi';

// ── Owner address — deploy sonrası güncelleyin ────────────────────────────────
const OWNER_ADDRESS = (process.env.NEXT_PUBLIC_OWNER_ADDRESS || '').toLowerCase();

const STATUS_LABEL: Record<number, string> = {
  0: 'None', 1: 'Active', 2: 'Completed', 3: 'Cancelled', 4: 'Expired',
};
const STATUS_COLOR: Record<number, string> = {
  0: '#6b7280', 1: '#22c55e', 2: '#f59e0b', 3: '#ef4444', 4: '#8b5cf6',
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '14px', flex: 1,
    }}>
      <div style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: '#1a1d24', border: '1px solid #2e3340', borderRadius: '10px',
          padding: '10px 14px', color: '#fff', fontSize: '0.9rem',
          outline: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export default function AdminBossPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const init = async () => {
      try {
        const ctx = await sdk.context;
        if (ctx?.client) connect({ connector: farcasterFrame() });
      } catch { }
    };
    init();
  }, [connect]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [health, setHealth] = useState('2000');
  const [tapFeeEth, setTapFeeEth] = useState('0.000001');
  const [prizes, setPrizes] = useState(['10000000', '5000000', '3000000', '1500000', '500000']); // 6 decimal USDC

  // ── Contract reads ────────────────────────────────────────────────────────
  const { data: reads, refetch } = useReadContracts({
    contracts: [
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'activeRaidId' },
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'owner' },
    ],
    query: { enabled: BOSS_RAID_ADDRESS !== '0x0000000000000000000000000000000000000000', refetchInterval: 15_000 },
  });

  const activeRaidId = reads?.[0]?.result ? Number(reads[0].result) : 0;
  const contractOwner = (reads?.[1]?.result as string || '').toLowerCase();

  const { data: raidRead, refetch: refetchRaid } = useReadContracts({
    contracts: activeRaidId > 0 ? [
      { address: BOSS_RAID_ADDRESS, abi: BOSS_RAID_ABI, functionName: 'getRaid', args: [BigInt(activeRaidId)] },
    ] : [],
    query: { enabled: activeRaidId > 0, refetchInterval: 10_000 },
  });

  const raid = raidRead?.[0]?.result as any;
  const status = raid ? Number(raid.status) : 0;
  const remainingHealth = raid ? Number(raid.remainingHealth) : 0;
  const totalPaidEth = raid ? formatEther(BigInt(raid.totalPaidEth)) : '0';
  const prizePool = raid ? Number(raid.prizePool) : 0;

  // ── USDC reads ────────────────────────────────────────────────────────────
  const totalPrize = prizes.reduce((a, p) => a + (parseInt(p) || 0), 0);
  const { data: usdcReads } = useReadContracts({
    contracts: address ? [
      { address: SEPOLIA_USDC_ADDRESS, abi: ERC20_APPROVE_ABI, functionName: 'balanceOf', args: [address] },
      {
        address: SEPOLIA_USDC_ADDRESS, abi: ERC20_APPROVE_ABI, functionName: 'allowance',
        args: [address, BOSS_RAID_ADDRESS],
      },
    ] : [],
    query: { enabled: !!address, refetchInterval: 10_000 },
  });

  const usdcBalance = usdcReads?.[0]?.result ? Number(usdcReads[0].result) : 0;
  const usdcAllowance = usdcReads?.[1]?.result ? Number(usdcReads[1].result) : 0;
  const needsApproval = usdcAllowance < totalPrize;

  // ── Writes ────────────────────────────────────────────────────────────────
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeStart, data: startHash, isPending: isStartPending } = useWriteContract();
  const { isSuccess: startConfirmed } = useWaitForTransactionReceipt({ hash: startHash });

  const { writeContract: writeCancel, isPending: isCancelPending } = useWriteContract();
  const { writeContract: writeWithdraw, isPending: isWithdrawPending } = useWriteContract();
  const { writeContract: writeSweep, isPending: isSweepPending } = useWriteContract();

  useEffect(() => {
    if (approveConfirmed) { toast.success('✅ USDC Approved!'); refetch(); }
  }, [approveConfirmed]);
  useEffect(() => {
    if (startConfirmed) { toast.success('🐉 Boss Raid Started!'); refetch(); refetchRaid(); }
  }, [startConfirmed]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!isMounted) return null;

  const isOwner = !!address && (
    address.toLowerCase() === contractOwner ||
    address.toLowerCase() === OWNER_ADDRESS ||
    OWNER_ADDRESS === '' // dev mode: allow any connected wallet if OWNER_ADDRESS not set
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleApprove() {
    writeApprove({
      address: SEPOLIA_USDC_ADDRESS,
      abi: ERC20_APPROVE_ABI,
      functionName: 'approve',
      args: [BOSS_RAID_ADDRESS, BigInt(totalPrize)],
      gas: BigInt(100000),
    }, {
      onError: (err: any) => { if (!err?.message?.includes('rejected')) toast.error(err?.shortMessage || 'Approve failed'); }
    });
  }

  function handleStartRaid() {
    if (!health || !tapFeeEth) { toast.error('Fill all fields!'); return; }
    const prizeAmounts = prizes.map(p => BigInt(parseInt(p) || 0)) as [bigint, bigint, bigint, bigint, bigint];
    if (prizeAmounts.some(p => p === BigInt(0))) { toast.error('All 5 prize amounts must be > 0'); return; }

    writeStart({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'startRaid',
      args: [BigInt(parseInt(health)), BigInt(parseUnits(tapFeeEth, 18)), prizeAmounts],
      gas: BigInt(500000),
    }, {
      onError: (err: any) => { if (!err?.message?.includes('rejected')) toast.error(err?.shortMessage || 'Start failed'); }
    });
  }

  function handleCancelRaid() {
    writeCancel({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'cancelRaid',
      args: [BigInt(activeRaidId)],
      gas: BigInt(100000),
    }, {
      onSuccess: () => { toast.success('Raid cancelled'); refetch(); refetchRaid(); },
      onError: (err: any) => { if (!err?.message?.includes('rejected')) toast.error(err?.shortMessage || 'Cancel failed'); }
    });
  }

  function handleWithdrawRevenue() {
    if (!address) return;
    writeWithdraw({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'withdrawCompletedRevenue',
      args: [BigInt(activeRaidId), address as `0x${string}`],
      gas: BigInt(150000),
    }, {
      onSuccess: () => toast.success('ETH withdrawn!'),
      onError: (err: any) => { if (!err?.message?.includes('rejected')) toast.error(err?.shortMessage || 'Withdraw failed'); }
    });
  }

  function handleSweepPrize() {
    writeSweep({
      address: BOSS_RAID_ADDRESS,
      abi: BOSS_RAID_ABI,
      functionName: 'sweepExpiredPrize',
      args: [BigInt(activeRaidId)],
      gas: BigInt(150000),
    }, {
      onSuccess: () => toast.success('Unclaimed prizes swept!'),
      onError: (err: any) => { if (!err?.message?.includes('rejected')) toast.error(err?.shortMessage || 'Sweep failed'); }
    });
  }

  return (
    <main style={{
      minHeight: '100vh', background: '#0a0a0c',
      padding: '24px 16px', maxWidth: '480px', margin: '0 auto',
    }}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>⚔️ Boss Admin</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>BossRaidManager Control Panel</div>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>

      {/* Contract not configured */}
      {BOSS_RAID_ADDRESS === '0x0000000000000000000000000000000000000000' && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '14px', padding: '16px', marginBottom: '20px',
        }}>
          <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '6px' }}>⚠️ Contract Not Configured</div>
          <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Set <code style={{ color: '#f59e0b' }}>NEXT_PUBLIC_BOSS_RAID_ADDRESS</code> in .env.local
            after deploying BossRaidManager to Base Sepolia.
          </div>
        </div>
      )}

      {/* Not owner warning */}
      {isConnected && !isOwner && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '14px', padding: '16px', marginBottom: '20px',
          color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center',
        }}>
          🔒 Connected wallet is not the contract owner.
        </div>
      )}

      {/* Active Raid Status */}
      {activeRaidId > 0 && raid && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '20px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: 800, color: '#fff' }}>Raid #{activeRaidId}</div>
            <div style={{
              background: STATUS_COLOR[status] + '22', border: `1px solid ${STATUS_COLOR[status]}55`,
              color: STATUS_COLOR[status], padding: '4px 10px', borderRadius: '8px',
              fontSize: '0.75rem', fontWeight: 700,
            }}>
              {STATUS_LABEL[status]}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <StatCard label="Remaining HP" value={remainingHealth.toLocaleString()} />
            <StatCard label="ETH Collected" value={`${parseFloat(totalPaidEth).toFixed(6)}`} sub="ETH" />
            <StatCard label="USDC Pool" value={`$${(prizePool / 1e6).toFixed(2)}`} />
          </div>

          {/* Action buttons by status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {status === RaidStatus.Active && (
              <button
                onClick={handleCancelRaid}
                disabled={isCancelPending}
                style={{
                  padding: '12px', background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px',
                  color: '#ef4444', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {isCancelPending ? '⏳ Cancelling...' : '🚫 Cancel Raid (Enables Refunds)'}
              </button>
            )}

            {status === RaidStatus.Completed && (
              <>
                <button
                  onClick={handleWithdrawRevenue}
                  disabled={isWithdrawPending || raid.revenueWithdrawn}
                  style={{
                    padding: '12px',
                    background: raid.revenueWithdrawn ? 'rgba(255,255,255,0.05)' : 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none', borderRadius: '10px',
                    color: raid.revenueWithdrawn ? '#6b7280' : '#fff', fontWeight: 700, cursor: raid.revenueWithdrawn ? 'not-allowed' : 'pointer',
                  }}
                >
                  {raid.revenueWithdrawn ? '✅ Revenue Already Withdrawn' :
                    isWithdrawPending ? '⏳ Withdrawing...' : `💰 Withdraw ${parseFloat(totalPaidEth).toFixed(6)} ETH Revenue`}
                </button>
                <button
                  onClick={handleSweepPrize}
                  disabled={isSweepPending}
                  style={{
                    padding: '12px', background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px',
                    color: '#f59e0b', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {isSweepPending ? '⏳ Sweeping...' : '🧹 Sweep Unclaimed Prizes (after 30 days)'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Start New Raid Form */}
      {(!activeRaidId || status !== RaidStatus.Active) && isOwner && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '20px',
        }}>
          <div style={{ fontWeight: 800, color: '#fff', marginBottom: '20px', fontSize: '1rem' }}>
            🐉 Start New Boss Raid
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <InputField
              label="Boss HP (e.g. 2000)"
              value={health}
              onChange={setHealth}
              placeholder="2000"
              type="number"
            />
            <InputField
              label="Tap Fee per Hit (ETH, e.g. 0.000001)"
              value={tapFeeEth}
              onChange={setTapFeeEth}
              placeholder="0.000001"
              type="number"
            />

            {/* Prize amounts */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '8px', letterSpacing: '0.05em' }}>
                PRIZE AMOUNTS (USDC, 6 decimals — e.g. 10000000 = $10)
              </div>
              {prizes.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '28px' }}>
                    {['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}
                  </span>
                  <input
                    type="number"
                    value={p}
                    onChange={e => {
                      const next = [...prizes];
                      next[i] = e.target.value;
                      setPrizes(next);
                    }}
                    style={{
                      flex: 1, background: '#1a1d24', border: '1px solid #2e3340',
                      borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af', minWidth: '48px' }}>
                    ${(parseInt(p) / 1e6).toFixed(2)}
                  </span>
                </div>
              ))}
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px', fontWeight: 700 }}>
                Total: ${(totalPrize / 1e6).toFixed(2)} USDC
              </div>
            </div>

            {/* USDC Status */}
            <div style={{
              background: '#1a1d24', border: '1px solid #2e3340', borderRadius: '12px',
              padding: '12px', fontSize: '0.8rem', color: '#9ca3af',
            }}>
              <div>Wallet USDC: <span style={{ color: '#fff' }}>${(usdcBalance / 1e6).toFixed(2)}</span></div>
              <div>Approved: <span style={{ color: usdcAllowance >= totalPrize ? '#22c55e' : '#ef4444' }}>
                ${(usdcAllowance / 1e6).toFixed(2)} {usdcAllowance >= totalPrize ? '✅' : '❌'}
              </span></div>
            </div>

            {/* Step 1: Approve */}
            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isApprovePending}
                style={{
                  padding: '14px',
                  background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              >
                {isApprovePending ? '⏳ Approving USDC...' : `Step 1: Approve $${(totalPrize / 1e6).toFixed(2)} USDC`}
              </button>
            ) : (
              <button
                onClick={handleStartRaid}
                disabled={isStartPending}
                style={{
                  padding: '14px',
                  background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                }}
              >
                {isStartPending ? '⏳ Starting Raid...' : '🐉 Step 2: Start Boss Raid'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Contract info */}
      <div style={{ marginTop: '20px', fontSize: '0.7rem', color: '#374151', textAlign: 'center', lineHeight: 1.8 }}>
        <div>Contract: {BOSS_RAID_ADDRESS.slice(0, 10)}...{BOSS_RAID_ADDRESS.slice(-8)}</div>
        <div>USDC: {SEPOLIA_USDC_ADDRESS.slice(0, 10)}...{SEPOLIA_USDC_ADDRESS.slice(-8)}</div>
        <div>Network: Base Sepolia (Testnet)</div>
      </div>
    </main>
  );
}
