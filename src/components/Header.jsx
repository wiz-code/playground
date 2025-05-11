import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { AppBar, Toolbar, Typography } from '@mui/material';

import { MetaContext } from './Context';

function Header() {
  const meta = useContext(MetaContext);
  const siteName = meta.get('siteName');

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {siteName}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {};

export default Header;
