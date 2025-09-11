// /src/app/inbox/page.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { EXPERTS } from '@/data/experts';

/** ========= Types ========= */
type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';
type InboxItem = {
  id: string;
  requesterName: string;
  topic: string;
  note?: string;
  expertName: string;   // 受信者（専門家）
  createdAt: string;    // ISO
  expiresAt: string;    // ISO
  status: RequestStatus;
  unread: boolean;
};

/** ========= Channels / Keys ========= */
const BC_NAME = 'sc-inbox';                      // /session からの通知チャンネル
const LS_ITEMS = 'sc_inbox_items_v1';            // 受信箱の永続化
const LS_NEWBUF = 'sc_inbox_new';                // /session 側のバッファ（初回取込用）
const LS_UNREAD_COUNT = 'inbox-unread-count';    // ヘッダー用の未読数

/** ========= Mock ========= */
const NOW = Date.now();
const minutesFromNow = (m: number) => new Date(NOW + m * 60_000).toISOString();

const MOCK_INBOX: InboxItem[] = [
  {
    id: 'REQ-24001',
    requesterName: '田中 花子',
    topic: '決算直前の節税相談',
    note: '今期の役員報酬の設定についてもアドバイス希望です。',
    expertName: '山田 太郎（税理士）',
    createdAt: new Date(NOW - 5 * 60_000).toISOString(),
    expiresAt: minutesFromNow(3),
    status: 'pending',
    unread: true,
  },
  {
    id: 'REQ-24002',
    requesterName: '佐藤 次郎',
    topic: '相続の初回相談',
    note: '家族構成と大まかな資産状況を共有したいです。',
    expertName: '山田 太郎（税理士）',
    createdAt: new Date(NOW - 40 * 60_000).toISOString(),
    expiresAt: minutesFromNow(-10),
    status: 'expired',
    unread: false,
  },
  {
    id: 'REQ-24003',
    requesterName: '中村 美咲',
    topic: '就業規則の見直し',
    note: '副業規程の追記を検討しています。',
    expertName: '山田 太郎（税理士）',
    createdAt: new Date(NOW - 12 * 60_000).toISOString(),
    expiresAt: minutesFromNow(6),
    status: 'pending',
    unread: true,
  },
  {
    id: 'REQ-24004',
    requesterName: '高橋 健',
    topic: '確定申告の準備',
    note: '医療費控除とふるさと納税の整理を相談したいです。',
    expertName: '山田 太郎（税理士）',
    createdAt: new Date(NOW - 90 * 60_000).toISOString(),
    expiresAt: minutesFromNow(15),
    status: 'accepted',
    unread: false,
  },
];

/** ========= Helpers ========= */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('ja-JP', { hour12: false });

function useCountdown(expireIso: string) {
  const [remainMs, setRemainMs] = useState(
    Math.max(0, new Date(expireIso).getTime() - Date.now())
  );
  useEffect(() => {
    const id = setInterval(() => {
      setRemainMs(Math.max(0, new Date(expireIso).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [expireIso]);

  const mm = String(Math.floor(remainMs / 1000 / 60)).padStart(2, '0');
  const ss = String(Math.floor((remainMs / 1000) % 60)).padStart(2, '0');
  return { remainMs, label: `${mm}:${ss}` };
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const label: Record<RequestStatus, string> = {
    pending: '待機中',
    accepted: '受諾',
    declined: '辞退',
    expired: '期限切れ',
  };
  // 色は共通バッジ＋軽い差分だけ残す
  const tone: Record<RequestStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    declined: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    expired: 'bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200',
  };
  return (
    <span className={`badge ${tone[status]}`} aria-label={`ステータス: ${label[status]}`}>
      {label[status]}
    </span>
  );
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const { remainMs, label } = useCountdown(expiresAt);
  if (remainMs === 0)
    return <span className="text-xs font-medium text-subtle">期限切れ</span>;
  const warn = remainMs < 60_000;
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${warn ? 'text-danger' : 'text-foreground'}`}
      title={`締切: ${formatTime(expiresAt)}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}

/** ========= Page ========= */
export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'unread' | RequestStatus>('all');
  const [sortKey, setSortKey] = useState<'created' | 'expires'>('created');

  /** 初回：localStorage から復元（無ければモック）＋ NEW バッファ取り込み */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ITEMS);
      const parsed: InboxItem[] | null = raw ? JSON.parse(raw) : null;
      const base = Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_INBOX;

      const bufRaw = localStorage.getItem(LS_NEWBUF);
      if (bufRaw) {
        const buf: any[] = JSON.parse(bufRaw);
        const merged = [...buf, ...base].map(toInboxItem);
        setItems(dedupe(merged));
        localStorage.removeItem(LS_NEWBUF);
      } else {
        setItems(base);
      }
    } catch {
      setItems(MOCK_INBOX);
    }
  }, []);

  /** BroadcastChannel 受信（/session → /inbox 即時反映） */
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel(BC_NAME);
    const onMsg = (ev: MessageEvent) => {
      const msg = ev.data;
      if (!msg || msg.type !== 'add') return;
      setItems(prev => dedupe([toInboxItem(msg), ...prev]));
    };
    ch.addEventListener('message', onMsg);
    return () => ch.close();
  }, []);

  /** pending の期限切れを自動反映（5秒おき） */
  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev =>
        prev.map(x =>
          x.status === 'pending' && new Date(x.expiresAt).getTime() <= Date.now()
            ? { ...x, status: 'expired', unread: false }
            : x
        )
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /** 変更のたび永続化＆未読件数の保存＋イベント通知 */
  const unreadCount = useMemo(() => items.filter(x => x.unread).length, [items]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_ITEMS, JSON.stringify(items));
      localStorage.setItem(LS_UNREAD_COUNT, String(unreadCount));
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inbox:unread', { detail: unreadCount }));
    }
  }, [items, unreadCount]);

  /** フィルタ＆ソート */
  const filtered = useMemo(() => {
    const k = q.trim();
    let list = items.filter(x => {
      const hay = `${x.requesterName} ${x.topic} ${x.note ?? ''} ${x.id}`;
      return k ? hay.includes(k) : true;
    });
    if (tab === 'unread') list = list.filter(x => x.unread);
    else if (tab !== 'all') list = list.filter(x => x.status === tab);

    list.sort((a, b) => {
      if (sortKey === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });
    return list;
  }, [items, q, tab, sortKey]);

  /** アクション */
  const onAccept = (id: string) =>
    setItems(prev => prev.map(x => (x.id === id ? { ...x, status: 'accepted', unread: false } : x)));
  const onDecline = (id: string) =>
    setItems(prev => prev.map(x => (x.id === id ? { ...x, status: 'declined', unread: false } : x)));
  const onMarkRead = (id: string) =>
    setItems(prev => prev.map(x => (x.id === id ? { ...x, unread: false } : x)));

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b surface/80 backdrop-blur supports-[backdrop-filter]:surface">
        <div className="sc-container py-6">
          <h1 className="text-2xl font-bold tracking-tight">受信箱</h1>
          <p className="text-sm text-subtle">相談リクエストを確認・対応します。</p>
        </div>
      </section>

      <section className="sc-container py-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="検索（依頼者名 / トピック / メモ / リクエストID）"
              className="input rounded-xl"
              aria-label="受信箱の検索"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value as any)}
              className="select rounded-xl bg-white text-sm"
              title="フィルタ"
              aria-label="フィルタ"
            >
              <option value="all">すべて</option>
              <option value="unread">未読</option>
              <option value="pending">待機中</option>
              <option value="accepted">受諾</option>
              <option value="declined">辞退</option>
              <option value="expired">期限切れ</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="select rounded-xl bg-white text-sm"
              title="並び替え"
              aria-label="並び替え"
            >
              <option value="created">新着順</option>
              <option value="expires">期限が近い順</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <div className="card border-dashed p-8 text-center text-subtle">
              該当するリクエストはありません。
            </div>
          )}

          {filtered.map((item) => (
            <article
              key={item.id}
              className={`card p-4 md:p-5 transition-shadow hover:shadow ${
                item.unread ? 'ring-1 ring-[color:var(--sc-ring)]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.unread && (
                      <span className="badge">● 新着</span>
                    )}
                    <span className="text-xs text-subtle">ID: {item.id}</span>
                  </div>
                  <h2 className="mt-2 line-clamp-1 text-base font-semibold">
                    {item.topic}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    依頼者：{item.requesterName} ／ 受信者：{item.expertName}
                  </p>
                  {item.note && (
                    <p className="mt-2 line-clamp-2 text-sm">{item.note}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-subtle">
                    <span>受信: {formatTime(item.createdAt)}</span>
                    <span>締切: {formatTime(item.expiresAt)}</span>
                    <Countdown expiresAt={item.expiresAt} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button
                    onClick={() => onMarkRead(item.id)}
                    className="btn btn-outline text-xs"
                    aria-label="既読にする"
                  >
                    既読にする
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDecline(item.id)}
                      disabled={item.status === 'declined' || item.status === 'expired'}
                      className="btn btn-outline text-sm disabled:opacity-50"
                      title="辞退"
                      aria-label="辞退"
                    >
                      辞退
                    </button>
                    <button
                      onClick={() => onAccept(item.id)}
                      disabled={item.status === 'accepted' || item.status === 'expired'}
                      className="btn btn-primary text-sm disabled:opacity-50"
                      title="受諾"
                      aria-label="受諾"
                    >
                      受諾
                    </button>
                  </div>

                  <a
                    href={`/chat/${item.id}`}
                    className="text-xs underline underline-offset-4"
                    title="チャットへ移動（モック）"
                  >
                    チャットに入室
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

/** ========= Convert & Utils ========= */
function toInboxItem(payload: any): InboxItem {
  // /session の Invite 形 { id, expertId, clientName, topic, createdAt, ttlSec, unread, note }
  if (payload && payload.expertId) {
    const exp = EXPERTS.find(e => e.id === payload.expertId);
    const expertName = exp ? `${exp.name}（${exp.license ?? '資格なし'}）` : '不明な専門家';
    const createdMs = Number(payload.createdAt) || Date.now();
    const ttlSec = Math.max(30, Math.min(600, Number(payload.ttlSec) || 180));
    return {
      id: String(payload.id),
      requesterName: String(payload.clientName || '匿名ユーザー'),
      topic: String(payload.topic || '相談があります'),
      note: payload.note ? String(payload.note) : undefined,
      expertName,
      createdAt: new Date(createdMs).toISOString(),
      expiresAt: new Date(createdMs + ttlSec * 1000).toISOString(),
      status: 'pending',
      unread: true,
    };
  }
  // 既に InboxItem ならそのまま
  return payload as InboxItem;
}

function dedupe(arr: InboxItem[]): InboxItem[] {
  const seen = new Set<string>();
  const out: InboxItem[] = [];
  for (const x of arr) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
  }
  return out;
}