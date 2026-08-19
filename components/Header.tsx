'use client'

import { useState } from 'react'

declare global {
  interface Window {
    Pi: any;
  }
}

export default function Header() {
  const [user, setUser] = useState<string | null>(null)

  const handlePiLogin = async () => {
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        // Inisialisasi SDK Pi Network (Sandbox mode untuk Testnet)
        window.Pi.init({ version: "2.0", sandbox: true });

        // Autentikasi Pengguna
        const auth = await window.Pi.authenticate(
          ['username', 'payments'],
          (incompletePayment: any) => {
            console.log("Incomplete payment detected:", incompletePayment);
          }
        );

        setUser(auth.user.username);
        alert(`Berhasil Login! Selamat datang, ${auth.user.username}`);
      } catch (error) {
        console.error("Gagal melakukan login Pi:", error);
        alert("Gagal menghubungkan ke Pi Wallet.");
      }
    } else {
      alert("Aplikasi harus dibuka melalui Pi Browser!");
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-slate-900 text-white">
      <div className="font-bold text-lg">MetaForge Studio</div>
      <button
        onClick={handlePiLogin}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
      >
        {user ? `👤 ${user}` : 'Pi Pioneer'}
      </button>
    </header>
  )
}
