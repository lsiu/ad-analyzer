// js/content.js - Main content script entry point

import { startPeriodicDetection } from './modules/adScheduler.js';
import { setupMessageListener } from './modules/messaging.js';

// Start periodic detection
startPeriodicDetection();

// Setup message listener for popup communication
setupMessageListener();