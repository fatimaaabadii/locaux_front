"use client"

import React, { useState, useMemo } from "react"
import Select from "react-select"
import { Plus, Edit, Trash2, Search, Upload, Eye } from "lucide-react"
import { FaGraduationCap, FaUsers, FaTimes, FaCheckCircle, FaTimesCircle, FaFileAlt } from "react-icons/fa"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCookie } from "cookies-next"
import {
    api,
    getCurrentUser,
    getFormations,
    createFormationWithAttachments,
    updateFormation,
    deleteFormation,
    getAxes,
} from "@/api"

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-900 text-white">
                    <h2 className="text-xl font-bold">Détails de la Formation</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors duration-200">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
            </div>
        </div>
    )
}

const ModalSection = ({ icon: Icon, title, children, bgColor = "bg-gray-50" }) => (
    <div className={`${bgColor} rounded-lg p-4 mb-4`}>
        <div className="flex items-center mb-3">
            <Icon className="text-blue-600 mr-2" size={18} />
            <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
        </div>
        {children}
    </div>
)

const InfoGrid = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">{item.label}</div>
                <div className="text-sm font-medium text-gray-900">{item.value || "N/A"}</div>
            </div>
        ))}
    </div>
)

const StatusBadge = ({ status, label }) => (
    <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2">{label}:</span>
        {status ? (
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
)

const FormationManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFormation, setSelectedFormation] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)

    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)

    const [formData, setFormData] = useState({
        nom: "",
        dateLancement: "",
        dateDebut: "",
        dateFin: "",
        lieu: "",
        axeId: null,
        provinceId: null,
        personnelIds: [],
        actif: true,
    })
    const [selectedFiles, setSelectedFiles] = useState([])
    const [editFormData, setEditFormData] = useState(null)

    const queryClient = useQueryClient()
    const { data: userData } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
    })

    const { data: personnes = [] } = useQuery({
        queryKey: ["personnesProvince", userData?.province?.symbols],
        queryFn: async () => {
            const provincesRes = await api.get("http://172.16.20.90/api/internal/v1/provinces", {
                headers: {
                    "Content-Type": "application/json",
                    "X-Internal-Secret":
                        "cEhFIsMu6vvLpZ1KOeFhOLh0rhf42xgdsSfsdDHkRMJyaxaOVu7tTuX2C05OFbtozGV1uMthtkbvMyxGrAEPwK5qDFKy6eHBX29CRcjiDitHlDmjITGVlJZ7g4lZi7mg",
                },
            })
            const province = provincesRes.data.find((p) => p.symbols === userData?.province?.symbols)
            if (!province) return []
            const res = await api.get(`http://172.16.20.90/api/internal/v1/personnes/province/${province.id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Internal-Secret":
                        "cEhFIsMu6vvLpZ1KOeFhOLh0rhf42xgdsSfsdDHkRMJyaxaOVu7tTuX2C05OFbtozGV1uMthtkbvMyxGrAEPwK5qDFKy6eHBX29CRcjiDitHlDmjITGVlJZ7g4lZi7mg",
                },
            })
            return res.data
        },
        enabled: !!userData?.province?.symbols,
    })

    const { data: formations = [], isLoading } = useQuery({
        queryKey: ["formations"],
        queryFn: getFormations,
    })

    const { data: axes = [] } = useQuery({
        queryKey: ["axes"],
        queryFn: getAxes,
    })

    const token = getCookie("token")
    const headers = { Authorization: `Bearer ${token}` }

    React.useEffect(() => {
        if (selectedFormation && showEditModal) {
            setEditFormData({
                nom: selectedFormation.nom || "",
                dateLancement: selectedFormation.dateLancement || "",
                dateDebut: selectedFormation.dateDebut || "",
                dateFin: selectedFormation.dateFin || "",
                lieu: selectedFormation.lieu || "",
                axeId: selectedFormation.axe?.id || null,
                provinceId: selectedFormation.province?.id || null,
                personnelIds: selectedFormation.personnels?.map((p) => p.id) || [],
                actif: selectedFormation.actif !== false,
            })
        }
    }, [selectedFormation, showEditModal])

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
        mutationFn: async (data) => {
            if (selectedFiles.length > 0) {
                return createFormationWithAttachments(data.formation, data.files)
            } else {
                return api.post("/formations/simple", data.formation, { headers })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["formations"])
            setShowCreateModal(false)
            setFormData({
                nom: "",
                dateLancement: "",
                dateDebut: "",
                dateFin: "",
                lieu: "",
                axeId: null,
                provinceId: null,
                personnelIds: [],
                actif: true,
            })
            setSelectedFiles([])
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || "Erreur lors de la création"
            alert(`Erreur: ${message}`)
        },
    })

    const handleCreateSubmit = (e) => {
        e.preventDefault()
        createMutation.mutate({ formation: formData, files: selectedFiles })
    }

    const editMutation = useMutation({
        mutationFn: (data) => updateFormation(selectedFormation.id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(["formations"])
            setSelectedFormation(data)
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
        mutationFn: (id) => deleteFormation(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["formations"])
            setShowDeleteModal(false)
            setSelectedFormation(null)
        },
    })

    const handleDelete = () => {
        deleteMutation.mutate(selectedFormation.id)
    }

    const personnelOptions = useMemo(() => {
        if (!personnes || !Array.isArray(personnes)) return []
        return personnes.map((p) => ({ value: p.id, label: p.nom_prenom_fr }))
    }, [personnes])

    const axeOptions = useMemo(() => {
        return axes.map((a) => ({ value: a.id, label: a.nom }))
    }, [axes])

    const itemsPerPage = 10

    const filteredFormations = formations.filter((formation) =>
        formation.nom?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const totalPages = Math.ceil(filteredFormations.length / itemsPerPage)
    const paginatedFormations = filteredFormations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="ml-64 bg-gray-50 min-h-screen">
            <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
                <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
                <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
            </div>

            <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-blue-900">Liste des Formations</h2>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} />
                        Nouvelle Formation
                    </button>
                </div>

                <div className="flex space-x-4 mb-6">
                    <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full">
                        <Search className="text-gray-400 text-lg mr-2 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher une formation..."
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
                                <th className="py-2 px-4 border-b">Date Lancement</th>
                                <th className="py-2 px-4 border-b">Lieu</th>
                                <th className="py-2 px-4 border-b">Axe</th>
                                <th className="py-2 px-4 border-b">Statut</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedFormations.map((formation) => (
                                <tr key={formation.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">{formation.nom}</td>
                                    <td className="py-2 px-4 border-b">{formation.dateLancement}</td>
                                    <td className="py-2 px-4 border-b">{formation.lieu}</td>
                                    <td className="py-2 px-4 border-b">{formation.axe?.nom}</td>
                                    <td className="py-2 px-4 border-b">
                                        {formation.actif ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4 border-b space-x-2">
                                        <button
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                            onClick={() => {
                                                setSelectedFormation(formation)
                                                setShowDetailsModal(true)
                                            }}
                                        >
                                            <Eye size={16} /> Détails
                                        </button>
                                        <button
                                            className="text-green-600 hover:underline flex items-center gap-1"
                                            onClick={() => {
                                                setSelectedFormation(formation)
                                                setShowEditModal(true)
                                            }}
                                        >
                                            <Edit size={16} /> Modifier
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline flex items-center gap-1"
                                            onClick={() => {
                                                setSelectedFormation(formation)
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
                        setSelectedFormation(null)
                    }}
                >
                    {selectedFormation && (
                        <div className="p-6">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedFormation.nom}</h2>
                            </div>

                            <ModalSection icon={FaGraduationCap} title="Informations Générales" bgColor="bg-blue-50">
                                <InfoGrid
                                    data={[
                                        { label: "Nom", value: selectedFormation.nom },
                                        { label: "Date de lancement", value: selectedFormation.dateLancement },
                                        { label: "Date de début", value: selectedFormation.dateDebut },
                                        { label: "Date de fin", value: selectedFormation.dateFin },
                                        { label: "Lieu", value: selectedFormation.lieu },
                                        { label: "Axe", value: selectedFormation.axe?.nom },
                                        { label: "Province", value: selectedFormation.province?.province },
                                    ]}
                                />
                                <div className="mt-4">
                                    <StatusBadge status={selectedFormation.actif} label="Statut" />
                                </div>
                            </ModalSection>

                            {selectedFormation.personnels && selectedFormation.personnels.length > 0 && (
                                <ModalSection icon={FaUsers} title="Personnel" bgColor="bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedFormation.personnels.map((p, idx) => (
                                            <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                                {p.nom_prenom_fr}
                                            </div>
                                        ))}
                                    </div>
                                </ModalSection>
                            )}

                            <div className="mt-4">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    onClick={() => {
                                        setShowDetailsModal(false)
                                        setShowAttachmentsModal(true)
                                    }}
                                >
                                    <Upload className="inline mr-2" size={16} />
                                    Gérer les pièces jointes
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal Création */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false)
                        setFormData({
                            nom: "",
                            dateLancement: "",
                            dateDebut: "",
                            dateFin: "",
                            lieu: "",
                            axeId: null,
                            provinceId: null,
                            personnelIds: [],
                            actif: true,
                        })
                        setSelectedFiles([])
                    }}
                >
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                        <h3 className="text-2xl font-bold mb-4 text-blue-900">Nouvelle Formation</h3>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold text-lg mb-4 text-blue-800 flex items-center">
                                <FaGraduationCap className="mr-2" />
                                Informations de la Formation
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
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
                                    <label className="block mb-1 font-medium text-sm">Date de lancement *</label>
                                    <input
                                        type="date"
                                        name="dateLancement"
                                        value={formData.dateLancement}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Lieu</label>
                                    <input
                                        name="lieu"
                                        value={formData.lieu}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Date de début</label>
                                    <input
                                        type="date"
                                        name="dateDebut"
                                        value={formData.dateDebut}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Date de fin</label>
                                    <input
                                        type="date"
                                        name="dateFin"
                                        value={formData.dateFin}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Axe</label>
                                    <Select
                                        options={axeOptions}
                                        value={axeOptions.find((o) => o.value === formData.axeId)}
                                        onChange={(option) => setFormData((prev) => ({ ...prev, axeId: option?.value }))}
                                        placeholder="Sélectionner un axe"
                                        isClearable
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-sm">Personnel</label>
                                    <Select
                                        options={personnelOptions}
                                        value={personnelOptions.filter((o) => formData.personnelIds.includes(o.value))}
                                        onChange={(options) =>
                                            setFormData((prev) => ({ ...prev, personnelIds: options?.map((o) => o.value) || [] }))
                                        }
                                        placeholder="Sélectionner le personnel"
                                        isMulti
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
                                    <label className="font-medium text-sm">Formation active</label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                                <FaFileAlt className="mr-2" />
                                Pièces jointes (optionnel)
                            </h4>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                                className="w-full"
                            />
                            {selectedFiles.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">{selectedFiles.length} fichier(s) sélectionné(s)</div>
                            )}
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
                        setSelectedFormation(null)
                        setEditFormData(null)
                    }}
                >
                    {editFormData && (
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <h3 className="text-2xl font-bold mb-4 text-blue-900">Modifier la Formation</h3>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-bold text-lg mb-4 text-blue-800 flex items-center">
                                    <FaGraduationCap className="mr-2" />
                                    Informations de la Formation
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
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
                                        <label className="block mb-1 font-medium text-sm">Date de lancement *</label>
                                        <input
                                            type="date"
                                            name="dateLancement"
                                            value={editFormData.dateLancement}
                                            onChange={handleEditChange}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Lieu</label>
                                        <input
                                            name="lieu"
                                            value={editFormData.lieu}
                                            onChange={handleEditChange}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Date de début</label>
                                        <input
                                            type="date"
                                            name="dateDebut"
                                            value={editFormData.dateDebut}
                                            onChange={handleEditChange}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Date de fin</label>
                                        <input
                                            type="date"
                                            name="dateFin"
                                            value={editFormData.dateFin}
                                            onChange={handleEditChange}
                                            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Axe</label>
                                        <Select
                                            options={axeOptions}
                                            value={axeOptions.find((o) => o.value === editFormData.axeId)}
                                            onChange={(option) => setEditFormData((prev) => ({ ...prev, axeId: option?.value }))}
                                            placeholder="Sélectionner un axe"
                                            isClearable
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 font-medium text-sm">Personnel</label>
                                        <Select
                                            options={personnelOptions}
                                            value={personnelOptions.filter((o) => editFormData.personnelIds.includes(o.value))}
                                            onChange={(options) =>
                                                setEditFormData((prev) => ({ ...prev, personnelIds: options?.map((o) => o.value) || [] }))
                                            }
                                            placeholder="Sélectionner le personnel"
                                            isMulti
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
                                        <label className="font-medium text-sm">Formation active</label>
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
                {showDeleteModal && selectedFormation && (
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
                                    Êtes-vous sûr de vouloir supprimer la formation{" "}
                                    <span className="font-semibold">"{selectedFormation.nom}"</span> ?
                                </p>
                                <p className="text-sm text-red-600 mt-2">Cette action est irréversible.</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setSelectedFormation(null)
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

export default FormationManagementPage
