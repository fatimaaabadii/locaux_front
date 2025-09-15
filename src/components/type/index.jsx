"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "/src/api";
import { DataTable } from "/src/components/hometable/hometable";

const Page = () => {
  const [tableData, setTableData] = useState([]);
  const [filterYear, setFilterYear] = useState("");

  // Utilisation de React Query pour récupérer les articles
  const { data: articles, refetch } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  /*

  useEffect(() => {
    if (articles && articles.length > 0) {
      const typeEvenetCounts = {}; // Initialiser un compteur pour les types d'événements

      articles.forEach(article => {
        const typeEvenet = article.typeEvenet; // Récupérer le type d'événement
        const dateSoumissionYear = article.dateSoumission.split("/")[2]; // Extraire l'année de la dateSoumission

        if (typeEvenet && (!filterYear || dateSoumissionYear === filterYear)) {
          addArticleCount(typeEvenetCounts, typeEvenet); // Ajouter au compteur par type d'événement
        }
      });

      const dataForTable = Object.keys(typeEvenetCounts).map(typeEvenet => ({
        typeEvenet: typeEvenet,
        articleTotal: typeEvenetCounts[typeEvenet], // Compter les articles pour chaque type d'événement
      }));

      setTableData(dataForTable.filter(entry => entry.articleTotal > 0)); // Filtrer les types avec au moins un article
    }
  }, [articles, filterYear]);

  const addArticleCount = (typeEvenetCounts, typeEvenet) => {
    if (!typeEvenetCounts[typeEvenet]) {
      typeEvenetCounts[typeEvenet] = 1;
    } else {
      typeEvenetCounts[typeEvenet]++;
    }
  };

  const handleFilterByYear = (year) => {
    setFilterYear(year);
  };

  return (
    <div className="px-6 py-4 mt-10" id="Materiels" style={{ backgroundColor: 'white' }}>
      <h2 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.3rem', fontWeight: 'bold', color: '#333', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', paddingBottom: '10px', textAlign: 'center' }}>
        Nombre Total d'Articles par Type d'Événement
      </h2>
      <div style={{ textAlign: 'center' }}>
        <label htmlFor="yearFilter">Filtrer par année : </label>
        <select id="yearFilter" onChange={(e) => handleFilterByYear(e.target.value)}>
          <option value="">Toutes les années</option>
          {articles && articles.length > 0 && Array.from(new Set(articles.map(article => article.dateSoumission.split("/")[2]))).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <DataTable
        columns={[
          {
            accessorKey: "typeEvenet",
            header: "Type d'Événement",
            cell: ({ row }) => <div>{row.getValue("typeEvenet")}</div>,
          },
          {
            accessorKey: "articleTotal",
            header: "Nombre Total d'Articles",
            cell: ({ row }) => <div>{row.getValue("articleTotal")}</div>,
          },
        ]}
        data={tableData}
        filterCol="typeEvenet"
      />
    </div>
  );*/
};

export default Page;
