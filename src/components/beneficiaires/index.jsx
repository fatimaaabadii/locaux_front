"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPartenariats,getBene,getCurrentUser } from "@/api";
import { DataTable } from "@/components/hometable";

const Page = () => {
  const [tableData, setTableData] = useState([]);
  const [filterYear, setFilterYear] = useState("");
  
  const { data: bene } = useQuery({
    queryKey: ['Bene'],
    queryFn: getBene(),
  });
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filtrer les données en fonction du rôle de l'utilisateur lorsqu'il change
    const filtered = filterDataByRole(bene || [], userData);
    setFilteredData(filtered);
  }, [bene, userData]);
  const filterDataByRole = (bene, userData) => {
    if (userData?.roles === "DELEGUE_ROLES") {
      // Filtrer les données où la colonne "delegation" est égale à "user.delegation"
      return bene.filter(item => item.delegation.trim() === userData.delegation.trim());
    }  else {
      // Si le rôle de l'utilisateur n'est pas défini, retourner toutes les données
      return bene;
    }
  };
  

  return (
    <div className="px-6 py-4 mt-10" id="Materiels" style={{ backgroundColor: 'white' }}>
      <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.3rem', fontWeight: 'bold', color: '#333', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', paddingBottom: '10px',textAlign: 'center' }}>
      Liste des bénéficiaires intéressés par la formation en ligne dans le domaine des langues vivantes sur la plateforme ALTISSIA
      </h2>
      
      <DataTable
        columns={[
          {
            accessorKey: "coordination",
            header: "Coordination",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("coordination")}</div>
            ),
          },
          
          {
            accessorKey: "delegation",
            header: "Délégation",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("delegation")}</div>
            ),
          },
         
          {
            accessorKey: "etablissement",
            header: "Établissement",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("etablissement")}</div>
            ),
          },
          {
            accessorKey: "nom",
            header: "Bénéficiaire",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("nom")}</div>
            ),
          }, 
          {
            accessorKey: "sexe",
            header: "Sexe",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("sexe")}</div>
            ),
          }, 
          {
            accessorKey: "handicap",
            header: "Type d'handicap",
            cell: ({ row }) => (
              <div className="capitalize">{row.getValue("handicap")}</div>
            ),
          }, 
          
          {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
              <div>{row.getValue("email")}</div>
            ),
          },
          {
            accessorKey: "etat",
            header: "Validité de l'email",
            cell: ({ row }) => (
              <div>{row.getValue("etat")}</div>
            ),
          },
        ]}
        data={filteredData || []}
        filterCol="etablissement"
      
      />
    </div>
  );
};

export default Page;