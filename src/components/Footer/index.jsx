"use client";
import React from 'react';
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiGlobe,
  FiYoutube,
  FiFacebook,
  FiInstagram,
  FiPhoneCall,
  FiPrinter,
} from "react-icons/fi";

const socialLinks = [
  {
    id: 1,
    icon: <FiGlobe />,
    url: "https://www.entraide.ma/fr",
  },
 
 
  {
    id: 5,
    icon: <FiTwitter />,
    url: "https://twitter.com/EntraideMaroc",
  },
 
  {
    id: 7,
    icon: <FiFacebook />,
    url: "https://web.facebook.com/people/%D8%A7%D9%84%D8%B5%D9%81%D8%AD%D8%A9-%D8%A7%D9%84%D8%B1%D8%B3%D9%85%D9%8A%D8%A9-%D9%84%D9%85%D8%A4%D8%B3%D8%B3%D8%A9-%D8%A7%D9%84%D8%AA%D8%B9%D8%A7%D9%88%D9%86-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A/100064920572710/?_rdc=1&_rdr",
  },
  {
    id: 8,
    icon: <FiInstagram />,
    url: "https://www.instagram.com/entraide_nationale_maroc/",
  },
  {
    id: 9,
    icon: <FiYoutube />,
    url: "https://www.youtube.com/channel/UCEU1Mgf3i3D5TUTamwoQ79w",
  },
];

const Footer = () => {
    return (
      <footer className="bg-gray-100 dark:bg-ternary-dark text-gray-700 dark:text-gray-300">
        <div className="container mx-auto py-10 grid grid-cols-2 gap-8" style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          <div className="text-center mb-16">
            <p className="text-lg sm:text-xl mb-10">Contactez nous</p>
            <ul className="flex justify-center gap-8 sm:gap-8">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="__blank"
                      className="text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                    >
                      {link.icon}
                    </a>
                  ) : (
                    <div className="text-gray-400 flex items-center">
                      {link.icon} <span className="ml-2">{link.text}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl mb-5">Coordonnées</p> {/* Modification du titre "Contactez nous" en "Coordonnées" */}
            <p className="text-gray-400 mb-2"> {/* Augmentation de la marge basse ici */}
              20, rue El Mariniyine, BP 750 - Hassan RABAT
            </p>
            <div className="flex justify-center items-center">
              <div className="flex items-center text-gray-400">
                <FiPhoneCall />
                <span className="ml-2">05 37 70 51 50</span>
              </div>
              <div className="flex items-center ml-4 text-gray-400">
                <FiPrinter />
                <span className="ml-2">05 37 70 43 73</span>
              </div>
            </div>
          </div>
        </div>
        <div className='text-center text-dark p-3 border-t-2 border-gray-400' style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
          © 2024
          <a className="container mx-auto py-10" href='https://www.entraide.ma/'>
            Entraide Nationale 
          </a>
        </div>
      </footer>
    );
  };
  
  export default Footer;