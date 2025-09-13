// /src/app/pro/mypage/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXPERTS } from "@/data/experts";

/** ================= Types ================= */
type RequestStatus = "pending" | "accepted" | "declined" | "expired";
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

/** ================ Keys / Channels ================ */
const BC_NAME = "sc-inbox";                     // /session からの通知チャンネル
const LS_ITEMS = "sc_inbox_items_v1";           // 受信箱の永続化
const LS_NEWBUF = "sc_inbox_new";               // /session 側のバッファ（初回取込用）
const LS_UNREAD_COUNT = "inbox-unread-count";   // ヘッダー未読数（将来用）
const LS_ONLINE = "pro_online_status_v1";       // オンライン/オフライン切替の保存

/** ================ Helpers ================ */
const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", { hour12: false });

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
  return (
    <span className={`badge ${tone[status]}`} aria-label={`ステータス: ${label[status]}`}>
      {label[status]}
    </span>
  );
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const { remainMs, label } = useCountdown(expiresAt);
  if (remainMs === 0) {
    return <span className="text-xs font-medium text-subtle">期限切れ</span>;
  }
  const warn = remainMs < 60_000;
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${warn ? "text-danger" : "text-foreground"}`}
      title={`締切: ${formatTime(expiresAt)}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}

/** 受信箱への変換（/session の Invite 形 → InboxItem） */
function toInboxItem(payload: any): InboxItem {
  // /session の Invite { id, expertId, clientName, topic, createdAt, ttlSec, unread, note }
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

/** デモ用：完全空にならないよう最低1件は維持（要件に合わせて常時デモ可） */
function demoFallback(): InboxItem[] {
  const now = Date.now();
  return [
    {
      id: `DEMO-${now}`,
      requesterName: "デモ依頼者",
      topic: "サンプル相談（表示確認用）",
      expertName: "あなた",
      createdAt: new Date(now - 60_000).toISOString(),
      expiresAt: new Date(now + 3 * 60_000).toISOString(),
      status: "pending",
      unread: true,
    },
  ];
}

/** ================= Page ================= */
export default function ProMyPage() {
  /** ===== オンライン/オフライン（スイッチ） ===== */
  const [online, setOnline] = useState<boolean>(true);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ONLINE);
      if (raw != null) setOnline(raw === "1");
    } catch { /* noop */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_ONLINE, online ? "1" : "0"); } catch { /* noop */ }
  }, [online]);

  /** ===== 受信箱（新規相談対応） ===== */
  const [items, setItems] = useState<InboxItem[]>([]);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<"created" | "expires">("created");

  // 初期：localStorage から復元（壊れていたらデモ1件で保護）＋ NEW バッファ取り込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_ITEMS);
      const parsed: InboxItem[] | null = raw ? JSON.parse(raw) : null;
      let base: InboxItem[] = Array.isArray(parsed) ? parsed : [];

      const bufRaw = localStorage.getItem(LS_NEWBUF);
      if (bufRaw) {
        const buf: any[] = JSON.parse(bufRaw);
        base = dedupe([...buf.map(toInboxItem), ...base]);
        localStorage.removeItem(LS_NEWBUF);
      }

      // 完全に無ければデモ挿入（「常に最低1件は見える」仕様）
      if (base.length === 0) base = demoFallback();
      setItems(base);
    } catch {
      setItems(demoFallback());
    }
  }, []);

  // BroadcastChannel（/session → 即時反映）
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

  // pending → expired 自動反映（5秒おき）
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

  // 永続化＋未読件数も保存（将来ヘッダー表示用）
  const unreadCount = useMemo(() => items.filter((x) => x.unread).length, [items]);
  useEffect(() => {
    try {
      localStorage.setItem(LS_ITEMS, JSON.stringify(items));
      localStorage.setItem(LS_UNREAD_COUNT, String(unreadCount));
    } catch { /* noop */ }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("inbox:unread", { detail: unreadCount }));
    }
  }, [items, unreadCount]);

  // フィルタ＆ソート（タブは撤去：“基本受ける”前提の要件）
  const filtered = useMemo(() => {
    const k = q.trim();
    let list = items.filter((x) => {
      const hay = `${x.requesterName} ${x.topic} ${x.note ?? ""} ${x.id}`;
      return k ? hay.includes(k) : true;
    });
    list.sort((a, b) => {
      if (sortKey === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });
    return list;
  }, [items, q, sortKey]);

  // アクション
  const onAccept = (id: string) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "accepted", unread: false } : x))
    );
  const onDecline = (id: string) =>
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "declined", unread: false } : x))
    );
  const onMarkRead = (id: string) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, unread: false } : x)));

  return (
    <main className="sc-container py-8 space-y-8">
      {/* === ページ見出し（プロフィール編集リンクは不要指示に従い未表示） === */}
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">プロ用マイページ</h1>
        <p className="mt-1 text-sm text-subtle">
          新規相談の一次対応・各種メニューにアクセスできます。
        </p>
      </header>

      {/* === オンライン / オフライン スイッチ（見た目で切替） === */}
      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">受付ステータス</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">現在：</span>
            <button
              type="button"
              onClick={() => setOnline((v) => !v)}
              className={`relative h-8 w-16 rounded-full transition ${
                online ? "bg-emerald-500/90" : "bg-zinc-300"
              }`}
              aria-label="オンライン/オフライン切替"
              title="オンライン/オフライン切替"
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  online ? "translate-x-8" : ""
                }`}
              />
            </button>
            <span
              className={`badge ${
                online
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200"
              }`}
            >
              {online ? "オンライン（受付中）" : "オフライン（対応不可）"}
            </span>
          </div>
        </div>
      </section>

      {/* === 新規相談対応（= 受信箱 本体を内包） === */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">新規相談対応</h2>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="検索（依頼者 / トピック / メモ / ID）"
              className="input rounded-xl w-64"
              aria-label="新規相談の検索"
            />
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

        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 && (
            <div className="card border-dashed p-8 text-center text-subtle">
              現在、対応すべき新規相談はありません。
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

                    <h3 className="mt-2 line-clamp-1 text-base font-semibold">
                      {item.topic}
                    </h3>

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

                {/* アクション */}
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
                      disabled={item.status === "declined" || item.status === "expired"}
                      className="btn btn-outline text-sm disabled:opacity-50"
                      title="辞退"
                      aria-label="辞退"
                    >
                      辞退
                    </button>
                    <button
                      onClick={() => onAccept(item.id)}
                      disabled={item.status === "accepted" || item.status === "expired"}
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

      {/* === メニュー群（②予約リクエスト / ③対応履歴 / ④決済情報 / ⑤ユーザー編集） === */}
      <section className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h3 className="text-lg font-semibold">予約リクエスト</h3>
          <p className="mt-1 text-sm text-subtle">
            利用者からの予約リクエストを管理します。
          </p>
          <div className="mt-3">
            <Link
              href="/pro/requests"  // TODO: 未実装ならプレースホルダーページを作成してください
              className="btn btn-outline text-sm"
            >
              管理画面を開く
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-lg font-semibold">対応履歴</h3>
          <p className="mt-1 text-sm text-subtle">
            過去の対応履歴を確認します。
          </p>
          <div className="mt-3">
            <Link
              href="/pro/history"   // TODO: 未実装ならプレースホルダーページを作成してください
              className="btn btn-outline text-sm"
            >
              履歴を見る
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-lg font-semibold">決済情報</h3>
          <p className="mt-1 text-sm text-subtle">
            過去の決済履歴・送金状況・手数料を管理します。
          </p>
          <div className="mt-3">
            <Link href="/pro/billing" className="btn btn-outline text-sm">
              決済情報ページへ
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-lg font-semibold">ユーザー編集</h3>
          <p className="mt-1 text-sm text-subtle">
            表示名・肩書・自己紹介・所在地などを編集します。
          </p>
          <div className="mt-3">
            <Link href="/pro/profile" className="btn btn-outline text-sm">
              プロフィール編集へ
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
