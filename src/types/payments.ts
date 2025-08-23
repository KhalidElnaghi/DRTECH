export type IPayment = {
  Id: number;
  PatientId: number;
  PatientName: string;
  DoctorId: number;
  DoctorName: string;
  AppointmentId: number;
  AppointmentDate?: string;
  PaymentAmount: number;
  PaymentMethod: number;
  PaymentMethodName?: string;
  ServiceType: number;
  ServiceTypeName?: string;
  Status: number;
  StatusName?: string;
  Description?: string;
  CreatedAt?: string;
};
