import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';

import Layout from './Layout';
import Loading from './Loading';

function LoadingPage() {
  return (
    <Layout>
      <Loading />
    </Layout>
  );
}

LoadingPage.propTypes = {
  //
};

export default LoadingPage;