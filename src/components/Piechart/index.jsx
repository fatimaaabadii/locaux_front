"use client";
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PartnershipsPieChart = ({ partnershipData }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const labels = partnershipData.map(entry => entry.domain);
      const data = partnershipData.map(entry => entry.count);
      const backgroundColors = [
        'rgba(75, 0, 130, 0.7)',
        'rgba(75, 0, 130, 0.5)', // Gris clair avec opacité
        'rgba(75, 0, 130, 0.3)',
        'rgba(0, 0, 255, 0.7)',
        'rgba(0, 0, 255, 0.3)',
        'rgba(218, 165, 32, 0.7)',
        'rgba(218, 165, 32, 0.3)',
        
        'rgba(32, 32, 32, 0.7)',     // Gris foncé avec opacité
        
        
      ];

      const newChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });

      chartInstanceRef.current = newChartInstance;
    }
  }, [partnershipData]);

  return (
    <div>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PartnershipsPieChart;