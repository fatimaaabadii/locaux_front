"use client";
import React, { useState, useCallback } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import { api, getCurrentUser, getPrestations, getProgrammes, getTypePrestations } from "/src/api";

const PrestationManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrestation, setSelectedPrestation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // État pour le formulaire
  const [formData, setFormData] = useState({
    nomPrestation: "",
    description: "",
    dateLancement: "",
    programmes: [],
    typePrestationId: "",
  });

  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });
  
  const { data: prestations = [], isLoading, error } = useQuery({
    queryKey: ["prestations"],
    queryFn: getPrestations(),
  });
  console.log(prestations);
  
  const { data: programmes = [] } = useQuery({
    queryKey: ["programmes"],
    queryFn: getProgrammes(),
  });

  const { data: typesPrestations = [] } = useQuery({
    queryKey: ["typesPrestations"],
    queryFn: getTypePrestations(),
  });

  const token = getCookie("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/api/prestations", data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['prestations']);
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/prestations/${id}`, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['prestations']);
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/prestations/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(['prestations']);
      setShowDeleteModal(false);
      setSelectedPrestation(null);
    },
  });

  // Handlers
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({
      nomPrestation: "",
      description: "",
      dateLancement: "",
      programmes: [],
      typePrestationId: "",
    });
    setSelectedPrestation(null);
  };

  const handleAddPrestation = () => {
    setFormData({
      nomPrestation: "",
      description: "",
      dateLancement: "",
      programmes: [],
      typePrestationId: "",
    });
    setShowAddModal(true);
  };

  const handleEditPrestation = (prestationId) => {
    const prestation = prestations.find(p => p.prestationId === prestationId);
    if (prestation) {
      console.log("Prestation à éditer:", prestation);
      console.log("Programmes de la prestation:", prestation.programme);
      
      setSelectedPrestation(prestation);
      setFormData({
        nomPrestation: prestation.nomPrestation || "",
        description: prestation.description || "",
        dateLancement: prestation.dateLancement || "",
        programmes: Array.isArray(prestation.programme) ? prestation.programme : [],
        typePrestationId: prestation.typePrestation?.typePrestationId || "",
      });
      setShowEditModal(true);
    }
  };

  const handleDeletePrestation = (prestationId) => {
    const prestation = prestations.find(p => p.prestationId === prestationId);
    setSelectedPrestation(prestation);
    setShowDeleteModal(true);
  };

  const handleSave = () => {
    // Préparer les données avec la structure attendue par Hibernate
    const programmesFormatted = (formData.programmes && formData.programmes.length > 0) 
      ? formData.programmes.map((p) => {
          // Si p est déjà un objet avec programmeId, on l'utilise directement
          const id = typeof p === 'object' ? p.programmeId : p;
          return { programmeId: Number(id) };
        })
      : [];

    const dataToSend = {
      nomPrestation: formData.nomPrestation,
      description: formData.description,
      dateLancement: formData.dateLancement,
      programme: programmesFormatted, // Changé de "programmes" à "programme" (singulier)
      typePrestation: formData.typePrestationId ? { typePrestationId: Number(formData.typePrestationId) } : null,
    };

    console.log("FormData avant envoi:", formData);
    console.log("Programmes formatés:", programmesFormatted);
    console.log("Data à envoyer:", dataToSend);

    if (selectedPrestation) {
      updateMutation.mutate({
        id: selectedPrestation.prestationId,
        data: dataToSend
      });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPrestation?.prestationId) {
      deleteMutation.mutate(selectedPrestation.prestationId);
    }
  };

  // Fonction pour mettre à jour le formulaire
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const filteredPrestations = prestations.filter(prestation =>
    prestation.nomPrestation?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-2xl font-bold text-blue-900">Gestion des Prestations</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
            onClick={handleAddPrestation}
          >
            <Plus className="mr-2 h-4 w-4" /> Ajouter prestation
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
            <Search className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher une prestation..."
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
                  <th className="py-2 px-4 border-b">Programmes</th>
                  <th className="py-2 px-4 border-b">Type de prestation</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrestations.map((prestation) => (
                  <tr key={prestation.prestationId} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{prestation.nomPrestation}</td>
                    <td className="py-2 px-4 border-b">{prestation.description}</td>
                    <td className="py-2 px-4 border-b">{prestation.dateLancement}</td>
                    <td className="py-2 px-4 border-b">
                      {prestation.programme?.map((p) => p.nomProgramme).join(", ") || "-"}
                    </td>
                    <td className="py-2 px-4 border-b">{prestation.typePrestation?.type_prestation || '-'}</td>
                    <td className="py-2 px-4 border-b flex space-x-2">
                      <button
                        onClick={() => handleEditPrestation(prestation.prestationId)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrestation(prestation.prestationId)}
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
              {showEditModal ? "Modifier la prestation" : "Ajouter une prestation"}
            </h2>
            
            <div className="mb-6">
              <label className="block font-medium mb-2">Nom de la prestation</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                placeholder="Nom de la prestation"
                value={formData.nomPrestation}
                onChange={(e) => updateFormData('nomPrestation', e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                placeholder="Description de la prestation"
                rows={3}
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">Date de lancement</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                value={formData.dateLancement}
                onChange={(e) => updateFormData('dateLancement', e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">Programme</label>

              {/* Badges des programmes sélectionnés */}
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.programmes || []).map((programme) => (
                  <span
                    key={programme.programmeId}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {programme.nomProgramme}
                    <button
                      type="button"
                      className="ml-1 font-bold"
                      onClick={() =>
                        updateFormData(
                          'programmes',
                          formData.programmes.filter((p) => p.programmeId !== programme.programmeId)
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Select pour ajouter un programme 
              <select
                value=""
                onChange={(e) => {
                  const selectedProgramme = programmes.find(
                    (p) => p.programmeId === parseInt(e.target.value)
                  );
                  if (
                    selectedProgramme &&
                    !formData.programmes?.some((p) => p.programmeId === selectedProgramme.programmeId)
                  ) {
                    updateFormData('programmes', [...(formData.programmes || []), selectedProgramme]);
                  }
                }}
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              >
                <option value="">Sélectionner un programme...</option>
                {programmes
                  .filter(
                    (p) => !formData.programmes?.some((selected) => selected.programmeId === p.programmeId)
                  )
                  .map((programme) => (
                    <option key={programme.programmeId} value={programme.programmeId}>
                      {programme.nomProgramme}
                    </option>
                  ))}
              </select>*/}


              <select
  value={formData.programmes[0]?.programmeId || ""}
  onChange={(e) => {
    const selectedProgramme = programmes.find(
      (p) => p.programmeId === parseInt(e.target.value)
    );
    if (selectedProgramme) {
      // Remplacer l'ancien programme par le nouveau dans un tableau
      updateFormData('programmes', [selectedProgramme]);
    }
  }}
  className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
>
  <option value="">Sélectionner un programme...</option>
  {programmes.map((programme) => (
    <option key={programme.programmeId} value={programme.programmeId}>
      {programme.nomProgramme}
    </option>
  ))}
</select>
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">Type de prestation</label>
              <select
                className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
                value={formData.typePrestationId}
                onChange={(e) => updateFormData('typePrestationId', e.target.value)}
              >
                <option value="">Sélectionner un type de prestation</option>
                {typesPrestations.map((type) => (
                  <option key={type.typePrestationId} value={type.typePrestationId}>
                    {type.type_prestation}
                  </option>
                ))}
              </select>
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
            <h2 className="text-m font-bold text-red-600">Supprimer la prestation</h2>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette prestation "{selectedPrestation?.nomPrestation}" ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-semibold"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPrestation(null);
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

export default PrestationManagementPage;