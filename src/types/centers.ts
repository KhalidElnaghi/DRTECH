export type ICenter = {
  number_of_courses: number;
  number_of_registrants: number;
  id: string;
  user_id: string;
  name: string;
  phone: string;
  neighborhood: {
    id: string;
    name: string;
    city: {
      id: string;
      name: string;
    };
  };
  userStatus: string;
  walletBalance: number;
};

export type ICity = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
};

export type INeighborhood = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  city_id: string;
};
