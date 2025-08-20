export type IPatient = {
  Id: string;
  FullName: string;
  Gender: number;
  GenderName: string;
  BloodType: number;
  BloodTypeName: string;
  PhoneNumber: string;
  EmergencyContact: string;
  Address: string;
  DateOfBirth: string;
  CreatedAt: string;
  IsArchived: boolean;
};

export type PatientParams = {
  page: number;
  SearchTerm?: string;
  Gender?: number;
  BloodType?: number;
};

export type PatientData = {
  FullName: string;
  Gender: number;
  BloodType: number;
  PhoneNumber: string;
  EmergencyContact: string;
  Address: string;
  DateOfBirth: string;
};
