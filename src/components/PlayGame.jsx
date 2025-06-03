import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  memo,
} from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, IconButton, Box, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import SettingsIcon from '@mui/icons-material/Settings';

import Setting from './Setting';
import { GameContext } from './Context';
import Common from '../common.json';
import settingSlice from '../redux/settingSlice';
import gameSlice from '../redux/gameSlice';
import Loading from './Loading.jsx';
import Head from './Head';
import Game from '../game/main';
import { getNextScene } from '../utils';

const { actions: settingActions } = settingSlice;
const { actions: gameActions } = gameSlice;
const { Games, HighFramerateCoef, LowFramerateCoef } = Common;

const gameMap = new Map(Games);
const monospaced = '"MS Gothic", "TakaoGothic", "Noto Sans CJK JP", Monospace';

const GameContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'absolute',
  contentVisibility: 'hidden',
  overflow: 'clip',
  zIndex: 100,
}));

function DisplayTime({ type, loading }) {
  const { scene, elapsedTime } = useSelector((state) => ({
    scene: state.game.scene,
    elapsedTime: state.game.elapsedTime,
  }), shallowEqual);
  const { visibleElapsedTime } = useSelector((state) => {////////
    if (type === 'fps') {
      return {
        visibleElapsedTime: state.fps.visibleElapsedTime,
      };
    } else if (type === 'racing') {
      return state.racing;
    }

    return undefined;
  }, shallowEqual);

  if (scene === 'play' && visibleElapsedTime && !loading) {
    return (
      <Box
        sx={{
          width: 'fit-content',
          position: 'absolute',
          left: 'calc(50% - 50px)',

          color: 'white',
          fontSize: '2.5rem',
          fontFamily: monospaced,
          zIndex: 1000,
        }}
      >
        {elapsedTime.toFixed(2)}
      </Box>
    );
  }

  return null;
}

function SettingButton() {
  const settingPage = useSelector((state) => state.game.settingPage);
  const visibleElapsedTime = useSelector((state) => state.fps.visibleElapsedTime);
  const dispatch = useDispatch();
  const theme = useTheme();

  const showSettingPage = useCallback(() => {
    dispatch(gameActions.setSettingPage(true))
  }, [settingPage]);

  return (
    <Box sx={{
      position: 'fixed',
      top: theme.spacing(1),
      right: theme.spacing(1),
      zIndex: 1000,
    }}>
      <IconButton aria-label="settings" size="large" onClick={showSettingPage}>
        <SettingsIcon fontSize="inherit" sx={{ color: grey[500] }} />
      </IconButton>
    </Box>
  );
}

function PlayGame() {
  const {
    crossOriginIsolated,
    canUseWaitAsync,
    isTouchDevice,
    webGPU,
    devicePixelRatio,
    
    gameId,
    heroId,
    levelId,
    scene,
    loading,
    settingPage,
  } = useSelector((state) => ({
    crossOriginIsolated: state.game.crossOriginIsolated,
    canUseWaitAsync: state.game.canUseWaitAsync,
    isTouchDevice: state.game.isTouchDevice,
    webGPU: state.game.webGPU,
    devicePixelRatio: state.game.devicePixelRatio,
    
    gameId: state.game.gameId,
    heroId: state.game.heroId,
    levelId: state.game.levelId,
    scene: state.game.scene,
    loading: state.game.loading,
    settingPage: state.game.settingPage,
  }), shallowEqual);
  const { framerateCoef, visibleStats, volume, mute } = useSelector((state) => ({
    framerateCoef: state.setting.framerateCoef,
    visibleStats: state.setting.visibleStats,
    volume: state.setting.volume,
    mute: state.setting.mute,
  }), shallowEqual);

  const [game, setGame] = useState(null);
  const dispatch = useDispatch();
  const theme = useTheme();
  const ref = useRef(null);

  const { type } = gameMap.get(gameId);

  const setElapsedTime = useCallback((data) => {
    dispatch(gameActions.setElapsedTime(data));
  }, []);
  const setScore = useCallback((score) => {
    dispatch(gameActions.setScore(score));
  }, []);

  const setScene = useCallback((scene) => {
    dispatch(gameActions.setScene(scene));
  }, []);

  const setLoading = useCallback((bool) => {
    dispatch(gameActions.setLoading(bool));

    if (!bool) {
      ref.current.style.setProperty('content-visibility', 'visible');
    }
  }, [ref.current]);

  useEffect(() => {
    dispatch(gameActions.setScene('play'));

    const params = {
      type,
      gameId,
      heroId,
      levelId,
      framerateCoef,
      settingPage,
      volume,
      mute,

      crossOriginIsolated,
      canUseWaitAsync,
      isTouchDevice,
      webGPU,
      devicePixelRatio,
    };
    const callbacks = {
      setScene,
      setElapsedTime,
      setLoading,
    };

    if (type === 'fps' || type === 'racing') {
      callbacks.setScore = setScore;
    }

    const gameObject = new Game(
      ref.current,
      callbacks,
      params,
    );
    setGame(gameObject);

    return () => {
      // TODO: クリーンアップ処理
      gameObject.stop(true);
      gameObject.dispose();
      setGame(null);
      dispatch(gameActions.resetGameState());
    };
  }, []);

  const { name: title, keywords, description } = gameMap.get(gameId);
  const content = useMemo(() => ({ title, keywords, description }), [title, keywords, description]);

  useEffect(() => {
    if (game == null) {
      return;
    }

    game.enableStats(visibleStats);
  }, [visibleStats]);

  useEffect(() => {
    if (game == null) {
      return;
    }

    game.publish('set-volume', volume);
  }, [volume]);

  useEffect(() => {
    if (game == null) {
      return;
    }

    game.publish('set-mute', mute);
  }, [mute]);

  useEffect(() => {
    if (game == null) {
      return;
    }

    if (settingPage) {
      game.pause();
    } else {
      game.start(true);
    }
  }, [settingPage]);

  useEffect(() => {
    if (game == null) {
      return;
    }

    game.setParam('framerateCoef', framerateCoef, true);
  }, [framerateCoef]);
console.log('PlayGame:rendererd')
  return (
    <Box sx={{ userSelect: 'none', height: '100svh' }}>
      <Head content={content} />
      <DisplayTime type={type} loading={loading} />
      {loading ? <Loading /> : null}
      <GameContainer id="container" ref={ref} />
      {loading ? null : (settingPage ? <Setting type={type} /> : <SettingButton />)}
    </Box>
  );
}

PlayGame.propTypes = {
  //
};

export default PlayGame;
