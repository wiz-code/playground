import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';

import { MetaContext } from './Context';

function Head({ content }) {
  const meta = useContext(MetaContext);
  const siteName = meta.get('siteName');

  return (
    <Helmet>
      <title>{`${content.title} | ${siteName}`}</title>
      <meta name="keywords" content={content.keywords} />
      <meta name="description" content={content.description} />
    </Helmet>
  );
}

export default Head;