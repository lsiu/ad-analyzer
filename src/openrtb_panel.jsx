import React from 'react';
import { createRoot } from 'react-dom/client';
import OpenRTBPanel from './OpenRTBPanel';

const container = document.getElementById('root');
const root = createRoot(container);
console.log('Rendering OpenRTBPanel');
debugger;
root.render(<OpenRTBPanel/>);
