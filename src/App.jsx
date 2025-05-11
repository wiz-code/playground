import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, useNavigate, useLocation } from 'react-router-dom';///////
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';

import defaultTheme from './theme';
import Common from './common.json';
import LoadingPage from './components/LoadingPage';
import { isRootPath } from './utils';

const SelectGame = lazy(() => import('./components/SelectGame'));
const GamePage = lazy(() => import('./components/GamePage'));

const theme = createTheme(defaultTheme);

function App({ pathname, lastSegment }) {
  useEffect(() => {
    //

    return () => {
      //
    };
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route
          index
          element={
            <SelectGame
              pathname={pathname}
              lastSegment={lastSegment}
            />
          }
        />
        <Route
          path="/game/*"
          element={
            <GamePage />
          }
        />
      </Route>    
    ),
    { basename: pathname },
  );
console.log('App:rendererd')
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingPage />}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  );
}

App.propTypes = {
  //
};

export default App;
