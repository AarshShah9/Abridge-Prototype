import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { Patient } from '../lib/types';
import { useAppContext } from '../contexts/AppContext';

const PatientTable: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPatients = searchTerm
    ? state.patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : state.patients;

  const handlePatientSelect = (patient: Patient) => {
    navigate(`/patient/${patient.id}`);
  };

  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-secondary">Patients</h2>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search by name or MRN..."
            className="w-full p-2 border border-border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-auto flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>MRN</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow 
                key={patient.id}
                onClick={() => handlePatientSelect(patient)}
                className="cursor-pointer hover:bg-primary-light"
              >
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.mrn}</TableCell>
                <TableCell>{patient.age}</TableCell>
              </TableRow>
            ))}
            
            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PatientTable;