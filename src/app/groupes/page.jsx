"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { api, getGroups, getGroupMembers, getUsers, getCurrentUser, getUnits } from "/src/api";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
const UserGroupsPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    membres: [],
  });

  // Requêtes pour obtenir les données
  const { data: groups, refetch: refetchGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });
 console.log("groupes",groups)
  const { data: membres } = useQuery({
    queryKey: ['groupmembres', selectedGroup],
    queryFn: () => getGroupMembers(selectedGroup),
    enabled: !!selectedGroup,
  });

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
  });

  // Mutations pour les opérations CRUD
    const token = getCookie('token'); 
    const headers = {
      Authorization: `Bearer ${token}`
    };
  const createGroupMutation = useMutation({
  mutationFn: async (groupData) => {
    console.log(groupData);
    const response = await api.post("/groupeDistribution/create", groupData, {
          headers: { headers  },
        });
    console.log("response",response.data);
    return response.data; // <-- indispensable 
  },
  onSuccess: () => {
    refetchGroups();
    closeModal();
  }
});


  const editGroupMutation = useMutation({
    mutationFn: async ({ selectedGroup, ...groupData }) => {
      console.log(groupData);
     const response = await api.put(`/groupeDistribution/update/${selectedGroup}`, groupData, {
          headers: { headers  },
        });
      return response.data; 
    },
    onSuccess: () => {
      refetchGroups();
      closeModal();
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      console.log(groupId);
      const response = await api.delete(`/groupeDistribution/${groupId}` ,{
          headers: { headers  },
        });
      return response.data;
    },
    onSuccess: () => {
      refetchGroups();
      closeModal();
      setSelectedGroup(null);
    }
  });

  // Gestionnaires d'événements
  const handleGroupClick = (groupId) => {
    setSelectedGroup(groupId);
  };

  /*const openModal = (type, group = null) => {
  setModalType(type);
  
  if (group) {
    // Pour la modification, on doit transformer les membres du groupe
    const formattedMembers = group.membres ? group.membres.map(member => ({
      id: member.utilisateur?.id || member.unite?.id || null,
      name: member.utilisateur?.name || member.unite?.nom || "",
      type: member.typeMembre // "UTILISATEUR" ou "UNITE"
    })) : [];

    setFormData({ 
      nom: group.nom || "",
      description: group.description || "",
      membres: formattedMembers
    });
  } else {
    // Pour la création
    setFormData({ 
      nom: "", 
      description: "", 
      membres: [] 
    });
  }
  
  setModalOpen(true);
};*/

const openModal = (type, group = null) => {
  setModalType(type);
  
  if (group) {
    console.log("edit");
    // Pour la modification, on doit transformer les membres du groupe
    const formattedMembers = group.membres ? group.membres.map(member => ({
      id: member.utilisateur?.id || member.unite?.id || null,
      name: member.utilisateur?.name || member.unite?.nom || "",
      type: member.typeMembre // "UTILISATEUR" ou "UNITE"
    })) : [];
    setSelectedGroup((group.id));
    setFormData({ 
      nom: group.nom || "",
      description: group.description || "",
      membres: formattedMembers
    });
  } else {
    // Pour la création
    setFormData({ 
      nom: "", 
      description: "", 
      membres: [] 
    });
  }
  
  setModalOpen(true);
};




  const closeModal = () => setModalOpen(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      membres: [...prev.membres, { 
        id: null, 
        name: "", 
        type: "UTILISATEUR" 
      }]
    }));
  };
const handleMemberChange = (index, field, value) => {
  setFormData(prev => {
    const updatedmembres = [...prev.membres];
    
    // Convertir en nombre si nécessaire pour l'id
    const newValue = field === "id" ? Number(value) : value;

    updatedmembres[index] = { 
      ...updatedmembres[index], 
      [field]: newValue 
    };

    return { ...prev, membres: updatedmembres };
  });
};

  

/*const handleMemberTypeChange = (index, type) => {
  setFormData(prev => {
    const updatedMembres = [...prev.membres];
    updatedMembres[index] = { 
      ...updatedMembres[index], 
      type: type,
      id: null,  // Reset l'ID quand on change de type
      name: ""   // Reset le nom quand on change de type
    };
    return { ...prev, membres: updatedMembres };
  });
};*/

const handleMemberTypeChange = (index, type) => {
  setFormData(prev => {
    const updatedMembres = [...prev.membres];
    updatedMembres[index] = { 
      ...updatedMembres[index], 
      type: type,
      id: null,  // Reset l'ID quand on change de type
      name: ""   // Reset le nom quand on change de type
    };
    return { ...prev, membres: updatedMembres };
  });
};

  const handleRemoveMember = (index) => {
    const updatedmembres = formData.membres.filter((_, i) => i !== index);
    setFormData({ ...formData, membres: updatedmembres });
  };

  const handleSubmit = () => {
    if (!formData.nom.trim()) {
      alert("Le nom du groupe est obligatoire");
      return;
    }

   const groupData = {
  id: Number(selectedGroup),
  nom: formData.nom,
  description: formData.description,
  membres: formData.membres.map(member => ({
    typeMembre: member.type, // correspond à l’enum TypeMembre
    utilisateur: member.type === "UTILISATEUR" ? { id: member.id } : null,
    unite: member.type === "UNITE" ? { id: member.id } : null
  }))
};



    if (modalType === "create") {
      console.log("create");
      createGroupMutation.mutate(groupData);
    } else if (modalType === "edit") {
      console.log("selectedgroup",selectedGroup);
      editGroupMutation.mutate({ 
        selectedGroup: selectedGroup, 
        ...groupData 
      });
    } else if (modalType === "delete") {
      deleteGroupMutation.mutate(selectedGroup);
    }
  };

  return (
    <>
      <div className="ml-64 bg-gray-50 min-h-screen">
        {/* En-tête de bienvenue */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>
            Bienvenue {userData?.name}
          </h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>

        {/* Contenu principal */}
        <div className="bg-gray-50 min-h-screen p-6">
          {/* Header de la page */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Groupes d&apos;Utilisateurs</h2>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
              onClick={() => openModal("create")}
            >
              <FaPlus className="mr-2" /> Nouveau Groupe
            </button>
          </div>

          {/* Liste des Groupes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {groups?.map((group) => (
              <div
                key={group.id}
                className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer ${
                  selectedGroup === group.id ? "border-blue-500" : ""
                }`}
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-900">{group.nom}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("edit", group);
                        setSelectedGroup(Number(group.id));
                      }}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("delete", group);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Créé par : {group.createur?.name}</p>
                <p className="text-gray-500 text-sm">Description : {group.description}</p>
              </div>
            ))}
          </div>

          {/* Membres du Groupe Sélectionné */}
        {selectedGroup && (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-4">
    <h3 className="text-xl font-semibold text-blue-900 mb-4">
      Membres du groupe : {groups.find((g) => g.id === selectedGroup)?.nom}
    </h3>

    <ul className="space-y-4">
      {groups.find((g) => g.id === selectedGroup)?.membres.map((member) => (
        <li
          key={member.id}
          className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
          {/* Informations principales */}
          <div>
            <p className="font-medium text-lg">{member.utilisateur?.name || ""}</p>
            {member.utilisateur?.email && (
              <p className="text-gray-500 text-sm">Email : {member.utilisateur.email}</p>
            )}
            {member.utilisateur?.tele && (
              <p className="text-gray-500 text-sm">Téléphone : {member.utilisateur.tele}</p>
            )}
            {member.unite?.nom && (
              <p className="text-gray-500 text-sm">
                Unité organisationnelle : {member.unite.nom}
              </p>
            )}
          </div>

          {/* Badge type membre */}
          <span
            className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-semibold ${
              member.typeMembre === "UTILISATEUR"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {member.typeMembre}
          </span>
        </li>
      ))}
    </ul>

    {groups.find((g) => g.id === selectedGroup)?.membres.length === 0 && (
      <p className="text-gray-400 mt-2">Aucun membre dans ce groupe.</p>
    )}
  </div>
)}

        </div>

        {/* Modal pour Créer/Modifier/Supprimer un Groupe */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-1/2">
              <h3 className="text-lg font-bold mb-4">
                {modalType === "create"
                  ? "Créer un Nouveau Groupe"
                  : modalType === "edit"
                  ? "Modifier le Groupe"
                  : "Supprimer le Groupe"}
              </h3>

              {(modalType === "create" || modalType === "edit") && (
                <form>
                  {/* Champs de base du groupe */}
                  <div className="mb-4">
                    <label className="block font-medium mb-2">Nom du Groupe</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>

                  {/* Gestion des membres */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Membres</h4>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        <FaPlus className="mr-2" /> Ajouter un membre
                      </button>
                    </div>

                    {formData.membres.map((member, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        {/* Sélecteur de type de membre */}
                       <select
                          value={member.type}
                          onChange={(e) => handleMemberTypeChange(index, e.target.value)}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="UTILISATEUR">Utilisateur</option>
                          <option value="UNITE">Unité</option>
                        </select>
                       <select
  value={member.id || ""}
  onChange={(e) => {
    const selectedId = Number(e.target.value); 
    const selectedItem = member.type === "UTILISATEUR"
      ? users.find(u => u.id === selectedId)
      : units.find(u => u.id === selectedId);

    handleMemberChange(index, "id", selectedId);
    handleMemberChange(index, "name", selectedItem?.name || selectedItem?.nom || "");
  }}
  className="flex-grow px-2 py-1 border rounded"
>
  <option value="">Sélectionner...</option>
  {(member.type === "UTILISATEUR" ? users : units).map((item) => (
    <option key={item.id} value={item.id}>
      {item.name || item.nom}
    </option>
  ))}
</select>
                        {/* Bouton de suppression */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </form>
              )}

              {modalType === "delete" && (
                <p>Êtes-vous sûr de vouloir supprimer ce groupe ?</p>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
                >
                  {modalType === "create" 
                    ? "Créer le groupe" 
                    : modalType === "edit" 
                    ? "Modifier le groupe" 
                    : "Supprimer le groupe"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserGroupsPage;