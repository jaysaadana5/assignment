import React from 'react';
import ReactDOM from 'react-dom/client';

// Static site - React not needed but keeping minimal setup for build
// All content is in public/index.html with styles.css and script.js

const root = document.getElementById('root');
if (root) {
  // Don't render anything - let the static HTML handle everything
  root.style.display = 'none';
}
