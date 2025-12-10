"use client";

import Footer from '/src/components/Footer';
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaEnvelope, FaUsers, FaPaperPlane, FaInbox, FaTrashAlt, FaArchive, FaBuilding , FaHandHolding, FaHandshake} from "react-icons/fa";
import { api, getCurrentUser } from "/src/api";
import { getCookie } from "cookies-next";
const Page = () => {

   const token = getCookie("token");
  const headers = { Authorization: `Bearer ${token}` };


  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });
 const { data: countlocaux } = useQuery({
    queryKey: ['countlocaux'],
    queryFn: async () => {
      const res = await api.get("/locaux/count", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
      const value = Number(res.data);
      if (isNaN(value)) throw new Error("Valeur retournée invalide");
      return value;
    },
  });

 const { data: countpartenariats } = useQuery({
    queryKey: ['countpartenariats'],
    queryFn: async () => {
      const res = await api.get("/partenariats/count",{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
      const value = Number(res.data);
      if (isNaN(value)) throw new Error("Valeur retournée invalide");
      return value;
    },
  });

  console.log(countpartenariats);
  const applications = [
    { name: "ASH", link: "http://154.144.246.177:8032/", icon: "/ASH.png" },
    { name: "Aides Techniques ", link: "https://aidestech.entraide.ma/login", icon: "/aides_technique.png" },
    { name: "Suivi Gissr", link: "https://entraide.ma/suivigissr", icon: "/suivigissr.png" },
    /*{ name: "Enfance ", link: "http://172.16.20.59/", icon: "/enfance.png" },*/
    { name: "Dashboard EPS", link: "https://entraide.ma/dashboard_eps/", icon: "/dashbord_eps.png" },
    { name: "Inspection ", link: "https://entraide.ma/inspection/", icon: "/inspection .png" },
    { name: "Suivi RH", link: "https://entraide.ma/suivirh", icon: "/suiviRH.png" },
    { name: "EMF ", link: "https://entraide.ma/suivi-emf/", icon: "/EMF.png" },
    { name: "E-learning", link: "https://entraide.ma/e-formation", icon: "/elearning.png" },
    { name: "Loyer", link: "http://172.16.20.58/", icon: "/paiment des Loyers .png" },
   { name: "Partenariat", link: "http://154.144.246.177:8070/", icon: "/partenariat.png" },

   /* { name: "Procédures Achat", link: "/app2", icon: "/procedureAchat.png" },*/

    
    { name: "Courrier", link: "https://entraide.ma/courrier", icon: "/COURRIER .png" },
    { name: "Gemap et budget", link: "http://172.16.20.20/", icon: "/gemap et budget.png" },
    { name: "Form stagiaires", link: "http://154.144.246.177:8042/", icon: "/form stagiares.png" },
    { name: "Stagiaires", link: "http://154.144.246.177:8040", icon: "/stagiares.png" },
    { name: "SIIPE", link: "http://172.16.20.70/index.php/login", icon: "/SIIPE.png" },
    { name: "Communication ", link: "https://communication.entraide.ma/", icon: "/gestion des activités de la communication.png" },
    { name: "eAwards", link: "https://subvention.entraide.ma/", icon: "/ewards.png" },
    { name: "GLPI", link: "http://172.16.20.65/glpi/", icon: "/GLPI.png" },

  ];

 const { data: totalMessagesRecu } = useQuery({
  queryKey: ["totalMessages", Number(userData?.id)],
  queryFn: async () => {
    if (!userData?.id) return 0;
    const userId = Number(userData.id); // <-- ajout de la vérification
    const res = await api.get(
      `/message/totalMessagesReceived?userId=${userId}`
    );
    return res.data;
  },
  enabled: !!userData?.id, // <-- ne s'exécute que si userData.id est défini
  initialData: 0,           // <-- optionnel, pour éviter undefined
});

console.log(userData);
const { data: totalMessagesEnvoye } = useQuery({
  queryKey: ["totalMessagesenv", Number(userData?.id)],
  queryFn: async () => {
    if (!userData?.id) return 0;

    const userId = Number(userData.id); // 👈 conversion directe en number
    if (isNaN(userId)) return 0;        // sécurité si ce n’est pas un nombre

    const res = await api.get(
      `/message/sent-count?userId=${userId}`
    );
    return res.data;
  },
  enabled: !!userData?.id,
  initialData: 0,
});



  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
  <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>Bienvenue {userData?.name}</h4>
  <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
</div>

      {/* Stats Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages reçus</p>
                <p className="text-2xl font-bold text-blue-900">{totalMessagesRecu ?? "..."}</p>
              </div>
              <FaEnvelope className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages envoyés</p>
                <p className="text-2xl font-bold text-blue-900">{totalMessagesEnvoye ?? "..."}</p>
              </div>
              <FaPaperPlane className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nombre de Locaux</p>
                <p className="text-2xl font-bold text-blue-900">{countlocaux}</p>
              </div>
              <FaBuilding className="text-blue-500 text-2xl" />
            </div>
          </div>


           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nombre de Partenariats</p>
                <p className="text-2xl font-bold text-blue-900">{countpartenariats}</p>
              </div>
              <FaHandshake className="text-blue-500 text-2xl" />
            </div>
          </div>


        </div>
      </div>

    
{/* Bloc Description compact et plus large horizontalement */}
<div className="px-6 py-4 my-4 bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-md border border-blue-100 transform transition-all hover:scale-105 duration-300 max-w-5xl mx-auto">
  <h3 className="text-lg font-semibold text-blue-900 mb-2">
    À propos de la plateforme
  </h3>
  <p className="text-gray-700 text-sm leading-relaxed">
    Cette plateforme représente un système d&apos;information destiné à optimiser l&apos;échange de données entre les différents services, tant internes qu&apos;externes, de l&apos;Entraide Nationale.
    Elle assure la collecte, la centralisation et le stockage des informations relatives aux centres, permettant ainsi leur consultation à tout moment et en temps réel.
    Le système produit automatiquement des statistiques détaillées couvrant l&apos;ensemble des volets d&apos;intervention à tous les niveaux de la hiérarchie administrative.
  </p>
  <p className="mt-3 text-xs text-gray-500 italic">
    Découvrez comment la plateforme facilite la communication et l'accès aux informations pour tous les services.
  </p>
</div>





<div className="p-6 mt-6 bg-white rounded-lg shadow-sm border border-gray-100 flex justify-center items-start">
  <div className="w-1/3 p-4 flex flex-col justify-center items-center text-center mt-24">
   
    <p className="text-gray-700 text-lg italic font-light">
    Découvrez une collection complète d&apos;applications de l&apos;Entraide Nationale, soigneusement conçues pour offrir un accès simplifié et optimisé aux services essentiels.
    </p>
  </div>
  
  <div className="w-2/3 p-4">
    <div className="relative flex justify-center items-center">
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 100px)',
          gridGap: '5px 5px',
          padding: '20px',
        }}
      >
        {applications.map((app, index) => (
          <div
            key={index}
            style={{
              gridColumn: `${(index % 2) ? 'auto' : 'span 1'}`,
              marginTop: `${(index % 2) ? '-45px' : '0'}`,
              animation: 'fadeIn 500ms ease-out forwards',
              animationDelay: `${index * 100}ms`,
              opacity: 0,
            }}
          >
            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
            <a
              href={app.link}
              className="block relative transform transition-all duration-300 hover:scale-110 hover:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                width: '80px',
                height: '92px',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                background: 'linear-gradient(45deg, #E6F3FF 0%, #DCF0FF 100%)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div 
                className="absolute"
                style={{
                  inset: '2px',
                  background: 'white',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  <img 
                    src={app.icon} 
                    alt={app.name}
                    className="w-8 h-8 mb-1 transition-transform duration-300 group-hover:scale-110 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
                    }}
                  />
                  <span 
                    className="text-[10px] text-center font-medium text-gray-700"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxWidth: '90%',
                      lineHeight: '1.2'
                    }}
                  >
                    {app.name}
                  </span>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

 
         
      <Footer />
    </div>
  );
};

export default Page;

