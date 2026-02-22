import React from 'react';
import { createRoot } from 'react-dom/client';
import OpenRTBPanel from './openrtb/OpenRTBPanel';

const container = document.getElementById('root');
const root = createRoot(container);
console.log('Rendering OpenRTBPanel');
root.render(<OpenRTBPanel/>);
