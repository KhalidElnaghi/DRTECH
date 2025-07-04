'use client';
import { useTranslate } from 'src/locales';
import { Avatar,  Card, Typography } from '@mui/material';

import i18n from 'src/locales/i18n';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

type props = {
  count: number;
  courses: any[];
};

const TopCoursesTableView = ({ count, courses }: Readonly<props>) => {
  const { t } = useTranslate();

  const TABLE_HEAD = [
    { id: 'logo_url', label: 'LABEL.IMAGE' },
    { id: 'name', label: 'LABEL.COURSE_NAME' },
    { id: 'field', label: 'LABEL.FIELD' },
    { id: 'number_of_users', label: 'LABEL.NUMBER_OF_USERS' },
  ];

  return (
    <Card>
      <Typography variant="h4" color="secondary" sx={{ px: 4, py: 2 }}>
        {t('LABEL.TOP_COURSES')}
      </Typography>
      <SharedTable
        count={count}
        data={courses}
        tableHead={TABLE_HEAD}
        customRender={{
          logo_url: (item: any) => <Avatar alt={item?.name} src={item?.logo_url} />,
          field: (item: any) => (i18n.language === 'ar' ? item?.field?.name : item?.field?.name_en),
        }}
        headColor="primary.common"
      />
    </Card>
  );
};

export default TopCoursesTableView;
