import { useMemo } from 'react';

import { paths } from 'src/app/auth/paths';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  // <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  <Iconify icon={name} width={24} height={24} />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  home: icon('mingcute:home-6-fill'),
  sections: icon('lucide:network'),
  categories: icon('bi:grid-fill'),
  subCategories: icon('fluent:list-bar-16-filled'),
  brands: icon('solar:bag-bold'),
  products: icon('dashicons:products'),
  mostSelling: icon('mdi:stars'),
  financialReports: icon('icon-park-outline:table-report'),
  clients: icon('fluent:people-32-light'),
  otp: icon('teenyicons:otp-solid'),
  clientsWallet: icon('ic_clients-wallet'),
  orders: icon('ion:cart-outline'),
  offers: icon('bxs:offer'),
  coupons: icon('mdi:coupon-outline'),
  employees: icon('clarity:employee-group-line'),
  drivers: icon('healthicons:truck-driver-outline'),
  driversWallet: icon('ph:wallet-duotone'),
  warehouses: icon('iconoir:delivery-truck'),
  paymentMethods: icon('tdesign:money'),
  currencies: icon('ic_currencies'),
  return: icon('carbon:deployment-policy'),
  notifications: icon('ic:outline-notifications-active'),
  advertisements: icon('tabler:ad'),
  appPages: icon('gravity-ui:square-bars-vertical'),
  reports: icon('oui:app-reporting'),
  loyaltySystem: icon('material-symbols:loyalty-outline'),
  settings: icon('cuida:settings-outline'),
  sliders: icon('ph:sliders'),
  workingArea: icon('mdi:locations'),
  reasons: icon('ph:question'),
  terms: icon('fluent-mdl2:entitlement-policy'),
  about: icon('mdi:about-circle-outline'),
  returnRequests: icon('fontisto:arrow-return-left'),
  privacy: icon('iconoir:privacy-policy'),
  banars: icon('material-symbols:wallpaper'),
  posters: icon('mingcute:announcement-line'),
  dataManagements: icon('fa:cogs'),
  promocodes: icon('mdi:coupon'),
  support: icon('token:chat'),
  building: icon('fa-solid:building'),
  bag: icon('lets-icons:bag-fill'),
  cartegries: icon('fluent:playing-cards-20-filled'),
  coupon: icon('ri:coupon-3-fill'),
  pages: icon('iconoir:multiple-pages-empty'),
  questions: icon('mdi:frequently-asked-questions'),
  city: icon('healthicons:city-outline'),
  banner: icon('solar:bill-linear'),
  appointments: icon('hugeicons:appointment-02'),
  rooms: icon('icon-park-twotone:single-bed'),
  payments: icon('healthicons:money-bag-outline'),
  doctors: icon('fa7-solid:user-doctor'),
  patients: icon('ic:baseline-people'),
  inpatients: icon('fa6-solid:bed-pulse'),
  users: icon('hugeicons:user-03'),
};

export function useNavData() {
  const { t } = useTranslate();
  const data = useMemo(
    () => [
      {
        subheader: t('SIDEBAR.MENU'),
        items: [
          { title: t('SIDEBAR.MAIN'), path: paths.dashboard.root, icon: ICONS.home },
          {
            title: t('SIDEBAR.APPOINTMENTS'),
            path: paths.dashboard.appointments,
            icon: ICONS.appointments,
          },
          { title: t('SIDEBAR.ROOMS'), path: paths.dashboard.rooms, icon: ICONS.rooms },
          { title: t('SIDEBAR.PAYMENTS'), path: paths.dashboard.payments, icon: ICONS.payments },
        ],
      },
      {
        subheader: t('SIDEBAR.MANAGEMENT'),
        items: [
          { title: t('SIDEBAR.DOCTORS'), path: paths.dashboard.doctors, icon: ICONS.doctors },
          { title: t('SIDEBAR.PATIENTS'), path: paths.dashboard.patients, icon: ICONS.patients },
          {
            title: t('SIDEBAR.INPATIENTS'),
            path: paths.dashboard.inpatients,
            icon: ICONS.inpatients,
          },
        ],
      },
      {
        subheader: t('SIDEBAR.SETTINGS'),
        items: [
          { title: t('SIDEBAR.USERS'), path: paths.dashboard.users, icon: ICONS.users },
          { title: t('SIDEBAR.SETTINGS'), path: paths.dashboard.settings, icon: ICONS.settings },
        ],
      },
    ],
    [t]
  );

  return data;
}
