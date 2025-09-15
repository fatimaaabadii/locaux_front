"use client";

import Footer from '/src/components/Footer';
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FaEnvelope, FaUsers, FaPaperPlane, FaInbox, FaTrashAlt, FaArchive } from "react-icons/fa";
import { api, getCurrentUser } from "/src/api";

const Page = () => {
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  console.log(userData);
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
  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#F0F2F5] to-[#E5E8EB] text-[#4A4F55] p-6">
  <h4 className="text-m font-bold mb-1" style={{ color: '#4A4F55' }}>Bienvenue {userData?.name}</h4>
  <p className="text-[#6B7A99]">Portail de communication interne - Entraide Nationale</p>
</div>

      {/* Stats Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages non lus</p>
                <p className="text-2xl font-bold text-blue-900">12</p>
              </div>
              <FaEnvelope className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages envoyés</p>
                <p className="text-2xl font-bold text-blue-900">25</p>
              </div>
              <FaPaperPlane className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Groupes d&apos;utilisateurs</p>
                <p className="text-2xl font-bold text-blue-900">3</p>
              </div>
              <FaUsers className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Message Filters and Actions */}
      <div className="p-6 flex justify-between">
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
            <FaInbox className="text-blue-500 text-xl mr-1" />
            <span className="text-sm">Reçus</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
            <FaPaperPlane className="text-blue-500 text-xl mr-1" />
            <span className="text-sm">Envoyés</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
            <FaTrashAlt className="text-blue-500 text-xl mr-1" />
            <span className="text-sm">Corbeille</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
            <FaArchive className="text-blue-500 text-xl mr-1" />
            <span className="text-sm">Archives</span>
          </button>
        </div>
       
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Messages Récents</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="pb-2">Expéditeur</th>
                  <th className="pb-2">Sujet</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="py-2">Direction</td>
                  <td className="py-2">Mise à jour des procédures</td>
                  <td className="py-2">Il y a 1 heure</td>
                  <td className="py-2">
                    <button className="text-blue-500 hover:underline">Voir</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2">RH</td>
                  <td className="py-2">Nouveau planning</td>
                  <td className="py-2">Il y a 3 heures</td>
                  <td className="py-2">
                    <button className="text-blue-500 hover:underline">Voir</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2">IT Support</td>
                  <td className="py-2">Maintenance programmée</td>
                  <td className="py-2">Hier</td>
                  <td className="py-2">
                    <button className="text-blue-500 hover:underline">Voir</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

     {/* <div className="p-6 mt-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-center">Applications</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-5 gap-4">
          {applications.map((app, index) => (
            <a href={app.link} key={index} className="text-center flex flex-col items-center p-4 hover:bg-gray-50 rounded transition-shadow hover:shadow-lg">
              <img src={app.icon} alt={app.name} className="w-12 h-12 mb-2" />
              <p className="text-sm text-gray-700">{app.name}</p>
            </a>
          ))}
        </div>
      </div>*/}

{/*<div className="p-6 mt-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
        <h2 className="text-lg font-semibold mb-4">Applications</h2>
        <div className="relative w-full h-[700px] mx-auto flex items-center justify-center">
        <div className="absolute text-center text-2xl font-bold text-gray-700">
            Entraide Nationale
          </div>
          {applications.map((app, index) => {
            const angle = (360 / applications.length) * index;
            const rotate = `rotate(${angle}deg) translate(300px) rotate(-${angle}deg)`; // Adjust 120px for radius

            return (
              <a
                href={app.link}
                key={index}
                style={{ transform: rotate }}
                className="absolute transform transition-transform hover:scale-110"
              >
                <img src={app.icon} alt={app.name} className="w-12 h-12 mx-auto mb-1" />
                <p className="text-xs text-gray-700">{app.name}</p>
              </a>
            );
          })}
        </div>
      </div>*/}

{/*
<div className="p-6 mt-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
  <h2 className="text-lg font-semibold mb-4">Applications</h2>

  <div
    className="hex-grid"
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 80px)', // Adjust the number of columns as needed
      gap: '8px', // Space between hexagons
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {applications.map((app, index) => (
      <a
        href={app.link}
        key={index}
        className="transform transition-transform hover:scale-105"
        style={{
          width: '80px',
          height: '92px',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
          backgroundColor: 'rgb(235, 248, 255)',
          padding: '12px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: index % 2 === 0 ? '16px' : '0', // Offset for every other row
        }}
      >
        <img src={app.icon} alt={app.name} style={{ width: '40px', height: '40px', marginBottom: '8px' }} />
        <p className="text-sm text-gray-700 font-semibold">{app.name}</p>
      </a>
    ))}
  </div>
</div>

*/}


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

  {/* <div className="p-6 mt-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-8 text-center">Nos Applications</h2>
      
      <div className="flex justify-center items-center">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 md:gap-2">
          {applications.map((app, index) => (
            <div
              key={app.name}
              className={`hex-container transform ${index % 2 ? '-translate-y-8' : ''} animate-fadeIn`}
              style={{
                animationDelay: `${index * 100}ms`,
                opacity: 0
              }}
            >
              <a
                href={app.link}
                className="block w-20 h-24 relative group transition-transform duration-300 hover:scale-110 hover:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 hex-shape" />
                
             
                <div className="absolute inset-0.5 bg-white hex-shape">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <img 
                      src={app.icon} 
                      alt={app.name}
                      className="w-8 h-8 mb-1 object-contain transition-transform duration-300 group-hover:scale-110 filter drop-shadow"
                    />
                    <span className="text-[10px] text-center font-medium text-gray-700 line-clamp-2">
                      {app.name}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hex-shape {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        
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
        
        .hex-container.animate-fadeIn {
          animation: fadeIn 500ms ease-out forwards;
        }
        
        .filter.drop-shadow {
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
        }
        
      
        .hex-container.-translate-y-8 {
          transform: translateY(-2rem);
        }
      `}</style>
    </div>*/}

{/*   <div className="p-6 mt-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
        <h2 className="text-lg font-semibold mb-4">Applications</h2>

        
        <div className="relative w-full h-[700px] flex items-center justify-center">
          <div className="absolute text-center bg-gray-200 w-40 h-40 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
            Entraide Nationale
          </div>

       
          <div className="absolute inset-0 flex items-center justify-center gap-8">
            {applications.map((app, index) => {
              const angle = (360 / applications.length) * index;
              const rotate = rotate(${angle}deg) translate(300px) rotate(-${angle}deg); // Adjust 180px for radius

              return (
                <a
                  href={app.link}
                  key={index}
                  style={{ transform: rotate }}
                  className="absolute transform transition-transform hover:scale-105 text-center w-24"
                >
                  <div className="flex flex-col items-center bg-blue-50 rounded-full p-3 shadow-md">
                    <img src={app.icon} alt={app.name} className="w-10 h-10 mb-2" />
                    <p className="text-sm text-gray-700 font-semibold">{app.name}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div> */}
          {/* Second Circle of Applications */}
         
      <Footer />
    </div>
  );
};

export default Page;

