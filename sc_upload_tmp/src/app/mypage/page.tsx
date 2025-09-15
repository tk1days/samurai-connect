// /src/app/mypage/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** =========================
 *  型定義
 *  ========================= */
type BookingItem = {
  id: string;
  expertId: string;
  expertName: string;
  startAt: number;
  endAt: number;
  status: "requested" | "confirmed" | "canceled" | "done";
};

type FavoriteItem = {
  expertId: string;
  expertName: string;
  tags?: string[];
};

type PaymentItem = {
  id: string;
  createdAt: number;
  description: string;
  amountJpy: number;
  status: "authorized" | "captured" | "refunded" | "failed";
  expertId?: string;
  expertName?: string;
};

type Profile = {
  displayName: string;
  email: string;
  phone?: string;
  preferredCategory?: string;
  area?: string;
  notificationEmail: boolean;
  notificationPush: boolean;
};

/** =========================
 *  ストレージキー
 *  ========================= */
const SKEY = {
  DEMO_VER: "sc_mypage_demo_ver",
  BOOKINGS: "sc_user_bookings_v1",
  FAVS: "sc_user_favorites_v1",
  PAY: "sc_user_payments_v1",
  PROF: "sc_user_profile_v1",
} as const;

const DEMO_VERSION = "v2-20250913";

/** 汎用ストレージ関数 */
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function saveJSON<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/** =========================
 *  デモデータ投入（固定）
 *  ========================= */
function injectDemoDataForce() {
  const now = Date.now();

  const favs: FavoriteItem[] = [
    { expertId: "E-201", expertName: "渡邉武", tags: ["税務", "創業"] },
    { expertId: "E-202", expertName: "山田太郎", tags: ["労務", "就業規則"] },
    { expertId: "E-203", expertName: "田口一郎", tags: ["契約", "M&A"] },
  ];
  saveJSON(SKEY.FAVS, favs);

  const bookings: BookingItem[] = [
    {
      id: "B-DEMO-001",
      expertId: "E-210",
      expertName: "田中治",
      startAt: now + 1000 * 60 * 60 * 24,
      endAt: now + 1000 * 60 * 60 * 25,
      status: "confirmed",
    },
  ];
  saveJSON(SKEY.BOOKINGS, bookings);

  const pays: PaymentItem[] = [
    {
      id: "P-DEMO-001",
      createdAt: now - 1000 * 60 * 60 * 2,
      description: "オンライン相談（60分）",
      amountJpy: 8800,
      status: "captured",
      expertId: "E-210",
      expertName: "田中治",
    },
    {
      id: "P-DEMO-002",
      createdAt: now - 1000 * 60 * 60 * 30,
      description: "事前ヒアリング（返金）",
      amountJpy: 0,
      status: "refunded",
      expertId: "E-202",
      expertName: "山田太郎",
    },
  ];
  saveJSON(SKEY.PAY, pays);

  const prof: Profile = {
    displayName: "ゲスト",
    email: "guest@example.com",
    phone: "",
    preferredCategory: "税務",
    area: "名古屋",
    notificationEmail: true,
    notificationPush: false,
  };
  saveJSON(SKEY.PROF, prof);

  localStorage.setItem(SKEY.DEMO_VER, DEMO_VERSION);
}

function ensureDemoData() {
  const ver = localStorage.getItem(SKEY.DEMO_VER);
  if (ver !== DEMO_VERSION) {
    injectDemoDataForce();
    return;
  }
  if (!localStorage.getItem(SKEY.FAVS) || !localStorage.getItem(SKEY.BOOKINGS) || !localStorage.getItem(SKEY.PAY)) {
    injectDemoDataForce();
  }
}

/** =========================
 *  表示ユーティリティ
 *  ========================= */
const fmtTime = (ms: number) => {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
};

const badge = (text: string) => (
  <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 border border-zinc-300">{text}</span>
);

/** =========================
 *  ページ本体
 *  ========================= */
export default function UserMyPage() {
  const [tab, setTab] = useState<"bookings" | "favs" | "payments" | "profile">("payments");

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [favs, setFavs] = useState<FavoriteItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    ensureDemoData();
    setBookings(loadJSON<BookingItem[]>(SKEY.BOOKINGS, []));
    setFavs(loadJSON<FavoriteItem[]>(SKEY.FAVS, []));
    setPayments(loadJSON<PaymentItem[]>(SKEY.PAY, []));
    setProfile(loadJSON<Profile>(SKEY.PROF, { displayName: "", email: "", notificationEmail: true, notificationPush: false } as Profile));
  }, []);

  const paymentsSorted = useMemo(
    () => [...payments].sort((a, b) => b.createdAt - a.createdAt),
    [payments]
  );

  const totalCaptured = useMemo(
    () => payments.filter((p) => p.status === "captured").reduce((sum, p) => sum + p.amountJpy, 0),
    [payments]
  );

  const removeFavorite = (expertId: string) => {
    const next = favs.filter((f) => f.expertId !== expertId);
    setFavs(next);
    saveJSON(SKEY.FAVS, next);
  };

  const updateProfile = (p: Partial<Profile>) => {
    const next = { ...(profile ?? {}), ...p } as Profile;
    setProfile(next);
    saveJSON(SKEY.PROF, next);
  };

  return (
    <main className="sc-container py-6 space-y-8">
      {/* ヘッダー（右上リンクは全削除） */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイページ</h1>
        {/* 右上のナビゲーションは空にして導線を統一 */}
        <div />
      </header>

      {/* タブ */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "bookings", label: "予約" },
          { key: "favs", label: "お気に入り" },
          { key: "payments", label: "支払い・請求" },
          { key: "profile", label: "プロフィール設定" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-3 py-1.5 rounded-full border ${tab === t.key ? "bg-black text-white border-black" : "bg-white hover:bg-zinc-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 予約 */}
      {tab === "bookings" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">予約</h2>
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="p-4 rounded-2xl border bg-white">
                <div className="flex justify-between">
                  <div className="font-medium">{b.expertName}</div>
                  <div className="text-sm">
                    {b.status === "confirmed" ? badge("確定") : b.status === "requested" ? badge("申請中") : b.status === "done" ? badge("完了") : badge("取消")}
                  </div>
                </div>
                <div className="mt-1 text-sm text-zinc-600">
                  {fmtTime(b.startAt)} 〜 {fmtTime(b.endAt)}
                </div>
                <div className="mt-2">
                  <Link href={`/experts?focus=${b.expertId}`} className="text-sm underline">
                    プロフィールを見る
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* お気に入り */}
      {tab === "favs" && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">お気に入り専門家</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {favs.map((f) => (
              <li key={f.expertId} className="p-4 rounded-2xl border bg-white">
                <div className="flex justify-between">
                  <div className="font-medium">{f.expertName}</div>
                  <button onClick={() => removeFavorite(f.expertId)} className="text-sm underline">解除</button>
                </div>
                {f.tags?.length ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {f.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 border">{t}</span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3">
                  <Link href={`/experts?focus=${f.expertId}`} className="text-sm underline">プロフィールを見る</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 支払い・請求 */}
      {tab === "payments" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">支払い・請求</h2>
            <div className="text-sm text-zinc-500">決済累計 ¥{totalCaptured.toLocaleString()}</div>
          </div>
          <ul className="space-y-3">
            {paymentsSorted.map((p) => (
              <li key={p.id} className="p-4 rounded-2xl border bg-white">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-zinc-600">{fmtTime(p.createdAt)}</div>
                    <div className="font-medium">{p.expertName ?? ""}</div>
                    <div className="text-base font-semibold">¥{p.amountJpy.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-zinc-600">{p.description}</div>
                    <div className="text-sm">
                      {p.status === "captured"
                        ? badge("支払済")
                        : p.status === "authorized"
                        ? badge("与信")
                        : p.status === "refunded"
                        ? badge("返金")
                        : badge("失敗")}
                    </div>
                  </div>
                  {p.expertId && (
                    <div className="pt-1">
                      <Link href={`/experts?focus=${p.expertId}`} className="text-xs underline">
                        専門家プロフィールを見る
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* プロフィール */}
      {tab === "profile" && profile && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">プロフィール設定</h2>
          <div className="grid gap-3 max-w-xl">
            <label className="grid gap-1">
              <span className="text-sm">表示名</span>
              <input className="px-3 py-2 rounded-xl border" value={profile.displayName} onChange={(e) => updateProfile({ displayName: e.target.value })} placeholder="お名前" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">メール</span>
              <input className="px-3 py-2 rounded-xl border" value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} placeholder="you@example.com" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">電話番号</span>
              <input className="px-3 py-2 rounded-xl border" value={profile.phone ?? ""} onChange={(e) => updateProfile({ phone: e.target.value })} placeholder="090-XXXX-XXXX" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm">関心カテゴリ</span>
                <input className="px-3 py-2 rounded-xl border" value={profile.preferredCategory ?? ""} onChange={(e) => updateProfile({ preferredCategory: e.target.value })} placeholder="税務 / 契約 / 相続 など" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">エリア</span>
                <input className="px-3 py-2 rounded-xl border" value={profile.area ?? ""} onChange={(e) => updateProfile({ area: e.target.value })} placeholder="名古屋 / 愛知 など" />
              </label>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={profile.notificationEmail} onChange={(e) => updateProfile({ notificationEmail: e.target.checked })} />
                メール通知
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={profile.notificationPush} onChange={(e) => updateProfile({ notificationPush: e.target.checked })} />
                プッシュ通知
              </label>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
