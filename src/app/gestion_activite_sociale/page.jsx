"use client";

import React, { useState } from "react";

import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  FaEye,
  FaHome,
  FaBuilding,
  FaGavel,
  FaTools,
  FaThList,
  FaTasks,
  FaCogs,
  FaUsers,
  FaFileAlt,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle, 
} from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie, deleteCookie } from "cookies-next";
import {
  api,
  getCurrentUser,
  getLocaux,
} from "/src/api";


 
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-900 text-white">
          <h2 className="text-xl font-bold">Détails du Local</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalSection = ({ icon: Icon, title, children, bgColor = "bg-gray-50" }) => (
  <div className={`${bgColor} rounded-lg p-4 mb-4`}>
    <div className="flex items-center mb-3">
      <Icon className="text-blue-600 mr-2" size={18} />
      <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

// Composant pour les informations en grille
const InfoGrid = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {data.map((item, index) => (
      <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
          {item.label}
        </div>
        <div className="text-sm font-medium text-gray-900">
          {item.value || "N/A"}
        </div>
      </div>
    ))}
  </div>
);

// Composant pour les badges de statut
const StatusBadge = ({ status, label }) => (
  <div className="flex items-center">
    <span className="text-sm text-gray-600 mr-2">{label}:</span>
    {status ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheckCircle className="mr-1" size={12} />
        Oui
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimesCircle className="mr-1" size={12} />
        Non
      </span>
    )}
  </div>
);

// Composant pour les prestations
const PrestationCard = ({ prestation }) => (
  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-800">{prestation.nomPrestation}</h4>
      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
        {prestation.typePrestation?.type_prestation}
      </span>
    </div>
    <div className="space-y-1 text-sm text-gray-600">
      <p><strong>Date de lancement:</strong> {prestation.dateLancement}</p>
      <p><strong>Description:</strong> {prestation.description}</p>
      {prestation.programme && (
        <div className="mt-2 p-2 bg-gray-50 rounded">
          <p className="text-xs font-medium text-gray-700">Programme associé:</p>
          <p className="text-xs text-gray-600">{prestation.programme.nomProgramme}</p>
        </div>
      )}
    </div>
  </div>
);

// Composant pour les programmes
const ProgrammeCard = ({ programme }) => (
  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
    <h4 className="font-medium text-gray-800 mb-2">{programme.nomProgramme}</h4>
    <div className="space-y-1 text-sm text-gray-600">
      <p><strong>Date de lancement:</strong> {programme.datedeLancement}</p>
      <p><strong>Description:</strong> {programme.description}</p>
    </div>
  </div>
);

const ListSection = ({ title, items, emptyMessage = "Aucun élément" }) => (
  <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
    <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
    {items && items.length > 0 ? (
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
    )}
  </div>
);

const PrestationManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCentre, setSelectedCentre] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // États séparés pour chaque modal - FIX PRINCIPAL
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [editFormData, setEditFormData] = useState(null);

  const queryClient = useQueryClient();
const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  
const { data: personnes = [] } = useQuery({
  queryKey: ["personnesProvince", userData?.province?.symbols],
  queryFn: async () => {
    // Récupérer l'id de la province à partir du symbol
    const provincesRes = await api.get("http://172.16.20.90/api/internal/v1/provinces", {
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret":
          "cEhFIsMu6vvLpZ1KOeFhOLh0rhf42xgdsSfsdDHkRMJyaxaOVu7tTuX2C05OFbtozGV1uMthtkbvMyxGrAEPwK5qDFKy6eHBX29CRcjiDitHlDmjITGVlJZ7g4lZi7mg",
      },
    });
    const province = provincesRes.data.find((p) => p.symbols === userData?.province?.symbols);
    if (!province) return [];
    const res = await api.get(
      `http://172.16.20.90/api/internal/v1/personnes/province/${province.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret":
            "cEhFIsMu6vvLpZ1KOeFhOLh0rhf42xgdsSfsdDHkRMJyaxaOVu7tTuX2C05OFbtozGV1uMthtkbvMyxGrAEPwK5qDFKy6eHBX29CRcjiDitHlDmjITGVlJZ7g4lZi7mg",
        },
      }
    );
    return res.data;
  },
  enabled: !!userData?.province?.symbols,
});

 

  const { data: locaux = [], isLoading } = useQuery({
    queryKey: ["locaux"],
    queryFn: getLocaux(),
  });
console.log(locaux);
 const token = getCookie("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Effect pour initialiser le formulaire d'édition
  React.useEffect(() => {
    if (selectedCentre && showEditModal) {
      setEditFormData({
        nomLocalFrancais: selectedCentre.nomLocalFrancais || "",
        nomLocalArabe: selectedCentre.nomLocalArabe || "",
        province: {
    id: selectedCentre.province?.id || null,  // récupère l'id existant
    // tu peux aussi envoyer d'autres champs si nécessaire
  },
        code: selectedCentre.code || "",
        type_local: selectedCentre.type_local?.trim().toLowerCase() || "",
        adresse: selectedCentre.adresse || "",
        milieu: selectedCentre.milieu || "",
        province: selectedCentre.province?.delegation || "",
        telephone: selectedCentre.telephone || "",
        fax: selectedCentre.fax || "",
        gestion: selectedCentre.gestion || "",
        autorise: selectedCentre.autorise || "",
        capaciteAccueil: selectedCentre.capaciteAccueil || "",
        etat_construction: selectedCentre.etat_construction || "",
        date_construction: selectedCentre.date_construction || "",
        superficie_totale_terrain: selectedCentre.superficie_totale_terrain || "",
        surface_batie: selectedCentre.surface_batie || "",
        superficie_totale_etages: selectedCentre.superficie_totale_etages || "",
        nombre_etage: selectedCentre.nombre_etage || "",
        utilisation: selectedCentre.utilisation || "",
        propriete: selectedCentre.propriete || "",
        numero_titre_foncier: selectedCentre.numero_titre_foncier || "",
        date_achat_local: selectedCentre.date_achat_local || "",
        date_exploitation_immobiliere: selectedCentre.date_exploitation_immobiliere || "",
        prix_batiment: selectedCentre.prix_batiment || "",
        raisons_conflit: selectedCentre.raisons_conflit || "",
        loyer: selectedCentre.loyer || false,
        litige: selectedCentre.litige || false,
        eau: selectedCentre.eau || false,
        electricite: selectedCentre.electricite || false,
        plan_de_situation: selectedCentre.plan_de_situation || false,
        plans_architecture: selectedCentre.plans_architecture || false,
        composant: selectedCentre.composant?.join(", ") || [],
        etages_utilises: selectedCentre.etages_utilises?.join(", ") || [],
        observation: selectedCentre.observation || "",
        prestation: selectedCentre?.prestation || [],
        personnelIds: selectedCentre?.personnelIds || [],
        certificat_propriete: selectedCentre.certificat_propriete || null,
        mappe_cadastrale: selectedCentre.mappe_cadastrale || null,
      });
    }
  }, [selectedCentre, showEditModal]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
// const localId = selectedCentre.localId;
  const editMutation = useMutation({
    mutationFn: ( data) => {
      console.log("Données envoyées en PUT:", data);
      console.log("headers envoyées en PUT:", headers);
      return api.put(`/locaux/${selectedCentre.localId}`, data, { headers });

    },
    onSuccess: (data) => {
     queryClient.invalidateQueries(["locaux"]);
      setSelectedCentre(data);
      setShowEditModal(false);
    },
   onError: (error) => {
    // Si tu utilises axios, error.response.data contient souvent l’erreur serveur
    const message =
      error.response?.data?.message ||
      error.message ||
      "Erreur inconnue lors de la mise à jour";
    alert(`Erreur lors de la mise à jour : ${message}`);
  },
});

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Convertir les chaînes de composants et étages en tableaux
    const formDataToSubmit = {
      ...editFormData,
      composant: editFormData.composant ? editFormData.composant.split(", ").filter(c => c.trim()) : [],
      etages_utilises: editFormData.etages_utilises ? editFormData.etages_utilises.split(", ").filter(e => e.trim()) : [],
    };
    editMutation.mutate(formDataToSubmit);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/locaux/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries(["locaux"]);
      setShowDeleteModal(false);
      setSelectedCentre(null);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(selectedCentre.id);
  };

  const itemsPerPage = 10;

  const filteredLocaux = locaux.filter((centre) =>
    centre.nomLocalFrancais?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLocaux.length / itemsPerPage);
  const paginatedLocaux = filteredLocaux.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
        <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
        <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
      </div>

      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Liste des Locaux</h2>
        </div>

        <div className="flex space-x-4 mb-6">
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
            <Search className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un local..."
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
                  <th className="py-2 px-4 border-b">Adresse</th>
                  <th className="py-2 px-4 border-b">Téléphone</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Code</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLocaux.map((centre) => (
                  <tr key={centre.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{centre.nomLocalFrancais}</td>
                    <td className="py-2 px-4 border-b">{centre.adresse}</td>
                    <td className="py-2 px-4 border-b">{centre.telephone}</td>
                    <td className="py-2 px-4 border-b">{centre.type_local}</td>
                    <td className="py-2 px-4 border-b">{centre.code}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() => {
                          setSelectedCentre(centre);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FaEye /> Détails
                      </button>
                      <button
                        className="text-green-600 hover:underline flex items-center gap-1"
                        onClick={() => {
                          setSelectedCentre(centre);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit size={16} /> Modifier
                      </button>
                      <button
                        className="text-red-600 hover:underline flex items-center gap-1"
                        onClick={() => {
                          setSelectedCentre(centre);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 size={16} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded border ${
                currentPage === index + 1 ? "bg-gray-300" : ""
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Modal Détails */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCentre(null);
          }}
        >
          {selectedCentre && (
            <div className="p-6">
              {/* En-tête avec le nom du local */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCentre.nomLocalFrancais}
                </h2>
                <p className="text-gray-600 text-lg">
                  {selectedCentre.nomLocalArabe}
                </p>
              </div>

              {/* Section Informations Générales */}
              <ModalSection icon={FaHome} title="Informations Générales" bgColor="bg-blue-50">
                <InfoGrid
                  data={[
                    { label: "Code", value: selectedCentre.code },
                    { label: "Type de local", value: selectedCentre.type_local },
                    { label: "Adresse", value: selectedCentre.adresse },
                    { label: "Milieu", value: selectedCentre.milieu },
                    { label: "Province", value: selectedCentre.province?.province  },
                    { label: "Téléphone", value: selectedCentre.telephone },
                    { label: "Fax", value: selectedCentre.fax },
                    { label: "Gestion", value: selectedCentre.gestion },
                    { label: "Autorisé", value: selectedCentre.autorise },
                    { label: "Capacité d'accueil", value: selectedCentre.capaciteAccueil + " personnes" },
                  ]}
                />
              </ModalSection>

              {/* Section Construction & Dimensions */}
              <ModalSection icon={FaBuilding} title="Construction & Dimensions" bgColor="bg-green-50">
                <InfoGrid
                  data={[
                    { label: "État de construction", value: selectedCentre.etat_construction },
                    { label: "Date de construction", value: selectedCentre.date_construction },
                    { label: "Superficie totale terrain", value: selectedCentre.superficie_totale_terrain + " m²" },
                    { label: "Surface bâtie", value: selectedCentre.surface_batie + " m²" },
                    { label: "Superficie totale étages", value: selectedCentre.superficie_totale_etages + " m²" },
                    { label: "Nombre d'étages", value: selectedCentre.nombre_etage },
                    { label: "Utilisation", value: selectedCentre.utilisation },
                  ]}
                />
              </ModalSection>

              {/* Section Juridique & Financière */}
              <ModalSection icon={FaGavel} title="Situation Juridique & Financière" bgColor="bg-purple-50">
                <InfoGrid
                  data={[
                    { label: "Propriété", value: selectedCentre.propriete },
                    { label: "Numéro titre foncier", value: selectedCentre.numero_titre_foncier },
                    { label: "Date d'achat", value: selectedCentre.date_achat_local },
                    { label: "Date exploitation immobilière", value: selectedCentre.date_exploitation_immobiliere },
                    { label: "Prix du bâtiment", value: selectedCentre.prix_batiment + " MAD" },
                    { label: "Raisons de conflit", value: selectedCentre.raisons_conflit },
                  ]}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatusBadge status={selectedCentre.loyer} label="Loyer" />
                  <StatusBadge status={selectedCentre.litige} label="Litige" />
                </div>
              </ModalSection>

              {/* Section Équipements */}
              <ModalSection icon={FaTools} title="Équipements & Commodités" bgColor="bg-yellow-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatusBadge status={selectedCentre.eau} label="Eau" />
                  <StatusBadge status={selectedCentre.electricite} label="Électricité" />
                  <StatusBadge status={selectedCentre.plan_de_situation} label="Plan de situation" />
                  <StatusBadge status={selectedCentre.plans_architecture} label="Plans d'architecture" />
                </div>
              </ModalSection>

              {/* Section Composants et Étages */}
              <ModalSection icon={FaThList} title="Composants & Étages" bgColor="bg-indigo-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ListSection
  title="Composants du local"
  items={Array.isArray(selectedCentre?.composant) ? selectedCentre.composant : []}
  emptyMessage="Aucun composant défini"
/>

                  <ListSection
                    title="Étages utilisés"
                    items={selectedCentre.etages_utilises}
                    emptyMessage="Aucun étage utilisé"
                  />
                </div>
              </ModalSection>

 {selectedCentre.programme?.length > 0 && (
                <ModalSection icon={FaCogs} title="Programmes" bgColor="bg-pink-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCentre.programme.map((programme) => (
                      <ProgrammeCard key={programme.programmeId} programme={programme} />
                    ))}
                  </div>
                </ModalSection>
              )}

              {/* Section Prestations */}
            {Array.isArray(selectedCentre.prestation) && selectedCentre.prestation.length > 0 ? (
  <ModalSection icon={FaTasks} title="Prestations" bgColor="bg-teal-50">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {selectedCentre.prestation.map((prestation, idx) => (
        <PrestationCard key={prestation.prestationId || idx} prestation={prestation} />
      ))}
    </div>
  </ModalSection>
) : (
    <ModalSection icon={FaTasks} title="Prestations" bgColor="bg-teal-50">
  <p className="text-gray-500 italic">Aucune prestation associée</p>
  </ModalSection>
)}


            
             

              {/* Section Personnel */}
             <ModalSection icon={FaUsers} title="Personnel" bgColor="bg-orange-50">
  <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">



{selectedCentre.responsable_nom ? (
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-700">
          Responsable du centre :{" "}
          <span className="font-semibold text-gray-900">
            {selectedCentre.responsable_nom}
          </span>
        </p>
      </div>
    ) : (
      <p className="text-sm text-gray-500 italic mb-2">
        Aucun responsable assigné
      </p>
    )}



    {selectedCentre.personnelIds?.length > 0 ? (
      <>
        <p className="text-sm text-gray-600 mb-2">
          Personnel assigné:{" "}
          {selectedCentre.personnelIds
            .map((id) => {
              const person = personnes.find((p) => p.id === id);
              return person ? person.nom_prenom_fr : `ID ${id}`;
            })
            .join(", ")}
        </p>
        <p className="text-xs text-gray-500">
          Total: {selectedCentre.personnelIds.length} personne(s)
        </p>
      </>
    ) : (
      <p className="text-sm text-gray-500 italic">Aucun personnel assigné</p>
    )}
  </div>
</ModalSection>


              {/* Section Observations */}
              {selectedCentre.observation && (
                <ModalSection icon={FaFileAlt} title="Observations" bgColor="bg-gray-50">
                  <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCentre.observation}
                    </p>
                  </div>
                </ModalSection>
              )}

              {/* Section Documents */}
             <ModalSection icon={FaFileAlt} title="Documents" bgColor="bg-red-50">
  <InfoGrid
    data={[
      {
        label: "Certificat de propriété",
        value: selectedCentre.certificat_propriete ? (
          <a
            href={`data:application/pdf;base64,${selectedCentre.certificat_propriete}`}
            download="certificat_propriete.pdf"
            className="text-blue-600 underline"
          >
            Télécharger
          </a>
        ) : (
          "Non disponible"
        ),
      },
      {
        label: "Mappe cadastrale",
        value: selectedCentre.mappe_cadastrale ? (
          <a
            href={`data:application/pdf;base64,${selectedCentre.mappe_cadastrale}`}
            download="mappe_cadastrale.pdf"
            className="text-blue-600 underline"
          >
            Télécharger
          </a>
        ) : (
          "Non disponible"
        ),
      },
    ]}
  />
</ModalSection>

            </div>
          )}
        </Modal>

        {/* Modal Modification - COMPLET AVEC TOUS LES CHAMPS */}
        <Modal 
          isOpen={showEditModal} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedCentre(null);
            setEditFormData(null);
          }}
        >
          {editFormData && (
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Modifier le local</h3>

              {/* Section Informations Générales */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-blue-800 flex items-center">
                  <FaHome className="mr-2" />
                  Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Nom Local (Français) *</label>
                    <input
                      name="nomLocalFrancais"
                      value={editFormData.nomLocalFrancais}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Nom Local (Arabe)</label>
                    <input
                      name="nomLocalArabe"
                      value={editFormData.nomLocalArabe}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Code</label>
                    <input
                      name="code"
                      value={editFormData.code}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                <div>
  <label className="block mb-1 font-medium text-sm">Type de local</label>
  <select
    name="type_local"
    value={editFormData.type_local || ""}
    onChange={handleEditChange}
    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
    {!editFormData.type_local && (
      <option value="">-- Sélectionner --</option>
    )}
    <option value="Délégation">Délégation</option>
    <option value="Coordination">Coordination</option>
    <option value="Centre social">Centre social</option>
    
    <option value="Dépôt">Dépôt</option>
    <option value="Autre">Autre</option>
  </select>
</div>


                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium text-sm">Adresse</label>
                    <input
                      name="adresse"
                      value={editFormData.adresse}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Milieu</label>
                    <select
                      name="milieu"
                      value={editFormData.milieu}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                       
                      
                       <option value="Rural">Rural</option>
                        <option value="Urbain">Urbain</option>
    
                     </select>
          
                  </div>
                <div>
  <label className="block mb-1 font-medium text-sm">Province</label>
  <input
    name="provinceNom"
    value={editFormData.provinceNom}
    className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
    readOnly
  />
</div>

                  <div>
                    <label className="block mb-1 font-medium text-sm">Téléphone</label>
                    <input
                      name="telephone"
                      value={editFormData.telephone}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Fax</label>
                    <input
                      name="fax"
                      value={editFormData.fax}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Gestion</label>
                    <select
                      name="gestion"
                      value={editFormData.gestion}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Entraide Nationale">Entraide Nationale</option>
                      <option value="Association">Association</option>
                      <option value="Autre">Autre</option>
    
                     </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Autorisé</label>
                    <select
                      name="autorise"
                      value={editFormData.autorise}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >

                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    
    
                     </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Capacité d'accueil</label>
                    <input
                      name="capaciteAccueil"
                      type="number"
                      value={editFormData.capaciteAccueil}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section Construction & Dimensions */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-green-800 flex items-center">
                  <FaBuilding className="mr-2" />
                  Construction & Dimensions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">État de construction</label>
                    <select
                      name="etat_construction"
                      value={editFormData.etat_construction}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Bon">Bon</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Mauvais">Mauvais</option>
    
                     </select>
                  </div>
                 <div>
  <label className="block mb-1 font-medium text-sm">Date de construction</label>
  <input
    name="date_construction"
    type="date"
    value={editFormData.date_construction || ""}
    onChange={handleEditChange}
    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
</div>

                  <div>
                    <label className="block mb-1 font-medium text-sm">Superficie totale terrain (m²)</label>
                    <input
                      name="superficie_totale_terrain"
                      type="number"
                      value={editFormData.superficie_totale_terrain}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Surface bâtie (m²)</label>
                    <input
                      name="surface_batie"
                      type="number"
                      value={editFormData.surface_batie}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Superficie totale étages (m²)</label>
                    <input
                      name="superficie_totale_etages"
                      type="number"
                      value={editFormData.superficie_totale_etages}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Nombre d'étages</label>
                    <input
                      name="nombre_etage"
                      type="number"
                      value={editFormData.nombre_etage}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium text-sm">Utilisation</label>
                    <select
                      name="utilisation"
                      value={editFormData.utilisation}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Utilisé">Utilisé</option>
                      <option value="Fermé">Fermé</option>
                      <option value="En rénovation">En rénovation</option>
    
                     </select>
                  </div>
                </div>
              </div>

              {/* Section Juridique & Financière */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-purple-800 flex items-center">
                  <FaGavel className="mr-2" />
                  Situation Juridique & Financière
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Propriété</label>
                    <select
                      name="propriete"
                      value={editFormData.propriete}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Entraide Nationale">Entraide Nationale</option>
                      <option value="Commune">Commune</option>
                      <option value="Domaine">Domaine</option>
                      <option value="Association">Association</option>
                      <option value="Autre">Autre</option>
                     </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Numéro titre foncier</label>
                    <input
                      name="numero_titre_foncier"
                      value={editFormData.numero_titre_foncier}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Date d'achat</label>
                    <input
                      name="date_achat_local"
                      type="date"
                      value={editFormData.date_achat_local}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Date exploitation immobilière</label>
                    <input
                      name="date_exploitation_immobiliere"
                      type="date"
                      value={editFormData.date_exploitation_immobiliere}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Prix du bâtiment (MAD)</label>
                    <input
                      name="prix_batiment"
                      type="number"
                      value={editFormData.prix_batiment}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Raisons de conflit</label>
                    <input
                      name="raisons_conflit"
                      value={editFormData.raisons_conflit}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="loyer"
                      checked={editFormData.loyer}
                      onChange={handleEditChange}
                      id="edit-loyer"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-loyer" className="text-sm font-medium">Loyer</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="litige"
                      checked={editFormData.litige}
                      onChange={handleEditChange}
                      id="edit-litige"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-litige" className="text-sm font-medium">Litige</label>
                  </div>
                </div>
              </div>

              {/* Section Équipements */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-yellow-800 flex items-center">
                  <FaTools className="mr-2" />
                  Équipements & Commodités
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="eau"
                      checked={editFormData.eau}
                      onChange={handleEditChange}
                      id="edit-eau"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-eau" className="text-sm font-medium">Eau</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="electricite"
                      checked={editFormData.electricite}
                      onChange={handleEditChange}
                      id="edit-electricite"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-electricite" className="text-sm font-medium">Électricité</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="plan_de_situation"
                      checked={editFormData.plan_de_situation}
                      onChange={handleEditChange}
                      id="edit-plan-situation"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-plan-situation" className="text-sm font-medium">Plan de situation</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="plans_architecture"
                      checked={editFormData.plans_architecture}
                      onChange={handleEditChange}
                      id="edit-plans-architecture"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-plans-architecture" className="text-sm font-medium">Plans d'architecture</label>
                  </div>
                </div>
              </div>

              {/* Section Composants et Étages */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-indigo-800 flex items-center">
                  <FaThList className="mr-2" />
                  Composants & Étages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Composants du local (séparés par des virgules)</label>
                    <textarea
                      name="composant"
                      value={editFormData.composant}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Salle de réunion, Bureau administratif, Cuisine"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Étages utilisés (séparés par des virgules)</label>
                    <textarea
                      name="etages_utilises"
                      value={editFormData.etages_utilises}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Rez-de-chaussée, 1er étage, 2ème étage"
                    />
                  </div>
                </div>
              </div>

              {/* Section Observations */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Observations
                </h4>
                <div>
                  <label className="block mb-1 font-medium text-sm">Observations</label>
                  <textarea
                    name="observation"
                    value={editFormData.observation}
                    onChange={handleEditChange}
                    rows="4"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observations générales sur le local..."
                  />
                </div>
              </div>

              {/* Section Documents */}
           {/*   <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-4 text-red-800 flex items-center">
                  <FaFileAlt className="mr-2" />
                  Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="certificat_propriete"
                      checked={editFormData.certificat_propriete}
                      onChange={handleEditChange}
                      id="edit-certificat"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-certificat" className="text-sm font-medium">Certificat de propriété</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="mappe_cadastrale"
                      checked={editFormData.mappe_cadastrale}
                      onChange={handleEditChange}
                      id="edit-mappe"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-mappe" className="text-sm font-medium">Mappe cadastrale</label>
                  </div>
                </div>
              </div>*/}

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCentre(null);
                    setEditFormData(null);
                  }}
                  className="px-6 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isLoading}
                  className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editMutation.isLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full mr-2"></span>
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder"
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && selectedCentre && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer le local <span className="font-semibold">"{selectedCentre.nomLocalFrancais}"</span> ?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Cette action est irréversible.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCentre(null);
                  }}
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDelete}
                  disabled={deleteMutation.isLoading}
                >
                  {deleteMutation.isLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full mr-2"></span>
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestationManagementPage;