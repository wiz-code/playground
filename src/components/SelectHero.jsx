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

function SelectHero() {
  const { gameId, scene } = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const theme = useTheme();

  const { name: title, keywords, description, heroes } = gameMap.get(gameId);
  const content = useMemo(
    () => ({ title, keywords, description }),
    [title, keywords, description],
  );

  useEffect(() => {
    dispatch(gameActions.setScene('select-hero'));

    return () => {
      //
    };
  }, []);

  const setHeroId = useCallback((value) => {
    dispatch(gameActions.setHeroId(value));
  }, []);

  console.log('SelectHero:rendererd');
  return (
    <Layout>
      <Head content={content} />
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        <Grid size={12} sx={{ m: theme.spacing(4, 4, 6) }}>
          <Typography variant="h1" align="center">
            キャラクター選択
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
        {heroes.map((hero) => (
          <Grid
            key={hero.id}
            container
            size={4}
            sx={{ my: theme.spacing(1), justifyContent: 'center' }}
          >
            <Card variant="outlined" sx={{ maxWidth: 300 }}>
              <CardActionArea
                component={Link}
                to="/game/stage"
                state="select-hero"
                disabled={scene !== 'select-hero'}
                onClick={() => setHeroId(hero.id)}
              >
                <CardMedia
                  component="img"
                  width="192"
                  height="144"
                  image={`${prefixPath}/${hero.image}`}
                  alt={hero.name}
                  sx={{ p: theme.spacing(0.5) }}
                />
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ mb: theme.spacing(1) }}
                  >
                    {hero.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hero.description}
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

SelectHero.propTypes = {
  //
};

export default SelectHero;
