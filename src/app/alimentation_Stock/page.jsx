"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlus, FaTrash } from "react-icons/fa";
import { getProduits, getCurrentUser, api } from "/src/api";
import { useToast } from "/src/components/ui/use-toast";
import { getCookie } from "cookies-next";

const Page = () => {
  const { data: produits = [] } = useQuery({
    queryKey: ["produits"],
    queryFn: getProduits(),
  });

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser(),
  });

  const role = userData?.roles || "";
  const { toast } = useToast();
  const token = getCookie("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [selectedProducts, setSelectedProducts] = useState([
    { produitId: "", nomProduit: "", quantite: "", cout_unitaire: "", cout_total: "", siAutreSpecifier: "" },
  ]);

  const [receptionInfo, setReceptionInfo] = useState({
    dateReception: "",
    source: "",
    numeroMarche: "",
    fichierBonLivraison: null,
  });

  const handleProductChange = (index, e) => {
    const { value } = e.target;
    const updatedProducts = [...selectedProducts];
    const selectedProduit = produits.find((p) => p.produitId.toString() === value);
    updatedProducts[index] = {
      ...updatedProducts[index],
      produitId: selectedProduit?.produitId || "",
      nomProduit: selectedProduit?.nomProduit || "",
      cout_unitaire: selectedProduit?.cout_unitaire || "",
      cout_total: selectedProduit?.cout_total || "",
      uniteMesure: selectedProduit?.uniteMesure || "",
    };
    setSelectedProducts(updatedProducts);
  };

  const handleProductInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [name]: value };
    setSelectedProducts(updatedProducts);
  };

  const addProduct = () =>
    setSelectedProducts([
      ...selectedProducts,
      { produitId: "", nomProduit: "", quantite: "", cout_unitaire: "", cout_total: "", siAutreSpecifier: "" },
    ]);

  const removeProduct = (index) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setReceptionInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const validProducts = selectedProducts.filter((product) => product.produitId && parseFloat(product.quantite) > 0);
      if (!validProducts.length) {
        toast({ description: "Veuillez ajouter au moins un produit valide", className: "bg-red-500 text-white" });
        return;
      }

      const operationDetails = validProducts.map((product) => ({
        produit: { produitId: parseInt(product.produitId) },
        quantite: Math.round(parseFloat(product.quantite) * 100) / 100,
        cout_unitaire: Math.round(parseFloat(product.cout_unitaire) * 100) / 100,
        cout_total: Math.round(parseFloat(product.cout_total) * 100) / 100,
        siAutreSpecifier: product.produitId === 8 ? product.siAutreSpecifier : undefined,
      }));

      const payload = {
        province: { id: userData?.province?.id },
        dateCreation: new Date().toISOString(),
        details: operationDetails,
        date_reception: receptionInfo.dateReception,
        source: receptionInfo.source,
        numeroMarche: receptionInfo.numeroMarche,
        fichier: null,
      };

      await api.post("/receptions/create", payload, { headers });
      toast({ description: "Réception créée avec succès", className: "bg-emerald-600 text-white" });

      setSelectedProducts([{ produitId: "", nomProduit: "", quantite: "", cout_unitaire: "", cout_total: "", siAutreSpecifier: "" }]);
      setReceptionInfo({ dateReception: "", source: "", numeroMarche: "", fichierBonLivraison: null });
    } catch (error) {
      toast({ description: "Erreur lors de la création de la réception", className: "bg-red-500 text-white" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar placeholder */}
      

      {/* Main content */}
      <div className="flex-1 ml-64 w-[calc(100%-16rem)] min-h-screen">
        {/* Barre supérieure */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] p-6 border-b border-gray-200">
          <h4 className="text-lg font-bold text-[#4A4F55]">Bienvenue {userData?.name}</h4>
          <p className="text-[#6B7A99] text-sm">Portail de communication interne - Entraide Nationale</p>
        </div>

        {/* Formulaire centré */}
        <div className="flex justify-center py-6">
          <div className="w-full max-w-4xl px-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Alimentation du Stock</h3>
                <p className="text-gray-600 text-sm">Enregistrer une nouvelle réception de produits</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {selectedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium text-gray-700">Produit {index + 1}</h5>
                      {selectedProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Produit</label>
                        <select
                          value={product.produitId}
                          onChange={(e) => handleProductChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                          <option value="">Sélectionner un produit</option>
                          {produits.map((produit) => (
                            <option key={produit.produitId} value={produit.produitId}>
                              {produit.nomProduit} {produit.uniteMesure ? `(${produit.uniteMesure})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Quantité {product.uniteMesure ? `(${product.uniteMesure})` : ""}
                        </label>
                        <input
                          type="text"
                          name="quantite"
                          value={product.quantite}
                          onChange={(e) => handleProductInputChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Coût unitaire</label>
                        <input
                          type="text"
                          name="cout_unitaire"
                          value={product.cout_unitaire}
                          onChange={(e) => handleProductInputChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Coût total</label>
                        <input
                          type="text"
                          name="cout_total"
                          value={product.cout_total}
                          onChange={(e) => handleProductInputChange(index, e)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {product.produitId == 8 && (
                        <div className="md:col-span-2">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Spécifier</label>
                          <input
                            type="text"
                            name="siAutreSpecifier"
                            value={product.siAutreSpecifier}
                            onChange={(e) => handleProductInputChange(index, e)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full bg-blue-50 text-blue-600 p-4 rounded-lg hover:bg-blue-100 flex items-center justify-center text-sm font-medium border-2 border-dashed border-blue-200"
                >
                  <FaPlus className="mr-2" /> Ajouter un autre produit
                </button>

                {/* Informations générales */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-lg text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    Informations générales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Date de réception</label>
                      <input
                        type="date"
                        name="dateReception"
                        value={receptionInfo.dateReception}
                        onChange={handleInfoChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">Référence ou source</label>
                      <select
                        name="source"
                        value={receptionInfo.source}
                        onChange={handleInfoChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        <option value="">Sélectionnez une option</option>
                        <option value="Saisie">Saisie</option>
                        <option value="Marché public">Marché public</option>
                        <option value="Bon de commande">Bon de commande</option>
                        <option value="Don">Don</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Référence du marché / bon de commande
                      </label>
                      <input
                        type="text"
                        name="numeroMarche"
                        value={receptionInfo.numeroMarche}
                        onChange={handleInfoChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full bg-blue-900 text-white p-4 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-blue-800"
                  >
                    <FaPlus className="mr-2" /> Enregistrer la réception
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
