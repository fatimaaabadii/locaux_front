"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import { getCurrentUser, getStocktotalByDelegation, getStockActuel } from "/src/api";

const Page = () => {
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const role = userData?.roles || "";

  const [isDataReady, setIsDataReady] = useState(false);

  const { data: stocktotal, isLoading: isLoadingStockTotal } = useQuery({
    queryKey: ["stocktotal", userData?.province?.id],
    queryFn: () => getStocktotalByDelegation(userData?.province?.id),
    enabled: !!userData?.province?.id,
  });

  const { data: stockActuel, isLoading: isLoadingStockActuel } = useQuery({
    queryKey: ["stockActuel"],
    queryFn: getStockActuel,
  });

  useEffect(() => {
    if (role === "ADMIN_ROLES") {
      if (stockActuel !== undefined) setIsDataReady(true);
    } else {
      if (stocktotal !== undefined) setIsDataReady(true);
    }
  }, [stockActuel, stocktotal, role]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;
  const isLoading = role === "ADMIN_ROLES" ? isLoadingStockActuel : isLoadingStockTotal;
  const dataToFilter = role === "ADMIN_ROLES" ? stockActuel : stocktotal;

  const filteredStock = useMemo(() => {
    if (!isDataReady || !dataToFilter) return [];
    return dataToFilter
      .filter((item) => item.nomProduit.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.nomProduit > b.nomProduit ? 1 : -1)); // tri par nomProduit
  }, [dataToFilter, searchQuery, isDataReady]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStock.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

  return (
     <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar remains unchanged */}
      

      {/* Main Content Area - Style inspiré du design existant */}
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6 mb-8">
          <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>

        {/* Page Title */}
        <div className="mb-6 ml-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">État du Stock</h2>
          <p className="text-[#6B7A99]">Gestion et suivi des stocks</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full max-w-md mb-6 ml-6">
          <FaSearch className="text-gray-400 text-lg mr-2 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher par produit..."
            className="outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 ml-6 mr-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white">
                <tr>
                  <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Délégation
                  </th>
                  <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Nom du Produit
                  </th>
                  <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Stock Actuel
                  </th>
                  <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Réceptions
                  </th>
                  <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Distributions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isDataReady &&
                  currentItems.map((item) => (
                    <tr key={item.produitId} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {item.nomDelegation || userData?.province?.province}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">
                        {item.nomProduit} ({item.uniteMesure || "Unité"})
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">
                        {item.quantiteStock ?? item.stockDisponible ?? 0}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">
                        {item.totalReception}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">
                        {item.totalDistribution}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between px-4 py-3 ml-6">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredStock.length)}</span>{" "}
              sur <span className="font-medium">{filteredStock.length}</span> résultats
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            <select
              value={currentPage}
              onChange={(e) => paginate(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 text-sm rounded-md bg-white"
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
