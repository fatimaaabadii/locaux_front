"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {api,getCurrentUser,
  getDomaines,
  getPartenariats,
  getPopulationsCibles,
  getContributionsEntraide,
  getContributionsPartenaires,
  getTypesCentre,
} from "/src/api";



import { setCookie, getCookie, deleteCookie } from "cookies-next";

const AddPartenariatPage = () => {
  // Chargement des listes depuis APIs
  const { data: domaines } = useQuery({ queryKey: ["domaines"], queryFn: getDomaines() });
  const { data: populations } = useQuery({ queryKey: ["populations"], queryFn: getPopulationsCibles() });
  const { data: contributions } = useQuery({ queryKey: ["contributions"], queryFn: getContributionsEntraide() });
  const { data: typesCentre } = useQuery({ queryKey: ["typesCentre"], queryFn: getTypesCentre() });
  const { data: partenariats } = useQuery({ queryKey: ["partenariats"], queryFn: getPartenariats() });
  const { data: ContributionsPartenaires } = useQuery({ queryKey: ["ContributionsPartenaires"], queryFn: getContributionsPartenaires() });
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
  console.log(partenariats);

  const [formData, setFormData] = useState({
    partenariatName: "",
    numero: "",
    provinceId: userData?.province ? Number(userData.province.id) : null,
    dureepartenariat: "",
    type: "",
    estimatioFinancier: "",
    montant_global: "",
    signataire: "",
    programme_INDH: "",
    
    dateSignature: "",
    date_lancement: "",
    indh: "",
    domaines: [],
    populationsCibles: [],
    contributions: [],
    typesCentre: [],
    partenaires: [],
    pieceJointe: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, values) => {
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, pieceJointe: e.target.files[0] }));
  };
 useEffect(() => {
  if (userData?.province) {
    setFormData((prev) => ({
      ...prev,
      provinceId: Number(userData.province.id),
    }));
  }
}, [userData]);

 const token = getCookie("token");
  const headers = {
    Authorization: `Bearer ${token}`
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = new FormData();

    // Ajouter le fichier si présent
    if (formData.pieceJointe) {
      payload.append("pieceJointe", formData.pieceJointe);
    }

    // Préparer les données en renommant contributionsPartenaires -> contributions
    const partenariatData = { ...formData };
    delete partenariatData.pieceJointe;
    
    // IMPORTANT : Renommer contributionsPartenaires en contributions pour chaque partenaire
    if (partenariatData.partenaires) {
      partenariatData.partenaires = partenariatData.partenaires.map(partenaire => ({
        ...partenaire,
        contributions: partenaire.contributionsPartenaires?.map(c => ({ id: c.id || c })) || [],
        // Supprimer l'ancien nom
        contributionsPartenaires: undefined
      }));
    }

    payload.append("partenariat", new Blob([JSON.stringify(partenariatData)], { type: "application/json" }));

    // Debug
    console.log("=== Payload après transformation ===");
    console.log(JSON.parse(await payload.get("partenariat").text()));

    // Envoi vers l'API
    const res = await api.post("/partenariats/create", payload, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Partenariat ajouté avec succès !");
   window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'ajout du partenariat");
  }
};

  const [selected, setSelected] = useState([]);

  const addDomaine = (e) => {
    const value = e.target.value;
    if (value && !selected.some((d) => d.id.toString() === value)) {
      const domaineObj = domaines.find((d) => d.id.toString() === value);
      const newSelected = [...selected, domaineObj];
      setSelected(newSelected);
      handleMultiSelect("domaines", newSelected);
    }
    e.target.value = "";
  };

  const removeDomaine = (id) => {
    const newSelected = selected.filter((d) => d.id !== id);
    setSelected(newSelected);
    handleMultiSelect("domaines", newSelected);
  };

  const [selectedPopulations, setSelectedPopulations] = useState([]);
  const addPopulation = (e) => {
    const value = e.target.value;
    if (value && !selectedPopulations.some((p) => p.id.toString() === value)) {
      const populationObj = populations.find((p) => p.id.toString() === value);
      const newSelected = [...selectedPopulations, populationObj];
      setSelectedPopulations(newSelected);
      handleMultiSelect("populationsCibles", newSelected);
    }
    e.target.value = "";
  };

  const removePopulation = (id) => {
    const newSelected = selectedPopulations.filter((p) => p.id !== id);
    setSelectedPopulations(newSelected);
    handleMultiSelect("populationsCibles", newSelected);
  };

  const [selectedContributions, setSelectedContributions] = useState([]);

  const addContribution = (e) => {
    const value = e.target.value;
    if (value && !selectedContributions.some((c) => c.id.toString() === value)) {
      const contributionObj = contributions.find((c) => c.id.toString() === value);
      const newSelected = [...selectedContributions, contributionObj];
      setSelectedContributions(newSelected);
      handleMultiSelect("contributions", newSelected);
    }
    e.target.value = "";
  };

  const removeContribution = (id) => {
    const newSelected = selectedContributions.filter((c) => c.id !== id);
    setSelectedContributions(newSelected);
    handleMultiSelect("contributions", newSelected);
  };

  const [selectedTypes, setSelectedTypes] = useState([]);

  const addType = (e) => {
    const value = e.target.value;
    if (value && !selectedTypes.some((t) => t.id.toString() === value)) {
      const typeObj = typesCentre.find((t) => t.id.toString() === value);
      const newSelected = [...selectedTypes, typeObj];
      setSelectedTypes(newSelected);
      handleMultiSelect("typesCentre", newSelected);
    }
    e.target.value = "";
  };

  const removeType = (id) => {
    const newSelected = selectedTypes.filter((t) => t.id !== id);
    setSelectedTypes(newSelected);
    handleMultiSelect("typesCentre", newSelected);
  };

  const [partenaires, setPartenaires] = useState([
    { partenaire: "", type: "", sousType: "", email: "", tel: "", fax: "", web: "", adresse: "", estimContribFinanc: "", contributionsPartenaires: [] }
  ]);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, partenaires: partenaires }));
  }, []);

  const handlePartenaireChange = (index, field, value) => {
    const newPartenaires = [...partenaires];
    newPartenaires[index][field] = value;
    setPartenaires(newPartenaires);
    setFormData(prev => ({ ...prev, partenaires: newPartenaires }));
  };

  const addPartenaire = () => {
    const newPartenaire = { 
      partenaire: "", 
      type: "", 
      sousType: "", 
      email: "", 
      tel: "", 
      fax: "", 
      web: "", 
      adresse: "", 
      estimContribFinanc: "", 
      contributionsPartenaires: [] 
    };
    const newPartenaires = [...partenaires, newPartenaire];
    setPartenaires(newPartenaires);
    setFormData(prev => ({ ...prev, partenaires: newPartenaires }));
  };

  const removePartenaire = (index) => {
    const newPartenaires = partenaires.filter((_, i) => i !== index);
    setPartenaires(newPartenaires);
    setFormData(prev => ({ ...prev, partenaires: newPartenaires }));
  };

  const addContributionPartenaire = (e, index) => {
    const value = e.target.value;
    if (!value) return;

    const contributionObj = ContributionsPartenaires.find((c) => c.id.toString() === value);
    const newPartenaires = [...partenaires];
    const partenaire = newPartenaires[index];

    if (!partenaire.contributionsPartenaires) partenaire.contributionsPartenaires = [];

    if (!partenaire.contributionsPartenaires.some((c) => c.id === contributionObj.id)) {
      partenaire.contributionsPartenaires.push(contributionObj);
    }

    setPartenaires(newPartenaires);
    setFormData((prev) => ({ ...prev, partenaires: newPartenaires }));

    e.target.value = "";
  };

  const removeContributionPartenaire = (index, id) => {
    const newPartenaires = [...partenaires];
    newPartenaires[index].contributionsPartenaires = newPartenaires[index].contributionsPartenaires.filter(
      (c) => c.id !== id
    );
    setPartenaires(newPartenaires);
    setFormData((prev) => ({ ...prev, partenaires: newPartenaires }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex mb-8">
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">

        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>
   
        
        {/* Header avec design moderne */}
        <div className="mt-8 ml-8 mr-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-8">
              Nouveau Partenariat
            </h2>
          </div>
        
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section infos générales */}
          <div className="bg-white rounded-m shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations Générales
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Intitulé du partenariat</label>
                  <input 
                    name="partenariatName" 
                    value={formData.partenariatName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                    placeholder="Entrez l'intitulé du partenariat"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro de convention/avenant</label>
                  <input 
                    name="numero" 
                    value={formData.numero} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                    placeholder="N° de convention"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
                  <input 
                    readOnly 
                    name="province" 
                    value={userData?.province?.province} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Durée du partenariat (ans)</label>
                  <input 
                    name="dureepartenariat" 
                    type="number"
                    placeholder="Ex: 3" 
                    value={formData.dureepartenariat} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type de partenariat</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="cadre">Cadre</option>
                    <option value="convention_specifique">Convention spécifique</option>
                    <option value="avenant">Avenant</option>
                    <option value="charte">Charte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date de signature</label>
                  <input 
                    type="date" 
                    name="dateSignature" 
                    value={formData.dateSignature} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date de lancement</label>
                  <input 
                    type="date" 
                    name="date_lancement" 
                    value={formData.date_lancement} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">INDH est partenaire ?</label>
                  <select
                    name="indh"
                    value={formData.indh}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Sélectionner</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </div>

                {formData.indh === "oui" && (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Programme INDH</label>
                    <select
                      name="programme_INDH"
                      value={formData.programme_INDH}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      <option value="">Sélectionner un programme</option>
                      <option value="Le programme transversal">Le programme transversal</option>
                      <option value="Le programme de lutte contre la précarité">Le programme de lutte contre la précarité</option>
                      <option value="Le programme de lutte contre l'exclusion sociale en milieu urbain">Le programme de lutte contre l'exclusion sociale en milieu urbain</option>
                      <option value="Le programme de lutte contre la pauvreté en milieu rural">Le programme de lutte contre la pauvreté en milieu rural</option>
                      <option value="Mise à niveau territoriale">Mise à niveau territoriale</option>
                      <option value="Rattrapage des déficits en infrastructures et services sociaux de base">Rattrapage des déficits en infrastructures et services sociaux de base</option>
                      <option value="Accompagnement des personnes en situation de précarité">Accompagnement des personnes en situation de précarité</option>
                      <option value="Amélioration du revenu et inclusion économique des jeunes">Amélioration du revenu et inclusion économique des jeunes</option>
                      <option value="Impulsion du capital humain des générations montantes">Impulsion du capital humain des générations montantes</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nature de la Signature</label>
                  <select
                    name="signataire"
                    value={formData.signataire}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    <option value="">Sélectionner une option</option>
                    <option value="Localement">Localement</option>
                    <option value="Par le biais d'une délégation de signature de la part de l'administration centrale">Par le biais d'une délégation de signature de la part de l'administration centrale</option>
                    <option value="Par le biais d'une délégation de signature de la part de la coordination régionale">Par le biais d'une délégation de signature de la part de la coordination régionale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimation financière EN (DH)</label>
                  <input 
                    name="estimatioFinancier" 
                    type="number"
                    placeholder="0.00" 
                    value={formData.estimatioFinancier} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Montant global (DH)</label>
                  <input 
                    name="montant_global" 
                    type="number"
                    placeholder="0.00" 
                    value={formData.montant_global} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Domaines */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Domaines d'intervention
              </h3>
            </div>
            <div className="p-6">
              <select
                onChange={addDomaine}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white mb-4"
              >
                <option value="">Choisir un domaine</option>
                {domaines?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.domaine}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                {selected.map((d) => (
                  <span
                    key={d.id}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {d.domaine}
                    <button
                      type="button"
                      onClick={() => removeDomaine(d.id)}
                      className="hover:bg-purple-200 rounded-full p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Populations Cibles */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Populations Cibles
              </h3>
            </div>
            <div className="p-6">
              <select
                onChange={addPopulation}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white mb-4"
              >
                <option value="">Choisir une population cible</option>
                {populations?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.populationCible}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                {selectedPopulations.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {p.populationCible}
                    <button
                      type="button"
                      onClick={() => removePopulation(p.id)}
                      className="hover:bg-green-200 rounded-full p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contributions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Contributions de l'Entraide
              </h3>
            </div>
            <div className="p-6">
              <select
                onChange={addContribution}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white mb-4"
              >
                <option value="">Choisir une contribution</option>
                {contributions?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contributionEn}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                {selectedContributions.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {c.contributionEn}
                    <button
                      type="button"
                      onClick={() => removeContribution(c.id)}
                      className="hover:bg-orange-200 rounded-full p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Types de centre */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Types de Centre
              </h3>
            </div>
            <div className="p-6">
              <select
                onChange={addType}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white mb-4"
              >
                <option value="">Choisir un type de centre</option>
                {typesCentre?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.typeCentre}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2">
                {selectedTypes.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {t.typeCentre}
                    <button
                      type="button"
                      onClick={() => removeType(t.id)}
                      className="hover:bg-teal-200 rounded-full p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Partenaires */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Partenaires
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {partenaires.map((p, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white hover:border-indigo-300 transition-all duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                        {index + 1}
                      </span>
                      Partenaire {index + 1}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePartenaire(index)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du partenaire</label>
                      <input
                        type="text"
                        placeholder="Nom du partenaire"
                        value={p.partenaire}
                        onChange={(e) => handlePartenaireChange(index, "partenaire", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                      <select
                        value={p.type || ""}
                        onChange={(e) => handlePartenaireChange(index, "type", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="Initiative Nationale pour le Développement Humain">Initiative Nationale pour le Développement Humain</option>
                        <option value="Ministère de la Solidarité, de l'Insertion Sociale et de la Famille">Ministère de la Solidarité, de l'Insertion Sociale et de la Famille</option>
                        <option value="Autre Ministère">Autre Ministère</option>
                        <option value="Wilaya">Wilaya</option>
                        <option value="Province/préfecture">Province/préfecture</option>
                        <option value="Etablissement public">Etablissement public</option>
                        <option value="Collectivité territoriale">Collectivité territoriale</option>
                        <option value="Association nationale">Association nationale</option>
                        <option value="Association locale">Association locale</option>
                        <option value="Coopérative">Coopérative</option>
                        <option value="Réseau d'associations">Réseau d'associations</option>
                        <option value="Coopération internationale">Coopération internationale</option>
                        <option value="ONG internationales">ONG internationales</option>
                        <option value="Secteur privé">Secteur privé</option>
                      </select>
                    </div>

                    {p.type === "Collectivité territoriale" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Précisez le type</label>
                        <select
                          value={p.sousType || ""}
                          onChange={(e) => handlePartenaireChange(index, "sousType", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">Sélectionner un sous-type</option>
                          <option value="Conseil régional">Conseil régional</option>
                          <option value="Conseil provincial/préfectoral">Conseil provincial/préfectoral</option>
                          <option value="Commune urbaine/rurale">Commune urbaine/rurale</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="email@exemple.com"
                        value={p.email}
                        onChange={(e) => handlePartenaireChange(index, "email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="text"
                        placeholder="+212 6XX XXX XXX"
                        value={p.tel}
                        onChange={(e) => handlePartenaireChange(index, "tel", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fax</label>
                      <input
                        type="text"
                        placeholder="Fax"
                        value={p.fax}
                        onChange={(e) => handlePartenaireChange(index, "fax", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Site Web</label>
                      <input
                        type="text"
                        placeholder="https://www.exemple.com"
                        value={p.web}
                        onChange={(e) => handlePartenaireChange(index, "web", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                      <input
                        type="text"
                        placeholder="Adresse complète"
                        value={p.adresse}
                        onChange={(e) => handlePartenaireChange(index, "adresse", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contributions du partenaire</label>
                      <select
                        onChange={(e) => addContributionPartenaire(e, index)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white mb-3"
                      >
                        <option value="">Choisir une contribution</option>
                        {ContributionsPartenaires?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.contributionPartenaire}
                          </option>
                        ))}
                      </select>

                      <div className="flex flex-wrap gap-2">
                        {(p.contributionsPartenaires || []).map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                          >
                            {c.contributionPartenaire}
                            <button
                              type="button"
                              onClick={() => removeContributionPartenaire(index, c.id)}
                              className="hover:bg-indigo-200 rounded-full p-1 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Estimation financière (DH)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={p.estimContribFinanc}
                        onChange={(e) => handlePartenaireChange(index, "estimContribFinanc", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPartenaire}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter un autre partenaire
              </button>
            </div>
          </div>

          {/* Pièce jointe */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Pièce Jointe
              </h3>
            </div>
            <div className="p-6">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                </div>
                <input type="file" name="pieceJointe" onChange={handleFileChange} className="hidden" />
              </label>
              {formData.pieceJointe && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">{formData.pieceJointe.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bouton submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button"
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Enregistrer le partenariat
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddPartenariatPage;