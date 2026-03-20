import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import { ComparePlayersProvider } from './context/ComparePlayersContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ComparePlayersProvider>
          <App />
        </ComparePlayersProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
