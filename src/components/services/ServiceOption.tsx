"use client";

import React from 'react';

interface ServiceOptionProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const ServiceOption: React.FC<ServiceOptionProps> = ({
  id,
  title,
  description,
  icon,
  onClick
}) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <button
        className="mt-4 text-primary hover:text-primary-dark transition-colors"
      >
        Get Started →
      </button>
    </div>
  );
};

export default ServiceOption;
