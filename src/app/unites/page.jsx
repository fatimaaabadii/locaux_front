"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import {  getUnits } from "/src/api"; 
import Modal from "react-modal";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { api, getGroups, getGroupMembers , getCurrentUser} from "/src/api"; 
const UnitManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    nom: "",
    description: "",
    niveau: "",
    typeUnite: "",
    parent_id: null,
  });
  const [updatedUnitData, setUpdatedUnitData] = useState({
    nom: "",
    description: "",
    niveau: "",
    typeUnite: "",
    parent_id: null,
  });

  // fetch units
  const { data: units, refetch: refetchUnits } = useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
  });

  const typeUniteOptions = [
    { value: 'DIRECTION', label: 'Direction' },
    { value: 'SOUS_DIRECTION', label: 'Sous-Direction' },
    { value: 'DIVISION', label: 'Division' },
    { value: 'SERVICES', label: 'Service' },
    { value: 'COORDINATION', label: 'Coordination' },
    { value: 'DELEGATION', label: 'Délégation' },
    // ajoutez d'autres types ici
  ];
  const token = getCookie('token'); 
  const headers = {
    Authorization: `Bearer ${token}`
  };
  const handleAddUnit = () => {
    setShowAddModal(true);
  };

  const handleEditUnit = (unitId) => {
    const selectedUnit = units.find((unit) => unit.id === unitId);
    setSelectedUnit(selectedUnit);
    setUpdatedUnitData(selectedUnit);
    setShowEditModal(true);
  };

  const handleDeleteUnit = (unitId) => {
    const selectedUnit = units.find((unit) => unit.id === unitId);
    setSelectedUnit(selectedUnit);
    setShowDeleteModal(true);
  };

  const handleSaveUnit = async () => {
    try {
      if (selectedUnit) {
        console.log(updatedUnitData);
        await api.put(`/uniteOrganisationnelle/update/${selectedUnit.id}`, updatedUnitData, {
          headers: { headers  },
       });
      } else {
        console.log(newUnitData);
        await api.post("/uniteOrganisationnelle/create", newUnitData, {
          headers: { headers  },
        });
      }
      refetchUnits();
      setShowAddModal(false);
      setShowEditModal(false);
      resetUnitData();
    } catch (error) {
      console.error("error saving unit:", error);
    }
  };

  const resetUnitData = () => {
    setNewUnitData({
      nom: "",
      description: "",
      niveau: "",
      typeUnite: "",
      parent_id: null,
    });
    setUpdatedUnitData({
      nom: "",
      description: "",
      niveau: "",
      typeUnite: "",
      parent_id: null,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/uniteOrganisationnelle/${selectedUnit.id}`);
      refetchUnits();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("error deleting unit:", error);
    }
  };
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });
  const filteredUnits = Array.isArray(units)
    ? units.filter((unit) =>
        unit.nom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
        <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>Bienvenue {userData?.name}</h4>
        <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Unités organisationnelles</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
            onClick={handleAddUnit}
          >
            <FaPlus className="mr-2" /> Ajouter unité
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
            <FaSearch className="text-gray-400 text-lg mr-2" />
            <input
              type="text"
              placeholder="rechercher une unité..."
              className="outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nom</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Niveau</th>
                <th className="py-2 px-4 border-b">Type unité</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits?.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{unit.nom}</td>
                  <td className="py-2 px-4 border-b">{unit.description}</td>
                  <td className="py-2 px-4 border-b">{unit.niveau}</td>
                  <td className="py-2 px-4 border-b">{unit.typeUnite}</td>
                  <td className="py-2 px-4 border-b flex space-x-2">
                    <button
                      onClick={() => handleEditUnit(unit.id)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Modal */}
      <Modal
        isOpen={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        className="bg-gray-100 text-gray-900 w-10/12 max-w-md h-[80vh] overflow-y-auto mx-auto rounded-lg shadow-lg p-8"
        overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-6">Ajouter une unité</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveUnit(newUnitData);
          }}
        >
          <div className="mb-6">
            <label htmlFor="nom" className="block font-medium mb-2">Nom</label>
            <input
              id="nom"
              type="text"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              placeholder="Nom de l'unité"
              value={newUnitData.nom}
              onChange={(e) => setNewUnitData({ ...newUnitData, nom: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block font-medium mb-2">Description</label>
            <input
              id="description"
              type="text"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              placeholder="Description"
              value={newUnitData.description}
              onChange={(e) => setNewUnitData({ ...newUnitData, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="niveau" className="block font-medium mb-2">Niveau</label>
            <input
              id="niveau"
              type="number"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              placeholder="Niveau"
              value={newUnitData.niveau}
              onChange={(e) => setNewUnitData({ ...newUnitData, niveau: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="typeUnite" className="block font-medium mb-2">Type d&apos;unité</label>
            <select
              id="typeUnite"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              value={newUnitData.typeUnite}
              onChange={(e) => setNewUnitData({ ...newUnitData, typeUnite: e.target.value })}
              required
            >
              <option value="">Sélectionnez un type</option>
              {typeUniteOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="parent_id" className="block font-medium mb-2">Unité Parent</label>
            <select
              id="parent_id"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              value={newUnitData.parent_id}
              onChange={(e) => setNewUnitData({ ...newUnitData, parent_id: e.target.value })}
            >
              <option value="">Sélectionnez l&apos;unité parent</option>
              {units?.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162E6A] transition-colors">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        className="bg-gray-100 text-gray-900 w-10/12 max-w-md h-[80vh] overflow-y-auto mx-auto rounded-lg shadow-lg p-8"
        overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-6">modifier une unité</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveUnit(updatedUnitData);
          }}
        >
          <div className="mb-6">
            <label htmlFor="nom" className="block font-medium mb-2">Nom</label>
            <input
              id="nom"
              type="text"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              placeholder="Nom de l'unité"
              value={updatedUnitData.nom}
              onChange={(e) => setUpdatedUnitData({ ...updatedUnitData, nom: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block font-medium mb-2">Description</label>
            <input
              id="description"
              type="text"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              placeholder="Description"
              value={updatedUnitData.description}
              onChange={(e) => setUpdatedUnitData({ ...updatedUnitData, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="niveau" className="block font-medium mb-2">Niveau</label>
            <input
              id="niveau"
              type="number"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              placeholder="Niveau"
              value={updatedUnitData.niveau}
              onChange={(e) => setUpdatedUnitData({ ...updatedUnitData, niveau: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="typeUnite" className="block font-medium mb-2">Type d&apos;unité</label>
            <select
              id="typeUnite"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              value={updatedUnitData.typeUnite}
              onChange={(e) => setUpdatedUnitData({ ...updatedUnitData, typeUnite: e.target.value })}
              required
            >
              <option value="">Sélectionnez un type</option>
              {typeUniteOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="parent_id" className="block font-medium mb-2">Unité Parent</label>
            <select
              id="parent_id"
              className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
              value={updatedUnitData.parent_id || ""}
              onChange={(e) => setUpdatedUnitData({ ...updatedUnitData, parent_id: e.target.value })}
            >
              <option value="">Sélectionnez l&apos;unité parent</option>
              {units?.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162E6A] transition-colors">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Delete Unit Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        className="bg-gray-100 text-gray-900 w-10/12 max-w-sm mx-auto rounded-lg shadow-lg p-8"
        overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-m font-bold text-red-600">Supprimer l&apos;unité</h2>
        <p className="text-gray-700 mb-6">êtes-vous sûr de vouloir supprimer cette unité ?</p>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold"
            onClick={handleDeleteConfirm}
          >
            Confirmer
          </button>
          <button
            className="px-4 py-2 ml-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-semibold"
            onClick={() => setShowDeleteModal(false)}
          >
            Annuler
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UnitManagementPage;
