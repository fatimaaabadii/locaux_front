"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUsers, getCurrentUser, api } from "/src/api";
import { getCookie } from "cookies-next";
import { FaTimes, FaPaperPlane, FaUsers, FaFileUpload } from "react-icons/fa";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function NouveauMessagePage() {
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const [destinataires, setDestinataires] = useState([]);
  const [objet, setObjet] = useState("");
  const [contenu, setContenu] = useState(""); // HTML avec ReactQuill
  const [importance, setImportance] = useState("Normal");
  const [files, setFiles] = useState([]);

  const token = getCookie("token");

  // Groupe des utilisateurs par type
  const groupedUsers = React.useMemo(() => {
    if (!users || users.length === 0) return {};
    return users
      .filter((u) => !destinataires.includes(u.id?.toString()))
      .reduce((acc, u) => {
        const typeLabel = {
          utilisateur_standard: "Utilisateur standard",
          utilisateur_normal: "Utilisateur normal",
          service_central: "Service central",
          chef_service_central: "Chef de service central",
          division_centrale: "Division centrale",
        }[u.type] || u.type;
        if (!acc[typeLabel]) acc[typeLabel] = [];
        acc[typeLabel].push(u);
        return acc;
      }, {});
  }, [users, destinataires]);

  // Mutation envoi message
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post("/message/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },
    onSuccess: () => {
      alert("Message envoyé ✅");
      setObjet("");
      setContenu("");
      setImportance("Normal");
      setDestinataires([]);
      setFiles([]);
    },
    onError: (error) => {
      console.error("Error details:", error.response?.data);
      alert("Erreur lors de l'envoi ❌");
    },
  });

  // Soumission formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    if (contenu === "" || contenu === "<p><br></p>") {
      alert("Veuillez écrire un contenu.");
      return;
    }

    const formData = new FormData();

    const messagePayload = {
      objet,
      contenu, // HTML envoyé
      importance,
      expediteur: currentUser,
      dateEnvoi:new Date(),
     // expediteurId: currentUser?.id,
      typeEnvoi: "INDIVIDUEL",
      destinataires: destinataires.map((id) => ({
        utilisateur: users.find((u) => u.id === parseInt(id)),
        typeDestinataire: "TO",
      })),
    };

    formData.append(
      "message",
      new Blob([JSON.stringify(messagePayload)], { type: "application/json" })
    );

    files.forEach((file) => formData.append("files", file));

    mutation.mutate(formData);
  };

  const toggleDestinataire = (id) => {
    setDestinataires((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (usersLoading) {
    return (
      <div className="ml-64 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 min-h-screen w-[calc(100%-16rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1">Bienvenue {currentUser?.name}</h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-600 rounded-lg shadow-md">
              <FaPaperPlane className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nouveau Message</h1>
              <p className="text-gray-500 text-sm">Composez et envoyez votre message</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">

              {/* Destinataires */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FaUsers className="text-indigo-600 text-lg" />
                  <label className="text-sm font-semibold text-gray-700">Destinataires</label>
                  {destinataires.length > 0 && (
                    <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      {destinataires.length} sélectionné{destinataires.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {destinataires.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {destinataires.map((id) => {
                      const user = users.find((u) => u.id === parseInt(id));
                      return (
                        <span key={id} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                          <span>{user?.name}</span>
                          <FaTimes className="cursor-pointer ml-1" onClick={() => toggleDestinataire(id)} />
                        </span>
                      );
                    })}
                  </div>
                )}

                <select
                  value=""
                  onChange={(e) => toggleDestinataire(e.target.value)}
                  className="w-full border border-gray-300 focus:border-indigo-500 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                >
                  <option value="" disabled>Sélectionnez un utilisateur...</option>
                  {Object.entries(groupedUsers).map(([type, usersOfType]) => (
                    <optgroup key={type} label={type}>
                      {usersOfType.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Objet */}
              <div className="p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Objet du message
                </label>
                <input
                  type="text"
                  value={objet}
                  onChange={(e) => setObjet(e.target.value)}
                  placeholder="Entrez l'objet de votre message..."
                  className="w-full border border-gray-300 focus:border-indigo-500 rounded-lg p-2.5 text-gray-700 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                  required
                />
              </div>

              {/* Contenu (éditeur riche) */}
              <div className="p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contenu du message
                </label>
                <ReactQuill
                  theme="snow"
                  value={contenu}
                  onChange={setContenu}
                  placeholder="Rédigez votre message ici..."
                  className="bg-white rounded-lg text-sm"
                  modules={{
                    toolbar: [
                      [{ font: [] }, { size: [] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ align: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                />
              </div>

              {/* Pièces jointes */}
              <div className="p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FaFileUpload className="inline mr-2 text-indigo-600" />
                  Pièces jointes
                </label>

                {files.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <FaFileUpload className="text-indigo-600 text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <FaTimes className="text-red-500 text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-lg p-4 cursor-pointer bg-gray-50 hover:bg-indigo-50 transition-all group">
                  <div className="text-center">
                    <FaFileUpload className="mx-auto text-2xl text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                    <p className="text-sm font-medium text-gray-600">Cliquez pour sélectionner des fichiers</p>
                    <p className="text-xs text-gray-400 mt-1">ou glissez-déposez vos fichiers ici</p>
                  </div>
                  <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="hidden" />
                </label>
              </div>

              {/* Importance */}
              <div className="p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Niveau d'importance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "Normal", label: "Normal", bgColor: "bg-gray-100", borderColor: "border-gray-300", hoverBg: "hover:bg-gray-200", selectedBg: "bg-gray-200", selectedBorder: "border-gray-500", textColor: "text-gray-700" },
                    { value: "Important", label: "Important", bgColor: "bg-orange-50", borderColor: "border-orange-300", hoverBg: "hover:bg-orange-100", selectedBg: "bg-orange-100", selectedBorder: "border-orange-500", textColor: "text-orange-700" },
                    { value: "Urgent", label: "Urgent", bgColor: "bg-red-50", borderColor: "border-red-300", hoverBg: "hover:bg-red-100", selectedBg: "bg-red-100", selectedBorder: "border-red-500", textColor: "text-red-700" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setImportance(item.value)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${
                        importance === item.value
                          ? `${item.selectedBg} ${item.selectedBorder} ${item.textColor} shadow-sm`
                          : `${item.bgColor} ${item.borderColor} text-gray-600 ${item.hoverBg}`
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="p-5 bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setObjet("");
                    setContenu("");
                    setDestinataires([]);
                    setFiles([]);
                    setImportance("Normal");
                  }}
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={mutation.isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                >
                  {mutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
