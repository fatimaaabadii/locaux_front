import React from "react";

const Modal = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
        {/* en-tête du modal */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        {/* contenu du modal */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;