import './style.css';

import Game from './game';

const game = new Game(true);

game.start();

postMessage({ payload: 'removeLoading' }, '*');
