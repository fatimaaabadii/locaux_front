"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { api, getUsers, getCurrentUser, getUnits } from "/src/api"; 
import Modal from "react-modal";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    tele: "",
    roles: [],
    unite: null,
  });
  const [updatedUserData, setUpdatedUserData] = useState({
    name: "",
    email: "",
    tele: "",
    roles: [],
    unite: null,
  });
  const token = getCookie('token'); 
  const headers = {
    Authorization: `Bearer ${token}`
  };
  // Fetch user data
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });
  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
  });

console.log(units);
const roles = [
  { value: 'ADMIN_ROLES', label: 'Admin' },
  { value: 'USER_ROLES', label: 'Utilisateur' },
  // ajoutez d'autres rôles ici
];
  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (userId) => {
    const selectedUser = users.find((user) => user.id === userId);
    setSelectedUser(selectedUser);
    setUpdatedUserData(selectedUser);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId) => {
    const selectedUser = users.find((user) => user.id === userId);
    setSelectedUser(selectedUser);
    setShowDeleteModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        console.log(updatedUserData)
        await api.put(`/auth/updateUser/${selectedUser.id}`, updatedUserData, {
          headers: { headers  },
        });
      } else {
        // Add new user
        console.log(newUserData);
        await api.post("/auth/addUser", newUserData, {
          headers: { headers  },
       });
      }
     refetchUsers();
      setShowAddModal(false);
      setShowEditModal(false);
      setNewUserData({
        name: "",
        email: "",
        tele: "",
        roles: [],
        unite: null,
      });
      setUpdatedUserData({
        name: "",
        email: "",
        tele: "",
        roles: [],
        unite: null,
      });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/auth/deleteUser/${selectedUser.id}`, {
        headers: {  headers  },
      });
      refetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users
        .filter((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((user) => (filterRole ? user.roles === filterRole : true))
    : [];


console.log(filteredUsers);
  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      {/* Div ajouté en haut de la page */}
      <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
        <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>Bienvenue {userData?.name}</h4>
        <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
      </div>
      <div className=" bg-gray-50 min-h-screen p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Gestion des Utilisateurs</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
            onClick={handleAddUser}
          >
            <FaPlus className="mr-2" /> Ajouter Utilisateur
          </button>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="flex space-x-4 mb-6">
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
            <FaSearch className="text-gray-400 text-lg mr-2" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2 rounded-lg border border-gray-100 shadow-sm"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN_ROLES">Administrateur</option>
            <option value="USER_ROLES">Utilisateur</option>
          </select>
        </div>

        {/* Liste des Utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nom</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Téléphone</th>
                <th className="py-2 px-4 border-b">Rôle</th>
                <th className="py-2 px-4 border-b">Unité</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.tele}</td>
               <td className="py-2 px-4 border-b">
  {user.roles?.map(r => r.name).join(", ")}
</td>


                  <td className="py-2 px-4 border-b">{user.unite?.nom || "N/A"}</td>
                  <td className="py-2 px-4 border-b flex space-x-2">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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

      {/* Add User Modal */}
      <Modal
      isOpen={showAddModal}
      onRequestClose={() => setShowAddModal(false)}
      className="bg-gray-100 text-gray-900 w-10/12 max-w-md h-[80vh] overflow-y-auto mx-auto rounded-lg shadow-lg p-8"
      overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Ajouter un utilisateur</h2>
        <button
          className="p-2 rounded-full hover:bg-gray-300 transition-colors"
          onClick={() => setShowAddModal(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveUser(newUserData);
        }}
      >
        <div className="mb-6">
          <label htmlFor="name" className="block font-medium mb-2">Nom</label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez le nom"
            value={newUserData.name}
            onChange={(e) => setNewUserData({ ...newUserData,roles: newUserData.roles.map(r => r.value), name: e.target.value })}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block font-medium mb-2">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez l'email"
            value={newUserData.email}
            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block font-medium mb-2">Mot de Passe</label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez le mot de passe"
            value={newUserData.password}
            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="tele" className="block font-medium mb-2">Téléphone</label>
          <input
            id="tele"
            type="tel"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez le numéro de téléphone"
            value={newUserData.tele}
            onChange={(e) => setNewUserData({ ...newUserData, tele: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
  <label htmlFor="roles" className="block font-medium mb-2">Rôles</label>
  <select
    id="roles"
    multiple
    className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
    value={newUserData.roles.map(r => r.value)}  // pour le multi-select
    onChange={(e) => {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => ({ value: option.value, label: option.label }));
      setNewUserData({ ...newUserData, roles: selectedOptions });
    }}
    required
  >
    {roles.map((role) => (
      <option key={role.value} value={role.value}>{role.label}</option>
    ))}
  </select>
</div>


        <div className="mb-6">
          <label htmlFor="unite" className="block font-medium mb-2">Unité Organisationnelle</label>
          <select
            id="unite"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            value={newUserData.unite?.nom || ""}
            onChange={(e) => {
              const selectedUnit = units.find(unit => unit.nom === e.target.value);
              setNewUserData({ ...newUserData, unite: selectedUnit });
            }}
            required
          >
            <option value="">Sélectionnez une unité</option>
            {units?.map((unit) => (
              <option key={unit.id} value={unit.nom}>{unit.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162E6A] transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>

      {/* Edit User Modal */}
      <Modal
      isOpen={showEditModal}
      onRequestClose={() => setShowEditModal(false)}
      className="bg-gray-100 text-gray-900 w-10/12 max-w-md h-[80vh] overflow-y-auto mx-auto rounded-lg shadow-lg p-8"
      overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Modifier un utilisateur</h2>
        <button
          className="p-2 rounded-full hover:bg-gray-300 transition-colors"
          onClick={() => setShowEditModal(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveUser(updatedUserData);
        }}
      >
        <div className="mb-6">
          <label htmlFor="name" className="block font-medium mb-2">Nom</label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez le nom"
            value={updatedUserData.name}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, name: e.target.value })}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block font-medium mb-2">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez l'email"
            value={updatedUserData.email}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="tele" className="block font-medium mb-2">Téléphone</label>
          <input
            id="tele"
            type="tel"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            placeholder="Entrez le numéro de téléphone"
            value={updatedUserData.tele}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, tele: e.target.value })}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="roles" className="block font-medium mb-2">Rôle</label>
          <select
            id="roles"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            value={updatedUserData.roles}
            onChange={(e) => setUpdatedUserData({ ...updatedUserData, roles: e.target.value })}
            required
          >
            <option value="">Sélectionnez un rôle</option>
            {roles.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="unite" className="block font-medium mb-2">Unité Organisationnelle</label>
          <select
            id="unite"
            className="w-full px-4 py-3 bg-gray-200 text-gray-900 rounded-md"
            value={updatedUserData.unite?.nom || ""}
            onChange={(e) => {
              const selectedUnit = units.find(unit => unit.nom === e.target.value);
              setUpdatedUserData({ ...updatedUserData, unite: selectedUnit });
            }}
            required
          >
            <option value="">Sélectionnez une unité</option>
            {units?.map((unit) => (
              <option key={unit.id} value={unit.nom}>{unit.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#162E6A] transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>

      {/* Delete User Modal */}
      <Modal
  isOpen={showDeleteModal}
  onRequestClose={() => setShowDeleteModal(false)}
  className="bg-gray-100 text-gray-900 w-10/12 max-w-sm mx-auto rounded-lg shadow-lg p-8"
  overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
>
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-m font-bold text-red-600">Supprimer un utilisateur</h2>
    <button
      className="p-2 rounded-full hover:bg-gray-300 transition-colors"
      onClick={() => setShowDeleteModal(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
  <p className="text-gray-700 mb-6">
    Êtes-vous sûr de vouloir supprimer cet utilisateur ?
  </p>
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

export default UserManagementPage;