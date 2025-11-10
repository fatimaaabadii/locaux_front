"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUsers, getCurrentUser, api } from "/src/api";
import { getCookie } from "cookies-next";
import { FaTimes } from "react-icons/fa";

export default function NouveauMessagePage() {
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: currentUser } = useQuery({ queryKey: ["user"], queryFn: getCurrentUser });

  const [destinataires, setDestinataires] = useState([]);
  const [objet, setObjet] = useState("");
  const [contenu, setContenu] = useState("");
  const [importance, setImportance] = useState("Normal");

  const mutation = useMutation({
    mutationFn: async (newMessage) => {
      const token = getCookie("token");
      console.log(newMessage);
      const { data } = await api.post("/message/create", newMessage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      alert("Message envoyé ✅");
      setObjet("");
      setContenu("");
      setImportance("Normal");
      setDestinataires([]);
    },
    onError: () => alert("Erreur lors de l’envoi ❌"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      objet,
      contenu,
      importance,
      dateEnvoi:new Date(),
      expediteur: currentUser,
      province:currentUser.province,
      destinataires: destinataires.map((id) => ({
        utilisateur: users.find((u) => u.id === parseInt(id)),
        typeDestinataire: "TO",
      })),
      typeEnvoi: "INDIVIDUEL",
    };
    mutation.mutate(payload);
  };

  const toggleDestinataire = (id) => {
    if (destinataires.includes(id)) {
      setDestinataires(destinataires.filter((d) => d !== id));
    } else {
      setDestinataires([...destinataires, id]);
    }
  };

  return (
     <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar remains unchanged */}
      

      {/* Main Content Area - Style inspiré du design existant */}
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>
            Bienvenue {currentUser?.name}
          </h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>
       
        <div className="p-3 bg-gray-50">
          {/* Header */}
        <div className="p-3">
  <h1 className="text-2xl font-bold mb-6 text-blue-900"> Nouveau message</h1>

  <div className="bg-white p-3 rounded-lg shadow-md">
    <form onSubmit={handleSubmit} className="space-y-3">
      
      {/* Destinataires */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {destinataires.map((id) => {
            const user = users.find((u) => u.id === parseInt(id));
            return (
              <span
                key={id}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {user?.name}
                <FaTimes className="cursor-pointer" onClick={() => toggleDestinataire(id)} />
              </span>
            );
          })}
        </div>
        <select
          value=""
          onChange={(e) => toggleDestinataire(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          <option value="" disabled>
            Sélectionnez un utilisateur...
          </option>
          {users
            ?.filter((u) => !destinataires.includes(u.id.toString()))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
        </select>
      </div>

      {/* Objet */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Objet</label>
        <input
          type="text"
          value={objet}
          onChange={(e) => setObjet(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          required
        />
      </div>

      {/* Contenu */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Contenu</label>
        <textarea
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg p-2 h-40 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          required
        />
      </div>

      {/* Importance */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Importance</label>
        <select
          value={importance}
          onChange={(e) => setImportance(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
          <option value="Important">Important</option>
        </select>
      </div>

      {/* Bouton */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="px-6 py-2 bg-blue-900 text-white rounded-lg shadow hover:bg-blue-800 disabled:opacity-50"
        >
          {mutation.isLoading ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </form>
  </div>
</div>
 </div>
    </div>
    </div>
  );
}
