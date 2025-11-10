"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSearch, FaTimes } from "react-icons/fa";
import { getPartenariats, getCurrentUser , downloadPieceJointePartenariat} from "/src/api";

const PartenariatsPage = () => {
  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const { data: partenariats } = useQuery({
    queryKey: ["partenariats"],
    queryFn: getPartenariats(),
  });
console.log(partenariats);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedPartenariat, setSelectedPartenariat] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  const filteredPartenariats = useMemo(() => {
    if (!partenariats) return [];
    return partenariats.filter((p) =>
      p.partenariatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.province.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.numero || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [partenariats, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPartenariats.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartenariats.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>

        {/* Recherche et Table */}
        <div className="p-6 bg-gray-50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Partenariats</h2>
            <p className="text-[#6B7A99]">Liste des partenariats enregistrés</p>
          </div>

          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full max-w-md mb-8">
            <FaSearch className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, province ou numéro..."
              className="outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">Nom du partenariat</th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">Province</th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">Numéro</th>
                    <th className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b text-sm text-gray-900">{p.partenariatName}</td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900 font-medium">{p.province.province}</td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">{p.numero}</td>
                      <td className="py-2 px-4 border-b text-sm text-gray-900">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => {
                            setSelectedPartenariat(p);
                            setActiveTab("general");
                          }}
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between px-4 py-3">
            <p className="text-sm text-gray-700">
              Affichage de{' '}
              <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredPartenariats.length)}</span>{' '}
              sur <span className="font-medium">{filteredPartenariats.length}</span> résultats
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <select
                value={currentPage}
                onChange={(e) => paginate(Number(e.target.value))}
                className="px-3 py-2 border rounded bg-white"
              >
                {Array.from({ length: totalPages }, (_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedPartenariat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-bold text-blue-900">Détails du Partenariat</h3>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedPartenariat(null)}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-6">
              {["general", "partenaires", "domaines"].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-4 -mb-px font-medium text-sm border-b-2 ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "general" && "Infos Générales"}
                  {tab === "partenaires" && "Partenaires"}
                  {tab === "domaines" && "Domaines & Populations"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-gray-800">
              {/* Infos Générales + Contributions */}
              {activeTab === "general" && (
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Nom", value: selectedPartenariat.partenariatName },
                    { label: "Province", value: selectedPartenariat.province.province },
                    { label: "Numéro", value: selectedPartenariat.numero },
                    { label: "Durée partenariat", value: `${selectedPartenariat.dureepartenariat} mois` },
                    { label: "Type", value: selectedPartenariat.type },
                    { label: "Contribution financière de l'Entraide Nationale", value: `${selectedPartenariat.estimatioFinancier} DH` },
                    { label: "Montant global", value: `${selectedPartenariat.montant_global} DH` },
                    { label: "Signataire", value: selectedPartenariat.signataire },
                    { label: "INDH", value: selectedPartenariat.indh},
                    { label: "Programme INDH", value: selectedPartenariat.programme_INDH },
                   
                    { label: "Date signature", value: selectedPartenariat.dateSignature },
                    { label: "Date lancement", value: selectedPartenariat.date_lancement },
                   
                    
                   
                 
                   
                    
                  ].map((info, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded shadow-sm">
                      <p className="text-gray-600 text-sm">{info.label}</p>
                      <p className="text-gray-800 font-medium">{info.value}</p>
                    </div>
                  ))}

                  <div className="col-span-2">
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      onClick={downloadPieceJointePartenariat(selectedPartenariat.id)}
    >
      Télécharger la pièce jointe
    </button>
  </div>
                </div>
              )}

              {/* Partenaires */}
                {activeTab === "partenaires" && (
  <div className="space-y-6">
    {selectedPartenariat.partenaires.map((p, idx) => (
      <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        {/* Header partenaire */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-blue-700">{p.partenaire}</h4>
          <span className="text-gray-500 italic">{p.type} - {p.soustype}</span>
        </div>

        {/* Infos du partenaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-800">
          <p><span className="font-medium text-gray-700">Tel:</span> {p.tel}</p>
          <p><span className="font-medium text-gray-700">Fax:</span> {p.fax}</p>
          <p><span className="font-medium text-gray-700">Adresse:</span> {p.adresse}</p>
          <p><span className="font-medium text-gray-700">Email:</span> {p.email}</p>
          <p><span className="font-medium text-gray-700">Web:</span> {p.web}</p>
          <p><span className="font-medium text-gray-700">Estimation:</span> {p.estimContribFinanc} DH</p>
        </div>

        {/* Contributions */}
        {p.contributions && p.contributions.length > 0 && (
          <div>
            <h5 className="text-blue-600 font-semibold mb-2">Contributions</h5>
            <ul className="list-disc list-inside text-gray-800">
              {p.contributions.map((c) => (
                <li key={c.id}>{c.contributionPartenaire}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
)}
    



              {/* Domaines / Populations / Types de centres */}
             
        {activeTab === "domaines" && (
  <div className="space-y-6">
    {/* Domaines */}
    <div>
      <h4 className="text-blue-700 font-bold mb-2">Domaines</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Domaine</th>
            </tr>
          </thead>
          <tbody>
            {selectedPartenariat.domaines.map((d, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-sm text-gray-800">{d.domaine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Populations cibles */}
    <div>
      <h4 className="text-blue-700 font-bold mb-2">Populations Cibles</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Population cible</th>
            </tr>
          </thead>
          <tbody>
            {selectedPartenariat.populationsCibles.map((p, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-sm text-gray-800">{p.populationCible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Types de centres */}
    <div>
      <h4 className="text-blue-700 font-bold mb-2">Types de centres</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Type de centre</th>
            </tr>
          </thead>
          <tbody>
            {selectedPartenariat.typesCentre.map((t, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-sm text-gray-800">{t.typeCentre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartenariatsPage;
