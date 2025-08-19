export type IAppointment = {
  id: number;
  patientName: string;
  patientId: number;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  scheduledTime?: string;
  serviceType?: number;
  status?: number;
  appointmenStatusName: string;
  notes: string;
  ClinicName: string;
  clinicLocation: {
    lat: number;
    lng: number;
    location: string;
  };
};
