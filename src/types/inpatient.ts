export type IInpatient = {
  Id: number;
  PatientId: number;
  PatientName: string;
  RoomId: number;
  RoomNumber: string;
  AdmissionDate: string;
  DischargeDate: string;
  Diagnosis: string;
  CreatedAt: string;
  IsArchived: boolean;
};

export type InpatientParams = {
  page: number;
  SearchTerm?: string;
  PatientId?: number;
  RoomId?: number;
};

export type InpatientData = {
  PatientId: number;
  RoomId: number;
  AdmissionDate: string;
  DischargeDate: string;
  Diagnosis: string;
};
