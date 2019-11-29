// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Angular dependencies
import angular from 'angular';
import angularUiRouter from '@uirouter/angularjs';
// Load config
// import './app.scss';
import {
  appInit,
  routing
} from './app.config';

// Utilities
import './utilities.js';

// Load services
import Battleship from './services/battleship.service';
import Alert from './services/alert.service';

// Load Views
import { homeComponent, homeState } from './views/home';
import { gameComponent, gameState } from './views/game';

export default angular.module('app', [
	angularUiRouter
])

.run(appInit)
.config(routing)

.config(homeState).component('home',homeComponent)
.config(gameState).component('game',gameComponent)

.service('Alert',Alert)
.service('Battleship',Battleship);