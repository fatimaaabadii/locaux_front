"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaPaperPlane, FaClock } from "react-icons/fa";
import { api,getMessage, getCurrentUser } from "/src/api"; 
import { getCookie } from 'cookies-next';

// Transformer le JSON backend en données exploitables
const transformMessages = (messages, currentUser) => {
  if (!messages) return [];

  return messages.map((msg) => {
    const isSent = msg.expediteur?.id === currentUser?.id;

    return {
      id: msg.id,
      from: isSent ? "Moi" : msg.expediteur?.name,
      to: msg.destinataires
        ?.map((d) => d.utilisateur?.name)
        .filter(Boolean)
        .join(", "),
      subject: msg.objet,
      content: msg.contenu,
      date: msg.dateEnvoi
        ? new Date(
            msg.dateEnvoi[0],
            msg.dateEnvoi[1] - 1,
            msg.dateEnvoi[2],
            msg.dateEnvoi[3],
            msg.dateEnvoi[4],
            msg.dateEnvoi[5]
          ).toLocaleString()
        : "",
      importance: msg.importance,
      statut: msg.statut,
      read: msg.statut === "Lu",
      category: isSent ? "envoyés" : "reçus",
      piecesJointes: msg.piecesJointes || [], // <-- Ajouté ici
    };
  });
};

export default function MessageriePage() {
  const [selectedMessage, setSelectedMessage] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState("reçus");
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const { data: rawMessages } = useQuery({
    queryKey: ["msg"],
    queryFn: getMessage(),
  });

  const messages = React.useMemo(
    () => transformMessages(rawMessages, userData),
    [rawMessages, userData]
  );
console.log(rawMessages);
  // Filtrer les messages en fonction de l'onglet actif et de la recherche
  const filteredMessages = messages?.filter((message) => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "non-lus") return !message.read && matchesSearch;
    return message.category === activeTab && matchesSearch;
  });

  // Réinitialiser le message sélectionné quand on change d'onglet
  React.useEffect(() => {
    setSelectedMessage(null);
  }, [activeTab]);
//console.log(selectedMessage.piecesJointes);

  const getTabCount = (tab) => {
    if (!messages) return 0;
    if (tab === "non-lus") return messages.filter(m => !m.read).length;
    return messages.filter(m => m.category === tab).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Aujourd'hui";
    if (diffDays === 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays - 1} jours`;
    return date.toLocaleDateString('fr-FR');
  };


// Fonction utilitaire pour nettoyer le HTML
const parseHtmlContent = (html) => {
  if (!html) return "";
  // Remplacer <p> par saut de ligne et supprimer les autres balises
 return html .replace(/<p>/gi, "") .replace(/<\/p>/gi, "\n\n") .replace(/<br\s*\/?>/gi, "\n") .replace(/<strong>/gi, "") .replace(/<\/strong>/gi, "") .replace(/<em>/gi, "") .replace(/<\/em>/gi, "") .replace(/&nbsp;/gi, " ") .trim();
};

const handleDownloadClick = async (e, piece) => {
  e.preventDefault();

  try {
    const token = getCookie('token');
    const messageId = Number(selectedMessage.id); // ou parseInt
    const pieceId = Number(piece.id);
    const url = `http://localhost:8080/message/${messageId}/pieces/${pieceId}/telecharger`;

    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', piece.nomFichier);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier :', error);
  }
};

  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Messagerie</h2>
              <p className="text-gray-600">Consultez vos messages reçus et envoyés</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bienvenue {userData?.name}</p>
              <p className="text-xs text-gray-400">Portail de communication interne</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar des messages */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les messages..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            {[
              { key: "reçus", label: "Reçus", icon: FaEnvelope, color: "blue" },
              { key: "envoyés", label: "Envoyés", icon: FaPaperPlane, color: "green" },
             /* { key: "non-lus", label: "Non lus", icon: FaEnvelopeOpen, color: "red" }*/
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                className={`flex-1 p-4 flex items-center justify-center space-x-2 transition-all duration-300 ${
                  activeTab === key
                    ? `border-b-3 border-${color}-500 bg-white text-${color}-600 font-semibold shadow-sm`
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
                onClick={() => setActiveTab(key)}
              >
                <Icon className={`text-sm ${activeTab === key ? `text-${color}-500` : 'text-gray-400'}`} />
                <span className="text-sm">{label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  activeTab === key 
                    ? `bg-${color}-100 text-${color}-800` 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {getTabCount(key)}
                </span>
              </button>
            ))}
          </div>

          {/* Liste des messages */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages?.length > 0 ? (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`border-b border-gray-100 p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    selectedMessage?.id === message.id
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500"
                      : !message.read
                      ? "bg-gradient-to-r from-blue-25 to-blue-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        !message.read ? 'text-gray-900 font-bold' : 'text-gray-700'
                      }`}>
                        {message.from}
                      </h3>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <FaClock className="text-gray-400 text-xs" />
                      <span className="text-xs text-gray-500">
                        {message.date}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm truncate mb-2 ${
                    !message.read ? 'font-semibold text-gray-900' : 'text-gray-800'
                  }`}>
                    {message.subject}
                  </p>
                  <p className="text-gray-600 text-xs truncate leading-relaxed">
                    {message.content}
                  </p>
                  {message.importance === "HAUTE" && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        🔴 Priorité haute
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <FaEnvelope className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-400">Aucun message trouvé</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? "Essayez une autre recherche" : "Vous n'avez pas encore de messages"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contenu du message */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedMessage ? (
            <>
              {/* Header du message */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                      {selectedMessage.subject}
                    </h2>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-900 block mb-1">
                            Expéditeur :
                          </span>
                          <span className="text-gray-700">{selectedMessage.from}</span>
                        </div>
                        {selectedMessage.to && (
                          <div>
                            <span className="font-semibold text-gray-900 block mb-1">
                              Destinataire :
                            </span>
                            <span className="text-gray-700">{selectedMessage.to}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-gray-900 block mb-1">
                            Date :
                          </span>
                          <span className="text-gray-700">{selectedMessage.date}</span>
                        </div>
                        <div>
                          
                         
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {selectedMessage.importance === "HAUTE" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                        🔴 Priorité haute
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenu du message */}
              {/* Contenu du message avec pièces jointes */}
<div className="flex-1 p-6 overflow-y-auto">
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 h-full shadow-inner border border-gray-200">
    <div className="bg-white rounded-lg p-6 h-full shadow-sm flex flex-col space-y-6">
      
      {/* Pièces jointes */}
     {selectedMessage.piecesJointes && selectedMessage.piecesJointes.length > 0 && (
  <div>
    <h4 className="font-semibold text-gray-900 mb-3">Pièces jointes :</h4>
    <ul className="space-y-2">
      {selectedMessage.piecesJointes.map((piece) => (
        <li key={piece.id} className="flex items-center justify-between border p-2 rounded hover:bg-gray-50">
          <span className="text-gray-800 truncate">{piece.nomFichier}</span>
          <button
            onClick={(e) => handleDownloadClick(e, piece)}
            className="text-blue-600 hover:underline text-sm"
          >
            Télécharger
          </button>
        </li>
      ))}
    </ul>
  </div>
)}


      {/* Contenu du message */}
      <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-base">
        {parseHtmlContent(selectedMessage.content)}
      </div>

    </div>
  </div>
</div>

            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="bg-white rounded-full p-6 shadow-lg mb-6 inline-flex">
                  <FaEnvelope className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun message sélectionné
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Choisissez un message dans la liste à gauche pour afficher son contenu ici
                </p>
              </div>
            </div>
          )}
        </div>











        
      </div>



   



    



    </div>
  );
}