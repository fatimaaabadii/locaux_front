"use client"

import React, { useState } from "react"
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react"
import { FaThList, FaTimes, FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCookie } from "cookies-next"
import { getCurrentUser, getAxes, createAxe, updateAxe, deleteAxe } from "/src/api"

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-900 text-white">
                    <h2 className="text-xl font-bold">Détails de l'Axe</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors duration-200">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
            </div>
        </div>
    )
}

const AxesManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedAxe, setSelectedAxe] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [formData, setFormData] = useState({
        nom: "",
        description: "",
    })
    const [editFormData, setEditFormData] = useState(null)

    const queryClient = useQueryClient()
    const { data: userData } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
    })

    const { data: axes = [], isLoading, error } = useQuery({
        queryKey: ["axes"],
        queryFn: getAxes,
    })

    React.useEffect(() => {
        if (selectedAxe && showEditModal) {
            setEditFormData({
                nom: selectedAxe.nom || "",
                description: selectedAxe.description || "",
            })
        }
    }, [selectedAxe, showEditModal])

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const createMutation = useMutation({
        mutationFn: (data) => createAxe(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["axes"])
            setShowCreateModal(false)
            setFormData({ nom: "", description: "" })
            alert("Axe créé avec succès!")
        },
        onError: (error) => {
            console.error("Create error:", error)
            const message = error.response?.data?.message || error.message || "Erreur lors de la création"
            alert(`Erreur: ${message}`)
        },
    })

    const handleCreateSubmit = (e) => {
        e.preventDefault()
        if (!formData.nom.trim()) {
            alert("Le nom de l'axe est requis")
            return
        }
        createMutation.mutate(formData)
    }

    const editMutation = useMutation({
        mutationFn: ({ id, data }) => updateAxe(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["axes"])
            setSelectedAxe(data)
            setShowEditModal(false)
            alert("Axe modifié avec succès!")
        },
        onError: (error) => {
            console.error("Edit error:", error)
            const message = error.response?.data?.message || error.message || "Erreur lors de la mise à jour"
            alert(`Erreur: ${message}`)
        },
    })

    const handleEditSubmit = (e) => {
        e.preventDefault()
        if (!editFormData.nom.trim()) {
            alert("Le nom de l'axe est requis")
            return
        }
        editMutation.mutate({ id: selectedAxe.id, data: editFormData })
    }

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteAxe(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["axes"])
            setShowDeleteModal(false)
            setSelectedAxe(null)
            alert("Axe supprimé avec succès!")
        },
        onError: (error) => {
            console.error("Delete error:", error)
            const message = error.response?.data?.message || error.message || "Erreur lors de la suppression"
            alert(`Erreur: ${message}`)
        },
    })

    const handleDelete = () => {
        if (!selectedAxe?.id) {
            alert("ID de l'axe non trouvé")
            return
        }
        deleteMutation.mutate(selectedAxe.id)
    }

    const itemsPerPage = 10

    const filteredAxes = Array.isArray(axes)
        ? axes.filter((axe) => axe.nom?.toLowerCase().includes(searchTerm.toLowerCase()))
        : []

    const totalPages = Math.ceil(filteredAxes.length / itemsPerPage)
    const paginatedAxes = filteredAxes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Display error if any
    if (error) {
        return (
            <div className="ml-64 bg-gray-50 min-h-screen p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Erreur:</strong> {error.message}
                </div>
            </div>
        )
    }

    return (
        <div className="ml-64 bg-gray-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
                <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
                <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
            </div>

            <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-900">Liste des Axes</h2>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} />
                        Nouvel Axe
                    </button>
                </div>

                <div className="flex space-x-4 mb-6">
                    <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
                        <Search className="text-gray-400 text-lg mr-2 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un axe..."
                            className="outline-none w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    {isLoading ? (
                        <div className="p-4 text-center">Chargement...</div>
                    ) : filteredAxes.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Aucun axe trouvé</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 border-b font-semibold text-gray-700">Nom</th>
                                <th className="py-3 px-4 border-b font-semibold text-gray-700">Description</th>
                                <th className="py-3 px-4 border-b font-semibold text-gray-700 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedAxes.map((axe) => (
                                <tr key={axe.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 border-b font-medium">{axe.nom}</td>
                                    <td className="py-3 px-4 border-b text-gray-600">
                                        {axe.description || "Aucune description"}
                                    </td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                                onClick={() => {
                                                    setSelectedAxe(axe)
                                                    setShowDetailsModal(true)
                                                }}
                                                title="Voir les détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors"
                                                onClick={() => {
                                                    setSelectedAxe(axe)
                                                    setShowEditModal(true)
                                                }}
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                                                onClick={() => {
                                                    setSelectedAxe(axe)
                                                    setShowDeleteModal(true)
                                                }}
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                className={`px-3 py-1 rounded border transition-colors ${
                                    currentPage === index + 1
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white hover:bg-gray-100 border-gray-300"
                                }`}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Modal Détails */}
                <Modal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false)
                        setSelectedAxe(null)
                    }}
                >
                    {selectedAxe && (
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedAxe.nom}</h3>
                                <div className="mt-4">
                                    <label className="text-sm font-semibold text-gray-600">Description:</label>
                                    <p className="text-gray-700 mt-1">{selectedAxe.description || "Aucune description"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Création */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false)
                        setFormData({ nom: "", description: "" })
                    }}
                >
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                        <h3 className="text-2xl font-bold mb-4 text-blue-900">Nouvel Axe</h3>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold text-lg mb-4 text-blue-800 flex items-center">
                                <FaThList className="mr-2" />
                                Informations de l'Axe
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Nom *</label>
                                    <input
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                        required
                                        placeholder="Entrez le nom de l'axe"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        placeholder="Entrez une description (optionnel)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setFormData({ nom: "", description: "" })
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? "Création..." : "Créer"}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Modal Modification */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedAxe(null)
                        setEditFormData(null)
                    }}
                >
                    {editFormData && (
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <h3 className="text-2xl font-bold mb-4 text-blue-900">Modifier l'Axe</h3>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-bold text-lg mb-4 text-blue-800 flex items-center">
                                    <FaThList className="mr-2" />
                                    Informations de l'Axe
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Nom *</label>
                                        <input
                                            name="nom"
                                            value={editFormData.nom}
                                            onChange={handleEditChange}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                            required
                                            placeholder="Entrez le nom de l'axe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Description</label>
                                        <textarea
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditChange}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                            placeholder="Entrez une description (optionnel)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setSelectedAxe(null)
                                        setEditFormData(null)
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    disabled={editMutation.isPending}
                                >
                                    {editMutation.isPending ? "Modification..." : "Modifier"}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Modal Suppression */}
                {showDeleteModal && selectedAxe && (
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
                                    Êtes-vous sûr de vouloir supprimer l'axe <span className="font-semibold">"{selectedAxe.nom}"</span> ?
                                </p>
                                <p className="text-sm text-red-600 mt-2">Cette action est irréversible.</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedAxe(null)
                                    }}
                                    disabled={deleteMutation.isPending}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AxesManagementPage