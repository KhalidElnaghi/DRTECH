export type IUser = {
  Id: number;
  FullName: string;
  Email: string;
  UserRole: number;
  UserRoleName?: string;
  Doctor?: {
    PhoneNumber?: string;
    SpecializationId?: number;
    SpecializationName?: string;
    Status?: number;
    StatusName?: string;
  };
};

export type CreateUserData = {
  email: string;
  fullName: string;
  password: string;
  userRole: number;
  doctor?: {
    phoneNumber: string;
    specializationId: number;
    status: number;
  };
};

export type UpdateUserData = {
  email?: string;
  fullName?: string;
  password?: string;
  userRole?: number;
  phoneNumber?: string;
  doctor?: {
    phoneNumber?: string;
    specializationId?: number;
    status?: number;
  };
};
export type TableUser = {
  Id: number;
  FullName: string;
  Role: number;
  RoleName: string;
  Gender: number;
  AcceptNewsLetter: boolean;
  IsLogin: boolean;
  Email: string;
  AccountStatus: number;
  CreatedAt: string;
  PhoneNumber: string;
};
