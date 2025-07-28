import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Grid2 as Grid,
  Button,
  IconButton,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Slider,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { yellow } from '@mui/material/colors';
import ClearIcon from '@mui/icons-material/Clear';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';

import fpsSlice from '../../redux/fpsSlice';

const { actions: fpsActions } = fpsSlice;

function FPSSetting() {
  const { visibleElapsedTime } = useSelector((state) => state.fps);
  const dispatch = useDispatch();
  const theme = useTheme();

  const setVisibleElapsedTime = useCallback(() => {
    dispatch(fpsActions.setVisibleElapsedTime(!visibleElapsedTime));
  }, [visibleElapsedTime]);

  return (
    <>
      <Grid container size={4} offset={2} sx={{ alignItems: 'center' }}>
        <Typography variant="h3">
          経過時間を表示する
        </Typography>
      </Grid>
      <Grid size={4} sx={{ textAlign: 'right' }}>
        <ToggleButtonGroup
          color="primary"
          value={visibleElapsedTime ? 'show' : 'hide'}
          exclusive
          onChange={setVisibleElapsedTime}
          aria-label="display elapsed time"
          size="small"
          sx={{ backgroundColor: 'white' }}
        >
          <ToggleButton value="hide" sx={{ width: '4rem' }}>非表示</ToggleButton>
          <ToggleButton value="show" sx={{ width: '4rem' }}>表示</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </>
  );
}

export default FPSSetting;