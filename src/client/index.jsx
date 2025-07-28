import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';

import store from './redux/store';
import App from './App';
import Common from '../common.json';
import { MetaContext } from './components/Context';

const { Meta, LastPathSegments } = Common;
const meta = new Map(Meta);

const container = document.getElementById('app');
const root = createRoot(container);

let { pathname } = window.location;
let lastSegment = '';

for (let i = 0, l = LastPathSegments.length; i < l; i += 1) {
  const segment = LastPathSegments[i];

  if (pathname.includes(segment)) {
    const lastIndex = pathname.lastIndexOf(segment);
    pathname = pathname.substring(0, lastIndex);
    lastSegment = segment;
  }
}

root.render(
  <Provider store={store}>
    <HelmetProvider>
      <MetaContext.Provider value={meta}>
        <App pathname={pathname} lastSegment={lastSegment} />
      </MetaContext.Provider>
    </HelmetProvider>
  </Provider>,
);
