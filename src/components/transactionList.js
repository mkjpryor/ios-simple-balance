/**
 * Transaction list page for the simple-balance app.
 */

import React, { useLayoutEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionSheetIOS, Alert, StyleSheet, View } from 'react-native';

import { actionCreators } from '../store';
import styles from './styles';
import { Currency, HeaderIconButton, List, ListItem, Text } from './utils';


const AccountBalance = ({ account }) => (
    <View>
        <Currency
            amount={account.balance}
            style={StyleSheet.flatten([
                styles.balanceBanner,
                account.balance >= 0 ?
                    styles.balanceBannerPositive :
                    styles.balanceBannerNegative
            ])}
        />
    </View>
);


const TransactionListItem = ({
    transaction,
    showRunningBalance,
    toEditTransaction,
    toCopyTransaction,
    deleteTransaction
}) => {
    const confirmDelete = () => Alert.alert(
        "Confirm delete",
        "If you delete this transaction it cannot be restored.",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => deleteTransaction(transaction.id)
            }
        ],
        { cancelable: false }
    );
    // When pressed, redirect to the edit page for the transaction
    const onPress = () => toEditTransaction(transaction.id);
    // When long-pressed, show the action sheet for the transaction
    const onLongPress = () => ActionSheetIOS.showActionSheetWithOptions(
        {
            options: ['Cancel', 'Copy transaction', 'Delete transaction'],
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2
        },
        buttonIndex => {
            // When copying a transaction, the user gets an opportunity to edit the new transaction
            if( buttonIndex == 1 ) toCopyTransaction(transaction.id);
            else if( buttonIndex == 2 ) confirmDelete();
        }
    );
    return (
        <ListItem
            onPress={onPress}
            onLongPress={onLongPress}
            style={showRunningBalance && styles.transactionListItemWithRunningBalance}
        >
            <Text style={{ flexGrow: 1 }}>{transaction.payee}</Text>
            <View style={styles.transactionAmountContainer}>
                <Currency
                    amount={transaction.amount}
                    style={StyleSheet.flatten([
                        styles.transactionAmount,
                        transaction.amount >= 0 ?
                            styles.currencyAmountPositive :
                            styles.currencyAmountNegative
                    ])}
                />
                {showRunningBalance &&
                    <Currency
                        amount={transaction.runningBalance}
                        style={styles.transactionRunningBalance}
                    />
                }
            </View>
        </ListItem>
    );
};


const TransactionList = ({ navigation, account, deleteTransaction }) => {
    // Add a button to the header to add an account
    useLayoutEffect(() => navigation.setOptions({
        title: account.name,
        headerRight: () => (
            <HeaderIconButton
                iconName="add"
                onPress={() => navigation.navigate('transactionAdd', { accountId: account.id })}
            />
        )
    }));
    // Group the transactions by cleared date and add a running balance as we go
    const transactionsByDate = [];
    let currentDate = null;
    let currentGroup = null;
    let runningBalance = account.balance;
    for( var i = 0, length = account.transactions.length; i < length; i++ ) {
        // Extract the transaction and add the running balance
        const transaction = { ...account.transactions[i], runningBalance };
        runningBalance -= transaction.amount;
        // Format the cleared date for the key
        const clearedDate = transaction.cleared.toLocaleDateString(
            'en-GB',
            { day: 'numeric', month: 'long', year: 'numeric' }
        );
        // If the date matches the current date, add to the group, else start a new group
        if( clearedDate === currentDate ) {
            currentGroup.push(transaction);
        }
        else {
            if( currentGroup !== null )
                transactionsByDate.push({ key: currentDate, data: currentGroup });
            currentDate = clearedDate;
            currentGroup = [transaction]
        }
    }
    // Make sure the final group gets pushed, if there is one
    if( currentGroup !== null ) transactionsByDate.push({ key: currentDate, data: currentGroup });
    return (
        <View style={styles.container}>
            <List
                sections={transactionsByDate}
                renderItem={({ item }) => (
                    <TransactionListItem
                        transaction={item}
                        showRunningBalance={account.showRunningBalance}
                        toEditTransaction={transactionId => navigation.navigate('transactionEdit', { accountId: account.id, transactionId })}
                        toCopyTransaction={transactionId => navigation.navigate('transactionCopy', { accountId: account.id, transactionId })}
                        deleteTransaction={transactionId => deleteTransaction(account.id, transactionId)}
                    />
                )}
                keyExtractor={item => item.id}
                ListHeaderComponent={() => (<AccountBalance account={account} />)}
            />
        </View>
    );
};


export default connect(
    (state, { route }) => ({ account: state.accounts.find(a => a.id === route.params.accountId) }),
    dispatch => bindActionCreators(actionCreators, dispatch)
)(TransactionList);
