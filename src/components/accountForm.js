/**
 * Page for adding an account in the simple-balance app.
 */

import React, { useLayoutEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Alert, View } from 'react-native';

import get from 'lodash/get';

import { actionCreators } from '../store';
import styles from './styles';
import { FormGroup, HeaderIconButton, Separator, Switch, TextInput } from './utils';


const AccountForm = ({ navigation, accounts, account, onComplete }) => {
    const [accountName, setAccountNameRaw] = useState(get(account, 'name', ''));
    const [accountNameSanitised, setAccountNameSanitised] = useState(get(account, 'name', ''));
    // When the account name is changed, also set the sanitised name
    const setAccountName = (text) => {
        setAccountNameRaw(text);
        setAccountNameSanitised(text.trim());
    };
    const [showRunningBalance, setShowRunningBalance] = useState(get(account, 'showRunningBalance', false));
    const onButtonPress = () => {
        // Check if the account name is unique and set the error message if not
        // Only consider accounts that are not the one we were given
        const accountId = get(account, 'id', null);
        if( accounts.filter(a => a.id !== accountId).some(a => a.name === accountNameSanitised) ) {
            setAccountName(accountNameSanitised);
            Alert.alert(
                'Account name already in use',
                'Please choose another account name.'
            );
        }
        else {
            onComplete({ name: accountNameSanitised, showRunningBalance });
            navigation.goBack();
        }
    };
    // Add a button to the header to say when they are done
    useLayoutEffect(() => navigation.setOptions({
        headerRight: () => (
            <HeaderIconButton
                iconName="checkmark"
                disabled={!accountNameSanitised}
                onPress={onButtonPress}
            />
        )
    }));
    return (
        <>
            <FormGroup label="Name">
                <TextInput
                    placeholder="Account name"
                    onChangeText={setAccountName}
                    defaultValue={accountName}
                    autoFocus
                />
            </FormGroup>
            <Separator />
            <FormGroup>
                <Switch
                    label="Show running balance?"
                    value={showRunningBalance}
                    onValueChange={setShowRunningBalance}
                />
            </FormGroup>
        </>
    );
};


export const AccountAdd = connect(
    (state) => ({ accounts: state.accounts }),
    dispatch => bindActionCreators(actionCreators, dispatch)
)(
    // When the header button is pressed, try to create the account
    ({ navigation, accounts, addAccount }) => (
        <View style={styles.container}>
            <AccountForm
                navigation={navigation}
                accounts={accounts}
                onComplete={addAccount}
            />
        </View>
    )
);


export const AccountEdit = connect(
    (state, { route }) => ({
        accounts: state.accounts,
        account: state.accounts.find(a => a.id === route.params.accountId)
    }),
    dispatch => bindActionCreators(actionCreators, dispatch)
)(
    // When the header button is pressed, try to edit the account
    ({ navigation, accounts, account, editAccount }) => (
        <View style={styles.container}>
            <AccountForm
                navigation={navigation}
                accounts={accounts}
                account={account}
                onComplete={acct => editAccount(account.id, acct)}
            />
        </View>
    )
);
