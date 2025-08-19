export type IRoom = {
  Id: string;
  RoomNumber: string;
  Floor: string;
  Type: number;
  TypeName: string;
  Status: number;
  StatusName: string;
  CreatedAt: string;
  IsArchived: boolean;
};

export type RoomParams = {
  page: number;
  SearchTerm?: string;
  Status?: number;
};

export type RoomData = {
  RoomNumber: string;
  Floor: string;
  Type: number;
  Status: number;
};
