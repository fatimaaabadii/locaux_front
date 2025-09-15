"use client";

import Link from "next/link";
import { useState } from "react";
import { FaHome, FaEnvelope, FaSignOutAlt, FaUser, FaUsers, FaClipboardList, FaThList, FaWarehouse, FaPlus } from "react-icons/fa";
import { AiOutlineUsergroupAdd, AiOutlineCluster } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "/src/api";
import { deleteCookie } from "cookies-next";

const Sidebar = () => {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const [openMessagerie, setOpenMessagerie] = useState(false);
  const [openLocaux, setOpenLocaux] = useState(false);

  return (
    <div className="fixed flex flex-col top-0 left-0 w-64 h-full border-r shadow-lg bg-[#F0F2F5]">
      {/* Header */}
      <div className="flex items-center justify-center border-b h-24 border-gray-300">
        <div className="text-center">
          <p className="text-xl font-serif tracking-wide text-[#4A4F55]">Intranet</p>
          <p className="text-l font-serif tracking-wide text-[#6B7A99]">Entraide Nationale</p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-grow overflow-y-auto">
        <ul className="py-4 space-y-1">
          <li>
            <Link href="/" className="flex items-center h-11 hover:bg-gray-200 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6">
              <FaHome className="w-5 h-5 text-[#6B7A99] mr-3" />
              <span className="text-l text-[#4A4F55]">Accueil</span>
            </Link>
          </li>

          {/* Messagerie Section */}
          <li>
            <button
              onClick={() => setOpenMessagerie(!openMessagerie)}
              className="flex items-center w-full h-11 hover:bg-gray-200 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
            >
              <FaEnvelope className="w-5 h-5 text-[#6B7A99] mr-3" />
              <span className="text-l text-[#4A4F55]">Messagerie</span>
            </button>
            {openMessagerie && (
              <ul className="ml-10 mt-1 space-y-1">
                <li>
                  <Link href="/messagerie" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Boîte de réception
                  </Link>
                </li>
                <li>
                  <Link href="/groupes" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Groupes d'utilisateurs
                  </Link>
                </li>
                <li>
                  <Link href="/unites" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Unités organisationnelles
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Locaux Section */}
          <li>
            <button
              onClick={() => setOpenLocaux(!openLocaux)}
              className="flex items-center w-full h-11 hover:bg-gray-200 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
            >
              <FaWarehouse className="w-5 h-5 text-[#6B7A99] mr-3" />
              <span className="text-l text-[#4A4F55]">Gestion des Locaux</span>
            </button>
            {openLocaux && (
              <ul className="ml-10 mt-1 space-y-1">
            <li>
                  <Link href="/gestion-programmes" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Gestion des programmes
                  </Link>
                </li>
                <li>
                  <Link href="/gestion-prestations" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Gestion des prestations
                  </Link>
                </li>
             
                <li>
                  <Link href="/locaux" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Liste des locaux
                  </Link>
                </li>
                <li>
                  <Link href="/contrats" className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Gestion des contrats
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Utilisateurs */}
          <li>
            <Link href="/utilisateurs" className="flex items-center h-11 hover:bg-gray-200 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6">
              <FaUsers className="w-5 h-5 text-[#6B7A99] mr-3" />
              <span className="text-l text-[#4A4F55]">Gestion des Utilisateurs</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300">
        <Link href="/user" className="flex items-center h-11 hover:bg-gray-200 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6">
          <FaUser className="w-5 h-5 text-[#6B7A99] mr-3" />
          <span className="text-l text-[#4A4F55]">Mon Profil</span>
        </Link>
        <button
          onClick={() => { deleteCookie("token"); window.location.href = "/login"; }}
          className="w-full flex items-center h-11 mt-2 hover:bg-gray-200 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6"
        >
          <FaSignOutAlt className="w-5 h-5 text-[#6B7A99] mr-3" />
          <span className="text-l text-[#4A4F55]">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
