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
        actif: true,
    })
    const [editFormData, setEditFormData] = useState(null)

    const queryClient = useQueryClient()
    const { data: userData } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
    })

    const { data: axes = [], isLoading } = useQuery({
        queryKey: ["axes"],
        queryFn: getAxes,
    })

    const token = getCookie("token")
    const headers = { Authorization: `Bearer ${token}` }

    React.useEffect(() => {
        if (selectedAxe && showEditModal) {
            setEditFormData({
                nom: selectedAxe.nom || "",
                description: selectedAxe.description || "",
                actif: selectedAxe.actif !== false,
            })
        }
    }, [selectedAxe, showEditModal])

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target
        setEditFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const createMutation = useMutation({
        mutationFn: (data) => createAxe(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["axes"])
            setShowCreateModal(false)
            setFormData({ nom: "", description: "", actif: true })
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || "Erreur lors de la création"
            alert(`Erreur: ${message}`)
        },
    })

    const handleCreateSubmit = (e) => {
        e.preventDefault()
        createMutation.mutate(formData)
    }

    const editMutation = useMutation({
        mutationFn: (data) => updateAxe(selectedAxe.id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["axes"])
            setSelectedAxe(data)
            setShowEditModal(false)
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || "Erreur lors de la mise à jour"
            alert(`Erreur: ${message}`)
        },
    })

    const handleEditSubmit = (e) => {
        e.preventDefault()
        editMutation.mutate(editFormData)
    }

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteAxe(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["axes"])
            setShowDeleteModal(false)
            setSelectedAxe(null)
        },
    })

    const handleDelete = () => {
        deleteMutation.mutate(selectedAxe.id)
    }

    const itemsPerPage = 10

    const filteredAxes = axes.filter((axe) => axe.nom?.toLowerCase().includes(searchTerm.toLowerCase()))

    const totalPages = Math.ceil(filteredAxes.length / itemsPerPage)
    const paginatedAxes = filteredAxes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Nom</th>
                                <th className="py-2 px-4 border-b">Description</th>
                                <th className="py-2 px-4 border-b">Statut</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedAxes.map((axe) => (
                                <tr key={axe.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{axe.nom}</td>
                                    <td className="py-2 px-4 border-b">{axe.description}</td>
                                    <td className="py-2 px-4 border-b">
                                        {axe.actif ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b space-x-2">
                                        <button
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                            onClick={() => {
                                                setSelectedAxe(axe)
                                                setShowDetailsModal(true)
                                            }}
                                        >
                                            <Eye size={16} /> Détails
                                        </button>
                                        <button
                                            className="text-green-600 hover:underline flex items-center gap-1"
                                            onClick={() => {
                                                setSelectedAxe(axe)
                                                setShowEditModal(true)
                                            }}
                                        >
                                            <Edit size={16} /> Modifier
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline flex items-center gap-1"
                                            onClick={() => {
                                                setSelectedAxe(axe)
                                                setShowDeleteModal(true)
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

                <div className="mt-4 flex justify-center gap-2">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={`px-3 py-1 rounded border ${currentPage === index + 1 ? "bg-gray-300" : ""}`}
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
                        setShowDetailsModal(false)
                        setSelectedAxe(null)
                    }}
                >
                    {selectedAxe && (
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedAxe.nom}</h3>
                                <p className="text-gray-600">{selectedAxe.description}</p>
                            </div>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-600 mr-2">Statut:</span>
                                {selectedAxe.actif ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <FaCheckCircle className="mr-1" size={12} />
                    Active
                  </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FaTimesCircle className="mr-1" size={12} />
                    Inactive
                  </span>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Création */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false)
                        setFormData({ nom: "", description: "", actif: true })
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
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="actif"
                                        checked={formData.actif}
                                        onChange={handleFormChange}
                                        className="mr-2"
                                    />
                                    <label className="font-medium text-sm">Axe actif</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={createMutation.isLoading}
                            >
                                {createMutation.isLoading ? "Création..." : "Créer"}
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
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="actif"
                                            checked={editFormData.actif}
                                            onChange={handleEditChange}
                                            className="mr-2"
                                        />
                                        <label className="font-medium text-sm">Axe actif</label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    disabled={editMutation.isLoading}
                                >
                                    {editMutation.isLoading ? "Modification..." : "Modifier"}
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
                                >
                                    Annuler
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isLoading}
                                >
                                    {deleteMutation.isLoading ? "Suppression..." : "Supprimer"}
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
