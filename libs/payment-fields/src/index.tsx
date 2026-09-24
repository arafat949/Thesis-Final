import { render } from 'preact';
import { App } from './App';

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Payment fields root element not found');
}

render(<App />, rootElement);
