import { format, getTime, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { useTranslate } from 'src/locales';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'yyyy-MM-dd';
  return date ? format(new Date(date), fm) : '';
}

export function fTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'p';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function isBetween(inputDate: Date | string | number, startDate: Date, endDate: Date) {
  const date = new Date(inputDate);

  const results =
    new Date(date.toDateString()) >= new Date(startDate.toDateString()) &&
    new Date(date.toDateString()) <= new Date(endDate.toDateString());

  return results;
}

export function isAfter(startDate: Date | null, endDate: Date | null) {
  const results =
    startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false;

  return results;
}
export function getMinDiff(inputDate: Date | string | number) {
  const date = new Date(inputDate);
  return differenceInMinutes(date, new Date());
}

type Options = {
  includeSeconds?: boolean | undefined;
  addSuffix?: boolean | undefined;
  locale?: Locale | undefined;
};
export function fToNowWithLocales(date: InputValue, options: Options) {
  return date ? formatDistanceToNow(new Date(date), options) : '';
}

export function convertTime24to12(time: string) {
  const { t } = useTranslate();
  // Split the input string to extract hours, minutes, and seconds
  const [hour, minute] = time.split(':');

  // Convert the hour from string to number
  let hourNum = parseInt(hour, 10);

  // Determine if it's AM or PM in Arabic
  const period = hourNum < 12 ? `${t('LABEL.AM')}` : `${t('LABEL.PM')}`;

  // Adjust hour for 12-hour format
  hourNum = hourNum % 12 || 12; // converts 0 -> 12 and keeps 1-11 as-is

  // Return formatted time
  return `${hourNum}:${minute} ${period}`;
}

export const englishDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long' }).format(new Date(date));
};
export const arabicDate = (date: string) => {
  return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' }).format(new Date(date));
};
