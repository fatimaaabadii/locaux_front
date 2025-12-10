'use client';
import { api } from "/src/api/index.js";
import { useToast } from "/src/components/ui/use-toast";
import React, { useState } from "react";
import { setCookie } from "cookies-next";
import { useMutation } from "@tanstack/react-query";
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';

export default function Page() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const login = async () => {
    try {
      const response = await api.post('/auth/login', { userName, password });
      setCookie("token", response.data, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
      toast({
        description: "Connexion réussie",
        className: "bg-green-500 text-white",
        duration: 2000,
        title: "Succès",
      });
      window.location.href = "/";
    } catch (error) {
      toast({
        description: "Échec de connexion",
        variant: "destructive",
        duration: 2000,
        title: "Erreur",
      });
    }
  };
console.log(userName, password);
  const { mutate } = useMutation({ mutationFn: login });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-end bg-gray-800 overflow-hidden">
      {/* Image de fond couvrant tout l’écran */}
      <Image
        src="/16.png"
        alt="Background"
        fill
        priority
        className="object-cover opacity-60"
      />

      {/* Couche grise semi-transparente */}
      <div className="absolute inset-0 bg-gray-900/40" />

      {/* Formulaire clair à droite */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 mr-20 my-10 border border-gray-200 text-gray-800">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logoentaide.png" alt="Logo" width={250} height={70} />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Intranet - Entraide Nationale
        </h2>
        <p className="text-gray-500 text-center mb-8">Connexion à votre espace</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifiant */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Identifiant
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="text-gray-400" />
              </span>
              <input
                type="text"
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Votre email"
                className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-400" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full py-3 pl-10 pr-10 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.03] hover:shadow-xl"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
