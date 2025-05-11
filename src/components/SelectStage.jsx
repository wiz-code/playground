import React, { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  Grid2 as Grid,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import Layout from './Layout';
import Head from './Head';

import Common from '../common.json';
import gameSlice from '../redux/gameSlice';

const { actions: gameActions } = gameSlice;
const { Games, Paths } = Common;
const gameMap = new Map(Games);
const pathMap = new Map(Paths);

const AssetPaths = pathMap.get('Assets');
const assetPaths = new Map(AssetPaths);
const prefixPath = assetPaths.get('images');

function SelectStage() {
  const { gameId, scene } = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const theme = useTheme();

  const { name: title, keywords, description, levels } = gameMap.get(gameId);
  const content = useMemo(
    () => ({ title, keywords, description }),
    [title, keywords, description],
  );

  useEffect(() => {
    dispatch(gameActions.setScene('select-stage'));

    return () => {
      //
    };
  }, []);

  const setLevelId = useCallback((value) => {
    dispatch(gameActions.setLevelId(value));
  }, []);

  console.log('SelectStage:rendererd');
  return (
    <Layout>
      <Head content={content} />
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        <Grid size={12} sx={{ m: theme.spacing(4, 4, 6) }}>
          <Typography variant="h1" align="center">
            ステージ選択
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        {levels.map((level) => (
          <Grid
            key={level.id}
            container
            size={4}
            sx={{ my: theme.spacing(1), justifyContent: 'center' }}
          >
            <Card variant="outlined" sx={{ maxWidth: 300 }}>
              <CardActionArea
                component={Link}
                to="/game/play"
                state="select-stage"
                disabled={scene !== 'select-stage'}
                onClick={() => setLevelId(level.id)}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ mb: theme.spacing(1) }}
                  >
                    {level.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {level.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

SelectStage.propTypes = {
  //
};

export default SelectStage;
