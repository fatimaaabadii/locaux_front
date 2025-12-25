"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaHandshake,
  FaUsers,
  FaMapMarkerAlt,
  FaBuilding,
  FaChartBar,
  FaChild,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCookie } from "cookies-next";
import { getCurrentUser, getStatistiquesPartenariats } from "/src/api";

/* 🎨 Palette institutionnelle */
const COLORS = [
  "#2563EB",
  "#16A34A",
  "#9333EA",
  "#EA580C",
  "#DC2626",
  "#0D9488",
  "#4F46E5",
  "#DB2777",
];

/* Formatter entiers pour axes et tooltip */
const integerFormatter = (value) => Math.round(value);

const TooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
  fontSize: "12px",
};

const Page = () => {
  const token = getCookie("token");

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  const { data: StatistiquesPartenariats } = useQuery({
    queryKey: ["StatistiquesPartenariats"],
    queryFn: getStatistiquesPartenariats(),
  });

  return (
    <div className="ml-64 bg-gray-50 min-h-screen">
      {/* ================= HERO ================= */}
      <div className="bg-gradient-to-r from-[#F1F5F9] to-[#E2E8F0] p-6">
        <h4 className="text-md font-bold text-gray-800">
          Bienvenue {userData?.name}
        </h4>
        <p className="text-gray-500 text-sm">
          Portail de communication interne – Entraide Nationale
        </p>
      </div>

      <div className="p-6">
        {/* ================= CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Partenariats"
            value={StatistiquesPartenariats?.totalPartenariats || 0}
            color="blue"
            icon={<FaHandshake />}
          />
          <StatCard
            title="Total Partenaires"
            value={StatistiquesPartenariats?.totalPartenaires || 0}
            color="green"
            icon={<FaUsers />}
          />
          <StatCard
            title="Provinces couvertes"
            value={
              StatistiquesPartenariats?.partenariatsParProvince?.length || 0
            }
            color="purple"
            icon={<FaMapMarkerAlt />}
          />
        </div>

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Provinces */}
          <ChartCard title="Partenariats par Province" icon={<FaMapMarkerAlt />}>
            <BarChartPro
              data={StatistiquesPartenariats?.partenariatsParProvince}
              color="#2563EB"
            />
          </ChartCard>

          {/* Types */}
          <ChartCard title="Répartition par Type" icon={<FaChartBar />}>
            <DonutChart
              data={StatistiquesPartenariats?.partenariatsParType}
            />
          </ChartCard>

          {/* Programmes INDH */}
          <ChartCard title="Programmes INDH" icon={<FaBuilding />}>
            <BarChartVertical
              data={StatistiquesPartenariats?.partenariatsParProgrammeINDH}
            />
          </ChartCard>

          {/* Population */}
          <ChartCard title="Population cible" icon={<FaChild />}>
            <DonutChart
              data={StatistiquesPartenariats?.partenariatsParPopulation}
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Domaine */}
          <ChartCard title="Domaines d’intervention" icon={<FaChartBar />}>
            <BarChartPro
              data={StatistiquesPartenariats?.partenariatsParDomaine}
              color="#0D9488"
            />
          </ChartCard>

          {/* Contribution */}
          <ChartCard title="Par contribution" icon={<FaChartBar />}>
            <BarChartPro
              data={StatistiquesPartenariats?.partenariatsParContribution}
              color="#DC2626"
            />
          </ChartCard>

          {/* INDH */}
          <ChartCard title="Partenariats INDH" icon={<FaHandshake />}>
            <DonutChart
              data={StatistiquesPartenariats?.partenariatsINDH}
            />
          </ChartCard>

          {/* Type Centre */}
          <ChartCard title="Types de centres" icon={<FaBuilding />}>
            <DonutChart
              data={StatistiquesPartenariats?.partenariatsParTypeCentre}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, icon, color }) => (
  <div
    className={`bg-white rounded-xl p-6 shadow-lg border-l-4 border-${color}-500`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className={`text-3xl font-bold text-${color}-900`}>{value}</p>
      </div>
      <div className={`bg-${color}-100 p-4 rounded-full text-${color}-600`}>
        {icon}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <h3 className="flex items-center text-gray-800 font-semibold mb-4">
      <span className="mr-2 text-blue-600">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

/* ================= CHART STYLES ================= */

const BarChartPro = ({ data, color }) =>
  data?.length > 0 && (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} barSize={22}>
        <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={integerFormatter}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value) => integerFormatter(value)}
          contentStyle={TooltipStyle}
        />
        <Bar
          dataKey="value"
          radius={[10, 10, 0, 0]}
          fill={color}
        />
      </BarChart>
    </ResponsiveContainer>
  );

const BarChartVertical = ({ data }) =>
  data?.length > 0 && (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" barSize={18}>
        <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
        <XAxis
          type="number"
          tickFormatter={integerFormatter}
          allowDecimals={false}
        />
        <YAxis dataKey="label" type="category" width={160} />
        <Tooltip
          formatter={(value) => integerFormatter(value)}
          contentStyle={TooltipStyle}
        />
        <Bar
          dataKey="value"
          fill="#9333EA"
          radius={[0, 10, 10, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

const DonutChart = ({ data }) =>
  data?.length > 0 && (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={65}
          outerRadius={110}
          paddingAngle={3}
          label={({ label, value }) => `${label}: ${integerFormatter(value)}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => integerFormatter(value)}
          contentStyle={TooltipStyle}
        />
        <Legend verticalAlign="bottom" iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );

export default Page;
