"use client"

import React, { useState, useMemo } from "react"
import Select from "react-select"
import { Plus, Edit, Trash2, Search, Upload, Eye } from "lucide-react"
import { FaGraduationCap, FaUsers, FaTimes, FaMapMarkerAlt } from "react-icons/fa"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getCurrentUser,
    getFormations,
    createFormationWithAttachments,
    updateFormation,
    deleteFormation,
    getAxes,
    getAttachmentsByFormation,
    uploadMultipleAttachments,
    downloadAttachment,
    deleteAttachment,
    getAllDelegations,
    api,
} from "/src/api"

const Modal = ({ isOpen, onClose, children, title = "Détails de la Formation" }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-900 text-white">
                    <h2 className="text-xl font-bold">{title}</h2>
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
        description: "",
        dateDebut: "",
        dateFin: "",
        organisateur: "",
        lieu: "",
        axeId: null,
        provinceId: null,
        personnelIds: [],
    })
    const [selectedFiles, setSelectedFiles] = useState([])
    const [editFormData, setEditFormData] = useState(null)

    const queryClient = useQueryClient()

    const { data: userData } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
    })

    const {
        data: formations = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["formations"],
        queryFn: getFormations,
    })

    const { data: axes = [] } = useQuery({
        queryKey: ["axes"],
        queryFn: getAxes,
    })

    const { data: delegations = [] } = useQuery({
        queryKey: ["delegations"],
        queryFn: getAllDelegations,
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

    const { data: attachments = [], refetch: refetchAttachments } = useQuery({
        queryKey: ["attachments", selectedFormation?.id],
        queryFn: () => getAttachmentsByFormation(selectedFormation.id),
        enabled: !!selectedFormation?.id && showAttachmentsModal,
    })

    React.useEffect(() => {
        if (selectedFormation && showEditModal) {
            const formatDateSafe = (date) => {
                if (!date) return ""
                if (typeof date === "string") {
                    return date.split("T")[0]
                }
                return new Date(date).toISOString().split("T")[0]
            }

            setEditFormData({
                nom: selectedFormation.nom || "",
                description: selectedFormation.description || "",
                dateDebut: formatDateSafe(selectedFormation.dateDebut),
                dateFin: formatDateSafe(selectedFormation.dateFin),
                organisateur: selectedFormation.organisateur || "",
                lieu: selectedFormation.lieu || "",
                axeId: selectedFormation.axeId || null,
                provinceId: selectedFormation.provinceId || null,
                personnelIds: selectedFormation.personnelIds || [],
            })
        }
    }, [selectedFormation, showEditModal])

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
        mutationFn: async (data) => {
            const formattedData = {
                ...data.formation,
                dateDebut: data.formation.dateDebut ? new Date(data.formation.dateDebut).toISOString() : null,
                dateFin: data.formation.dateFin ? new Date(data.formation.dateFin).toISOString() : null,
            }
            return createFormationWithAttachments(formattedData, data.files)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["formations"])
            setShowCreateModal(false)
            setFormData({
                nom: "",
                description: "",
                dateDebut: "",
                dateFin: "",
                organisateur: "",
                lieu: "",
                axeId: null,
                provinceId: null,
                personnelIds: [],
            })
            setSelectedFiles([])
            alert("Formation créée avec succès!")
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
            alert("Le nom de la formation est requis")
            return
        }
        createMutation.mutate({ formation: formData, files: selectedFiles })
    }

    const editMutation = useMutation({
        mutationFn: ({ id, data }) => {
            const formattedData = {
                ...data,
                dateDebut: data.dateDebut ? new Date(data.dateDebut).toISOString() : null,
                dateFin: data.dateFin ? new Date(data.dateFin).toISOString() : null,
            }
            return updateFormation(id, formattedData)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(["formations"])
            setSelectedFormation(data)
            setShowEditModal(false)
            alert("Formation modifiée avec succès!")
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
            alert("Le nom de la formation est requis")
            return
        }
        editMutation.mutate({ id: selectedFormation.id, data: editFormData })
    }

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteFormation(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["formations"])
            setShowDeleteModal(false)
            setSelectedFormation(null)
            alert("Formation supprimée avec succès!")
        },
        onError: (error) => {
            console.error("Delete error:", error)
            const message = error.response?.data?.message || error.message || "Erreur lors de la suppression"
            alert(`Erreur: ${message}`)
        },
    })

    const handleDelete = () => {
        if (!selectedFormation?.id) {
            alert("ID de la formation non trouvé")
            return
        }
        deleteMutation.mutate(selectedFormation.id)
    }

    const uploadAttachmentsMutation = useMutation({
        mutationFn: ({ formationId, files }) => uploadMultipleAttachments(formationId, files),
        onSuccess: () => {
            refetchAttachments()
            alert("Fichiers téléchargés avec succès!")
        },
        onError: (error) => {
            console.error("Upload error:", error)
            alert("Erreur lors du téléchargement des fichiers")
        },
    })

    const deleteAttachmentMutation = useMutation({
        mutationFn: (attachmentId) => deleteAttachment(attachmentId),
        onSuccess: () => {
            refetchAttachments()
            alert("Fichier supprimé avec succès!")
        },
        onError: (error) => {
            console.error("Delete attachment error:", error)
            alert("Erreur lors de la suppression du fichier")
        },
    })

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0 && selectedFormation?.id) {
            uploadAttachmentsMutation.mutate({ formationId: selectedFormation.id, files })
            e.target.value = null
        }
    }

    const handleDownloadAttachment = async (attachment) => {
        try {
            await downloadAttachment(attachment.id, attachment.originalFileName)
        } catch (error) {
            console.error("Download error:", error)
            alert("Erreur lors du téléchargement du fichier")
        }
    }

    const axeOptions = useMemo(() => {
        return Array.isArray(axes) ? axes.map((a) => ({ value: a.id, label: a.nom })) : []
    }, [axes])

    const delegationOptions = useMemo(() => {
        return Array.isArray(delegations) ? delegations.map((d) => ({ value: d.id, label: d.province })) : []
    }, [delegations])

    const personnelOptions = useMemo(() => {
        if (!personnes || !Array.isArray(personnes)) return []
        return personnes.map((p) => ({ value: p.id, label: p.nom_prenom_fr }))
    }, [personnes])

    const itemsPerPage = 10
    const filteredFormations = Array.isArray(formations)
        ? formations.filter((formation) => formation.nom?.toLowerCase().includes(searchTerm.toLowerCase()))
        : []

    const totalPages = Math.ceil(filteredFormations.length / itemsPerPage)
    const paginatedFormations = filteredFormations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleDateString("fr-FR")
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 B"
        if (bytes < 1024) return bytes + " B"
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
        return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    }

    const getAxeName = (axeId) => {
        const axe = axes.find((a) => a.id === axeId)
        return axe?.nom || "N/A"
    }

    const getProvinceName = (provinceId) => {
        const province = delegations.find((d) => d.id === provinceId)
        return province?.province || "N/A"
    }

    const getPersonnelNames = (personnelIds) => {
        if (!Array.isArray(personnelIds) || personnelIds.length === 0) return "Aucun"
        const names = personnelIds
            .map((id) => {
                const person = personnes.find((p) => p.id === id)
                return person?.nom_prenom_fr || ""
            })
            .filter(Boolean)
        return names.length > 0 ? names.join(", ") : "N/A"
    }

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
                    ) : filteredFormations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Aucune formation trouvée</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 border-b font-semibold text-gray-700">Nom</th>
                                <th className="py-3 px-4 border-b font-semibold text-gray-700">Organisateur</th>
                                <th className="py-3 px-4 border-b font-semibold text-gray-700">Lieu</th>
                                <th className="py-3 px-4 border-b font-semibold text-gray-700">Date Début</th>
                                <th className="py-3 px-4 border-b font-semibold text-gray-700 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedFormations.map((formation) => (
                                <tr key={formation.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 border-b font-medium">{formation.nom}</td>
                                    <td className="py-3 px-4 border-b text-gray-600">{formation.organisateur || "N/A"}</td>
                                    <td className="py-3 px-4 border-b text-gray-600">{formation.lieu || "N/A"}</td>
                                    <td className="py-3 px-4 border-b text-gray-600">{formatDate(formation.dateDebut)}</td>
                                    <td className="py-3 px-4 border-b">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                onClick={() => {
                                                    setSelectedFormation(formation)
                                                    setShowDetailsModal(true)
                                                }}
                                                title="Voir les détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                                onClick={() => {
                                                    setSelectedFormation(formation)
                                                    setShowAttachmentsModal(true)
                                                }}
                                                title="Gérer les pièces jointes"
                                            >
                                                <Upload size={16} />
                                            </button>
                                            <button
                                                className="text-green-600 hover:text-green-800 transition-colors"
                                                onClick={() => {
                                                    setSelectedFormation(formation)
                                                    setShowEditModal(true)
                                                }}
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                onClick={() => {
                                                    setSelectedFormation(formation)
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
                                className={`px-3 py-1 border rounded ${
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
                                <p className="text-gray-600">{selectedFormation.description || "Aucune description"}</p>
                            </div>

                            <ModalSection icon={FaGraduationCap} title="Informations Générales" bgColor="bg-blue-50">
                                <InfoGrid
                                    data={[
                                        { label: "Nom", value: selectedFormation.nom },
                                        { label: "Organisateur", value: selectedFormation.organisateur },
                                        { label: "Date de début", value: formatDate(selectedFormation.dateDebut) },
                                        { label: "Date de fin", value: formatDate(selectedFormation.dateFin) },
                                        { label: "Lieu", value: selectedFormation.lieu },
                                        { label: "Axe", value: getAxeName(selectedFormation.axeId) },
                                    ]}
                                />
                            </ModalSection>

                            <ModalSection icon={FaMapMarkerAlt} title="Localisation" bgColor="bg-green-50">
                                <InfoGrid
                                    data={[{ label: "Province/Délégation", value: getProvinceName(selectedFormation.provinceId) }]}
                                />
                            </ModalSection>

                            <ModalSection icon={FaUsers} title="Participants" bgColor="bg-purple-50">
                                <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                        Personnel Assigné
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {getPersonnelNames(selectedFormation.personnelIds)}
                                    </div>
                                </div>
                            </ModalSection>
                        </div>
                    )}
                </Modal>

                {/* Added Create Modal */}
                <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer une Formation">
                    <form onSubmit={handleCreateSubmit}>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nom">
                                    Nom
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="nom"
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateDebut">
                                    Date de Début
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="dateDebut"
                                    type="date"
                                    name="dateDebut"
                                    value={formData.dateDebut}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateFin">
                                    Date de Fin
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="dateFin"
                                    type="date"
                                    name="dateFin"
                                    value={formData.dateFin}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="organisateur">
                                    Organisateur
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="organisateur"
                                    type="text"
                                    name="organisateur"
                                    value={formData.organisateur}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lieu">
                                    Lieu
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="lieu"
                                    type="text"
                                    name="lieu"
                                    value={formData.lieu}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="axeId">
                                    Axe
                                </label>
                                <Select
                                    className="w-full"
                                    options={axeOptions}
                                    value={axeOptions.find((option) => option.value === formData.axeId)}
                                    onChange={(option) => setFormData((prev) => ({ ...prev, axeId: option?.value }))}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provinceId">
                                    Province/Délégation
                                </label>
                                <Select
                                    className="w-full"
                                    options={delegationOptions}
                                    value={delegationOptions.find((option) => option.value === formData.provinceId)}
                                    onChange={(option) => setFormData((prev) => ({ ...prev, provinceId: option?.value }))}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="personnelIds">
                                    Participants
                                </label>
                                <Select
                                    className="w-full"
                                    options={personnelOptions}
                                    value={personnelOptions.filter((option) => formData.personnelIds.includes(option.value))}
                                    isMulti
                                    onChange={(options) =>
                                        setFormData((prev) => ({ ...prev, personnelIds: options.map((option) => option.value) }))
                                    }
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="files">
                                    Fichiers
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" type="submit">
                                    Créer
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal>

                {/* Added Edit Modal */}
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier une Formation">
                    {editFormData && (
                        <form onSubmit={handleEditSubmit}>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nom">
                                        Nom
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="nom"
                                        type="text"
                                        name="nom"
                                        value={editFormData.nom}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                        Description
                                    </label>
                                    <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="description"
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateDebut">
                                        Date de Début
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="dateDebut"
                                        type="date"
                                        name="dateDebut"
                                        value={editFormData.dateDebut}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dateFin">
                                        Date de Fin
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="dateFin"
                                        type="date"
                                        name="dateFin"
                                        value={editFormData.dateFin}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="organisateur">
                                        Organisateur
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="organisateur"
                                        type="text"
                                        name="organisateur"
                                        value={editFormData.organisateur}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lieu">
                                        Lieu
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="lieu"
                                        type="text"
                                        name="lieu"
                                        value={editFormData.lieu}
                                        onChange={handleEditChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="axeId">
                                        Axe
                                    </label>
                                    <Select
                                        className="w-full"
                                        options={axeOptions}
                                        value={axeOptions.find((option) => option.value === editFormData.axeId)}
                                        onChange={(option) => setEditFormData((prev) => ({ ...prev, axeId: option?.value }))}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provinceId">
                                        Province/Délégation
                                    </label>
                                    <Select
                                        className="w-full"
                                        options={delegationOptions}
                                        value={delegationOptions.find((option) => option.value === editFormData.provinceId)}
                                        onChange={(option) => setEditFormData((prev) => ({ ...prev, provinceId: option?.value }))}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="personnelIds">
                                        Participants
                                    </label>
                                    <Select
                                        className="w-full"
                                        options={personnelOptions}
                                        value={personnelOptions.filter((option) => editFormData.personnelIds.includes(option.value))}
                                        isMulti
                                        onChange={(options) =>
                                            setEditFormData((prev) => ({ ...prev, personnelIds: options.map((option) => option.value) }))
                                        }
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" type="submit">
                                        Modifier
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Added Delete Modal */}
                <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Supprimer une Formation">
                    {selectedFormation && (
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Êtes-vous sûr de vouloir supprimer la formation <strong>{selectedFormation.nom}</strong> ?
                            </p>
                            <div className="flex justify-end">
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mr-2"
                                    onClick={handleDelete}
                                >
                                    Supprimer
                                </button>
                                <button
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Added Attachments Modal */}
                <Modal
                    isOpen={showAttachmentsModal}
                    onClose={() => {
                        setShowAttachmentsModal(false)
                        setSelectedFormation(null)
                    }}
                    title="Pièces Jointes"
                >
                    {attachments.length > 0 ? (
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="files">
                                    Télécharger des Fichiers
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {attachments.map((attachment) => (
                                    <div key={attachment.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                        <div className="text-sm font-medium text-gray-900 mb-1">{attachment.originalFileName}</div>
                                        <div className="text-xs text-gray-500">Taille: {formatFileSize(attachment.size)}</div>
                                        <div className="flex justify-between items-center mt-3">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                onClick={() => handleDownloadAttachment(attachment)}
                                            >
                                                Télécharger
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600 mb-4">Aucun fichier joint trouvé pour cette formation.</p>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="files">
                                    Télécharger des Fichiers
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    )
}

export default FormationManagementPage