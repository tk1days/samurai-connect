import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center bg-gray-50">
      <div className="p-8 rounded-2xl shadow bg-white">
        <h1 className="text-3xl font-bold">サムライコネクト（β）</h1>
        <p className="text-gray-600 mt-2">今すぐ、専門家とつながる。</p>
      </div>
    </main>
  )
}