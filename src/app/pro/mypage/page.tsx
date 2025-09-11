// /src/app/pro/mypage/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LS_INBOX = "sc_inbox_items_v1";

type RequestStatus = "pending" | "accepted" | "declined" | "expired";
type InboxItem = {
  id: string;
  requesterName: string;
  topic: string;
  note?: string;
  expertName: string;
  createdAt: string;
  expiresAt: string;
  status: RequestStatus;
  unread: boolean;
};

export default function ProMyPage() {
  const [items, setItems] = useState<InboxItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_INBOX);
      const parsed = raw ? (JSON.parse(raw) as InboxItem[]) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  const summary = useMemo(() => {
    const now = Date.now();
    const toMs = (iso: string) => new Date(iso).getTime();
    const unread = items.filter((x) => x.unread).length;
    const pending = items.filter(
      (x) => x.status === "pending" && toMs(x.expiresAt) > now
    ).length;
    const acceptedToday = items.filter((x) => {
      if (x.status !== "accepted") return false;
      const d = new Date(x.createdAt);
      const t = new Date();
      return (
        d.getFullYear() === t.getFullYear() &&
        d.getMonth() === t.getMonth() &&
        d.getDate() === t.getDate()
      );
    }).length;
    const expired = items.filter((x) => x.status === "expired").length;
    return { unread, pending, acceptedToday, expired };
  }, [items]);

  return (
    <main className="sc-container py-8 space-y-8">
      {/* ヘッダー */}
      <header className="border-b pb-4">
        <h1>プロ用マイページ</h1>
        <p className="mt-1 text-subtle">
          相談履歴・プロフィール・決済情報・専門家ボードの管理を行います。
        </p>
      </header>

      {/* サマリー */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-sm text-muted">未読リクエスト</div>
          <div className="mt-1 text-2xl font-bold tabular">{summary.unread}</div>
          <Link href="/inbox" className="mt-2 inline-block text-xs underline">
            受信箱を開く
          </Link>
        </div>

        <div className="card p-4">
          <div className="text-sm text-muted">待機中（期限内）</div>
          <div className="mt-1 text-2xl font-bold tabular">{summary.pending}</div>
          <span className="mt-2 inline-block text-xs text-subtle">
            /inbox で確認可能
          </span>
        </div>

        <div className="card p-4">
          <div className="text-sm text-muted">本日 受諾</div>
          <div className="mt-1 text-2xl font-bold tabular">
            {summary.acceptedToday}
          </div>
          <span className="mt-2 inline-block text-xs text-subtle">今日分の受諾数</span>
        </div>

        <div className="card p-4">
          <div className="text-sm text-muted">期限切れ</div>
          <div className="mt-1 text-2xl font-bold tabular">{summary.expired}</div>
          <span className="mt-2 inline-block text-xs text-subtle">
            過去の期限切れ件数
          </span>
        </div>
      </section>

      {/* 機能カード */}
      <section className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2>相談履歴</h2>
          <p className="mt-1 text-sm text-muted">
            受信したライブ相談やセッションの履歴を確認します。
          </p>
          <div className="mt-3">
            <Link href="/inbox" className="btn btn-outline text-sm">
              受信箱を開く
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h2>プロフィール編集</h2>
          <p className="mt-1 text-sm text-muted">
            表示名・肩書・自己紹介・所在地などを編集します。
          </p>
          <div className="mt-3">
            <Link href="/pro/profile" className="btn btn-outline text-sm">
              プロフィール編集へ
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h2>決済情報</h2>
          <p className="mt-1 text-sm text-muted">
            受け取り口座・請求書情報・過去の決済履歴を管理します。
          </p>
          <div className="mt-3">
            <Link href="/pro/billing" className="btn btn-outline text-sm">
              決済情報ページへ
            </Link>
          </div>
        </section>

        <section className="card p-5">
          <h2>専門家ボード</h2>
          <p className="mt-1 text-sm text-muted">
            自分のボードに載せる専門家の追加・削除を行います。
          </p>
          <div className="mt-3">
            <Link href="/pro/board" className="btn btn-outline text-sm">
              ボード編集へ
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}