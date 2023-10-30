import React from 'react';
import { Helmet } from 'react-helmet';

function Helmets() {
  return (
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR&display=swap"
        rel="stylesheet"
      />
    </Helmet>
  );
}

export default Helmets;
