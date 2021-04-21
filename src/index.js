/**
 * Main module for the simple-balance application.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import makeStore from './store';

import Navigation from './navigation';


const { store, persistor } = makeStore();


export default SimpleBalance = () => (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Navigation />
        </PersistGate>
    </Provider>
);
