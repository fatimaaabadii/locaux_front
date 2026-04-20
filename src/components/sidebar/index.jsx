"use client";

import Link from "next/link";
import { useState } from "react";
import { FaHome, FaEnvelope, FaSignOutAlt, FaUser, FaUsers, FaWarehouse, FaBoxOpen, FaHandshake ,FaUserGraduate} from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "/src/api";
import { deleteCookie } from "cookies-next";
import { FaNewspaper, FaBroadcastTower , FaPenNib,FaEdit  } from "react-icons/fa";
const Sidebar = () => {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const [openMessagerie, setOpenMessagerie] = useState(false);
  const [openLocaux, setOpenLocaux] = useState(false);
  const [openPartenariat, setOpenPartenariat] = useState(false);
  const [openStock, setOpenStock] = useState(false);
 const [openCommunication, setOpenCommunication] = useState(false);
  const hasRole = (roleName) => {
    return userData?.roles?.some(role => role.name === roleName);
  };

  const isAdmin = hasRole("ROLE_ADMIN");

  return (
    <div className="fixed flex flex-col top-0 left-0 w-64 h-full border-r shadow-lg bg-gradient-to-r from-[#0b3d91] to-[#1e40af]">
      {/* Header */}
      <div className="flex items-center justify-center h-24 bg-gradient-to-r from-[#0b3d91] to-[#1e40af]">
        <div className="text-center text-white"> 
          <p className="text-xl font-serif tracking-wide ">Intranet</p>
          <p className="text-l font-serif tracking-wide ">Entraide Nationale</p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-grow overflow-y-auto">
        <ul className="py-4 space-y-1">
          <li>
            <Link href="/" className="flex items-center h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6">
              <FaHome className="w-5 h-5 text-white mr-3" />
              <span className="text-l text-white">Accueil</span>
            </Link>
          </li>

          {/* Messagerie */}
          {(isAdmin || hasRole("Messagerie")) && (
            <li>
              <button
                onClick={() => setOpenMessagerie(!openMessagerie)}
                className="flex items-center w-full h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
              >
                <FaEnvelope className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Messagerie</span>
              </button>
              {openMessagerie && (
                <ul className="ml-10 mt-1 space-y-1">
                  <li><Link href="/messagerie" className="block px-2 py-1 text-sm text-white rounded">Boîte de réception</Link></li>
                  <li><Link href="/nouveauMessage" className="block px-2 py-1 text-sm text-white rounded">Nouveau Message</Link></li>
                  <li><Link href="/groupes" className="block px-2 py-1 text-sm text-white rounded">Groupes d'utilisateurs</Link></li>
                  <li><Link href="/unites" className="block px-2 py-1 text-sm text-white rounded">Unités organisationnelles</Link></li>
                </ul>
              )}
            </li>
          )}

          {/* Locaux */}
          {(isAdmin || hasRole("Locaux")) && (
            <li>
              <button
                onClick={() => setOpenLocaux(!openLocaux)}
                className="flex items-center w-full h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
              >
                <FaWarehouse className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Gestion des Locaux</span>
              </button>
              {openLocaux && (
                <ul className="ml-10 mt-1 space-y-1">
                  <li><Link href="/gestion-programmes" className="block px-2 py-1 text-sm text-white rounded">Gestion des programmes</Link></li>
                  <li><Link href="/gestion-prestations" className="block px-2 py-1 text-sm text-white rounded">Gestion des prestations</Link></li>
                  <li><Link href="/locaux" className="block px-2 py-1 text-sm text-white rounded">Liste des locaux</Link></li>
                  <li><Link href="/contrats" className="block px-2 py-1 text-sm text-white rounded">Nouveau local</Link></li>
                  
                </ul>
              )}
            </li>
          )}

          {/* Stock */}
          {(isAdmin || hasRole("Stock")) && (
            <li>
              <button
                onClick={() => setOpenStock(!openStock)}
                className="flex items-center w-full h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
              >
                <FaBoxOpen className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Gestion de Stock</span>
              </button>
              {openStock && (
                <ul className="ml-10 mt-1 space-y-1">
                  <li><Link href="/alimentation_Stock" className="block px-2 py-1 text-sm text-white rounded">Alimentation du Stock</Link></li>
                  <li><Link href="/Inventaire_actuel" className="block px-2 py-1 text-sm text-white rounded">Inventaire actuel</Link></li>
                  <li><Link href="/receptions" className="block px-2 py-1 text-sm text-white rounded">Réceptions</Link></li>
                  <li><Link href="/distribution" className="block px-2 py-1 text-sm text-white rounded">Distribution</Link></li>
                </ul>
              )}
            </li>
          )}



          {/* Partenariat */}
          {(isAdmin || hasRole("Partenariat")) && (
            <li>
              <button
                onClick={() => setOpenPartenariat(!openPartenariat)}
                className="flex items-center w-full h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
              >
                <FaHandshake className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Partenariats</span>
              </button>
              {openPartenariat && (
                <ul className="ml-10 mt-1 space-y-1">
                  <li><Link href="/liste_partenariats" className="block px-2 py-1 text-sm text-white rounded">Liste des partenariats</Link></li>
                  <li><Link href="/nouveau-partenariat" className="block px-2 py-1 text-sm text-white rounded">Nouveau partenariat</Link></li>
                  <li><Link href="/suivi-partenariat" className="block px-2 py-1 text-sm text-white rounded">Suivi des partenariats</Link></li>
                   <li><Link href="/Statistiques_Partenariat" className="block px-2 py-1 text-sm text-white rounded">Statistiques</Link></li>
                </ul>
              )}
            </li>
          )}
          

  {(isAdmin || hasRole("Communication")) && (
            <li>
              <button
                onClick={() => setOpenCommunication(!openStock)}
                className="flex items-center w-full h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
              >
                <FaEdit   className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Communication</span>
              </button>
              {openCommunication && (
                <ul className="ml-10 mt-1 space-y-1">
                  <li><Link href="/articles" className="block px-2 py-1 text-sm text-white rounded">Ajouter un nouveau article</Link></li>
                
                </ul>
              )}
            </li>
          )}

{(isAdmin || hasRole("Formation")) && (
            <li>
              <button
                onClick={() => setOpenStock(!openStock)}
                className="flex items-center w-full h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6 focus:outline-none"
              >
                <FaUserGraduate className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Formations</span>
              </button>
              {openStock && (
                <ul className="ml-10 mt-1 space-y-1">
                  <li><Link href="/axes-management" className="block px-2 py-1 text-sm text-white rounded">Axes de formations</Link></li>
                  <li><Link href="/formations-management" className="block px-2 py-1 text-sm text-white rounded">Formations</Link></li>
                 
                </ul>
              )}
            </li>
          )}


          {/* Utilisateurs */}
          {isAdmin && (
            <li>
              <Link href="/utilisateurs" className="flex items-center h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6">
                <FaUsers className="w-5 h-5 text-white mr-3" />
                <span className="text-l text-white">Utilisateurs</span>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-300">
        <Link href="/user" className="flex items-center h-11 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6">
          <FaUser className="w-5 h-5 text-white mr-3" />
          <span className="text-l text-white">Mon Profil</span>
        </Link>
        <button
          onClick={() => { deleteCookie("token"); window.location.href = "/login"; }}
          className="w-full flex items-center h-11 mt-2 text-gray-800 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-400 px-6"
        >
          <FaSignOutAlt className="w-5 h-5 text-white mr-3" />
          <span className="text-l text-white">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
