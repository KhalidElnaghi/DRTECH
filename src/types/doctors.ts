export type IDoctor = {
  Id: number;
  FullName: string;
  SpecializationId: number;
  SpecializationName: string;
  PhoneNumber: string;
  StatusName: string;
  Status: number;
  email: string;
  password?: string;
  ExaminationFees?: number;
};

export type ICreateDoctor = {
  FullName: string;
  SpecializationId: number;
  PhoneNumber: string;
  Status: number;
  email: string;
  password: string;
  ExaminationFees?: number;
};

export type IUpdateDoctor = {
  FullName?: string;
  SpecializationId?: number;
  PhoneNumber?: string;
  Status?: number;
  email?: string;
  password?: string;
  ExaminationFees?: number;
};

export type ISpecialization = {
  Id: number;
  Name: string;
};
