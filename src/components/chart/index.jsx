"use client";
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PartnershipsChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // Stocke une référence au graphique actuel

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Détruit le graphique actuel s'il existe
    }

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Nombre de partenariats',
            data: Object.values(data),
            backgroundColor: '#6A5ACD', // Mauve foncé avec opacité
            borderColor: '#909090',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      chartInstanceRef.current = newChartInstance; // Stocke une référence au nouveau graphique
    }
  }, [data]);

  return (
    <div style={{ width: '300px', height: '300px' }}> {/* Définissez la taille du conteneur */}
      <canvas ref={chartRef} width={300} height={300}></canvas> {/* Définissez la taille du canvas */}
    </div>
  );
};

export default PartnershipsChart;