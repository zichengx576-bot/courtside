import {MotionPreferences} from './MotionPreferences';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {LocaleProvider} from './Locale';
import './style.css';
import './readability.css';
import './dark.css';
import './cover-clip.css';
createRoot(document.getElementById('root')).render(<MotionPreferences><LocaleProvider><App/></LocaleProvider></MotionPreferences>);

import './structure.css';

import './advisor.css';

import './premium.css';

import './campaign.css';
import './precision.css';
import './experience.css';
import './scroll-experience.css';
