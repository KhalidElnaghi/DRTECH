'use client';

import { useMemo, useState } from 'react';

import {
  Box,
  Paper,
  alpha,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { useDashboardPatientsStatistics } from 'src/hooks/use-dashboard-query';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import PatientsStatisticsSkeleton from './skeletons/patients-statistics-skeleton';

type ApiChartDataPoint = {
  Date: string;
  PatientCount: number;
  InpatientCount: number;
};

type ChartDataPoint = {
  month?: string;
  year?: string;
  patients: number;
  inpatients: number;
};

export default function PatientsStatistics() {
  const [period, setPeriod] = useState('monthly');
  const { data, isLoading } = useDashboardPatientsStatistics({ period });

  const stats = data?.Data || data || {};

  // Process API data based on selected period
  const processedChartData = useMemo(() => {
    if (!stats.ChartData || !Array.isArray(stats.ChartData)) {
      return [];
    }

    const apiData: ApiChartDataPoint[] = stats.ChartData;

    if (period === 'monthly') {
      // Group by month for monthly view
      const monthlyData = apiData.reduce((acc: ChartDataPoint[], item) => {
        const date = new Date(item.Date);
        const monthKey = `${date.toLocaleDateString('en-US', { month: 'short' })}, ${date.getFullYear()}`;

        const existingMonth = acc.find((m) => m.month === monthKey);
        if (existingMonth) {
          existingMonth.patients += item.PatientCount;
          existingMonth.inpatients += item.InpatientCount;
        } else {
          acc.push({
            month: monthKey,
            patients: item.PatientCount,
            inpatients: item.InpatientCount,
          });
        }
        return acc;
      }, []);

      // Sort by date
      return monthlyData.sort((a, b) => {
        const dateA = new Date(
          apiData.find((item) => {
            const date = new Date(item.Date);
            return (
              `${date.toLocaleDateString('en-US', { month: 'short' })}, ${date.getFullYear()}` ===
              a.month
            );
          })?.Date || ''
        );
        const dateB = new Date(
          apiData.find((item) => {
            const date = new Date(item.Date);
            return (
              `${date.toLocaleDateString('en-US', { month: 'short' })}, ${date.getFullYear()}` ===
              b.month
            );
          })?.Date || ''
        );
        return dateA.getTime() - dateB.getTime();
      });
    }

    // Group by year for yearly view
    const yearlyData = apiData.reduce((acc: ChartDataPoint[], item) => {
      const date = new Date(item.Date);
      const yearKey = date.getFullYear().toString();

      const existingYear = acc.find((y) => y.year === yearKey);
      if (existingYear) {
        existingYear.patients += item.PatientCount;
        existingYear.inpatients += item.InpatientCount;
      } else {
        acc.push({
          year: yearKey,
          patients: item.PatientCount,
          inpatients: item.InpatientCount,
        });
      }
      return acc;
    }, []);

    // Sort by year
    return yearlyData.sort((a, b) => parseInt(a.year || '0', 10) - parseInt(b.year || '0', 10));
  }, [stats.ChartData, period]);

  // Fallback data in case API doesn't return data
  const fallbackData: Record<string, ChartDataPoint[]> = {
    monthly: [
      { month: 'Jan, 2024', patients: 0, inpatients: 0 },
      { month: 'Feb, 2024', patients: 0, inpatients: 0 },
      { month: 'Mar, 2024', patients: 0, inpatients: 0 },
      { month: 'Apr, 2024', patients: 0, inpatients: 0 },
      { month: 'May, 2024', patients: 0, inpatients: 0 },
      { month: 'Jun, 2024', patients: 0, inpatients: 0 },
    ],
    yearly: [
      { year: '2020', patients: 0, inpatients: 0 },
      { year: '2021', patients: 0, inpatients: 0 },
      { year: '2022', patients: 0, inpatients: 0 },
      { year: '2023', patients: 0, inpatients: 0 },
      { year: '2024', patients: 0, inpatients: 0 },
    ],
  };

  // Use processed API data if available, otherwise fall back to empty data
  const currentData =
    processedChartData.length > 0
      ? processedChartData
      : fallbackData[period] || fallbackData.monthly;

  const currentValue = stats.TotalPatients || currentData[currentData.length - 1]?.patients || 0;
  const previousValue = currentData[currentData.length - 2]?.patients || 0;
  const changePercentage =
    stats.WeeklyChangePercentage ||
    (previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0);
  const isIncrease =
    stats.IsWeeklyIncrease !== undefined ? stats.IsWeeklyIncrease : changePercentage >= 0;

  // Line chart options
  const chartOptions = useChart({
    chart: {
      type: 'line',
      toolbar: { show: false },
      sparkline: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    colors: ['#2065D1', '#54B435'],
    stroke: {
      width: 3,
      curve: 'smooth',
      lineCap: 'round',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.1,
        gradientToColors: ['#2065D1', '#54B435'],
        inverseColors: false,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      size: 6,
      strokeColors: '#FFFFFF',
      strokeWidth: 2,
      colors: ['#2065D1', '#54B435'],
      hover: {
        size: 8,
      },
    },
    xaxis: {
      categories: currentData.map((item: ChartDataPoint) => item.month || item.year || ''),
      labels: {
        style: {
          fontSize: '10px',
          fontFamily: 'Inter Tight',
          colors: '#637381',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: period === 'yearly' ? 2000 : 100,
      tickAmount: 5,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter Tight',
          colors: '#637381',
        },
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
    grid: {
      borderColor: alpha('#919EAB', 0.2),
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (value: number) => `${Math.round(value)} patients`,
        title: {
          formatter: () => '',
        },
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter Tight',
      },
      custom({ series, seriesIndex, dataPointIndex, w }) {
        const chartDataPoint = currentData[dataPointIndex];
        const timeLabel = chartDataPoint.month || chartDataPoint.year || '';
        return `
          <div style="
            background: white;
            border: 1px solid #DFE1E7;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            font-family: 'Inter Tight', sans-serif;
            width: 200px;
          ">
            <div style="font-weight: 600; color: #212B36; margin-bottom: 8px;">Total Patient</div>
            <div style="font-weight: 600; border-bottom: 1.5px solid #E0E3E7; margin-bottom: 8px;"></div>
            <div style="display: flex; justify-content: space-between;">
              <div style="color: #637381; font-size: 12px; margin-bottom: 4px;">${timeLabel}</div>
              <div style="color: #2065D1; font-weight: 600;">${chartDataPoint.patients}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <div style="color: #637381; font-size: 12px; margin-bottom: 4px;">${timeLabel}</div>
              <div style="color: #54B435; font-weight: 600;">${chartDataPoint.inpatients}</div>
           </div>
          </div>
        `;
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: 'Inter Tight',
      fontWeight: 500,
      labels: {
        colors: '#637381',
      },
      itemMargin: {
        horizontal: 16,
        vertical: 8,
      },
    },
    states: {
      hover: {
        filter: {
          type: '',
          value: 0.1,
        },
      },
    },
  });

  const chartSeries = [
    {
      name: 'Patients',
      data: currentData.map((item: ChartDataPoint) => item.patients),
    },
    {
      name: 'Inpatient',
      data: currentData.map((item: ChartDataPoint) => item.inpatients),
    },
  ];

  if (isLoading) {
    return <PatientsStatisticsSkeleton />;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        background: '#FFFFFF',
      }}
    >
      {/* Header with Title and Period Filter */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 600,
            color: '#212B36',
            fontSize: '18px',
          }}
        >
          Patient Statistics
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="period-select-label">Period</InputLabel>
          <Select
            labelId="period-select-label"
            value={period}
            label="Period"
            onChange={(e) => setPeriod(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E0E3E7',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2065D1',
              },
            }}
          >
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Metric */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Inter Tight',
            fontWeight: 700,
            color: '#212B36',
            fontSize: '32px',
            lineHeight: 1.2,
          }}
        >
          {currentValue}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Iconify
            icon={isIncrease ? 'lucide:arrow-up' : 'lucide:arrow-down'}
            color={isIncrease ? '#40C4AA' : '#D92C20'}
            width={16}
            height={16}
          />
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Inter Tight',
              fontWeight: 500,
              color: '#637381',
              fontSize: '14px',
            }}
          >
            {Math.abs(changePercentage)}% since last week
          </Typography>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ flex: 1, minHeight: 300 }}>
        <Chart type="line" series={chartSeries} options={chartOptions} height={300} />
      </Box>
    </Paper>
  );
}
