// /src/app/pro/board/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EXPERTS, type Expert } from "@/data/experts";

/**
 * 専門家ボード管理（モック）
 * - 現在ログイン中の専門家IDは暫定で "1"
 * - boardMembers は localStorage に保存（実DBは未接続）
 */
const MOCK_EXPERT_ID = "1";
const LS_KEY = (id: string) => `sc_pro_board_${id}`;

export default function ProBoardPage() {
  // --- ベース専門家（自分） ---
  const me = useMemo(() => EXPERTS.find((e) => e.id === MOCK_EXPERT_ID), []);

  // --- メンバーID配列（保存対象） ---
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // --- 検索 ---
  const [q, setQ] = useState("");

  // 初期ロード：localStorage > EXPERTSの初期値
  useEffect(() => {
    const init = () => {
      try {
        const saved = localStorage.getItem(LS_KEY(MOCK_EXPERT_ID));
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) {
            setMemberIds(arr.filter(Boolean));
            setLoaded(true);
            return;
          }
        }
      } catch {}
      // EXPERTS の初期boardMembersを採用（なければ空）
      setMemberIds((me?.boardMembers ?? []).filter(Boolean));
      setLoaded(true);
    };
    init();
  }, [me]);

  // 永続化
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(LS_KEY(MOCK_EXPERT_ID), JSON.stringify(memberIds));
    } catch {}
  }, [memberIds, loaded]);

  // 展開：現在のメンバー（順序維持）
  const members: Expert[] = useMemo(() => {
    const map = new Map(EXPERTS.map((e) => [e.id, e]));
    return memberIds.map((id) => map.get(id)).filter(Boolean) as Expert[];
  }, [memberIds]);

  // 候補：自分以外 & 既に含まれていない
  const candidates: Expert[] = useMemo(() => {
    const k = q.trim().toLowerCase();
    return EXPERTS.filter((e) => {
      if (e.id === MOCK_EXPERT_ID) return false;
      if (memberIds.includes(e.id)) return false;
      if (!k) return true;
      const hay = [e.name, e.title, e.license ?? "", e.location ?? "", ...(e.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(k);
    }).slice(0, 24);
  }, [q, memberIds]);

  // 操作
  const add = (id: string) =>
    setMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const remove = (id: string) =>
    setMemberIds((prev) => prev.filter((x) => x !== id));
  const moveUp = (idx: number) =>
    setMemberIds((prev) => {
      if (idx <= 0 || idx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  const moveDown = (idx: number) =>
    setMemberIds((prev) => {
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return arr;
    });
  const clearAll = () => setMemberIds([]);

  if (!loaded) {
    return <div className="sc-container py-8 text-sm text-subtle">読み込み中…</div>;
  }

  return (
    <main className="sc-container py-8 space-y-8">
      {/* パンくず */}
      <div className="text-sm text-subtle">
        <Link href="/pro/mypage" className="underline">プロ用マイページ</Link>
        <span className="mx-1">/</span>
        専門家ボード
      </div>

      {/* 見出し */}
      <header className="border-b pb-4">
        <h1>専門家ボード</h1>
        <p className="mt-1 text-sm text-subtle">
          あなたのボードに表示する専門家を管理します（保存先：ブラウザの{" "}
          <code className="rounded bg-zinc-100 px-1">localStorage</code>）。
        </p>
      </header>

      {/* 現在のボード（しっかり表示） */}
      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">現在のボード</h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/experts/${MOCK_EXPERT_ID}`}
              className="text-sm underline"
              title="公開プロフィールを確認"
            >
              公開プロフィールを確認
            </Link>
            {members.length > 0 && (
              <button
                onClick={clearAll}
                className="btn btn-outline text-xs"
              >
                すべて外す
              </button>
            )}
          </div>
        </div>

        {members.length === 0 ? (
          <div className="card-soft border-dashed p-8 text-center text-subtle">
            まだボードに登録されていません。下の「候補から追加」から追加してください。
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m, idx) => (
              <li key={m.id} className="card-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-subtle">{m.license ?? "（資格なし）"}</div>
                    <Link
                      href={`/experts/${m.id}`}
                      className="block truncate text-base font-semibold underline-offset-4 hover:underline"
                      title={m.name}
                    >
                      {m.name}
                    </Link>
                    <div className="truncate text-sm">{m.title}</div>
                    <div className="mt-1 text-xs text-muted">所在地：{m.location}</div>
                    {m.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.tags.slice(0, 4).map((t) => (
                          <span
                            key={`${m.id}-${t}`}
                            className="badge-muted text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <button
                      onClick={() => remove(m.id)}
                      className="btn btn-outline px-2 py-1 text-xs"
                      title="ボードから外す"
                    >
                      外す
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveUp(idx)}
                        className="btn btn-outline px-2 py-1 text-xs"
                        disabled={idx === 0}
                        title="上へ"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        className="btn btn-outline px-2 py-1 text-xs"
                        disabled={idx === members.length - 1}
                        title="下へ"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 追加：候補から探す（控えめに） */}
      <section className="card p-5">
        <h2 className="text-lg font-semibold">候補から追加</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input"
            placeholder="キーワード（名前 / 資格 / タグ / 所在地）で検索"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="btn btn-outline text-sm"
            >
              クリア
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 card-soft border-dashed p-8 text-center text-subtle">
              該当する候補がありません。
            </div>
          ) : (
            candidates.map((e) => (
              <article key={e.id} className="card-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-subtle">{e.license ?? "（資格なし）"}</div>
                      {e.online ? (
                        <span className="badge text-[11px]">● 待機中</span>
                      ) : null}
                    </div>
                    <Link
                      href={`/experts/${e.id}`}
                      className="block truncate text-base font-semibold underline-offset-4 hover:underline"
                    >
                      {e.name}
                    </Link>
                    <div className="truncate text-sm">{e.title}</div>
                    <div className="mt-1 text-xs text-muted">所在地：{e.location}</div>
                  </div>
                  <button
                    onClick={() => add(e.id)}
                    className="btn btn-primary text-xs"
                  >
                    追加
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* 戻る導線 */}
      <div className="flex items-center gap-2">
        <Link href="/pro/mypage" className="btn btn-outline">
          プロ用マイページへ戻る
        </Link>
      </div>
    </main>
  );
}
