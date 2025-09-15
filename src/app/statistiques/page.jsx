"use client";
/*import PartnershipsPieChart from '@/components/Piechart';
import PartnershipsChart from '@/components/chart';
import { FaUserFriends } from 'react-icons/fa';

import Beneficiaires from "@/components/beneficiaires";
import Etablissements from "@/components/etablissements";*/


import Footer from '/src/components/Footer';
import Card from "/src/components/card";
import ArticleCarousel from "/src/components/swiper/swiper";
import { IoGift } from "react-icons/io5";
import { FaBriefcase } from "react-icons/fa";
import { MdDirectionsWalk } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaHandshake } from 'react-icons/fa';
import { FaMapMarker } from 'react-icons/fa';
import { BiMapPin } from 'react-icons/bi';
import { MdCheckCircle } from 'react-icons/md';
import { api ,getBene, getEtablissements,getCurrentUser, getArticles} from '/src/api';
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { FaChartLine , FaHourglassHalf  } from "react-icons/fa";
import { FaChartBar,FaExclamationCircle,FaTimesCircle   } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { FiBriefcase } from "react-icons/fi";
import { IoIosAnalytics } from "react-icons/io";
import { MdPieChart } from "react-icons/md";
import { BsChartDonut } from "react-icons/bs";
import { TiChartBarOutline } from "react-icons/ti";
import { BiPieChart } from "react-icons/bi";
import Delegation from "/src/components/delegation";
//import Region from "/src/components/region";
import Type from "/src/components/type";


const Page = () => {
   
 



  


 
   
 
    


  return (
      <div className="bg-white">
          <div className="p-6" >
         
             

              <div>
                           <Delegation />
                          
                           
                          

                  </div>

             
       
          
               
          </div>
         { <Footer/>}
      </div>
  );
};
export default Page;