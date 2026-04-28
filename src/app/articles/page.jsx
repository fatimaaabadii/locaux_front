"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaSearch, FaPlus, FaTrash, FaImage, FaVideo, FaTimes, FaUpload, FaEye, FaDownload, FaSpinner } from "react-icons/fa";
import { api, getArticles, getCurrentUser, getTypeevenements, getMediaPresente , getArticlesByDelegations} from "/src/api";
import { getCookie } from "cookies-next";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

// ─── Utilitaire : fetch authentifié → Blob URL ────────────────────────────────
const fetchWithAuth = async (lien) => {
  const token = getCookie("token");
  const filename = lien.split("/").pop();
  const url = `${BASE_URL}/api/files/${filename}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Accès refusé ou fichier introuvable (${res.status})`);
  return res.blob();
};

const openFileWithAuth = async (lien, nomFichier, mode = "view") => {
  try {
    const blob = await fetchWithAuth(lien);
    const blobUrl = URL.createObjectURL(blob);
    if (mode === "view") {
      window.open(blobUrl, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = nomFichier;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    alert("Erreur : " + err.message);
  }
};

// ─── Aperçu image/vidéo authentifié ──────────────────────────────────────────
const AuthenticatedMedia = ({ lien, typeFichier, nomFichier }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    setLoading(true);
    setError(false);

    fetchWithAuth(lien)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lien]);

  if (loading)
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <FaSpinner className="animate-spin" /> Chargement de l'aperçu…
      </div>
    );
  if (error || !src) return null;

  if (typeFichier?.startsWith("image"))
    return (
      <img
        src={src}
        alt={nomFichier}
        className="mt-3 max-h-48 rounded-lg border border-gray-200 object-cover"
      />
    );

  if (typeFichier?.startsWith("video"))
    return (
      <video controls className="mt-3 max-h-48 rounded-lg border border-gray-200 w-full">
        <source src={src} type={typeFichier} />
        Votre navigateur ne supporte pas la vidéo.
      </video>
    );

  return null;
};

// ─── Reusable sub-components ──────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
      <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const TagInput = ({ value, onChange, onAdd, tags, onRemove, placeholder, color }) => {
  const colorMap = {
    blue: { dot: "bg-blue-400", badge: "bg-blue-100 text-blue-800" },
    purple: { dot: "bg-purple-400", badge: "bg-purple-100 text-purple-800" },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-sm rounded-lg font-semibold transition"
        >
          + Ajouter
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
              {tag.name}
              <button
                type="button"
                onClick={() => onRemove(tag.id)}
                className="ml-1 hover:text-red-600 transition"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Article Edit Modal ───────────────────────────────────────────────────────
const ArticleEditModal = ({ article, onClose, onSubmit, isSubmitting, typeEvenements, MediaPresente }) => {
  const [form, setForm] = useState({
    title: article.title || "",
    content: article.content || "",
    dateEvenementt: article.dateEvenementt || "",
    nombreParticipants: article.nombreParticipants || "",
    nombreBeneficiaires: article.nombreBeneficiaires || "",
    lienArticleMedia: article.lienArticleMedia || "",
    etat: article.etat || "En cours de traitement",
    observation: article.observation || "",
    typeEvenement: { id: article.typeEvenement?.id || "" },
   medias: article.medias?.map((m) => ({ id: m.id })) || [],
    partenaires: article.partenaires?.map((p) => ({ id: p.id, name: p.name })) || [],
    presences: article.presences?.map((p) => ({ id: p.id, name: p.name })) || [],
  });

  const [partenaireInput, setPartenaireInput] = useState("");
  const [presenceInput, setPresenceInput] = useState("");
   const [deletedMediaIds, setDeletedMediaIds] = useState([]);
const [newFiles, setNewFiles] = useState([]);
const fileInputRef = useRef(null);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleMedia = (mediaItem) => {
    const selected = form.medias.some((x) => x.id === mediaItem.id);
    set("medias", selected
      ? form.medias.filter((x) => x.id !== mediaItem.id)
      : [...form.medias, { id: mediaItem.id }]
    );
  };

  const addTag = (field, input, setInput) => {
    const val = input.trim();
    if (!val) return;
    setForm((f) => ({ ...f, [field]: [...f[field], { id: Date.now(), name: val }] }));
    setInput("");
  };

  const removeTag = (field, id) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((t) => t.id !== id) }));

 const handleSubmit = (e) => {
  e.preventDefault();

  const cleaned = {
    ...form,
    etat: article.etat,
    corrige:article.corrige,
    medias: form.medias.map(({ id }) => ({ id })),
    partenaires: form.partenaires.map(({ name }) => ({ name })),
    presences: form.presences.map(({ name }) => ({ name })),
    deletedMediaIds, // 🔥 important
  };

  const fd = new FormData();
  fd.append("article", JSON.stringify(cleaned));

  newFiles.forEach((file) => {
    fd.append("files", file);
  });

  onSubmit(fd);
};

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition";
  const labelCls = "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">

        <div className="bg-gradient-to-r from-green-800 to-green-700 px-8 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-1">Modification</p>
            <h2 className="text-xl font-bold text-white">Modifier l'article</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white flex items-center justify-center transition text-lg font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} id="edit-form" className="overflow-y-auto flex-1 px-8 py-6 space-y-7 bg-gray-50">

          <Section title="Informations générales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className={labelCls}>Titre *</label>
                <input required className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Date Événement</label>
                <input type="date" className={inputCls} value={form.dateEvenementt} onChange={(e) => set("dateEvenementt", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Type Événement</label>
                <select className={inputCls} value={form.typeEvenement?.id || ""} onChange={(e) => set("typeEvenement", { id: Number(e.target.value) })}>
                  <option value="">-- Sélectionner --</option>
                  {typeEvenements?.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                </select>
              </div>
              <div className="col-span-full">
                <label className={labelCls}>Contenu</label>
                <textarea rows={5} className={inputCls} value={form.content} onChange={(e) => set("content", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Participants & Bénéficiaires">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre de participants</label>
                <input type="number" min="0" className={inputCls} value={form.nombreParticipants} onChange={(e) => set("nombreParticipants", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Nombre de bénéficiaires</label>
                <input type="number" min="0" className={inputCls} value={form.nombreBeneficiaires} onChange={(e) => set("nombreBeneficiaires", e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Partenaires">
            <TagInput value={partenaireInput} onChange={setPartenaireInput}
              onAdd={() => addTag("partenaires", partenaireInput, setPartenaireInput)}
              tags={form.partenaires} onRemove={(id) => removeTag("partenaires", id)}
              placeholder="Nom du partenaire..." color="blue" />
          </Section>

          <Section title="Présences">
            <TagInput value={presenceInput} onChange={setPresenceInput}
              onAdd={() => addTag("presences", presenceInput, setPresenceInput)}
              tags={form.presences} onRemove={(id) => removeTag("presences", id)}
              placeholder="Présence..." color="purple" />
          </Section>

          <Section title="Médias Présents">
            <div className="flex flex-wrap gap-2">
              {MediaPresente?.map((m) => {
                const selected = form.medias.some((x) => x.id === m.id);
                return (
                  <button key={m.id} type="button" onClick={() => toggleMedia(m)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      selected ? "bg-green-800 text-white border-green-800 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
                    }`}>
                    {selected && <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    {m.name}
                  </button>
                );
              })}
            </div>
            {form.medias.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                  {form.medias.length} média(s) sélectionné(s)
                </span>
                <button type="button" onClick={() => set("medias", [])} className="text-xs text-gray-400 hover:text-red-500 underline transition">Tout désélectionner</button>
              </div>
            )}
          </Section>

          <Section title="Lien média externe">
            <input className={inputCls} placeholder="https://..." value={form.lienArticleMedia} onChange={(e) => set("lienArticleMedia", e.target.value)} />
          </Section>
<Section title="Photos & Vidéos existantes">
  {article.piecesJointes?.length ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {article.piecesJointes.map((p) => {
        const isDeleted = deletedMediaIds.includes(p.id);

        if (isDeleted) return null;

        return (
          <div key={p.id} className="relative group border rounded-lg overflow-hidden">
            <AuthenticatedMedia
              lien={p.lien}
              typeFichier={p.typeFichier}
              nomFichier={p.nomFichier}
            />

            {/* bouton supprimer */}
            <button
              type="button"
              onClick={() =>
                setDeletedMediaIds((prev) => [...prev, p.id])
              }
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-gray-400 text-sm italic">
      Aucun média existant
    </p>
  )}
</Section>
    <Section title="Ajouter des photos / vidéos">
  <div
    onClick={() => fileInputRef.current?.click()}
    className="border-2 border-dashed border-green-200 rounded-xl p-6 text-center cursor-pointer hover:bg-green-50"
  >
    Cliquez pour ajouter
  </div>

  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/*,video/*"
    className="hidden"
    onChange={(e) => {
      const files = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...files]);
    }}
  />

  {newFiles.length > 0 && (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {newFiles.map((file, idx) => {
        const preview = URL.createObjectURL(file);
        const isVideo = file.type.startsWith("video");

        return (
          <div key={idx} className="relative group">
            {isVideo ? (
              <video src={preview} className="w-full h-32 object-cover rounded" />
            ) : (
              <img src={preview} className="w-full h-32 object-cover rounded" />
            )}

            <button
              type="button"
              onClick={() =>
                setNewFiles((prev) => prev.filter((_, i) => i !== idx))
              }
              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  )}
</Section>
        </form>

        <div className="flex-shrink-0 px-8 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition font-medium">Annuler</button>
          <button type="submit" form="edit-form" disabled={isSubmitting}
            className="px-6 py-2 rounded-lg bg-green-800 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center gap-2">
            {isSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaUpload className="text-xs" />}
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Article Form Modal ───────────────────────────────────────────────────────
const ArticleFormModal = ({ initialData,userData, onClose, onSubmit, isSubmitting, typeEvenements, MediaPresente }) => {
  const fileInputRef = useRef(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    dateSoumission: "",
    dateEvenementt: "",
    nombreParticipants: "",
    nombreBeneficiaires: "",
    lienArticleMedia: "",
    sousType: "",
    etat: "En cours de traitement",
    observation: "",
    corrige: "",
    province: { id: "" },
    typeEvenement: { id: "" },
    medias: [],
    //mediacommunication: [], // ← tableau pour multi-sélection
    descriptionArticle: { id: 1 },
    partenaires: [],
    presences: [],
  });

  useEffect(() => {
    if (userData?.province?.id) {
      setForm((prev) => ({ ...prev, province: { id: userData.province.id } }));
    }
  }, [userData]);





  useEffect(() => {
  if (initialData) {
    setForm({
      ...initialData,
      province: { id: initialData.province?.id },
      typeEvenement: { id: initialData.typeEvenement?.id },
    });
  }
}, [initialData]);


  const [partenaireInput, setPartenaireInput] = useState("");
  const [presenceInput, setPresenceInput] = useState("");
 
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleMedia = (mediaItem) => {
    const alreadySelected = form.medias.some(
      (x) => x.id === mediaItem.id
    );

    if (alreadySelected) {
      set("medias", form.medias.filter((x) => x.id !== mediaItem.id));
    } else {
      set("medias", [...form.medias, { id: mediaItem.id }]);
    }
  };
  // ─── Toggle sélection d'un média ──────────────────────────────────────────
 

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const mapped = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
    }));
    setMediaFiles((prev) => [...prev, ...mapped]);
    e.target.value = null;
  };

  const removeMedia = (idx) => {
    setMediaFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const addTag = (field, input, setInput) => {
    const val = input.trim();
    if (!val) return;
    setForm((f) => ({ ...f, [field]: [...f[field], { id: Date.now(), name: val }] }));
    setInput("");
  };

  const removeTag = (field, id) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((t) => t.id !== id) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedForm = {
      ...form,
      medias: form.medias.map(({ id }) => ({ id })),
      partenaires: form.partenaires.map(({ name }) => ({ name })),
      presences: form.presences.map(({ name }) => ({ name })),
      // mediacommunication est déjà un tableau [{id: x}, {id: y}]
    };
    const fd = new FormData();
    fd.append("article", JSON.stringify(cleanedForm));
    mediaFiles.forEach((m) => fd.append("files", m.file));
   // console.log(cleanedForm)
    onSubmit(fd);
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition";
  const labelCls = "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Nouveau</p>
            <h2 className="text-xl font-bold text-white">Ajouter un article</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white flex items-center justify-center transition text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} id="article-form" className="overflow-y-auto flex-1 px-8 py-6 space-y-7 bg-gray-50">

          {/* Informations générales */}
          <Section title="Informations générales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className={labelCls}>Titre *</label>
                <input
                  required
                  className={inputCls}
                  placeholder="Titre de l'article"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Date Événement</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.dateEvenementt}
                  onChange={(e) => set("dateEvenementt", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Type Événement</label>
                <select
                  className={inputCls}
                  value={form.typeEvenement.id}
                  onChange={(e) => set("typeEvenement", { id: Number(e.target.value) })}
                >
                  <option value="">-- Sélectionner --</option>
                  {typeEvenements?.map((t) => (
                    <option key={t.id} value={t.id}>{t.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-full">
                <label className={labelCls}>Contenu</label>
                <textarea
                  rows={5}
                  className={inputCls}
                  placeholder="Contenu détaillé..."
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Participants & Bénéficiaires */}
          <Section title="Participants & Bénéficiaires">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre de participants</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  placeholder="0"
                  value={form.nombreParticipants}
                  onChange={(e) => set("nombreParticipants", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Nombre de bénéficiaires</label>
                <input
                  type="number"
                  min="0"
                  className={inputCls}
                  placeholder="0"
                  value={form.nombreBeneficiaires}
                  onChange={(e) => set("nombreBeneficiaires", e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Partenaires */}
          <Section title="Partenaires">
            <TagInput
              value={partenaireInput}
              onChange={setPartenaireInput}
              onAdd={() => addTag("partenaires", partenaireInput, setPartenaireInput)}
              tags={form.partenaires}
              onRemove={(id) => removeTag("partenaires", id)}
              placeholder="Nom du partenaire..."
              color="blue"
            />
          </Section>

          {/* Présences */}
          <Section title="Présences">
            <TagInput
              value={presenceInput}
              onChange={setPresenceInput}
              onAdd={() => addTag("presences", presenceInput, setPresenceInput)}
              tags={form.presences}
              onRemove={(id) => removeTag("presences", id)}
              placeholder="Présence..."
              color="purple"
            />
          </Section>

          {/* ─── Médias Présents (multi-sélection) ─────────────────────────── */}
          <Section title="Médias Présents">
            <p className="text-xs text-gray-400 mb-3">
              Cliquez sur les médias présents lors de l'événement (plusieurs choix possibles)
            </p>
            <div className="flex flex-wrap gap-2">
              {MediaPresente?.map((m) => {
                const selected = form.medias.some((x) => x.id === m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMedia(m)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      selected
                        ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-700"
                    }`}
                  >
                    {selected && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {m.name}
                  </button>
                );
              })}
            </div>
            {form.medias.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {form.medias.length} média(s) sélectionné(s)
                </span>
                <button
                  type="button"
                  onClick={() => set("medias", [])}
                  className="text-xs text-gray-400 hover:text-red-500 underline transition"
                >
                  Tout désélectionner
                </button>
              </div>
            )}
          </Section>

          {/* Lien média externe */}
          <Section title="Lien média externe">
            <input
              className={inputCls}
              placeholder="https://..."
              value={form.lienArticleMedia}
              onChange={(e) => set("lienArticleMedia", e.target.value)}
            />
          </Section>

          {/* Upload photos / vidéos */}
          <Section title="Photos & Vidéos">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-white"
            >
              <div className="flex gap-3 text-blue-400">
                <FaImage className="text-2xl" />
                <FaVideo className="text-2xl" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Cliquez pour ajouter des photos ou vidéos</p>
              <p className="text-xs text-gray-400">JPG, PNG, GIF, MP4, MOV — plusieurs fichiers acceptés</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaFiles.map((m, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-black aspect-square"
                  >
                    {m.type === "image" ? (
                      <img src={m.preview} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <video src={m.preview} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-start justify-between p-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          m.type === "video" ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
                        }`}
                      >
                        {m.type === "video" ? "Vidéo" : "Photo"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-2 pb-1 pt-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <p className="text-white text-xs truncate">{m.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 px-8 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">{mediaFiles.length} fichier(s) sélectionné(s)</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="article-form"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center gap-2"
            >
              {isSubmitting ? <FaSpinner className="animate-spin text-xs" /> : <FaUpload className="text-xs" />}
              {isSubmitting ? "Envoi…" : "Soumettre"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pièces jointes avec auth ─────────────────────────────────────────────────
const PiecesJointesSection = ({ piecesJointes, lienArticleMedia }) => {
  const [loadingMap, setLoadingMap] = useState({});

  const handleAction = async (lien, nomFichier, mode) => {
    setLoadingMap((prev) => ({ ...prev, [`${lien}-${mode}`]: true }));
    await openFileWithAuth(lien, nomFichier, mode);
    setLoadingMap((prev) => ({ ...prev, [`${lien}-${mode}`]: false }));
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
        <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Pièces Jointes</h3>
      </div>

      <ul className="p-6 space-y-3 text-sm text-gray-700">
        {piecesJointes?.length ? (
          piecesJointes.map((p) => (
            <li key={p.id} className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  {p.typeFichier?.startsWith("image") ? (
                    <FaImage className="text-blue-400 flex-shrink-0" />
                  ) : p.typeFichier?.startsWith("video") ? (
                    <FaVideo className="text-purple-400 flex-shrink-0" />
                  ) : (
                    <FaUpload className="text-gray-400 flex-shrink-0" />
                  )}
                  <span className="font-medium truncate">{p.nomFichier}</span>
                </div>
                {p.lien && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(p.lien, p.nomFichier, "download")}
                      disabled={loadingMap[`${p.lien}-download`]}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-800 border border-green-200 hover:border-green-400 rounded-full px-3 py-1 transition-all disabled:opacity-50"
                    >
                      {loadingMap[`${p.lien}-download`] ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaDownload className="text-xs" />
                      )}
                      Télécharger
                    </button>
                  </div>
                )}
              </div>
              {p.lien && (p.typeFichier?.startsWith("image") || p.typeFichier?.startsWith("video")) && (
                <AuthenticatedMedia lien={p.lien} typeFichier={p.typeFichier} nomFichier={p.nomFichier} />
              )}
            </li>
          ))
        ) : (
          <li className="text-gray-400 italic">Aucune pièce jointe</li>
        )}
      </ul>

      <div className="bg-blue-50 border-t border-blue-100 px-6 py-3">
        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-1">
          Lien de l'article sur Media
        </h3>
        <p className="text-gray-800 text-sm">{lienArticleMedia || "—"}</p>
      </div>
    </section>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Page = () => {
  const queryClient = useQueryClient();
  const token = getCookie("token");
  const headers = { Authorization: `Bearer ${token}` };

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
const [page, setPage] = useState(0);
const size = 8;


useEffect(() => {
  setPage(0);
}, [userData?.province?.id]);

const { data: articlesDelegations } = useQuery({
  queryKey: ["articlesDelegations", userData?.province?.id, page], // ← page bien dans la clé
  queryFn: () => getArticlesByDelegations(userData?.province?.id, page, size),
  enabled: !!userData?.province?.id,
  placeholderData: (prev) => prev, // ← React Query v5 (ou keepPreviousData en v4)
});
console.log("by province", articlesDelegations);
const articleList = articlesDelegations?.content || [];
const totalPages = articlesDelegations?.totalPages || 0;
const currentPage = articlesDelegations?.number || 0;


  const { data: typeEvenements } = useQuery({
    queryKey: ["typeEvenements"],
    queryFn: getTypeevenements,
  });

  const { data: MediaPresente } = useQuery({
    queryKey: ["mediacommunication"],
    queryFn: getMediaPresente,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editArticle, setEditArticle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);


const updateMutation = useMutation({
  mutationFn: async ({ id, data }) => {
    const res = await axios.put(
      `http://localhost:8080/api/articles/${id}`, 
      data,  // FormData
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          // pas de Content-Type ici
        },
      }
    );
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(["articlesDelegations"]);
    setShowEditModal(false);
  },
});
  
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post("/api/articles", formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["articles"]);
      setShowAddModal(false);
    },
    onError: (err) => {
      alert("Erreur : " + err.message);
    },
  });

const filteredArticles = articleList.filter((article) =>
  article.title.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="ml-64 bg-gray-50 min-h-screen w-[calc(100%-16rem)]">

        {/* Top bar */}
        <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
          <h4 className="text-m font-bold mb-1">Bienvenue {userData?.name}</h4>
          <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
        </div>

        <div className="p-6 bg-gray-50">
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-1">Articles</h2>
              <p className="text-[#6B7A99]">Liste des articles soumis</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              <FaPlus className="text-xs" />
              Nouvel article
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-full max-w-md mb-6">
            <FaSearch className="text-gray-400 text-lg mr-2 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher par titre..."
              className="outline-none w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {["Titre", "Province", "Date Événement", "État", "Action"].map((h) => (
                    <th
                      key={h}
                      className="py-2 px-4 border-b text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-sm font-medium text-gray-900">{article.title}</td>
                    <td className="py-2 px-4 border-b text-sm text-gray-900">{article.province?.province}</td>
                    <td className="py-2 px-4 border-b text-sm text-gray-900">{article.dateEvenementt}</td>
                    <td className="py-2 px-4 border-b text-sm">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full ${
                          article.etat === "Validé"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {article.etat}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-sm flex gap-2">
  <button
    onClick={() => setSelectedArticle(article)}
    className="bg-blue-900 text-white px-3 py-1 rounded text-xs"
  >
    Voir
  </button>

  <button
    onClick={() => {
  setEditArticle(article);
  setShowEditModal(true);
}}
    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
  >
    Modifier
  </button>
</td>
                  </tr>
                ))}
                {filteredArticles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400 text-sm italic">
                      Aucun article trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

               <div className="flex items-center justify-between mt-4 text-sm px-4 pb-4">
              <button
  onClick={() => setPage((p) => Math.max(p - 1, 0))}
  disabled={page === 0} // ← utiliser `page` et non `currentPage`
>
  ← Précédent
</button>

<div>Page {page + 1} / {totalPages}</div>

<button
  onClick={() => setPage((p) => p + 1)}
  disabled={page + 1 >= totalPages} // ← `page` directement
>
  Suivant →
</button>
            </div>
          </div>

          {/* ── Modal Détails ── */}
          {selectedArticle && (
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-6 flex items-start justify-between flex-shrink-0">
                  <div>
                    <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Détail de l'article</p>
                    <h2 className="text-2xl font-bold text-white leading-snug max-w-3xl">{selectedArticle.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="ml-4 mt-1 flex-shrink-0 w-9 h-9 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white flex items-center justify-center transition-all duration-200 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 px-8 py-8 space-y-8 bg-gray-50">

                  {/* Infos générales */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Informations Générales</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm text-gray-700">
                      {[
                        ["Date Soumission", new Date(selectedArticle.dateCreation).toLocaleDateString()],
                        ["Date Événement", selectedArticle.dateEvenementt],
                        ["Province", selectedArticle.province?.province],
                        ["Type Événement", selectedArticle.typeEvenement?.libelle],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                          <p className="font-medium">{val || "—"}</p>
                        </div>
                      ))}
                      <div className="col-span-full">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                          {selectedArticle.descriptionArticle?.description || "N/A"}
                        </div>
                      </div>
                      <div className="col-span-full">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contenu</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm min-h-[120px]">
                          {selectedArticle.content}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Participants */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Participants & Bénéficiaires</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-800">{selectedArticle.nombreParticipants ?? "—"}</p>
                        <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mt-1">Participants</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-700">{selectedArticle.nombreBeneficiaires ?? "—"}</p>
                        <p className="text-xs text-green-500 font-semibold uppercase tracking-wide mt-1">Bénéficiaires</p>
                      </div>
                    </div>
                  </section>

                  {/* Partenaires & Présences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { title: "Partenaires", items: selectedArticle.partenaires, color: "blue", dot: "bg-blue-400", badge: "bg-blue-50 text-blue-800", empty: "Aucun partenaire" },
                      { title: "Présences", items: selectedArticle.presences, color: "purple", dot: "bg-purple-400", badge: "bg-purple-50 text-purple-800", empty: "Aucune présence" },
                    ].map(({ title, items, dot, badge, empty }) => (
                      <section key={title} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
                          <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
                          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">{title}</h3>
                        </div>
                        <ul className="p-6 space-y-2 text-sm text-gray-700">
                          {items?.length ? (
                            items.map((p) => (
                              <li key={p.id} className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`}></span>
                                {p.name}
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-400 italic">{empty}</li>
                          )}
                        </ul>
                      </section>
                    ))}
                  </div>

                  {/* ─── Médias Présents (affichage détail) ──────────────────── */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Médias Présents</h3>
                    </div>
                    <div className="p-6">
                      {selectedArticle.medias?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedArticle.medias.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                              {m.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic text-sm">Aucun média présent</p>
                      )}
                    </div>
                  </section>

                  {/* Pièces jointes (avec auth) */}
                  <PiecesJointesSection
                    piecesJointes={selectedArticle.piecesJointes}
                    lienArticleMedia={selectedArticle.lienArticleMedia}
                  />

                  {/* État & Observations */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-700 rounded-full inline-block"></span>
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">État & Observations</h3>
                    </div>
                    <div className="p-6 space-y-4 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">État</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            selectedArticle.etat === "Validé"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {selectedArticle.etat}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Observation</p>
                        <p className="text-gray-800">{selectedArticle.observation || "—"}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="flex-shrink-0 px-8 py-4 bg-white border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-6 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Modal Ajout ── */}
          {showAddModal && (
            <ArticleFormModal
              userData={userData}
              typeEvenements={typeEvenements}
              MediaPresente={MediaPresente}
              onClose={() => setShowAddModal(false)}
              onSubmit={(fd) => createMutation.mutate(fd)}
              isSubmitting={createMutation.isPending}
            />
          )}

  {showEditModal && editArticle && (
  <ArticleEditModal
    article={editArticle}
    typeEvenements={typeEvenements}
    MediaPresente={MediaPresente}
    onClose={() => setShowEditModal(false)}
    onSubmit={(data) =>
      updateMutation.mutate({ id: editArticle.id, data })
    }
    isSubmitting={updateMutation.isPending}
  />
)}
        </div>
      </div>
    </div>
  );
};

export default Page;