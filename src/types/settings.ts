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
