import React, { useCallback, useMemo } from 'react';
import { Box, useTheme, useMediaQuery, Skeleton, Chip, Typography } from '@mui/material';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarColumnsButton, 
  GridToolbarDensitySelector, 
  GridToolbarExport,
  GridToolbarQuickFilter,
  GridOverlay
} from '@mui/x-data-grid';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import TableRowsIcon from '@mui/icons-material/TableRows';

const CustomToolbar = React.memo(() => {
  return (
    <GridToolbarContainer sx={{ 
      justifyContent: 'space-between', 
      alignItems: 'center',
      p: 2,
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
      <GridToolbarQuickFilter sx={{
        '& .MuiInputBase-root': {
          backgroundColor: 'transparent',
        },
        '& .MuiInputBase-root.Mui-focused': {
          backgroundColor: 'transparent',
        }
      }} />
    </GridToolbarContainer>
  );
});

const LoadingOverlay = React.memo(() => (
  <GridOverlay>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Skeleton variant="rectangular" width="80%" height={30} sx={{ my: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="90%" height={30} sx={{ my: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="85%" height={30} sx={{ my: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="80%" height={30} sx={{ my: 1, borderRadius: 1 }} />
    </Box>
  </GridOverlay>
));

const CustomNoRowsOverlay = React.memo(() => (
  <GridOverlay>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <TableRowsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
      <Typography variant="h6" color="text.secondary">No data available</Typography>
    </Box>
  </GridOverlay>
));

const CustomNoResultsOverlay = React.memo(() => (
  <GridOverlay>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
      <Typography variant="h6" color="text.secondary">No results found</Typography>
    </Box>
  </GridOverlay>
));

const DataTable = ({
  columns,
  data,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const visibleData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.error('Data passed to DataTable is not an array:', data);
      return [];
    }
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => ({
      id: item.id || `row-${index}`,
      ...item
    }));
  }, [data, page, rowsPerPage]);

  const formattedColumns = useMemo(() => 
    columns.map(({ id, label, render, chip, valueGetter, ...rest }) => ({
      field: id,
      headerName: label,
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        if (chip) {
          const { label, color, size } = chip(params.value, params.row);
          return <Chip label={label} color={color} size={size} variant="outlined" />;
        }
        return render ? render(params.row) : params.value;
      },
      valueGetter: valueGetter,
      ...rest
    })),
    [columns]
  );

  const handlePageChange = useCallback((newPage) => {
    onPageChange(newPage);
  }, [onPageChange]);

  const handleRowsPerPageChange = useCallback((event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  }, [onRowsPerPageChange]);

  const dataGridSx = useMemo(() => ({
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: theme.palette.background.default,
    },
    '& .MuiDataGrid-cell': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& .MuiDataGrid-row': {
      '&:nth-of-type(even)': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }), [theme]);

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <Box sx={{ 
      height: 400, 
      width: '100%', 
      '& .MuiDataGrid-root': { border: `1px solid ${theme.palette.divider}` },
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 1,
      overflow: 'hidden',
    }}>
      <DataGrid
        rows={visibleData}
        columns={formattedColumns}
        pageSize={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        disableSelectionOnClick
        slots={{
          toolbar: CustomToolbar,
          loadingOverlay: LoadingOverlay,
          noRowsOverlay: CustomNoRowsOverlay,
          noResultsOverlay: CustomNoResultsOverlay,
        }}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handleRowsPerPageChange}
        initialState={{
          filter: {
            filterModel: {
              items: [],
              quickFilterValues: [],
            },
          },
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        sx={dataGridSx}
      />
    </Box>
  );
};

export default React.memo(DataTable);