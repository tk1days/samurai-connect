// src/app/pro/billing/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** ===== Keys (localStorage) ===== */
const LS_PAYOUT = "pro_billing_payout_v1";
const LS_INVOICE = "pro_billing_invoice_v1";
const LS_HISTORY = "pro_billing_history_v1";

/** ===== Types ===== */
type Payout = {
  bankName: string;
  branch: string;
  accountType: "普通" | "当座";
  accountNumber: string;
  accountHolder: string;
};

type InvoiceProfile = {
  company?: string;
  person: string;
  postal: string;
  address1: string;
  address2?: string;
  tel?: string;
  taxId?: string; // インボイス登録番号など
};

type TxStatus = "paid" | "pending" | "refunded";
type Tx = {
  id: string;
  when: string;        // ISO
  client: string;
  summary: string;
  amountYen: number;
  feeYen: number;
  status: TxStatus;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", { hour12: false });

export default function ProBillingPage() {
  /** ===== State ===== */
  const [payout, setPayout] = useState<Payout>({
    bankName: "",
    branch: "",
    accountType: "普通",
    accountNumber: "",
    accountHolder: "",
  });

  const [invoice, setInvoice] = useState<InvoiceProfile>({
    company: "",
    person: "",
    postal: "",
    address1: "",
    address2: "",
    tel: "",
    taxId: "",
  });

  const [history, setHistory] = useState<Tx[]>([]);

  /** ===== Load / Seed ===== */
  useEffect(() => {
    try {
      const p = localStorage.getItem(LS_PAYOUT);
      if (p) setPayout(JSON.parse(p));
    } catch {}
    try {
      const i = localStorage.getItem(LS_INVOICE);
      if (i) setInvoice(JSON.parse(i));
    } catch {}
    try {
      const h = localStorage.getItem(LS_HISTORY);
      if (h) setHistory(JSON.parse(h));
      else {
        // 軽いモック
        const seed: Tx[] = [
          {
            id: "TX-240031",
            when: new Date(Date.now() - 2 * 86400_000).toISOString(),
            client: "株式会社アルファ",
            summary: "ライブ相談（30分）",
            amountYen: 5000,
            feeYen: 500,
            status: "paid",
          },
          {
            id: "TX-240028",
            when: new Date(Date.now() - 5 * 86400_000).toISOString(),
            client: "個人ユーザーB",
            summary: "ライブ相談（20分）",
            amountYen: 3000,
            feeYen: 300,
            status: "paid",
          },
          {
            id: "TX-240027",
            when: new Date(Date.now() - 6 * 86400_000).toISOString(),
            client: "個人ユーザーC",
            summary: "相談予約（キャンセル）",
            amountYen: 3000,
            feeYen: 0,
            status: "refunded",
          },
        ];
        setHistory(seed);
      }
    } catch {}
  }, []);

  /** ===== Persist ===== */
  useEffect(() => {
    try { localStorage.setItem(LS_PAYOUT, JSON.stringify(payout)); } catch {}
  }, [payout]);
  useEffect(() => {
    try { localStorage.setItem(LS_INVOICE, JSON.stringify(invoice)); } catch {}
  }, [invoice]);
  useEffect(() => {
    try { localStorage.setItem(LS_HISTORY, JSON.stringify(history)); } catch {}
  }, [history]);

  const totals = useMemo(() => {
    const paid = history.filter(h => h.status === "paid");
    const gross = paid.reduce((s, x) => s + x.amountYen, 0);
    const fee = paid.reduce((s, x) => s + x.feeYen, 0);
    return { gross, fee, net: Math.max(0, gross - fee) };
  }, [history]);

  /** ===== Render ===== */
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">決済情報</h1>
        <p className="mt-1 text-sm text-zinc-600">
          受け取り口座・請求情報・取引履歴を管理します。{" "}
          <Link href="/pro/mypage" className="underline">プロ用マイページへ戻る</Link>
        </p>
      </header>

      {/* Summary */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">サマリー</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-zinc-500">総売上（支払い済）</div>
            <div className="mt-1 text-xl font-bold tabular-nums">¥{totals.gross.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-zinc-500">手数料累計</div>
            <div className="mt-1 text-xl font-bold tabular-nums">¥{totals.fee.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-zinc-500">振込予定額</div>
            <div className="mt-1 text-xl font-bold tabular-nums">¥{totals.net.toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* Payout */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">受け取り口座</h2>
        <p className="mt-1 text-sm text-zinc-600">売上の振込先を登録・更新します。</p>

        <form
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="text-sm text-zinc-700">銀行名</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={payout.bankName}
              onChange={(e) => setPayout({ ...payout, bankName: e.target.value })}
              placeholder="例：三井住友銀行"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">支店名</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={payout.branch}
              onChange={(e) => setPayout({ ...payout, branch: e.target.value })}
              placeholder="例：渋谷支店"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">口座種別</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={payout.accountType}
              onChange={(e) => setPayout({ ...payout, accountType: e.target.value as Payout["accountType"] })}
            >
              <option>普通</option>
              <option>当座</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-700">口座番号</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={payout.accountNumber}
              onChange={(e) => setPayout({ ...payout, accountNumber: e.target.value })}
              placeholder="7桁〜8桁"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-zinc-700">口座名義（カナ推奨）</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={payout.accountHolder}
              onChange={(e) => setPayout({ ...payout, accountHolder: e.target.value })}
              placeholder="ヤマダ タロウ"
            />
          </div>

          <div className="sm:col-span-2 mt-2">
            <button
              type="submit"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
              onClick={() => {}}
            >
              保存（自動）
            </button>
          </div>
        </form>
      </section>

      {/* Invoice */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">請求書情報</h2>
        <p className="mt-1 text-sm text-zinc-600">請求書の宛名・住所・登録番号を管理します。</p>

        <form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <div className="sm:col-span-2">
            <label className="text-sm text-zinc-700">会社名（任意）</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.company}
              onChange={(e) => setInvoice({ ...invoice, company: e.target.value })}
              placeholder="例：〇〇合同会社"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">担当者 / 氏名</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.person}
              onChange={(e) => setInvoice({ ...invoice, person: e.target.value })}
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">郵便番号</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.postal}
              onChange={(e) => setInvoice({ ...invoice, postal: e.target.value })}
              placeholder="100-0001"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-zinc-700">住所1</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.address1}
              onChange={(e) => setInvoice({ ...invoice, address1: e.target.value })}
              placeholder="東京都千代田区〇〇1-2-3"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-zinc-700">住所2（任意）</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.address2}
              onChange={(e) => setInvoice({ ...invoice, address2: e.target.value })}
              placeholder="ビル名・部屋番号など"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">電話（任意）</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.tel}
              onChange={(e) => setInvoice({ ...invoice, tel: e.target.value })}
              placeholder="03-1234-5678"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-700">登録番号（任意）</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invoice.taxId}
              onChange={(e) => setInvoice({ ...invoice, taxId: e.target.value })}
              placeholder="T1234567890123（インボイスなど）"
            />
          </div>

          <div className="sm:col-span-2 mt-2">
            <button
              type="submit"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
              onClick={() => {}}
            >
              保存（自動）
            </button>
          </div>
        </form>
      </section>

      {/* History */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">取引履歴</h2>
          <button
            onClick={() => setHistory([])}
            className="text-xs text-zinc-600 underline"
            title="モックを消去"
          >
            すべてクリア
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">まだ取引履歴がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-600">
                  <th className="py-2 pr-4">日時</th>
                  <th className="py-2 pr-4">依頼者</th>
                  <th className="py-2 pr-4">内容</th>
                  <th className="py-2 pr-4">金額</th>
                  <th className="py-2 pr-4">手数料</th>
                  <th className="py-2">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{fmt(tx.when)}</td>
                    <td className="py-2 pr-4">{tx.client}</td>
                    <td className="py-2 pr-4">{tx.summary}</td>
                    <td className="py-2 pr-4 tabular-nums">¥{tx.amountYen.toLocaleString()}</td>
                    <td className="py-2 pr-4 tabular-nums">¥{tx.feeYen.toLocaleString()}</td>
                    <td className="py-2">
                      <span
                        className={{
                          paid: "rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200",
                          refunded: "rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-amber-200",
                          pending: "rounded-md bg-gray-50 px-2 py-0.5 text-gray-700 ring-1 ring-gray-300",
                        }[tx.status]}
                      >
                        {tx.status === "paid" ? "支払い済み" : tx.status === "refunded" ? "返金" : "保留"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}