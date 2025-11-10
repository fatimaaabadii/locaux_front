"use client";

import React from "react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChartLine, FaPlus, FaUser, FaWarehouse ,FaHome ,FaDolly ,FaSignOutAlt, FaHourglassHalf, FaTruckLoading  ,FaSearch, FaClipboardList, FaBoxOpen,FaTags, FaThList} from "react-icons/fa";
import { MdCheckCircle , MdCategory} from "react-icons/md";
import Footer from '/src/components/Footer';
import { getOperationsByDelegations, getOperations , getProduits, getCurrentUser} from '/src/api';
import { deleteCookie } from 'cookies-next';

const Page = () => {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });

  const { data: receptiontotal } = useQuery({
    queryKey: ['receptiontotal'],
    queryFn: getOperations(),
  });

  const role = userData?.roles || "";

  const { data: operations, refetch: refetchOperations } = useQuery({
    queryKey: ["operations", userData?.province?.id],
    queryFn: () => getOperationsByDelegations(userData?.province?.id),
    enabled: !!userData?.province?.id,
  });
console.log(operations); 
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 4;

 
  
  const filteredOperations = useMemo(() => {
    const dataToFilter = role === "ADMIN_ROLES" ? receptiontotal : operations;
    
    if (!dataToFilter) return [];
    
    const filteredData = dataToFilter.filter((operation) => {
      return (
        operation.province.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.details.some((detail) =>
          detail.produit.nomProduit.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    });

    return filteredData.sort((a, b) => new Date(b.dateCreation[0], b.dateCreation[1] - 1, b.dateCreation[2]) - new Date(a.dateCreation[0], a.dateCreation[1] - 1, a.dateCreation[2]));
  }, [operations, receptiontotal, searchQuery, role]);

  const indexOfLastOperation = currentPage * itemsPerPage;
  const indexOfFirstOperation = indexOfLastOperation - itemsPerPage;
  const currentOperations = filteredOperations.slice(indexOfFirstOperation, indexOfLastOperation);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);

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
        
        <div className="p-6 bg-gray-50">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Réceptions</h2>
            <p className="text-[#6B7A99]">Gestion et suivi des réceptions de produits</p>
          </div>

          {/* Search Input */}
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full max-w-md mb-8">
            <FaSearch className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par produit ou délégation..."
              className="outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table of Operations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date de réception
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Délégation
                    </th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Référence ou source
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
                  {currentOperations.map((operation) => (
                    <tr key={operation.operationId} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation.date_reception}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">
                        {operation.province.province}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation.source}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        {operation.numeroMarche || 'N/A'}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Produit</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Quantité</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Prix unitaire</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">Coût total</th>
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
                                <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">
                                  {detail.cout_total} DH
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

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{indexOfFirstOperation + 1}</span> à{' '}
                <span className="font-medium">{Math.min(indexOfLastOperation, filteredOperations.length)}</span>{' '}
                sur <span className="font-medium">{filteredOperations.length}</span> résultats
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

              {/* Dropdown for Page Selection */}
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
    </div>
  );
};

export default Page;