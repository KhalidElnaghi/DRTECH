export type IAppointment = {
  id: number;
  patientName: string;
  patientId: number;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  scheduledTime?: string;
  serviceType?:number;
  appointmenStatus: number;
  status?: number;
  appointmenStatusName: string;
  notes: string;
};

