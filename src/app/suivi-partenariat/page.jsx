"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getPartenariats , getCurrentUser} from "/src/api";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, FileText } from "lucide-react";
export default function PartenariatsPage() {

  const [currentPage, setCurrentPage] = useState(1);
  const [suiviPage, setSuiviPage] = useState(1);
  const itemsPerPage = 5;



  const queryClient = useQueryClient();
  const [selectedPart, setSelectedPart] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [suiviForm, setSuiviForm] = useState({
    etatAvancement: "",
    etat: "",
    commentaire: "",
    projetOperationel: "",
    objectifAtteints: "",
    dateSuivi: "",
    avenant: "",
  });

  const { data: partenariatsData } = useQuery({
    queryKey: ["partenariats"],
    queryFn: getPartenariats(),
  });
 const { data: userData } = useQuery({
    queryKey: ["userData"],
    queryFn: getCurrentUser,
  });
  const partenariats = Array.isArray(partenariatsData) ? partenariatsData : [];

  const { data: suivis = [] } = useQuery({
    queryKey: ["suivis", selectedPart],
    queryFn: () =>
      api.get(`/suivi/partenariat/${selectedPart}`).then((res) => res.data),
    enabled: !!selectedPart,
  });

 const addSuiviMutation = useMutation({
    mutationFn: (newSuivi) =>
      api.post("/suivi/create", newSuivi).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["suivis", variables.idpart]);
      setSuiviForm({
        etatAvancement: "",
        etat: "",
        commentaire: "",
        projetOperationel: "",
        objectifAtteints: "",
        dateSuivi: "",
        avenant: "",
      });
      setShowModal(false);
      alert("Suivi ajouté avec succès !");
    },
    onError: () => {
      alert("Erreur lors de l'ajout du suivi.");
    },
  });

  // Pagination logic for partenariats
  const totalPages = Math.ceil(partenariats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPartenariats = partenariats.slice(startIndex, endIndex);

  // Pagination logic for suivis
  const totalSuiviPages = Math.ceil(suivis.length / itemsPerPage);
  const suiviStartIndex = (suiviPage - 1) * itemsPerPage;
  const suiviEndIndex = suiviStartIndex + itemsPerPage;
  const currentSuivis = suivis.slice(suiviStartIndex, suiviEndIndex);

  const handleChange = (e) => {
    setSuiviForm({ ...suiviForm, [e.target.name]: e.target.value });
  };

  const handleSubmitSuivi = (partId) => {
    addSuiviMutation.mutate({ ...suiviForm, idpart: partId });
  };

  const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        Page {currentPage} sur {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => onPageChange(idx + 1)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentPage === idx + 1
                ? "bg-blue-900 text-white"
                : "border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
   <div className="min-h-screen bg-gray-100 flex">
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>
     <div className="p-6 bg-gray-50">
        <div className="mb-8">
         <h2 className="text-2xl font-bold text-blue-900 mb-2">Suivi des partenariats établis</h2>
          
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nom du Partenariat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPartenariats.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.partenariatName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.province.province}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {p.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors shadow-sm"
                        onClick={() => {
                          setSelectedPart(p.id);
                          setShowModal(true);
                          setSuiviPage(1);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter suivi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un suivi</h2>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-1">Informations du suivi</h3>
                <p className="text-sm text-blue-700">Remplissez les détails du suivi pour ce partenariat</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    État d'avancement (%)
                  </label>
                  <input
                    type="number"
                    name="etatAvancement"
                    placeholder="Ex: 75"
                    value={suiviForm.etatAvancement}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    État du partenariat
                  </label>
                  <select
                    name="etat"
                    value={suiviForm.etat}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Sélectionner un état</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Résiliée">Résiliée</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date du suivi
                  </label>
                  <input
                    type="date"
                    name="dateSuivi"
                    value={suiviForm.dateSuivi}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                 <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Projet opérationnel
                  </label>
                  <select
                    name="projetOperationel"
                    value={suiviForm.projetOperationel}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Sélectionner une option</option>
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Objectifs atteints
                  </label>
                  <input
                    type="text"
                    name="objectifAtteints"
                    placeholder="Vos objectifs atteints "
                    value={suiviForm.objectifAtteints}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Avenant
                  </label>
                  <input
                    type="text"
                    name="avenant"
                    placeholder=" Avenant"
                    value={suiviForm.avenant}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commentaire
                  </label>
                  <textarea
                    name="commentaire"
                    placeholder="Ajoutez vos observations..."
                    value={suiviForm.commentaire}
                    onChange={handleChange}
                    rows="3"
                    className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md font-semibold"
                onClick={() => handleSubmitSuivi(selectedPart)}
              >
                Enregistrer le suivi
              </button>

              {/* Tableau des suivis existants */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Historique des suivis</h3>
                {suivis.length > 0 ? (
                  <>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">État</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avancement</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commentaire</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Projet</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avenant</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Objectifs</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentSuivis.map((s) => (
                              <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{s.dateSuivi}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                    {s.etat}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${s.etatAvancement}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium">{s.etatAvancement}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{s.commentaire}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{s.projetOperationel}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{s.avenant}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{s.objectifAtteints}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {totalSuiviPages > 1 && (
                      <PaginationControls
                        currentPage={suiviPage}
                        totalPages={totalSuiviPages}
                        onPageChange={setSuiviPage}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Aucun suivi enregistré pour ce partenariat</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      )}
    </div>
    </div>
  );
  
}