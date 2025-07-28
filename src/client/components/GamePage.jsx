import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { grey } from '@mui/material/colors';

import {
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  FormGroup,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import Layout from './Layout';
import Head from './Head';
import TitlePage from './TitlePage';
import SelectHero from './SelectHero';
import SelectStage from './SelectStage';
import PlayGame from './PlayGame';
import { ColumnGrid, Row } from './Common';
import { GameContext } from '../components/Context';

import Common from '../../common.json';
import { getNextScene } from '../utils';
import settingSlice from '../redux/settingSlice';
import gameSlice from '../redux/gameSlice';

const { actions: gameActions } = gameSlice;
const { actions: settingActions } = settingSlice;
const { Games } = Common;
const gameMap = new Map(Games);

function GamePage() {
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    const onFullscreenChange = () => {
      dispatch(
        settingActions.setIsFullscreen(document.fullscreenElement != null),
      );
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    if (window.crossOriginIsolated) {
      dispatch(gameActions.setCrossOriginIsolated(true));
    }

    if (typeof Atomics.waitAsync === 'function') {
      dispatch(gameActions.setCanUseWaitAsync(true));
    }

    if (
      window.ontouchstart != null &&
      (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
    ) {
      dispatch(gameActions.setIsTouchDevice(true));
    }

    if (window.navigator.gpu != null) {
      dispatch(gameActions.setCanUseWebGPU(true));
    }

    dispatch(gameActions.setDevicePixelRatio(window.devicePixelRatio));

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement == null) {
      document.documentElement.requestFullscreen();
    } else if (typeof document.exitFullscreen === 'function') {
      document.exitFullscreen();
    }
  }, [document.fullscreenElement]);

  const gameContext = { toggleFullScreen };

console.log('GamePage:rendererd')
  return (
    <GameContext.Provider value={gameContext}>
      <Routes>
        <Route
          path="/title"
          element={
            <TitlePage />
          }
        />
        <Route
          path="/hero"
          element={
            <SelectHero />
          }
        />
        <Route
          path="/stage"
          element={
            <SelectStage />
          }
        />
        <Route
          path="/play"
          element={
            <PlayGame />
          }
        />
      </Routes>
    </GameContext.Provider>
  );
}

GamePage.propTypes = {
  //
};

export default GamePage;
