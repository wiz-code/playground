import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { grey } from '@mui/material/colors';

import {
  Grid,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import Layout from './Layout';
import Head from './Head';
import { ColumnGrid, Row } from './Common';
import MobilePlayDialog from './MobilePlayDialog';

import Common from '../../common.json';
import { getNextScene } from '../utils';
import gameSlice from '../redux/gameSlice';

const { actions: gameActions } = gameSlice;
const { Games } = Common;
const gameMap = new Map(Games);

function TitlePage() {
  const { isFullscreen } = useSelector((state) => state.setting);
  const { gameId, scene } = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const theme = useTheme();

  const { name: title, keywords, description } = gameMap.get(gameId);
  const content = useMemo(() => ({ title, keywords, description }), [title, keywords, description]);

  useEffect(() => {
    dispatch(gameActions.setScene('title'));

    return () => {
      //
    };
  }, []);

console.log('TitlePage:rendererd')
  return (
    <Layout>
      <Head content={content} />
      {/*<MobilePlayDialog />*/}
      <ColumnGrid container>
        <Row item sx={{ mt: theme.spacing(4) }}>
          <Typography variant="h1" align="center">
            {title}
          </Typography>
        </Row>
        <Row
          container
          item
          sx={{ gap: theme.spacing(2), justifyContent: 'center' }}
        >
          <Button
            variant="contained"
            component={Link}
            to="/game/hero"
            state="title"
            disabled={scene !== 'title'}
          >
            ゲームを開始する
          </Button>
        </Row>
      </ColumnGrid>
    </Layout>
  );
}

TitlePage.propTypes = {
  //
};

export default TitlePage;
