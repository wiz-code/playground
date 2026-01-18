import React, {
  lazy,
  Suspense,

  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
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

import { ColumnGrid, Row } from './Common';///////////
import { GameContext } from './Context';

import Common from '../../common.json';
import { HighFramerateCoef, LowFramerateCoef } from '../../common/constants';
import settingSlice from '../redux/settingSlice';
import gameSlice from '../redux/gameSlice';
import Loading from './Loading.jsx';
import Head from './Head';
import Game from '../game/main';

const { actions: settingActions } = settingSlice;
const { actions: gameActions } = gameSlice;
const { Games } = Common;

const gameMap = new Map(Games);

function LoadingAdditionals() {
  return (
    <Grid size={12} sx={{ textAlign: 'center' }}>
      <Typography variant="body1">
        読み込み中...
      </Typography>
    </Grid>
  );
}

function Setting({ type }) {
  const [Additionals, setAdditionals] = useState(null);
  const {
    isFullscreen,
    framerateCoef,
    visibleStats,
    settingPage,
    volume,
    mute,
  } = useSelector((state) => ({
    isFullscreen: state.setting.isFullscreen,
    framerateCoef: state.setting.framerateCoef,
    visibleStats: state.setting.visibleStats,
    settingPage: state.setting.settingPage,
    volume: state.setting.volume,
    mute: state.setting.mute,
  }), shallowEqual);
  const { toggleFullScreen } = useContext(GameContext);
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    const components = lazy(() => {
      if (type === 'fps') {
        return import('./setting/FPS');
      }/* else if (type === 'racing') {
        return import('./setting/Racing');
      }*/

      return Promise.reject();
    });

    setAdditionals(components);
  }, []);

  const additionalSettings = useMemo(() => (
    Additionals != null ? (
      <Suspense fallback={<LoadingAdditionals />}>
        <Additionals />
      </Suspense>
    ) : null
  ), [Additionals]);

  const setVisibleStats = useCallback(() => {
    dispatch(settingActions.setVisibleStats(!visibleStats));
  }, [visibleStats]);

  const setFramerateCoef = useCallback(
    () => {
      const value = framerateCoef === HighFramerateCoef ? LowFramerateCoef : HighFramerateCoef;
      dispatch(settingActions.setFramerateCoef(value));
    },
    [framerateCoef],
  );

  const toggleMute = useCallback((e, value) => {
    dispatch(settingActions.setMute(!mute));
  }, [mute]);

  const changeVolume = useCallback((e, value) => {
    dispatch(settingActions.setVolume(value));
  }, [volume]);

  const hideSettingPage = useCallback(() => {
    dispatch(gameActions.setSettingPage(false));
  }, [settingPage]);
console.log('Setting:rendererd')
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        zIndex: 1000,
        position: 'absolute',
        top: 0,
        backgroundColor: 'rgba(1,1,1,0.5)',
        flexGrow: 1,
      }}
    >
      <Box sx={{
        position: 'fixed',
        top: theme.spacing(1),
        right: theme.spacing(1),
      }}>
        <IconButton aria-label="delete" size="large" onClick={hideSettingPage}>
          <ClearIcon color="primary" fontSize="inherit" />
        </IconButton>
      </Box>
      <Grid container spacing={2} sx={{ color: 'white' }}>
        <Grid size={12} sx={{ m: theme.spacing(4, 8), textAlign: 'center' }}>
          <Typography variant="h1">
            コンフィグ画面
          </Typography>
        </Grid>
        <Grid container size={4} offset={2} sx={{ my: theme.spacing(1), alignItems: 'center' }}>
          <Typography variant="h3">
            音量
          </Typography>
        </Grid>
        <Grid size={4} sx={{ textAlign: 'right' }}>
          <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 1 }}>
            <VolumeDownIcon />
            <Slider
              aria-label="volume"
              value={volume}
              onChange={changeVolume}
              valueLabelDisplay="auto"
            />
            <VolumeUpIcon />
          </Stack>
        </Grid>
        <Grid container size={4} offset={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h3">
            ミュート
          </Typography>
        </Grid>
        <Grid size={4} sx={{ textAlign: 'right' }}>
          <ToggleButtonGroup
            color="primary"
            value={mute ? 'on' : 'off'}
            exclusive
            onChange={toggleMute}
            aria-label="switch mute"
            size="small"
            sx={{ backgroundColor: 'white' }}
          >
            <ToggleButton value="off" sx={{ width: '4rem' }}>ＯＦＦ</ToggleButton>
            <ToggleButton value="on" sx={{ width: '4rem' }}>ＯＮ</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid container size={4} offset={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h3">
            フレームレート
          </Typography>
        </Grid>
        <Grid size={4} sx={{ textAlign: 'right' }}>
          <ToggleButtonGroup
            color="primary"
            value={framerateCoef === HighFramerateCoef ? 'high' : 'low'}
            exclusive
            onChange={setFramerateCoef}
            aria-label="change FPS"
            size="small"
            sx={{ backgroundColor: 'white' }}
          >
            <ToggleButton value="high" sx={{ width: '4rem' }}>高い</ToggleButton>
            <ToggleButton value="low" sx={{ width: '4rem' }}>低い</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid container size={4} offset={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h3">
            FPSを表示する
          </Typography>
        </Grid>
        <Grid size={4} sx={{ textAlign: 'right' }}>
          <ToggleButtonGroup
            color="primary"
            value={visibleStats ? 'show' : 'hide'}
            exclusive
            onChange={setVisibleStats}
            aria-label="display FPS"
            size="small"
            sx={{ backgroundColor: 'white' }}
          >
            <ToggleButton value="show" sx={{ width: '4rem' }}>表示</ToggleButton>
            <ToggleButton value="hide" sx={{ width: '4rem' }}>非表示</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid container size={4} offset={2} sx={{ alignItems: 'center' }}>
          <Typography variant="h3">
            全画面表示
          </Typography>
        </Grid>
        <Grid container size={4} sx={{ justifyContent: 'flex-end' }}>
          {/*<FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={isFullscreen}
                  onChange={toggleFullScreen}
                />
              }
              label="ON"
            />
          </FormGroup>*/}
          <ToggleButtonGroup
            color="primary"
            value={isFullscreen ? 'on' : 'off'}
            exclusive
            onChange={toggleFullScreen}
            aria-label="fullscreen mode"
            size="small"
            sx={{ backgroundColor: 'white' }}
          >
            <ToggleButton value="off" sx={{ width: '4rem' }}>ＯＦＦ</ToggleButton>
            <ToggleButton value="on" sx={{ width: '4rem' }}>ＯＮ</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        {additionalSettings}
      </Grid>
    </Box>
  );
}

export default Setting;