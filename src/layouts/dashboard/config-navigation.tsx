import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

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
  home: icon('solar:home-bold'),
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
  settings: icon('teenyicons:cog-outline'),
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
};

export function useNavData() {
  const { t } = useTranslate();
  const data = useMemo(
    () => [
      {
        items: [
          { title: t('SIDEBAR.MAIN'), path: paths.dashboard.root, icon: ICONS.home },
          { title: t('SIDEBAR.CENTERS'), path: paths.dashboard.centers, icon: ICONS.building },
          // { title: t('SIDEBAR.CLIENTS'), path: paths.dashboard.clients, icon: ICONS.clients },
          // {
          //   title: t('SIDEBAR.FIELDS_AND_SPECIALTIES'),
          //   path: paths.dashboard.categories,
          //   icon: ICONS.cartegries,
          // },
          // { title: t('SIDEBAR.COURSES'), path: paths.dashboard.courses, icon: ICONS.bag },
          // {
          //   title: t('SIDEBAR.SUPPORT'),
          //   path: paths.dashboard.supportGroup.root,
          //   icon: ICONS.support,
          //   module: 'SUPPORT',
          //   children: [
          //     {
          //       title: t('SIDEBAR.TECHNICAL_SUPPORT'),
          //       path: paths.dashboard.supportGroup.technical_support,
          //     },
          //     {
          //       title: t('SIDEBAR.CALLS_REASONS'),
          //       path: paths.dashboard.supportGroup.calls_reasons,
          //     },
          //   ],
          // },
          // { title: t('SIDEBAR.COUPONS'), path: paths.dashboard.coupons, icon: ICONS.coupon },
          // {
          //   title: t('SIDEBAR.PAGES'),
          //   path: paths.dashboard.pages.root,
          //   icon: ICONS.pages,
          //   module: 'PAGES',
          //   children: [
          //     {
          //       title: t('SIDEBAR.ABOUT_APP'),
          //       path: paths.dashboard.pages.about,
          //     },
          //     {
          //       title: t('SIDEBAR.PRIVACY_POLICY'),
          //       path: paths.dashboard.pages.privacyPolicy,
          //     },
          //     {
          //       title: t('SIDEBAR.TERMS_AND_CONDITIONS'),
          //       path: paths.dashboard.pages.termsAndConditions,
          //     },
          //     {
          //       title: t('SIDEBAR.HOME_SCREEN'),
          //       path: paths.dashboard.pages.homeScreen,
          //     },
          //   ],
          // },
          // { title: t('SIDEBAR.FAQ'), path: paths.dashboard.faq, icon: ICONS.questions },
          // {
          //   title: t('SIDEBAR.CITIES_AND_NEIGHBORHOODS'),
          //   path: paths.dashboard.citiesAndNeighborhoods,
          //   icon: ICONS.city,
          // },
          // {
          //   title: t('SIDEBAR.PACKAGES_BANNERS'),
          //   path: paths.dashboard.banners,
          //   icon: ICONS.banner,
          // },
        ],
      },
    ],
    [t]
  );

  return data;
}
