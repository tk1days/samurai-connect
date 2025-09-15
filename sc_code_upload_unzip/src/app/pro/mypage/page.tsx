// /src/app/pro/mypage/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXPERTS } from "@/data/experts";

/* ========================== Types & Consts ========================== */
type RequestStatus = "pending" | "accepted" | "declined" | "expired";
type InboxItem = {
  id: string;
  requesterName: string;
  topic: string;
  note?: string;
  expertName: string;
  createdAt: string;       // ISO
  expiresAt: string;       // ISO
  status: RequestStatus;
  unread: boolean;
  acceptedAt?: string;     // 受諾時刻（本ページで付与）
};

type TxStatus = "paid" | "pending" | "refunded";
type Tx = {
  id: string;
  when: string;      // ISO
  client: string;
  summary: string;
  amountYen: number;
  feeYen: number;
  status: TxStatus;
};

type Reservation = {
  id: string;
  client: string;
  topic: string;
  createdAt: string;                 // ISO（受信時刻）
  when?: string;                     // ISO（予定日時：あれば使用）
  status: "pending" | "confirmed" | "cancelled";
};

const NOW = Date.now();
const minutesFromNow = (m: number) => new Date(NOW + m * 60_000).toISOString();

/** LS Keys */
const LS_ITEMS = "sc_inbox_items_v1";
const LS_NEWBUF = "sc_inbox_new";
const BC_NAME = "sc-inbox";
const LS_UNREAD_COUNT = "inbox-unread-count";
const LS_ONLINE = "sc_pro_online_v1";
const LS_ONLINE_LOG = "sc_pro_online_log_v1";     // [{t:number,on:boolean}]
const LS_HISTORY = "pro_billing_history_v1";      // Tx[]
const LS_RESERV = "pro_reservations_v1";          // Reservation[]

/* ========================== Helpers ========================== */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", { hour12: false });

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

function toInboxItem(payload: any): InboxItem {
  // /session の Invite 形 { id, expertId, clientName, topic, createdAt, ttlSec, unread, note }
  if (payload && payload.expertId) {
    const exp = EXPERTS.find((e) => e.id === payload.expertId);
    const expertName = exp ? `${exp.name}（${exp.license ?? "資格なし"}）` : "不明な専門家";
    const createdMs = Number(payload.createdAt) || Date.now();
    const ttlSec = Math.max(30, Math.min(600, Number(payload.ttlSec) || 180));
    return {
      id: String(payload.id),
      requesterName: String(payload.clientName || "匿名ユーザー"),
      topic: String(payload.topic || "相談があります"),
      note: payload.note ? String(payload.note) : undefined,
      expertName,
      createdAt: new Date(createdMs).toISOString(),
      expiresAt: new Date(createdMs + ttlSec * 1000).toISOString(),
      status: "pending",
      unread: true,
    };
  }
  return payload as InboxItem;
}

/** 残りカウントダウン */
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
  const mm = String(Math.floor(remainMs / 1000 / 60)).padStart(2, "0");
  const ss = String(Math.floor((remainMs / 1000) % 60)).padStart(2, "0");
  return { remainMs, label: `${mm}:${ss}` };
}
function Countdown({ expiresAt }: { expiresAt: string }) {
  const { remainMs, label } = useCountdown(expiresAt);
  if (remainMs === 0) return <span className="text-xs font-medium text-subtle">期限切れ</span>;
  const warn = remainMs < 60_000;
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${warn ? "text-danger" : "text-foreground"}`}
      aria-live="polite"
      title={`締切: ${formatTime(expiresAt)}`}
    >
      {label}
    </span>
  );
}

/** ステータスバッジ */
function StatusBadge({ status }: { status: RequestStatus }) {
  const label: Record<RequestStatus, string> = {
    pending: "待機中",
    accepted: "受諾",
    declined: "辞退",
    expired: "期限切れ",
  };
  const tone: Record<RequestStatus, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    declined: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    expired: "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200",
  };
  return <span className={`badge ${tone[status]}`}>{label[status]}</span>;
}

/* ========================== MOCK Seeds (必要時のみ) ========================== */
const MOCK_INBOX: InboxItem[] = [
  {
    id: "REQ-24001",
    requesterName: "田中 花子",
    topic: "決算直前の節税相談",
    note: "役員報酬の設定についてもアドバイス希望です。",
    expertName: "山田 太郎（税理士）",
    createdAt: new Date(NOW - 5 * 60_000).toISOString(),
    expiresAt: minutesFromNow(3),
    status: "pending",
    unread: true,
  },
  {
    id: "REQ-24002",
    requesterName: "佐藤 次郎",
    topic: "相続の初回相談",
    note: "大まかな資産状況を共有したいです。",
    expertName: "山田 太郎（税理士）",
    createdAt: new Date(NOW - 40 * 60_000).toISOString(),
    expiresAt: minutesFromNow(-10),
    status: "expired",
    unread: false,
  },
];

/* ========================== Page ========================== */
export default function ProMyPage() {
  /* -------- オンライン切替（永続＋ログ） -------- */
  const [online, setOnline] = useState(false);
  useEffect(() => {
    try {
      setOnline(localStorage.getItem(LS_ONLINE) === "1");
      // ログ初期化
      const raw = localStorage.getItem(LS_ONLINE_LOG);
      if (!raw) {
        const init = [{ t: Date.now(), on: localStorage.getItem(LS_ONLINE) === "1" }];
        localStorage.setItem(LS_ONLINE_LOG, JSON.stringify(init));
      }
    } catch {}
  }, []);
  const toggleOnline = () => {
    setOnline((v) => {
      const next = !v;
      try {
        localStorage.setItem(LS_ONLINE, next ? "1" : "0");
        const raw = localStorage.getItem(LS_ONLINE_LOG);
        const log: { t: number; on: boolean }[] = raw ? JSON.parse(raw) : [];
        log.push({ t: Date.now(), on: next });
        localStorage.setItem(LS_ONLINE_LOG, JSON.stringify(log));
      } catch {}
      return next;
    });
  };

  /* -------- 受信箱（ページ内蔵） -------- */
  const [items, setItems] = useState<InboxItem[]>([]);
  const [q, setQ] = useState("");

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

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(BC_NAME);
    const onMsg = (ev: MessageEvent) => {
      const msg = ev.data;
      if (!msg || msg.type !== "add") return;
      setItems((prev) => dedupe([toInboxItem(msg), ...prev]));
    };
    ch.addEventListener("message", onMsg);
    return () => ch.close();
  }, []);

  // 期限切れ自動反映
  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) =>
        prev.map((x) =>
          x.status === "pending" && new Date(x.expiresAt).getTime() <= Date.now()
            ? { ...x, status: "expired", unread: false }
            : x
        )
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // 永続＋未読数イベント
  const unreadCount = useMemo(() => items.filter((x) => x.unread).length, [items]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_ITEMS, JSON.stringify(items));
      localStorage.setItem(LS_UNREAD_COUNT, String(unreadCount));
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("inbox:unread", { detail: unreadCount }));
    }
  }, [items, unreadCount]);

  // 絞り込み
  const filtered = useMemo(() => {
    const k = q.trim();
    let list = items.filter((x) => {
      const hay = `${x.requesterName} ${x.topic} ${x.note ?? ""} ${x.id}`;
      return k ? hay.includes(k) : true;
    });
    list.sort((a, b) => {
      const unreadDiff = Number(b.unread) - Number(a.unread);
      if (unreadDiff !== 0) return unreadDiff;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });
    return list;
  }, [items, q]);

  /* -------- 受信箱アクション（acceptedAt付与） -------- */
  const onMarkRead = (id: string) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  const onDecline = (id: string) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "declined", unread: false } : x))
    );
  const onAccept = (id: string) =>
    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "accepted", unread: false, acceptedAt: new Date().toISOString() } : x
      )
    );

  /* -------- 売上（Billingのモックデータを利用） -------- */
  const txHistory: Tx[] = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {}
    // ない場合は軽いモック
    return [
      { id: "TX-240031", when: new Date(NOW - 2 * 86400_000).toISOString(), client: "株式会社アルファ", summary: "ライブ相談（30分）", amountYen: 5000, feeYen: 500, status: "paid" },
      { id: "TX-240028", when: new Date(NOW - 5 * 86400_000).toISOString(), client: "個人ユーザーB", summary: "ライブ相談（20分）", amountYen: 3000, feeYen: 300, status: "paid" },
      { id: "TX-240027", when: new Date(NOW - 6 * 86400_000).toISOString(), client: "個人ユーザーC", summary: "相談予約（キャンセル）", amountYen: 3000, feeYen: 0, status: "refunded" },
    ];
  }, []);

  const revenue = useMemo(() => {
    const paid = txHistory.filter((t) => t.status === "paid");
    const byDay = new Map<string, { gross: number; fee: number }>();
    for (const t of paid) {
      const d = new Date(t.when);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const cur = byDay.get(key) ?? { gross: 0, fee: 0 };
      cur.gross += t.amountYen;
      cur.fee += t.feeYen;
      byDay.set(key, cur);
    }
    const gross = paid.reduce((s, x) => s + x.amountYen, 0);
    const fee = paid.reduce((s, x) => s + x.feeYen, 0);
    const net = Math.max(0, gross - fee);
    // グラフ用（直近14日）
    const last14: { day: string; net: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const v = byDay.get(key);
      last14.push({
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        net: Math.max(0, (v?.gross ?? 0) - (v?.fee ?? 0)),
      });
    }
    return { gross, fee, net, last14 };
  }, [txHistory]);

  /* -------- オンライン稼働時間（ログから算出） -------- */
  function calcUptime(days: number) {
    try {
      const raw = localStorage.getItem(LS_ONLINE_LOG);
      const log: { t: number; on: boolean }[] = raw ? JSON.parse(raw) : [];
      const since = Date.now() - days * 86400_000;
      const seg = log.filter((e) => e.t >= since);
      const lastBefore = [...log].reverse().find((e) => e.t < since);
      if (lastBefore) seg.unshift({ t: since, on: lastBefore.on });
      if (seg.length === 0) return 0;
      let sum = 0;
      for (let i = 0; i < seg.length; i++) {
        const cur = seg[i];
        if (i === seg.length - 1) {
          // open interval until now
          if (cur.on) sum += Date.now() - cur.t;
        } else {
          const nextT = seg[i + 1].t;
          if (cur.on) sum += nextT - cur.t;
        }
      }
      return Math.max(0, Math.round(sum / 1000)); // sec
    } catch {
      return 0;
    }
  }
  const uptime7s = calcUptime(7);
  const uptime30s = calcUptime(30);

  /* -------- 予約（未処理と確定をまとめて管理） -------- */
  const [reservTab, setReservTab] = useState<"pending" | "confirmed">("pending");
  const reservations: Reservation[] = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS_RESERV);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { id: "RS-1001", client: "小林様", topic: "就業規則の見直し", createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(), status: "pending" },
      { id: "RS-1002", client: "山本様", topic: "契約レビュー",         createdAt: new Date(Date.now() - 3  * 3600_000).toISOString(), status: "pending" },
      { id: "RS-1003", client: "A社",   topic: "相続相談",               createdAt: new Date(Date.now() - 2  * 86400_000).toISOString(), status: "confirmed", when: minutesFromNow(120) },
    ];
  }, []);
  const pendingList = reservations.filter(r => r.status === "pending");
  const confirmedList = useMemo(
    () =>
      reservations
        .filter(r => r.status === "confirmed")
        .sort((a, b) => new Date(a.when ?? a.createdAt).getTime() - new Date(b.when ?? b.createdAt).getTime()),
    [reservations]
  );
  const staleReservations = useMemo(
    () => pendingList.filter((r) => Date.now() - new Date(r.createdAt).getTime() > 24 * 3600_000),
    [pendingList]
  );

  /* -------- 指標（7日/30日） -------- */
  function windowStats(days: number) {
    const since = Date.now() - days * 86400_000;
    const inWin = items.filter((x) => new Date(x.createdAt).getTime() >= since);
    const total = inWin.length;
    const accepted = inWin.filter((x) => x.status === "accepted").length;
    const acceptRate = total === 0 ? 0 : accepted / total;

    // 平均応答時間（acceptedAtがあるもの）
    const durList = inWin
      .filter((x) => x.status === "accepted" && x.acceptedAt)
      .map((x) => new Date(x.acceptedAt!).getTime() - new Date(x.createdAt).getTime())
      .filter((ms) => ms >= 0);
    const avgMs = durList.length ? Math.round(durList.reduce((s, x) => s + x, 0) / durList.length) : 0;

    return { total, accepted, acceptRate, avgMs };
  }
  const w7 = windowStats(7);
  const w30 = windowStats(30);

  /* ========================== Render ========================== */
  return (
    <main className="sc-container py-6 space-y-8">
      {/* ヘッダー行：タイトル + オンライン切替 */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">プロ用マイページ</h1>
        </div>

        <label className="inline-flex select-none items-center gap-3">
          <span className="text-sm font-medium">
            {online ? "オンライン（受付中）" : "オフライン（対応不可）"}
          </span>
          <button
            type="button"
            onClick={toggleOnline}
            aria-pressed={online}
            className={`relative h-7 w-12 rounded-full transition ${online ? "bg-emerald-500" : "bg-zinc-300"}`}
            title="オンライン切替"
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${online ? "left-6" : "left-0.5"}`}
            />
          </button>
        </label>
      </header>

      {/* ===== 1. 新規相談対応（強調表示） ===== */}
      <section
        id="inbox"
        className="card p-5 ring-1 ring-[color:var(--sc-ring)] border-2 border-indigo-200/60 bg-[color:var(--sc-brand-50)]/20"
      >
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">新規相談対応</h2>
            <span className="badge-success">要即対応</span>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="検索（依頼者名 / トピック / メモ / リクエストID）"
            className="input rounded-xl w-72"
            aria-label="相談の検索"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <div className="card-soft border-dashed p-8 text-center text-subtle">
              いま対応すべき新規相談はありません。
            </div>
          )}

          {filtered.map((item) => (
            <article
              key={item.id}
              className={`card p-4 md:p-5 transition-shadow hover:shadow ${
                item.unread ? "ring-1 ring-[color:var(--sc-ring)]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    {item.unread && <span className="badge">● 新着</span>}
                    <span className="text-xs text-subtle">ID: {item.id}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-1 text-base font-semibold">{item.topic}</h3>
                  <p className="mt-1 text-sm text-muted">
                    依頼者：{item.requesterName} ／ 受信者：{item.expertName}
                  </p>
                  {item.note && <p className="mt-2 line-clamp-2 text-sm">{item.note}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-subtle">
                    <span>受信: {formatTime(item.createdAt)}</span>
                    <span>締切: {formatTime(item.expiresAt)}</span>
                    <Countdown expiresAt={item.expiresAt} />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <button onClick={() => onMarkRead(item.id)} className="btn btn-outline text-xs">
                    既読にする
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDecline(item.id)}
                      disabled={item.status === "declined" || item.status === "expired"}
                      className="btn btn-outline text-sm disabled:opacity-50"
                      title="辞退"
                    >
                      辞退
                    </button>
                    <a
                      href={`/chat/${item.id}`}
                      onClick={() => onAccept(item.id)}
                      className="btn btn-primary text-sm"
                      title="チャットに入室して対応開始"
                    >
                      受諾して入室
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== 2. 予約（未処理 & 確定）まとめ ===== */}
      <section
        id="reservations"
        className="card p-5 ring-1 ring-[color:var(--sc-ring)] border-2 border-amber-200/60 bg-amber-50/40"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">予約管理</h2>
            {pendingList.length > 0 ? (
              <span className="badge-warning">未処理 {pendingList.length}</span>
            ) : (
              <span className="badge">未処理なし</span>
            )}
            {staleReservations.length > 0 && (
              <span className="badge-warning">24時間超 {staleReservations.length}</span>
            )}
          </div>
          <Link href="/pro/reservations" className="text-sm underline">
            一覧を開く
          </Link>
        </div>

        {/* タブ */}
        <div className="mb-3 inline-flex rounded-lg border bg-white p-1">
          <button
            className={`px-3 py-1.5 text-sm rounded-md ${reservTab === "pending" ? "bg-amber-100 font-medium" : "text-subtle hover:bg-zinc-50"}`}
            onClick={() => setReservTab("pending")}
          >
            未処理リクエスト
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md ${reservTab === "confirmed" ? "bg-amber-100 font-medium" : "text-subtle hover:bg-zinc-50"}`}
            onClick={() => setReservTab("confirmed")}
          >
            確定スケジュール
          </button>
        </div>

        {/* ペイン */}
        {reservTab === "pending" ? (
          pendingList.length === 0 ? (
            <p className="text-sm text-subtle">未処理の予約リクエストはありません。</p>
          ) : (
            <ul className="space-y-2">
              {pendingList.map((r) => (
                <li key={r.id} className="rounded-lg border bg-white/70 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.topic}</div>
                    <span className="text-xs text-subtle">ID: {r.id}</span>
                  </div>
                  <div className="mt-1 text-subtle">
                    依頼者：{r.client} ／ 受信：{formatTime(r.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : confirmedList.length === 0 ? (
          <p className="text-sm text-subtle">予定されている面談はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="sc-table">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>依頼者</th>
                  <th>トピック</th>
                </tr>
              </thead>
              <tbody>
                {confirmedList.map((r) => (
                  <tr key={r.id}>
                    <td>{formatTime(r.when ?? r.createdAt)}</td>
                    <td>{r.client}</td>
                    <td className="max-w-[28rem] truncate">{r.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== 3. その他メニュー（予約リクエストは削除／縦3ブロック） ===== */}
      <section className="space-y-4">
        <Link href="/pro/history" className="card p-5 hover:shadow transition-shadow block">
          <h3 className="text-lg font-semibold">対応履歴</h3>
          <p className="mt-1 text-sm text-subtle">過去の相談対応を検索・確認します。</p>
        </Link>

        <Link href="/pro/billing" className="card p-5 hover:shadow transition-shadow block">
          <h3 className="text-lg font-semibold">決済情報</h3>
          <p className="mt-1 text-sm text-subtle">
            売上・手数料・振込予定の確認と請求情報の設定を行います。
          </p>
        </Link>

        <Link href="/pro/profile" className="card p-5 hover:shadow transition-shadow block">
          <h3 className="text-lg font-semibold">ユーザー編集</h3>
          <p className="mt-1 text-sm text-subtle">プロフィールや公開情報を編集します。</p>
        </Link>
      </section>

      {/* ===== 4. 相談KPI ===== */}
      <section className="card p-5">
        <h2 className="text-lg font-semibold">相談KPI</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Metric label="直近7日の相談数" value={w7.total} />
          <Metric label="直近30日の相談数" value={w30.total} />
          <Metric label="7日 受諾率" value={`${Math.round(w7.acceptRate * 100)}%`} />
          <Metric label="30日 受諾率" value={`${Math.round(w30.acceptRate * 100)}%`} />
          <Metric label="7日 平均応答" value={msToLabel(w7.avgMs)} />
          <Metric label="30日 平均応答" value={msToLabel(w30.avgMs)} />
        </div>
      </section>

      {/* ===== 5. 売上と稼働 ===== */}
      <section className="card p-5">
        <h2 className="text-lg font-semibold">売上と稼働</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Metric label="総売上（支払い済）" value={`¥${revenue.gross.toLocaleString()}`} />
          <Metric label="手数料累計" value={`¥${revenue.fee.toLocaleString()}`} />
          <Metric label="振込予定額" value={`¥${revenue.net.toLocaleString()}`} />
          <Metric label="オンライン稼働 7日" value={secToLabel(uptime7s)} />
          <Metric label="オンライン稼働 30日" value={secToLabel(uptime30s)} />
          <div className="col-span-2 md:col-span-3">
            <Sparkline data={revenue.last14.map((d) => d.net)} caption="直近14日の日次ネット売上" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ========================== Small UI Components ========================== */
function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-3 bg-white/70">
      <div className="text-xs text-subtle">{label}</div>
      <div className="mt-1 text-xl font-bold tabular">{value}</div>
    </div>
  );
}

function Sparkline({ data, caption }: { data: number[]; caption?: string }) {
  const w = 260;
  const h = 48;
  const max = Math.max(1, ...data);
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((v, i) => {
      const x = Math.round(i * step);
      const y = Math.round(h - (v / max) * (h - 4) - 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      {caption ? <div className="mb-1 text-xs text-subtle">{caption}</div> : null}
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="48">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
}

/* ========================== Utils ========================== */
function msToLabel(ms: number) {
  if (!ms) return "-";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m ? `${m}分${s}秒` : `${s}秒`;
}
function secToLabel(sec: number) {
  if (!sec) return "0分";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h) return `${h}時間${m}分`;
  return `${m}分`;
}