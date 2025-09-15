"use client";

import React, { useState, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";

import { api, getCurrentUser, getMessage, getGroups, getGroupMembers, getUsers } from "/src/api";
import { FaInbox, FaEnvelope, FaPaperPlane, FaTrash, FaStar, FaReply, 
         FaForward, FaExclamationCircle, FaSearch, FaPlus, FaUser, FaUsers } from 'react-icons/fa';

const MessagerieApp = () => {
  const [activeTab, setActiveTab] = useState('reçus');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({ 
    recipientType: 'user', // 'user' ou 'group'
    to: "", 
    subject: "", 
    content: "", 
    attachment: null 
  });

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const { data: messages } = useQuery({
    queryKey: ['msg'],
    queryFn: getMessage(),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isComposing,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
    enabled: isComposing,
  });

  console.log("groups", groups);

  // Fonction pour gérer le changement dans le formulaire de composition
  const handleComposeChange = (e) => {
  const { name, value, files } = e.target;
  setComposeData((prev) => ({
    ...prev,
    [name]: files ? files[0] : value,
  }));
};


  // Fonction pour changer le type de destinataire
  const handleRecipientTypeChange = useCallback((type) => {
    setComposeData(prevData => ({
      ...prevData,
      recipientType: type,
      to: "" // Reset le destinataire quand on change de type
    }));
  }, []);

  // Composant pour la composition de message (défini en dehors du rendu principal)
  const ComposeMessage = useCallback(() => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Nouveau Message</h2>
          <button onClick={() => setIsComposing(false)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {/* Sélecteur de type de destinataire */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => handleRecipientTypeChange('user')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  composeData.recipientType === 'user' 
                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaUser className="w-4 h-4" />
                <span>Utilisateur</span>
              </button>
              <button
                type="button"
                onClick={() => handleRecipientTypeChange('group')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  composeData.recipientType === 'group' 
                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaUsers className="w-4 h-4" />
                <span>Groupe</span>
              </button>
            </div>

            {/* Select pour le destinataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {composeData.recipientType === 'user' ? 'Utilisateur:' : 'Groupe:'}
              </label>
              <select
                name="to"
                value={composeData.to}
                onChange={handleComposeChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  {composeData.recipientType === 'user' 
                    ? 'Sélectionner un utilisateur...' 
                    : 'Sélectionner un groupe...'
                  }
                </option>
                {composeData.recipientType === 'user' 
                  ? users?.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))
                  : groups?.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.nom} ({group.membres?.length || 0} membres)
                      </option>
                    ))
                }
              </select>
            </div>

            <input
              type="text"
              placeholder="Objet:"
              name="subject"
              value={composeData.subject}
              onChange={handleComposeChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              placeholder="Votre message..."
              name="content"
              rows={10}
              value={composeData.content}
              onChange={handleComposeChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <input
              type="file"
              name="attachment"
              onChange={handleComposeChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Enregistrer comme brouillon
            </button>
            <button 
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [composeData, handleComposeChange, handleRecipientTypeChange, users, groups]);

  return (
    <div className="ml-64 bg-gray-50 min-h-screen flex">
      {/* Barre latérale */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <button
          onClick={() => setIsComposing(true)}
          className="w-full bg-blue-900 text-white rounded-lg p-3 flex items-center justify-center space-x-2 hover:bg-blue-800 transition-colors mb-6"
        >
          <FaPlus className="w-4 h-4" />
          <span>Nouveau Message</span>
        </button>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('reçus')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'reçus' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaInbox className="w-5 h-5" />
            <span>Reçus</span>
            <span className="ml-auto bg-blue-100 text-blue-600 rounded-full px-2 py-1 text-xs">
              {messages?.filter(m => m.category === 'reçus' && !m.read).length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('non-lus')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'non-lus' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaEnvelope className="w-5 h-5" />
            <span>Non lus</span>
          </button>

          <button
            onClick={() => setActiveTab('envoyés')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'envoyés' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaPaperPlane className="w-5 h-5" />
            <span>Envoyés</span>
          </button>

          <button
            onClick={() => setActiveTab('important')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'important' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaStar className="w-5 h-5" />
            <span>Important</span>
          </button>

          <button
            onClick={() => setActiveTab('corbeille')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'corbeille' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaTrash className="w-5 h-5" />
            <span>Corbeille</span>
          </button>
        </nav>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">
        {/* Barre de recherche */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-lg flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher des messages..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Liste des messages */}
        <div className="flex-1 overflow-auto">
          {messages
            ?.filter(message => {
              if (activeTab === 'non-lus') return !message.read;
              return message.category === activeTab;
            })
            .map(message => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`border-b border-gray-200 p-4 cursor-pointer hover:bg-gray-50 ${
                  !message.read ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{message.from}</h3>
                  <span className="text-sm text-gray-500">{message.date}</span>
                </div>
                <p className="font-medium text-gray-800 mb-1">{message.subject}</p>
                <p className="text-gray-600 text-sm truncate">{message.content}</p>
              </div>
            ))}
        </div>

        {/* Message sélectionné */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                <button onClick={() => setSelectedMessage(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-medium">De: {selectedMessage.from}</p>
                    {selectedMessage.to && <p className="text-gray-600">À: {selectedMessage.to}</p>}
                    <p className="text-sm text-gray-500">{selectedMessage.date}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      onClick={() => {
                        setComposeData({
                          recipientType: 'user',
                          to: selectedMessage.from,
                          subject: `Re: ${selectedMessage.subject}`,
                          content: `\n\n---\n${selectedMessage.content}`,
                          attachment: null
                        });
                        setSelectedMessage(null);
                        setIsComposing(true);
                      }}
                    >
                      <FaReply className="w-5 h-5" />
                    </button>
                    <button 
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                      onClick={() => {
                        setComposeData({
                          recipientType: 'user',
                          to: "",
                          subject: `Fwd: ${selectedMessage.subject}`,
                          content: `\n\n---\n${selectedMessage.from}: ${selectedMessage.content}`,
                          attachment: null
                        });
                        setSelectedMessage(null);
                        setIsComposing(true);
                      }}
                    >
                      <FaForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de composition */}
        {isComposing && <ComposeMessage />}
      </div>
    </div>
  );
};

export default MessagerieApp;