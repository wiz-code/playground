import React from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const ColumnGrid = styled(Grid)(({ theme }) => ({
  height: '100%',
  flexDirection: 'column',
}));

export const Row = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));
