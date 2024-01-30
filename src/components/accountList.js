/**
 * Account list page for the simple-balance app.
 */

import React, { useLayoutEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionSheetIOS, Alert, View } from 'react-native';

import { actionCreators } from '../store';
import styles from './styles';
import { Currency, HeaderIconButton, IconButton, Text, ListItem, List } from './utils';


const AccountListItem = ({ account, toggleDefaultAccount, toTransactions, toEditAccount, deleteAccount }) => {
    const confirmDelete = () => Alert.alert(
        "Confirm delete",
        "If you delete this account, you will lose all the transactions.",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteAccount(account.id)
            }
        ],
        { cancelable: false }
      );
    // When pressed, show the transactions for the account
    const onPress = () => toTransactions(account.id);
    // When long-pressed, show the action sheet for the account
    const onLongPress = () => ActionSheetIOS.showActionSheetWithOptions(
        {
            options: ['Cancel', 'Edit account', 'Delete account'],
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2
        },
        buttonIndex => {
            if( buttonIndex == 1 ) toEditAccount(account.id);
            else if( buttonIndex == 2 ) confirmDelete();
        }
    );
    return (
        <ListItem onPress={onPress} onLongPress={onLongPress} caret>
            <IconButton
                iconName={account.isDefault ? "star" : "star-outline"}
                style={{ paddingRight: 15 }}
                iconStyle={{ color: "cornflowerblue" }}
                onPress={toggleDefaultAccount}
            />
            <Text style={{ flexGrow: 1 }}>{account.name}</Text>
            <Currency
                amount={account.balance}
                style={account.balance >= 0 ? styles.currencyAmountPositive : styles.currencyAmountNegative}
                />
        </ListItem>
    );
};


const AccountList = ({ navigation, accounts, editAccount, deleteAccount }) => {
    // Add a button to the header to add an account
    useLayoutEffect(() => navigation.setOptions({
        headerRight: () => (
            <HeaderIconButton
                iconName="add"
                onPress={() => navigation.navigate('accountAdd')}
            />
        )
    }));
    const toTransactions = accountId => navigation.navigate('transactionList', { accountId });
    const toEditAccount = accountId => navigation.navigate('accountEdit', { accountId });
    return (
        <View style={styles.container}>
            <List
                data={accounts}
                renderItem={({ item }) => (
                    <AccountListItem
                        account={item}
                        toTransactions={toTransactions}
                        toEditAccount={toEditAccount}
                        toggleDefaultAccount={() => editAccount(item.id, { isDefault: !item.isDefault })}
                        deleteAccount={deleteAccount}
                    />
                )}
                keyExtractor={item => item.id}
            />
        </View>
    );
};


export default connect(
    state => ({ accounts: state.accounts }),
    dispatch => bindActionCreators(actionCreators, dispatch)
)(AccountList);
