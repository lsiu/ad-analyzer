// js/content.js - Main content script entry point

import { highlightAds } from './modules/adHighlighter.js';
import { startPeriodicDetection } from './modules/adScheduler.js';
import { setupMessageListener } from './modules/messaging.js';

// Initialize the ad highlighter
highlightAds();

// Start periodic detection
startPeriodicDetection();

// Setup message listener for popup communication
setupMessageListener();