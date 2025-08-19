export type IAppointment = {
  Id: number;
  PatientName: string;
  PatientId: number;
  DoctorId: number;
  DoctorName: string;
  AppointmentDate: string;
  ScheduledTime?: string;
  ServiceType?: number;
  Status?: number;
  AppointmenStatusName: string;
  Notes: string;
  ClinicName: string;
  ClinicLocation: {
    lat: number;
    lng: number;
    location: string;
  };
};
