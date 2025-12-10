"use client";
import React, { useState,  useMemo  } from "react";
import Link from "next/link";
import Select from "react-select"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaSearch,
  FaEye,
  FaUser,
  FaClipboardList,
  FaThList,
  FaWarehouse,
  FaPlus,
  FaSignOutAlt,
  FaSave,
  FaTimes,
  FaHome,
  FaBuilding,
  FaGavel,
  FaTools,
  FaUsers,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRuler,
  FaEuroSign,
  FaFileAlt,
  FaUpload,
  FaFile,
  FaProjectDiagram,
} from "react-icons/fa";
import { getCookie, deleteCookie } from "cookies-next";
import { api, getCurrentUser, getLocaux, getProgrammes,getPrestations } from "/src/api";

// Composant pour les sections du formulaire
const FormSection = ({ icon: Icon, title, children, bgColor = "bg-gray-50" }) => (
  <div className={`${bgColor} rounded-lg p-6 mb-6 shadow-sm border border-gray-200`}>
    <div className="flex items-center mb-4">
      <Icon className="text-blue-600 mr-3" size={20} />
      <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

// Composant pour les champs de formulaire
const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  options = null,
  placeholder = "",
  className = "",
  accept = null
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="">Sélectionner...</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
      />
    ) : type === "checkbox" ? (
      <div className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-600">Oui</span>
      </div>
    ) : type === "file" ? (
      <div className="relative">
        <input
          type="file"
          name={name}
          onChange={onChange}
          accept={accept}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {value && (
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <FaFile className="mr-2" />
            <span>{value.name}</span>
          </div>
        )}
      </div>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

// Composant pour les listes dynamiques
const DynamicList = ({ label, items, setItems, placeholder = "Ajouter un élément" }) => {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          <FaPlus size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
            <span className="text-sm text-gray-700">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 transition-colors duration-200"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddCentrePage = () => {
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });




const provinceSymbol = userData?.province?.symbols;
  const [selectedPersonnes, setSelectedPersonnes] = useState([]);

  // Étape 1 : Récupérer toutes les provinces
  const { data: provinces, isLoading: loadingProvinces } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await api.get("http://172.16.20.90/api/internal/v1/provinces", {
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Secret":
            "cEhFIsMu6vvLpZ1KOeFhOLh0rhf42xgdsSfsdDHkRMJyaxaOVu7tTuX2C05OFbtozGV1uMthtkbvMyxGrAEPwK5qDFKy6eHBX29CRcjiDitHlDmjITGVlJZ7g4lZi7mg",
        },
      });
      return res.data;
    },
  });

  // Étape 2 : Trouver la province du user
  const provinceData = provinces?.find((p) => p.symbols === provinceSymbol);
  const provinceId = provinceData?.id;

  // Étape 3 : Charger les personnes de cette province
  const { data: personnes, isLoading: loadingPersonnes } = useQuery({
    queryKey: ["personnesProvince", provinceId],
    queryFn: async () => {
      const res = await api.get(
        `http://172.16.20.90/api/internal/v1/personnes/province/${provinceId}`,
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
    enabled: !!provinceId,
  });
console.log(personnes);
  // Étape 4 : Gérer la sélection multiple








  
  const { data: prestations = [], isLoading, error } = useQuery({
      queryKey: ["prestations"],
      queryFn: getPrestations(),
    });
 // console.log(prestations)
    const { data: programmes = [] } = useQuery({
      queryKey: ["programmes"],
      queryFn: getProgrammes(),
    });
  //console.log(userData);

  // État initial du formulaire
  const [formData, setFormData] = useState({
    // Informations générales
    nomLocalFrancais: "",
    nomLocalArabe: "",
    code: "",
    telephone: "",
    fax: "",
    adresse: "",
    milieu: "",
    type_local: "",
    gestion: "",
    autorise: "",
    capaciteAccueil: "",
    programmeIds: [],
    prestationIds: [],

    // Construction et dimensions
    etat_construction: "",
    date_construction: "",
    superficie_totale_terrain: "",
    surface_batie: "",
    superficie_totale_etages: "",
    nombre_etage: "",
    utilisation: "",

    // Juridique et financier
    propriete: "",
    numero_titre_foncier: "",
    date_achat_local: "",
    date_exploitation_immobiliere: "",
    prix_batiment: "",
    loyer: false,
    litige: false,
    raisons_conflit: "",

    // Équipements
    eau: false,
    electricite: false,
    plan_de_situation: false,
    plans_architecture: false,

    // Autres
    observation: "",
  });
const prestationOptions = useMemo(() => {
    if (!formData.programmeIds.length) return [];
    return prestations
      .filter((p) => formData.programmeIds.includes(p.programme.programmeId))
      .map((p) => ({
        value: p.prestationId,
        label: p.nomPrestation,
      }));
  }, [prestations, formData.programmeIds]);

  const handlePrestationChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      prestationIds: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };



  const personnelOptions = useMemo(() => {
     if (!personnes || !Array.isArray(personnes)) return [];
  return personnes.map((p) => ({
    value: p.id,
    label: p.nom_prenom_fr,
  }));
}, [personnes]);

// Gérer la sélection multi
const handlePersonnelChange = (selectedOptions) => {
  setPersonnelIds(selectedOptions ? selectedOptions.map((opt) => opt.value) : []);
};

const handleResponsableChange = (selectedOption) => {
  if (selectedOption) {
    setResponsableId(selectedOption.value);
    setResponsableNom(selectedOption.label);
  } else {
    setResponsableId(null);
    setResponsableNom(null);
  }
};



  // États pour les fichiers
  const [certificatFile, setCertificatFile] = useState(null);
  const [mappeFile, setMappeFile] = useState(null);

  // États pour les listes dynamiques
  const [composantInput, setComposantInput] = useState([]);
  const [etagesInput, setEtagesInput] = useState([]);
  const [personnelIds, setPersonnelIds] = useState([]);
   const [responsableId, setResponsableId] = useState(null);
   const [responsableNom, setResponsableNom] = useState(null);
  const programmeOptions = programmes.map((p) => ({
    value: p.programmeId,
    label: p.nomProgramme,
  }));
  /*const handleProgrammeChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      programmeIds: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };*/
  const handleProgrammeChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
    setFormData((prev) => ({
      ...prev,
      programmeIds: selectedIds,
      prestationIds: [], // reset prestations si on change les programmes
    }));
  };

  // Options pour les champs select
  const milieuOptions = [
    { value: "urbain", label: "Urbain" },
    { value: "rural", label: "Rural" },
  ];

  const typeLocalOptions = [
    { value: "Centre ou établissement social", label: "Centre ou établissement social" },
    { value: "Direction provinciale", label: "Direction provinciale" },
    { value: "Direction régionale", label: "Direction régionale" },
    { value: "Dépot", label: "Dépot" },
    { value: "Autre", label: "Autre" },
  ];

  const gestionOptions = [
    { value: "Entraide Nationale", label: "Entraide Nationale" },
    { value: "Association", label: "Association" },
    { value: "Autre", label: "Autre" },
  ];

 const proprieteOptions = [
  { value: "Entraide Nationale", label: "Entraide Nationale" },
  { value: "Commune", label: "Commune" },
  { value: "Domaine", label: "Domaine" },
  { value: "Association", label: "Association" },
  { value: "Éducation Nationale", label: "Éducation Nationale" },
  { value: "Santé", label: "Santé" },
  { value: "Force armée royale", label: "Force armée royale" },
  { value: "Jeunesse et Sport", label: "Jeunesse et Sport" },
  { value: "Formation professionnelle", label: "Formation professionnelle" },
  { value: "Promotion Nationale", label: "Promotion Nationale" },
  { value: "Force auxiliaire", label: "Force auxiliaire" },
  { value: "Gendarmerie royale", label: "Gendarmerie royale" },
  { value: "Groupe Al Omrane", label: "Groupe Al Omrane" },
  { value: "Fondation Mohamed V", label: "Fondation Mohamed V" },
  { value: "Administration pénitentiaire", label: "Administration pénitentiaire" },
  { value: "INDH", label: "INDH" },
  { value: "Awqaf", label: "Awqaf" },
  { value: "Eaux et forêts", label: "Eaux et forêts" },
  { value: "Terres de Kish", label: "Terres de Kish" },
  { value: "Groupes dynastiques SOULALITE", label: "Groupes dynastiques SOULALITE" },
  { value: "Une personne", label: "Une personne" },
  { value: "Une entreprise", label: "Une entreprise" },
  { value: "Une coopérative", label: "Une coopérative" },
  { value: "Église", label: "Église" },
  { value: "Croix rouge", label: "Croix rouge" },
  { value: "Croissant rouge", label: "Croissant rouge" },
  { value: "Autre", label: "Autre" }
];


  const etatConstructionOptions = [
    { value: "bon", label: "Bon" },
    { value: "moyen", label: "Moyen" },
    { value: "mauvais", label: "Mauvais" },
  ];

  const autorisationOptions = [
    { value: "oui", label: "Oui" },
    { value: "non", label: "Non" },
    { value: "en cours", label: "En cours" },
  ];
const utilisationOptions = [
    { value: "Utilisé", label: "Utilisé" },
    { value: "Fermé", label: "Fermé" },
    { value: "En rénovation", label: "En rénovation" },
  ];

  // Gestionnaire de changement pour les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleMultiSelectChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setFormData((prev) => ({ ...prev, programmeIds: values }));
  };
  // Gestionnaire de changement pour les fichiers
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === "certificatFile") {
        setCertificatFile(files[0]);
      } else if (name === "mappeFile") {
        setMappeFile(files[0]);
      }
    }
  };

  // Fonction de soumission du formulaire
  const token = getCookie("token");
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const etages_utilises = etagesInput
  .split(",")           // séparer par virgule
  .map(e => e.trim())   // enlever les espaces
  .filter(e => e !== "");
   const composant = composantInput
  .split(",")           // séparer par virgule
  .map(e => e.trim())   // enlever les espaces
  .filter(e => e !== "");
      // Créer l'objet local avec toutes les données
      const localData = {
        ...formData,
        composant: composant,
        etages_utilises: etages_utilises,
        province: {
          id: userData?.province?.id,
        },
        personnelIds: personnelIds.map(id => parseInt(id)),
        programme: formData.programmeIds.map((id) => ({ programmeId: Number(id) })),
        prestation: formData.prestationIds.map((id) => ({ prestationId: id })),
         responsable_id: responsableId ? parseInt(responsableId) : null,
         responsable_nom: responsableNom || null,
      };

      // Créer un FormData pour envoyer les fichiers et les données
      const formDataToSend = new FormData();
      
      // Pour @RequestPart, créer un blob avec le type application/json
      const localBlob = new Blob([JSON.stringify(localData)], {
        type: 'application/json'
      });
      formDataToSend.append('local', localBlob);
      
      // Ajouter les fichiers s'ils existent
      if (certificatFile) {
        formDataToSend.append('certificatFile', certificatFile);
      }
      if (mappeFile) {
        formDataToSend.append('mappeFile', mappeFile);
      }

      console.log("formDataToSend",localData);
     // console.log("FormData entries:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      // Envoyer la requête avec FormData
     const response = await api.post('/locaux', formDataToSend, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Centre ajouté avec succès !");
      // Rediriger vers la liste des locaux
      window.location.href = "/locaux";
      
    } catch (error) {
      console.error("Erreur lors de l'ajout du centre:", error);
      alert("Erreur lors de l'ajout du centre. Veuillez réessayer.");
    }
  };

  const logout = () => {
    deleteCookie("token");
    window.location.href = "/login";
  };

  return (
  <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar remains unchanged */}
      

      {/* Main Content Area - Style inspiré du design existant */}
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>
            Bienvenue {userData?.name}
          </h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>
       
        <div className="p-3 bg-gray-50">
          {/* Header */}
        <div className="p-3">
            <h2 className="text-2xl font-bold text-blue-900">Ajouter un nouveau centre</h2>
           
          </div>

          <form onSubmit={handleSubmit}>
            {/* Section Informations Générales */}
            <FormSection icon={FaHome} title="Informations Générales" bgColor="bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  label="Nom en français"
                  name="nomLocalFrancais"
                  value={formData.nomLocalFrancais}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom du centre en français"
                />
                <FormField
                  label="Nom en arabe"
                  name="nomLocalArabe"
                  value={formData.nomLocalArabe}
                  onChange={handleInputChange}
                  placeholder="اسم المركز بالعربية"
                />
                <FormField
                  label="Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="Code unique du centre"
                />
                <FormField
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="0X XX XX XX XX"
                />
                <FormField
                  label="Fax"
                  name="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={handleInputChange}
                  placeholder="0X XX XX XX XX"
                />
                <FormField
                  label="Type de local"
                  name="type_local"
                  type="select"
                  value={formData.type_local}
                  onChange={handleInputChange}
                  options={typeLocalOptions}
                  required
                />
                <FormField
                  label="Milieu"
                  name="milieu"
                  type="select"
                  value={formData.milieu}
                  onChange={handleInputChange}
                  options={milieuOptions}
                  required
                />
                <FormField
                  label="Gestion"
                  name="gestion"
                  type="select"
                  value={formData.gestion}
                  onChange={handleInputChange}
                  options={gestionOptions}
                  required
                />
                <FormField
                  label="Autorisé"
                  name="autorise"
                  type="select"
                  value={formData.autorise}
                  onChange={handleInputChange}
                  options={autorisationOptions}
                  required
                />
              </div>
              <FormField
                label="Adresse complète"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                required
                placeholder="Adresse complète du centre"
                className="mt-4"
              />
              <FormField
                label="Capacité d'accueil"
                name="capaciteAccueil"
                type="number"
                value={formData.capaciteAccueil}
                onChange={handleInputChange}
                placeholder="Nombre de personnes"
              />
            </FormSection>

            {/* Section Construction & Dimensions */}
            <FormSection icon={FaBuilding} title="Construction & Dimensions" bgColor="bg-green-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  label="État de construction"
                  name="etat_construction"
                  type="select"
                  value={formData.etat_construction}
                  onChange={handleInputChange}
                  options={etatConstructionOptions}
                  required
                />
                <FormField
                  label="Date de construction"
                  name="date_construction"
                  type="date"
                  value={formData.date_construction}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Nombre d'étages"
                  name="nombre_etage"
                  type="number"
                  value={formData.nombre_etage}
                  onChange={handleInputChange}
                  placeholder="Nombre d'étages"
                />
                <FormField
                  label="Superficie totale terrain (m²)"
                  name="superficie_totale_terrain"
                  type="number"
                  value={formData.superficie_totale_terrain}
                  onChange={handleInputChange}
                  placeholder="Superficie en m²"
                />
                <FormField
                  label="Surface bâtie (m²)"
                  name="surface_batie"
                  type="number"
                  value={formData.surface_batie}
                  onChange={handleInputChange}
                  placeholder="Surface en m²"
                />
                <FormField
                  label="Superficie totale étages (m²)"
                  name="superficie_totale_etages"
                  type="number"
                  value={formData.superficie_totale_etages}
                  onChange={handleInputChange}
                  placeholder="Superficie en m²"
                />
              </div>





              <FormField
                label="Utilisation"
                name="utilisation"
                type="select"
                value={formData.utilisation}
                onChange={handleInputChange}
                options={utilisationOptions}
                required
              />
            </FormSection>

            {/* Section Juridique & Financière */}
            <FormSection icon={FaGavel} title="Situation Juridique & Financière" bgColor="bg-purple-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  label="Propriété"
                  name="propriete"
                  type="select"
                  value={formData.propriete}
                  onChange={handleInputChange}
                  options={proprieteOptions}
                  required
                />
                <FormField
                  label="Numéro titre foncier"
                  name="numero_titre_foncier"
                  value={formData.numero_titre_foncier}
                  onChange={handleInputChange}
                  placeholder="Numéro du titre foncier"
                />
                <FormField
                  label="Prix du bâtiment (MAD)"
                  name="prix_batiment"
                  type="number"
                  value={formData.prix_batiment}
                  onChange={handleInputChange}
                  placeholder="Prix en MAD"
                />
                <FormField
                  label="Date d'achat"
                  name="date_achat_local"
                  type="date"
                  value={formData.date_achat_local}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Date exploitation immobilière"
                  name="date_exploitation_immobiliere"
                  type="date"
                  value={formData.date_exploitation_immobiliere}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Loyer"
                  name="loyer"
                  type="checkbox"
                  value={formData.loyer}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Litige"
                  name="litige"
                  type="checkbox"
                  value={formData.litige}
                  onChange={handleInputChange}
                />
              </div>
              {formData.litige && (
                <FormField
                  label="Raisons du conflit"
                  name="raisons_conflit"
                  type="textarea"
                  value={formData.raisons_conflit}
                  onChange={handleInputChange}
                  placeholder="Décrivez les raisons du conflit..."
                  className="mt-4"
                />
              )}
            </FormSection>
             <FormSection icon={FaProjectDiagram} title="Programmes et Préstations" bgColor="bg-teal-50">
             
              <div>
        <label className="block font-medium mb-2">Programmes</label>
        <Select
          isMulti
          options={programmeOptions}
          value={programmeOptions.filter((opt) =>
            formData.programmeIds.includes(opt.value)
          )}
          onChange={handleProgrammeChange}
          placeholder="Sélectionner un ou plusieurs programmes..."
        />
      </div>

      {/* Prestations */}
      <div>
        <label className="block font-medium mb-2">Prestations</label>
        <Select
          isMulti
          isDisabled={!formData.programmeIds.length}
          options={prestationOptions}
          value={prestationOptions.filter((opt) =>
            formData.prestationIds.includes(opt.value)
          )}
          onChange={handlePrestationChange}
          placeholder={
            formData.programmeIds.length
              ? "Sélectionner les prestations..."
              : "Choisir d’abord un programme"
          }
        />
      </div>

            </FormSection>
            {/* Section Documents */}
            <FormSection icon={FaUpload} title="Documents & Fichiers" bgColor="bg-teal-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Certificat"
                  name="certificatFile"
                  type="file"
                  value={certificatFile}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  placeholder="Sélectionner le certificat"
                />
                <FormField
                  label="Mappe"
                  name="mappeFile"
                  type="file"
                  value={mappeFile}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  placeholder="Sélectionner la mappe"
                />
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <FaFileAlt className="inline mr-2" />
                  Formats acceptés: PDF, JPG, JPEG, PNG, DOC, DOCX (Taille max: 10MB par fichier)
                </p>
              </div>
            </FormSection>

            {/* Section Équipements */}
            <FormSection icon={FaTools} title="Équipements & Commodités" bgColor="bg-yellow-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  label="Eau"
                  name="eau"
                  type="checkbox"
                  value={formData.eau}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Électricité"
                  name="electricite"
                  type="checkbox"
                  value={formData.electricite}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Plan de situation"
                  name="plan_de_situation"
                  type="checkbox"
                  value={formData.plan_de_situation}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Plans d'architecture"
                  name="plans_architecture"
                  type="checkbox"
                  value={formData.plans_architecture}
                  onChange={handleInputChange}
                />
              </div>
            </FormSection>
             
            {/* Section Composants et Étages */}
            <FormSection icon={FaThList} title="Composants & Étages" bgColor="bg-indigo-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="mb-4">
  <label className="block font-medium mb-1">Composants du local</label>
  <input
    type="text"
    placeholder="Ex: Chambre 1, Cuisine, Salon"
    value={composantInput}
    onChange={(e) => setComposantInput(e.target.value)}
    className="border rounded p-2 w-full"
  />
</div>

<div className="mb-4">
  <label className="block font-medium mb-1">Étages utilisés</label>
  <input
    type="text"
    placeholder="Ex: Rez-de-chaussée, 1er étage"
    value={etagesInput}
    onChange={(e) => setEtagesInput(e.target.value)}
    className="border rounded p-2 w-full"
  />
</div>

              </div>
            </FormSection>

            {/* Section Personnel */}
           <div className="mb-4">
  <label className="block font-medium mb-2">Personnel</label>
  <Select
    isMulti
    options={personnelOptions}
    value={personnelOptions.filter((opt) =>
      personnelIds.includes(opt.value)
    )}
    onChange={handlePersonnelChange}
    placeholder="Sélectionner une ou plusieurs personnes..."
  />
</div>

  <div className="mb-4">
  <label className="block font-medium mb-2">Responsable de centre</label>
  <Select
    options={personnelOptions}
    value={
      personnelOptions.find((opt) => opt.value === responsableId) || null
    }
    onChange={handleResponsableChange}
    placeholder="Sélectionner une personne..."
    isClearable
  />
</div>



            {/* Section Observations */}
            <FormSection icon={FaFileAlt} title="Observations" bgColor="bg-gray-50">
              <FormField
                label="Observations"
                name="observation"
                type="textarea"
                value={formData.observation}
                onChange={handleInputChange}
                placeholder="Ajoutez vos observations et remarques ici..."
              />
            </FormSection>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 mt-8 mb-6">
              <Link
                href="/locaux"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                <FaTimes size={16} />
                Annuler
              </Link>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <FaSave size={16} />
                Enregistrer le centre
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCentrePage;