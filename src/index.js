/**
 * Main module for the simple-balance application.
 */

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, Text } from 'react-native';

import makeStore from './store';

import Navigation from './navigation';


const { store, persistor } = makeStore();


export default SimpleBalance = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <Navigation />
            </PersistGate>
        </Provider>
    );
};
