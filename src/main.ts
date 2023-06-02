import './style.scss';

import Game from './game';

const game = new Game(false);

game.start();

postMessage({ payload: 'removeLoading' }, '*');
