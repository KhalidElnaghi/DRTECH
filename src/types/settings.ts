// ----------------------------------------------------------------------

export interface NotificationSettings {
  NewsAndUpdates: boolean;
  OffersAndPromotions: boolean;
  AllRemindersAndActivity: boolean;
  ActiveOnly: boolean;
  ImportantRemindersOnly: boolean;
}

export interface NotificationSettingsResponse {
  Data: NotificationSettings;
  IsSuccess: boolean;
  StatusCode: number;
  Error: {
    Message: string;
  };
}

export interface UpdateNotificationSettingsRequest {
  NewsAndUpdates: boolean;
  OffersAndPromotions: boolean;
  AllRemindersAndActivity: boolean;
  ActiveOnly: boolean;
  ImportantRemindersOnly: boolean;
}

export interface AccountData {
  FirstName: string;
  LastName: string;
  Email: string;
  ProfileTempImagePath?: string;
  DateOfBirth?: string;
  PhoneNumber?: string;
}

export interface AccountDataResponse {
  Data: AccountData;
  IsSuccess: boolean;
  StatusCode: number;
  Error: {
    Message: string;
  };
}

export interface UpdateAccountDataRequest {
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Email: string;
  DateOfBirth: string;
  ProfileTempImagePath?: string;
}
