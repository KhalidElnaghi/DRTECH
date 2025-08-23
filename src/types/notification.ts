export interface INotification {
  Id: number;
  UserId: string;
  Title: string;
  Message: string;
  SentAt: string;
  IsRead: boolean;
}

export interface INotificationResponse {
  Data: INotification[];
  IsSuccess: boolean;
  StatusCode: number;
  Error: {
    Message: string;
  };
}

export interface INotificationParams {
  page?: number;
  limit?: number;
}
