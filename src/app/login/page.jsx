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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

  const { mutate } = useMutation({ mutationFn: login });

  function handleSubmit(event) {
    event.preventDefault();
    mutate();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Section Image */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-indigo-300 opacity-80" />
          <Image
            src="/16.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-700 transform scale-105 hover:scale-100"
          />
        </div>

        {/* Section Formulaire */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col items-center justify-center bg-white">
          <div className="w-full flex justify-center mb-8">
            <Image 
              src="/en.png" 
              alt="Logo" 
              width={140} 
              height={30} 
              className="relative" 
            />
          </div>

          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            Intranet - Entraide Nationale
          </h3>
          <p className="text-gray-500 mb-8">Connexion</p>

          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
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
                  className="w-full py-3 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-md focus:ring focus:ring-indigo-400 focus:border-transparent transition-shadow"
                  placeholder="Votre email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
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
                  className="w-full py-3 pl-10 pr-10 bg-gray-100 border border-gray-300 rounded-md focus:ring focus:ring-indigo-400 focus:border-transparent transition-shadow"
                  placeholder="Votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
  type="submit"
  className="relative w-full py-3 bg-gray-500 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl"
>
  Se connecter
</button>
          </form>
        </div>
      </div>
    </div>
  );
}
