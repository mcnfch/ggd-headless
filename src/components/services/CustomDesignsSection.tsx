"use client";

import React from 'react';
import ServiceOption from './ServiceOption';
import ExistingDesignForm from './forms/ExistingDesignForm';
import UploadDesignForm from './forms/UploadDesignForm';
import CustomDesignForm from './forms/CustomDesignForm';

const serviceOptions = [
  {
    id: 'existing-design',
    title: 'Add Existing Design to Product',
    description: 'Have a design you love? Let us add it to one of our products.',
    icon: '🎨'
  },
  {
    id: 'upload-design',
    title: 'Upload Your Own Design',
    description: 'Upload your digital artwork and we\'ll apply it to your chosen product.',
    icon: '⬆️'
  },
  {
    id: 'custom-design',
    title: 'Request Custom Design',
    description: 'Tell us your vision and we\'ll create a unique design for you.',
    icon: '✨'
  }
];

const CustomDesignsSection = () => {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {serviceOptions.map((option) => (
          <ServiceOption
            key={option.id}
            {...option}
            onClick={() => {
              const element = document.getElementById(option.id);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </div>

      <div className="mt-16 space-y-16">
        <div id="existing-design">
          <ExistingDesignForm onBack={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
        <div id="upload-design">
          <UploadDesignForm onBack={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
        <div id="custom-design">
          <CustomDesignForm onBack={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
      </div>
    </>
  );
};

export default CustomDesignsSection;
