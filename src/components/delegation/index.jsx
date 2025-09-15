"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "/src/api";
import { DataTable } from "/src/components/hometable/hometable";

const Page = () => {
  const [filterYear, setFilterYear] = useState("");

  const { data: articles, isLoading, isError, error } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    ssr: false, 
  });
  useEffect(() => {
    if (articles) {
      console.log("Articles récupérés :", articles);
    }
  }, [articles]);
  const filteredArticles = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    return articles.filter(article => 
      article.etat === "Validé" && (!filterYear || article.dateSoumission.split("/")[2] === filterYear)
    );
  }, [articles, filterYear]);

  const { delegationTableData, typeEventTableData, regionTableData } = useMemo(() => {
    const counts = {
      delegations: {},
      typeEvents: {},
      regions: {},
    };

    filteredArticles.forEach(article => {
      const delegation = article.delegations && article.delegations[0]?.delegation;
      const typeEvent = article.typeEvenet;
      const region = article.delegations && article.delegations[0]?.coordination;

      if (delegation) counts.delegations[delegation] = (counts.delegations[delegation] || 0) + 1;
      if (typeEvent) counts.typeEvents[typeEvent] = (counts.typeEvents[typeEvent] || 0) + 1;
      if (region) counts.regions[region] = (counts.regions[region] || 0) + 1;
    });

    return {
      delegationTableData: Object.entries(counts.delegations).map(([delegation, count]) => ({ delegation, articleTotal: count })),
      typeEventTableData: Object.entries(counts.typeEvents).map(([typeEvent, count]) => ({ typeEvenet: typeEvent, articleTotal: count })),
      regionTableData: Object.entries(counts.regions).map(([region, count]) => ({ region, articleTotal: count })),
    };
  }, [filteredArticles]);

  const years = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    return Array.from(new Set(articles.map(article => article.dateSoumission.split("/")[2])));
  }, [articles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement en cours</h2>
          <p className="text-lg">Veuillez patienter, les données seront bientôt affichées...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return <div>Une erreur s&apos;est produite : {error.message}</div>;
  }

  return (
    <div className="px-6 py-4 mt-10" id="Materiels" style={{ backgroundColor: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label htmlFor="yearFilter">Filtrer par année : </label>
        <select id="yearFilter" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">Toutes les années</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <h2 style={{ textAlign: 'center' }}>Nombre Total d&apos;Articles Validés par Délégation</h2>
      <DataTable
        columns={[
          { accessorKey: "delegation", header: "Délégation" },
          { accessorKey: "articleTotal", header: "Nombre Total d'Articles Validés" },
        ]}
        data={delegationTableData}
      />

      <h2 style={{ textAlign: 'center', marginTop: '40px' }}>Nombre Total d&apos;Articles Validés par Type d&apos;Événement</h2>
      <DataTable
        columns={[
          { accessorKey: "typeEvenet", header: "Type d'Événement" },
          { accessorKey: "articleTotal", header: "Nombre Total d'Articles Validés" },
        ]}
        data={typeEventTableData}
      />

      <h2 style={{ textAlign: 'center', marginTop: '40px' }}>Nombre Total d&apos;Articles Validés par Région</h2>
      <DataTable
        columns={[
          { accessorKey: "region", header: "Région" },
          { accessorKey: "articleTotal", header: "Nombre Total d'Articles Validés" },
        ]}
        data={regionTableData}
      />
    </div>
  );
};

export default Page;
