"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Importação para Next.js 13+

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      // Registra o usuário
      const response = await axios.post("http://localhost:5000/auth/register", {
        email,
        password,
      });

      // Autentica o usuário após o registro
      const loginResponse = await axios.post(
        "http://localhost:5000/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", loginResponse.data.token);

      // Fetch e armazena dados iniciais (favoritos e histórico) após login
      const [favoritesResponse, viewedResponse] = await Promise.all([
        axios.get("http://localhost:5000/user/me/favorites", {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`,
          },
        }),
        axios.get("http://localhost:5000/user/me/history", {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`,
          },
        }),
      ]);

      localStorage.setItem("favorites", JSON.stringify(favoritesResponse.data));
      localStorage.setItem("history", JSON.stringify(viewedResponse.data));

      router.push("/dashboard");
    } catch (err) {
      setError("Falha ao registrar ou fazer login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-black">
          Criar Conta
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black"
            >
              E-mail
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#0A5584] focus:outline-none focus:ring-1 focus:ring-[#0A5584] sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Senha
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#0A5584] focus:outline-none focus:ring-1 focus:ring-[#0A5584] sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#0A5584] py-2 px-4 text-sm font-medium text-white shadow-sm transition duration-300 ease-in-out hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#0A5584] focus:ring-offset-2"
            >
              Criar Conta
            </button>
          </div>
          <div>
            <p className="-mt-2 text-center text-sm text-gray-500">
              <Link
                href="/"
                className="font-medium text-[#0A5584] transition-transform duration-300 ease-in-out hover:text-[#0A5584] hover:scale-105 hover:brightness-110"
              >
                Já tem uma conta? Fazer Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
