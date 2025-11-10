"use client";

import React, { useState , useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FaChartLine, FaPlus, FaDolly, FaHome, FaUser, FaBoxOpen, FaSignOutAlt, FaClipboardList ,FaTrash, FaSearch } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '/src/components/ui/dialog';
import { Button } from '/src/components/ui/button';
import { Input } from '/src/components/ui/input';
import { Label } from '/src/components/ui/label';
import { useToast } from "/src/components/ui/use-toast";
import { api, getCurrentUser, getPreparation, getPreparations, getStockActuel, getProduits } from "/src/api";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

const PreparationModal = ({ onSubmit , role}) => {

  const { data: produits = [] } = useQuery({
    queryKey: ['produits'],
    queryFn: getProduits(),
  });

  const { data: stockActuel, isLoading: isLoadingStockActuel } = useQuery({
      queryKey: ['stockActuel'],
      queryFn: getStockActuel,
    });
    console.log("stockActuel", stockActuel);

    const [formData, setFormData] = useState({
    date_expedition: '',
    destination: '',
    numeroMarche: '',
    dest_beneficiaire: '',
    partenaire: '',
    nbre_bene:'',
    details: []
    
  });

  const [selectedProduit, setSelectedProduit] = useState("");
  const [quantite, setQuantite] = useState("");
  const [coutUnitaire, setCoutUnitaire] = useState("");
  const [siAutreSpecifier, setSiAutreSpecifier] = useState("");
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });

  const handleAddProduit = () => {
    if (!selectedProduit || !quantite ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const produit = produits.find(p => p.produitId === parseInt(selectedProduit));
    if (!produit) return;

    // Vérifier si le produit "Autre" est sélectionné mais sans description
    if (produit.produitId === 8 && (!siAutreSpecifier || siAutreSpecifier.trim() === '')) {
      alert("Veuillez spécifier le type de produit 'Autre'");
      return;
    }

    // Vérifier le stock disponible
    const delegationId = userData?.province?.id

    const produitStock = stockActuel.find(
      item =>
        item.produitId === produit.produitId &&
        item.provinceId === delegationId
    );

   if (!produitStock) {
            alert(`Le produit "${produit.nomProduit}" est non disponible dans le stock.`);
   return;
   }
  const stockDisponible = parseInt(produitStock.stockDisponible);

  const quantiteNumber = parseInt(quantite);
  if (quantiteNumber > stockDisponible) {
    alert(`Attention ! Stock insuffisant pour ${produit.nomProduit}. Stock disponible : ${stockDisponible}`);
    return;
  }

    // Vérifier si le produit existe déjà dans les détails
    const existingIndex = formData.details.findIndex(detail => 
      detail.produit.produitId === produit.produitId
    );

    if (existingIndex >= 0) {
      // Mettre à jour le produit existant
      const updatedDetails = [...formData.details];
      updatedDetails[existingIndex] = {
        produit: produit,
        quantite: parseInt(quantite),
        cout_unitaire: parseFloat(coutUnitaire),
        ...(produit.produitId === 8 ? { siAutreSpecifier } : {})
      };
      setFormData({
        ...formData,
        details: updatedDetails
      });
    } else {
      // Ajouter un nouveau produit
      setFormData({
        ...formData,
        details: [
          ...formData.details,
          {
            produit: produit,
            quantite: parseInt(quantite),
            cout_unitaire: parseFloat(coutUnitaire),
            ...(produit.produitId === 8 ? { siAutreSpecifier } : {})
          }
        ]
      });
    }

    // Réinitialiser les champs
    setSelectedProduit("");
    setQuantite("");
    setCoutUnitaire("");
    setSiAutreSpecifier("");
  };

  const handleRemoveProduit = (produitId) => {
    setFormData({
      ...formData,
      details: formData.details.filter(detail => detail.produit.produitId !== produitId)
    });
  };

  const handleAutreSpecifierChange = (value) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map(detail => 
        detail.produit.produitId === 8
          ? { ...detail, siAutreSpecifier: value }
          : detail
      )
    }));
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.details.length === 0) {
      alert("Veuillez ajouter au moins un produit");
      return;
    }

    const payload = {
      ...formData,
      details: formData.details
    };
    
    onSubmit(payload);
    setFormData({
      date_expedition: '',
      destination: '',
      numeroMarche:'',
      dest_beneficiaire: '',
      partenaire: '',
      nbre_bene:'',
      details: []
    });
    setIsModalOpen(false);
  };

  const handleQuantityChange = (produitId, value) => {
    console.log("Produit ID:", produitId);
    console.log("Valeur saisie:", value);
    
    const numericValue = value === '' ? '' : Number(value);
    const produitStock = stockActuel?.find(item => item.produitId === produitId);
  
    console.log("Produit trouvé dans stockActuel:", produitStock);
  
    if (produitStock) {
      const stockDisponible = produitStock.totalReception - produitStock.totalPreparation;
      console.log("Stock disponible:", stockDisponible);
  
      if (numericValue > stockDisponible) {
        alert(`Attention ! Stock insuffisant pour ${produitStock.nomProduit}. Stock disponible : ${stockDisponible}`);
        return;
      }
    } else {
      alert("❌ Produit non trouvé dans stockActuel !");
    }
  
    setFormData(prev => ({
      ...prev,
      details: prev.details.map(detail => 
        detail.produit.produitId === produitId 
          ? { ...detail, quantite: numericValue }
          : detail
      )
    }));
  };

  const handleCostChange = (produitId, value) => {
    const numericValue = value === '' ? '' : Number(value);
    setFormData(prev => ({
      ...prev,
      details: prev.details.map(detail => 
        detail.produit.produitId === produitId 
          ? { ...detail, cout_unitaire: numericValue }
          : detail
      )
    }));
  };

  const FormField = ({ label, produitId, unit }) => {
    const [quantityValue, setQuantityValue] = useState('');
    const [costValue, setCostValue] = useState('');
    const [autreSpecifier, setAutreSpecifier] = useState('');
    const detail = formData.details.find(d => d.produit.produitId === produitId);
  
    useEffect(() => {
      if (detail?.quantite !== undefined) {
        setQuantityValue(detail.quantite.toString());
      }
      if (detail?.cout_unitaire !== undefined) {
        setCostValue(detail.cout_unitaire.toString());
      }
      if (detail?.siAutreSpecifier !== undefined) {
        setAutreSpecifier(detail.siAutreSpecifier);
      }
    }, [detail?.quantite, detail?.cout_unitaire, detail?.siAutreSpecifier]);
  
    return (
      <div className="space-y-2">
        <Label className="text-gray-600 text-sm">
          {label} {unit ? `(${unit})` : ""}
        </Label>
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="number"
              min="0"
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              onBlur={(e) => handleQuantityChange(produitId, e.target.value)}
              className="w-full"
              placeholder="Quantité"
            />
            {unit && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <span className="text-gray-400 text-xs">{unit}</span>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type="number"
              min="0"
              value={costValue}
              onChange={(e) => setCostValue(e.target.value)}
              onBlur={(e) => handleCostChange(produitId, e.target.value)}
              className="w-full"
              placeholder="Coût unitaire (DH)"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <span className="text-gray-400 text-xs">DH</span>
            </div>
          </div>
          
          {/* Ajouter le champ pour spécifier le produit "Autre" */}
          {produitId === 8 && quantityValue > 0 && (
            <div className="mt-2">
              <Input
                type="text"
                value={autreSpecifier}
                onChange={(e) => setAutreSpecifier(e.target.value)}
                onBlur={(e) => handleAutreSpecifierChange(e.target.value)}
                className="w-full"
                placeholder="Spécifier le produit"
                required={quantityValue > 0}
              />
            </div>
          )}
        </div>
      </div>
    );
  };
 
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>

        <Button variant="outline" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center">
          <FaPlus className="mr-2 h-4 w-4" />
          Nouvelle Distribution
        </Button>
      
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold mb-4">Nouvelle distribution</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_expedition">Date d&apos;expédition</Label>
              <Input
                id="date_expedition"
                type="date"
                value={formData.date_expedition}
                onChange={(e) => setFormData({ ...formData, date_expedition: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
    
            <div className="space-y-2">
              <Label htmlFor="partenaire">En Partenariat avec: </Label>
              <Input
                id="partenaire"
                type="text"
                value={formData.partenaire}
                onChange={(e) => setFormData({ ...formData, partenaire: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nbre_bene">Nombre de bénéficiaires: </Label>
              <Input
                id="nbre_bene"
                type="number"
                value={formData.nbre_bene}
                onChange={(e) => setFormData({ ...formData, nbre_bene: e.target.value })}
              />
            </div>
           
              <div className="space-y-2">
              <Label htmlFor="numeroMarche">Référence du marché</Label>
              <Input
                id="numeroMarche"
                type="text"
                value={formData.numeroMarche}
                onChange={(e) => setFormData({ ...formData, numeroMarche: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Label className="whitespace-nowrap">Utilisation prévue :</Label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.dest_beneficiaire === "beneficiaires"}
                  onChange={() => setFormData({ ...formData, dest_beneficiaire: "beneficiaires" })}
                  className="w-4 h-4"
                />
                <span>Destiné aux bénéficiaires</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.dest_beneficiaire === "stock_non_utile"}
                  onChange={() => setFormData({ ...formData, dest_beneficiaire: "stock_non_utile" })}
                  className="w-4 h-4"
                />
                <span>Stock non utile</span>
              </label>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <Label className="text-lg font-medium">Produits à distribuer</Label>
            
            {/* Section d'ajout de produit */}
            <div className="grid grid-cols-4 gap-4 p-4 border rounded-md bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="produit">Produit</Label>
                <select 
                  id="produit"
                  value={selectedProduit}
                  onChange={(e) => setSelectedProduit(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.map((produit) => (
                    <option key={produit.produitId} value={produit.produitId}>
                      {produit.nomProduit}{produit.uniteMesure ? `(${produit.uniteMesure })` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité</Label>
                <Input
                  id="quantite"
                  type="number"
                  min="1"
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  className="w-full"
                  placeholder="Quantité"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cout_unitaire">Coût unitaire (DH)</Label>
                <Input
                  id="cout_unitaire"
                  type="number"
                  min="0"
                  value={coutUnitaire}
                  onChange={(e) => setCoutUnitaire(e.target.value)}
                  className="w-full"
                  placeholder="Coût unitaire"
                />
              </div>
              {selectedProduit === "8" && (
                <div className="space-y-2">
                  <Label htmlFor="siAutreSpecifier">Spécifier le produit</Label>
                  <Input
                    id="siAutreSpecifier"
                    type="text"
                    value={siAutreSpecifier}
                    onChange={(e) => setSiAutreSpecifier(e.target.value)}
                    className="w-full"
                    placeholder="Spécifier le produit"
                  />
                </div>
              )}
              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={handleAddProduit}
                  className="bg-blue-900 hover:bg-blue-800 w-full"
                >
                  Ajouter
                </Button>
              </div>
            </div>
            
            {/* Liste des produits ajoutés */}
            {formData.details.length > 0 && (
              <div className="mt-6 border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût unitaire</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.details.map((detail) => (
                      <tr key={detail.produit.produitId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {detail.produit.nomProduit}
                          {detail.siAutreSpecifier && ` (${detail.siAutreSpecifier})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detail.quantite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detail.cout_unitaire} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduit(detail.produit.produitId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <DialogTrigger asChild>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </DialogTrigger>
            <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
              Confirmer la distribution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  const { toast } = useToast();
  const token = getCookie('token');
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
   const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });

  const { data: preparation, refetch: refetchPreparation } = useQuery({
    queryKey: ["preparation", userData?.province?.id],
    queryFn: () => getPreparation(userData?.province?.id),
    enabled: !!userData?.province?.id,
  });
  const { data: preparations } = useQuery({
    queryKey: ['preparations'],
    queryFn: getPreparations(),
  });
console.log("preps", preparations);
  const role = userData?.roles || "";
  const dataToFilter = role === "ADMIN_ROLES" ? preparations : preparation;
  const filteredData = dataToFilter?.filter(operation => {
      const searchLower = searchTerm.toLowerCase();
      
      // Recherche dans la délégation
      const delegationMatch = operation?.delegation?.nomDelegation?.toLowerCase().includes(searchLower);
      
      // Recherche dans les produits
      const productsMatch = operation?.details?.some(detail =>
        detail.produit.nomProduit.toLowerCase().includes(searchLower)
      );
      
      return delegationMatch || productsMatch;
    }) || [];

  // Calculer la pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // Composant de pagination
  const Pagination = () => (
    <div className="flex justify-center mt-6 gap-2 items-center">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>

      {/* Liste déroulante */}
      <select
        value={currentPage}
        onChange={(e) => setCurrentPage(Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-white"
      >
        {[...Array(totalPages)].map((_, index) => (
          <option key={index + 1} value={index + 1}>
            {index + 1}
          </option>
        ))}
      </select>

      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    </div>
  );

  const handlePreparationSubmit = async (formData) => {
    try {
      console.log("formdata",formData)
     const response = await api.post("/preparation", {
        ...formData,
        delegation: {
          id: userData?.province?.id
        }
      }, { headers });

      toast({
        description: "distribution créée avec succès",
        className: "bg-emerald-600 text-white",
        duration: 2000,
        title: "Success",
      });
     
      refetchPreparation();
    } catch (error) {
      toast({
        description: "Erreur lors de la création de la distribution",
        className: "bg-red-500 text-white",
        duration: 2000,
        title: "Error",
      });
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar remains unchanged */}
      

      {/* Main Content Area - Style inspiré du design existant */}
      <div className="ml-64 bg-gray-50 min-h-screen">
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>
            Bienvenue {userData?.name}
          </h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>
        
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Distribution</h2>
            <PreparationModal onSubmit={handlePreparationSubmit} role={role}  />
          </div>
          
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full max-w-md mb-6">
            <FaSearch className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par produit ou délégation..."
              className="outline-none w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
              }}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Délégation
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date d&apos;expédition
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Utilisation prévue
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Partenaires
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Nombre de bénéficiaires
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Référence du marché
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Produits et détails
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((operation) => (
                    <tr
                      key={operation.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">
                        {operation?.delegation?.province}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation?.date_expedition}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation?.destination}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation?.dest_beneficiaire}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation?.partenaire}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation?.nbre_bene}
                      </td>
                       <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation?.numeroMarche}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Produit</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Quantité</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Prix unitaire</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {operation?.details?.map((detail, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-3 py-2 text-sm font-medium text-gray-800">
                                  {detail.produit.nomProduit}
                                  {detail.siAutreSpecifier && (
                                    <span className="text-xs text-gray-500 block mt-1">
                                      ({detail.siAutreSpecifier})
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-center">
                                  <span className="inline-flex items-center justify-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                                    {detail.quantite} {detail.produit.uniteMesure || ""}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                                  {detail.cout_unitaire} DH
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Afficher la pagination seulement s'il y a des données */}
          {filteredData.length > 0 && <Pagination />}
          
          {/* Message si aucun résultat */}
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun résultat ne correspond à votre recherche
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;