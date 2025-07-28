import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';

function Loading() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 'calc(50% - 24px)',
        top: 'calc(50% - 24px)',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

Loading.propTypes = {
  //
};

export default Loading;