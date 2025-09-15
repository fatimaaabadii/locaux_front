"use client";
import React, { useState, useCallback } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { api, getCurrentUser, getProgrammes } from "/src/api";

const ProgrammeManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    nomProgramme: "",
    description: "",
    datedeLancement: "",
  });

  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });
  
  const { data: programmes = [], isLoading, error } = useQuery({
    queryKey: ["programme"],
    queryFn: getProgrammes(),
  });

  const token = getCookie("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/programmes", data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['programme']);
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/programmes/${id}`, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['programme']);
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/programmes/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['programme']);
      setShowDeleteModal(false);
      setSelectedProgramme(null);
    },
  });

  // Handlers
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({
      nomProgramme: "",
      description: "",
      datedeLancement: "",
    });
    setSelectedProgramme(null);
  };

  const handleAddProgramme = () => {
    setFormData({
      nomProgramme: "",
      description: "",
      datedeLancement: "",
    });
    setShowAddModal(true);
  };

  const handleEditProgramme = (programmeId) => {
    const programme = programmes.find(p => p.programmeId === programmeId);
    if (programme) {
      setSelectedProgramme(programme);
      setFormData({
        nomProgramme: programme.nomProgramme || "",
        description: programme.description || "",
        datedeLancement: programme.datedeLancement || "",
      });
      setShowEditModal(true);
    }
  };

  const handleDeleteProgramme = (programmeId) => {
    const programme = programmes.find(p => p.programmeId === programmeId);
    setSelectedProgramme(programme);
    setShowDeleteModal(true);
  };

  const handleSave = () => {
    if (selectedProgramme) {
      updateMutation.mutate({
        id: selectedProgramme.programmeId,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProgramme?.programmeId) {
      deleteMutation.mutate(selectedProgramme.programmeId);
    }
  };

  // Fonction pour mettre à jour le formulaire
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const filteredProgrammes = programmes.filter(programme =>
    programme.nomProgramme?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
        <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>
          Bienvenue {userData?.name}
        </h4>
        <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
      </div>
      
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Gestion des Programmes</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
            onClick={handleAddProgramme}
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter programme
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
            <Search className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un programme..."
              className="outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {isLoading ? (
            <div className="p-4 text-center">Chargement...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nom</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">Date de lancement</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgrammes.map((programme) => (
                  <tr key={programme.programmeId} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{programme.nomProgramme}</td>
                    <td className="py-2 px-4 border-b">{programme.description}</td>
                    <td className="py-2 px-4 border-b">{programme.datedeLancement}</td>
                    <td className="py-2 px-4 border-b flex space-x-2">
                      <button
                        onClick={() => handleEditProgramme(programme.programmeId)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgramme(programme.programmeId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal pour Ajouter/Modifier */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-100 text-gray-900 w-10/12 max-w-md h-[80vh] overflow-y-auto mx-auto rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold mb-6">
              {showEditModal ? "Modifier le programme" : "Ajouter un programme"}
            </h2>
            
            <div className="mb-6">
              <label className="block font-medium mb-2">Nom du programme</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                placeholder="Nom du programme"
                value={formData.nomProgramme}
                onChange={(e) => updateFormData('nomProgramme', e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                placeholder="Description du programme"
                rows={3}
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">Date de Lancement</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                value={formData.datedeLancement}
                onChange={(e) => updateFormData('datedeLancement', e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-semibold"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162E6A] transition-colors"
              >
                {(createMutation.isPending || updateMutation.isPending) 
                  ? "Enregistrement..." 
                  : "Enregistrer"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-100 text-gray-900 w-10/12 max-w-sm mx-auto rounded-lg shadow-lg p-8">
            <h2 className="text-m font-bold text-red-600">Supprimer le programme</h2>
            <p className="text-gray-700 mb-6">Êtes-vous sûr de vouloir supprimer ce programme ?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-semibold"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProgramme(null);
                }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammeManagementPage;