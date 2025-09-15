"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPartenariats,getBene,getCurrentUser,getEtablissements } from "@/api";
import { DataTable } from "@/components/hometable";

const Page = () => {
  const [tableData, setTableData] = useState([]);
  const [filterYear, setFilterYear] = useState("");
  const { data: eta } = useQuery({
    queryKey: ['Etab'],
    queryFn: getEtablissements(),
  });
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
    const filtered = filterDataByRole(eta || [], userData);
    setFilteredData(filtered);
  }, [eta, userData]);

  const filterDataByRole = (eta, userData) => {
    if (userData?.roles === "DELEGUE_ROLES") {
      // Filtrer les données où la colonne "delegation" est égale à "user.delegation"
      return eta.filter(item => item.delegation.trim() === userData.delegation.trim());
    }  else {
      // Si le rôle de l'utilisateur n'est pas défini, retourner toutes les données
      return eta;
    }
  };
  

  return (
    <div className="px-6 py-4 mt-10" id="Materiels" style={{ backgroundColor: 'white' }}>
      <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.3rem', fontWeight: 'bold', color: '#333', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', paddingBottom: '10px',textAlign: 'center' }}>
      Liste des établissements
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
        
        ]}
        data={filteredData || []}
        filterCol="etablissement"
      
      />
    </div>
  );
};

export default Page;