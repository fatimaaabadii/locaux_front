"use client";
import CountUp from "react-countup";

const Card = ({ name, count, svg, className }) => {
  return (
    <div className="flex items-center px-2 py-2 shadow-md rounded-lg bg-gray-80 text-gray-800 w-auto max-w-xxl"> {/* bg-gray-200 Fond gris clair et texte gris foncé */}
      <div className="p-3  text-blue-900 rounded-lg">{svg}</div> {/* Fond violet clair et texte gris foncé */}
      <div className="mx-5">
        <h4 className="text-3xl font-semibold text-gray-600"> {/* Texte violet foncé */}
          <CountUp end={count} start={0} />
        </h4>
        <div className="text-gray-600 center">{name}</div> {/* Texte gris moyen */}
      </div>
    </div>
  );
};

export default Card;
