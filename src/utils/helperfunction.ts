import i18n from 'src/locales/i18n';

export function getNameKeyLang(): 'name_en' | 'name_ar' {
  return i18n.language === 'en' ? 'name_en' : 'name_ar';
}

export function getCustomNameKeyLang(enKey:string,arKey:string){
  return i18n.language === 'en' ? enKey : arKey;
}


// eslint-disable-next-line consistent-return
export const showErrorMessage: (err: any) => string = (err: any) => {
  if (
    (err?.response?.data?.message?.message || err?.response?.data?.message?.Message) &&
    typeof err?.response?.data?.message?.message === 'string'
  ) {
    return err?.response?.data?.message?.message || err?.response?.data?.message?.Message;
  // eslint-disable-next-line no-else-return
  } else if (err?.response?.status === 403) {
    return `${err?.response?.data?.message  }, Not allowed`;
  } else if (err?.response?.status === 400 || err?.response?.status === 422) {
    if (
      (err?.response?.data?.message?.message || err?.response?.data?.message?.Message) &&
      typeof err?.response?.data?.message?.message === 'string'
    ) {
      return err?.response?.data?.message?.message || err?.response?.data?.message?.Message;
    } if (
      err?.response?.data?.message?.message &&
      typeof err?.response?.data?.message?.message === 'object'
    ) {
      return err?.response?.data?.message?.message[0];
    } if (
      (err?.response?.data?.message || err?.response?.data?.Message) &&
      (typeof err?.response?.data?.message === 'string' ||
        typeof err?.response?.data?.Message === 'string')
    ) {
      return err?.response?.data?.message || err?.response?.data?.Message;
    }
  } else if (err?.response?.status === 500) {
    return err?.response?.data?.message;
  } else {
    return 'unknown error occurred';
  }
};
