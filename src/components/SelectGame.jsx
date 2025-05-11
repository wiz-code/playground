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
import { ColumnGrid, Row } from './Common';

import Common from '../common.json';
import gameSlice from '../redux/gameSlice';
import { MetaContext, GameContext } from './Context';

const { actions: gameActions } = gameSlice;
const { Games } = Common;
const gameMap = new Map(Games);

function SelectPage({ pathname, lastSegment }) {
  const { scene, gameId } = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const theme = useTheme();
  const meta = useContext(MetaContext);

  const Title = meta.get('title');
  const titleMap = new Map(Title);
  const title = titleMap.get(SelectPage.name);

  const Subtitle = meta.get('subtitle');
  const subtitleMap = new Map(Subtitle);
  const subtitle = subtitleMap.get(SelectPage.name);

  const Keywords = meta.get('keywords');
  const keywordsMap = new Map(Keywords);
  const keywords = keywordsMap.get(SelectPage.name);

  const Description = meta.get('description');
  const descriptionMap = new Map(Description);
  const description = descriptionMap.get(SelectPage.name);

  useEffect(() => {
    dispatch(gameActions.setScene('unstarted'));

    return () => {
      //
    };
  }, []);

  const content = useMemo(() => ({ title, keywords, description }), [title, keywords, description]);
  const titlePath = useMemo(() => (lastSegment === '' ? `${pathname}title` : `${pathname}/${lastSegment}/title`), [lastSegment]);

  const setGameId = useCallback((e) => {
    const { value } = e.target;
    dispatch(gameActions.setGameId(value));
  }, []);

console.log('SelectGame:rendererd')
  return (
    <Layout>
      <Head content={content} />
      <ColumnGrid container>
        <Row item sx={{ mt: theme.spacing(4) }}>
          <Typography variant="h1">
            {title}
          </Typography>
          {subtitle !== '' ? (
            <Typography variant="subtitle1">
              {subtitle}
            </Typography>
          ) : null}
        </Row>
        <Row item sx={{ display: 'flex', gap: theme.spacing(1) }}>
          <Typography variant="body1">テストプレイするゲームを選んでください</Typography>
        </Row>
        <Row item sx={{ display: 'flex', justifyContent: 'center' }} />
        <Row
          container
          item
          sx={{ gap: theme.spacing(2), justifyContent: 'center' }}
        >
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="game-select-label">デモゲーム選択</InputLabel>
            <Select
              labelId="game-select-label"
              id="game-select"
              value={gameId}
              label="デモゲーム選択"
              onChange={setGameId}
            >
              {Array.from(gameMap.entries()).map(([id, { name: label }]) => (
                <MenuItem key={`game-${id}`} value={id}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            component={Link}
            to="/game/title"
            disabled={scene !== 'unstarted'}
          >
            ゲームを起動する
          </Button>
        </Row>
      </ColumnGrid>
    </Layout>
  );
}

SelectPage.propTypes = {
  //
};

export default SelectPage;
