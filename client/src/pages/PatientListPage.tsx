import React from 'react';
import PatientTable from '../components/PatientTable';

const PatientListPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-secondary">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Select a patient to view their visit diff
          </p>
        </div>
        
        <div className="flex-grow">
          <PatientTable />
        </div>
      </div>
    </div>
  );
};

export default PatientListPage;
