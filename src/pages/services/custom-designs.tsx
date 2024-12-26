import React, { useState } from 'react';
import { NextPage } from 'next';
import Layout from '@/components/layout';
import ServiceOption from '@/components/services/ServiceOption';
import ExistingDesignForm from '@/components/services/forms/ExistingDesignForm';
import UploadDesignForm from '@/components/services/forms/UploadDesignForm';
import CustomDesignForm from '@/components/services/forms/CustomDesignForm';

const CustomDesignsPage: NextPage = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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

  const renderForm = () => {
    switch (selectedOption) {
      case 'existing-design':
        return <ExistingDesignForm onBack={() => setSelectedOption(null)} />;
      case 'upload-design':
        return <UploadDesignForm onBack={() => setSelectedOption(null)} />;
      case 'custom-design':
        return <CustomDesignForm onBack={() => setSelectedOption(null)} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Custom Design Services
        </h1>
        
        {!selectedOption ? (
          <div className="grid md:grid-cols-3 gap-8">
            {serviceOptions.map((option) => (
              <ServiceOption
                key={option.id}
                {...option}
                onClick={() => setSelectedOption(option.id)}
              />
            ))}
          </div>
        ) : (
          renderForm()
        )}
      </div>
    </Layout>
  );
};

export default CustomDesignsPage;
