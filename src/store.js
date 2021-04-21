/**
 * Module defining the Redux store for the simple-balance app.
 */

import { createStore } from 'redux';
import { createTransform, persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import findIndex from 'lodash/findIndex';


const actions = {
    ACCOUNT_ADD: 'SIMPLE_BALANCE/ACCOUNT/ADD',
    ACCOUNT_EDIT: 'SIMPLE_BALANCE/ACCOUNT/EDIT',
    ACCOUNT_DELETE: 'SIMPLE_BALANCE/ACCOUNT/DELETE',

    TRANSACTION_ADD: 'SIMPLE_BALANCE/TRANSACTION/ADD',
    TRANSACTION_EDIT: 'SIMPLE_BALANCE/TRANSACTION/EDIT',
    TRANSACTION_DELETE: 'SIMPLE_BALANCE/TRANSACTION/DELETE'
};


export const actionCreators = {
    addAccount: (account) => ({
        type: actions.ACCOUNT_ADD,
        account
    }),
    editAccount: (accountId, account) => ({
        type: actions.ACCOUNT_EDIT,
        accountId,
        account
    }),
    deleteAccount: (accountId) => ({
        type: actions.ACCOUNT_DELETE,
        accountId
    }),

    addTransaction: (accountId, transaction) => ({
        type: actions.TRANSACTION_ADD,
        accountId,
        transaction
    }),
    editTransaction: (accountId, transactionId, transaction) => ({
        type: actions.TRANSACTION_EDIT,
        accountId,
        transactionId,
        transaction
    }),
    deleteTransaction: (accountId, transactionId) => ({
        type: actions.TRANSACTION_DELETE,
        accountId,
        transactionId
    })
};


function uuid() {
    // This is good enough for here
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        c => {
            const r = Math.random()*16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }
    );
}


function updateAccount(accounts, accountId, transform) {
    const updatedAccount = transform(accounts.find(a => a.id === accountId));
    // Make sure there is only ever one default account
    return accounts.map(
        account => {
            if( account.id === updatedAccount.id ) {
                return updatedAccount;
            }
            else {
                return {
                    ...account,
                    isDefault: !updatedAccount.isDefault && account.isDefault
                };
            }
        }
    );
}


function insertTransaction(transactions, transaction) {
    // We need to maintain the sort order when inserting
    // Transactions are ordered by cleared with the latest first
    // We assume the majority of transactions will have a recent cleared,
    // so a linear search for insertion index will be OK performance-wise
    const insertAt = findIndex(transactions, (t) => t.cleared <= transaction.cleared);
    // If the transaction occurs before all others, insertAt will be -1
    // In this case, we want to append the transaction
    if( insertAt >= 0 ) {
        return [
            ...transactions.slice(0, insertAt),
            transaction,
            ...transactions.slice(insertAt)
        ];
    }
    else {
        return [...transactions, transaction];
    }
}


function removeTransaction(transactions, transactionId) {
    const removeIndex = findIndex(transactions, (t) => t.id === transactionId);
    const removed = transactions[removeIndex];
    return {
        transactions: [
            ...transactions.slice(0, removeIndex),
            ...transactions.slice(removeIndex + 1)
        ],
        removed
    };
}


const accountDefaults = {
    balance: 0,
    transactions: [],
    showRunningBalance: false,
    isDefault: false
};


function reducer(state = { accounts: [] }, action) {
    // The state is just a list of accounts
    // An account has a name, balance and list of transactions
    //   The balance is an integer number of pence
    //   The list of transactions is ordered by the clearedAt date, with the
    //   newest transactions at the front
    // A transaction has a payee, an amount and a cleared date
    //   The amount is an integer number of pence, +ve for income, -ve for expense
    switch(action.type) {
        case actions.ACCOUNT_ADD:
            return {
                accounts: [
                    // If the incoming account is set as the default, unset all others
                    ...state.accounts.map(
                        account => ({
                            ...account,
                            isDefault: !action.account.isDefault && account.isDefault
                        })
                    ),
                    {
                        // Start with the defaults
                        ...accountDefaults,
                        // Override with the account from the action
                        ...action.account,
                        // Make sure to set a new id
                        id: uuid()
                    }
                ]
            };
        case actions.ACCOUNT_EDIT:
            return {
                accounts: updateAccount(
                    state.accounts,
                    action.accountId,
                    (account) => ({ ...accountDefaults, ...account, ...action.account })
                )
            };
        case actions.ACCOUNT_DELETE:
            const accountIndex = findIndex(state.accounts, (a) => a.id === action.accountId);
            return {
                accounts: [
                    ...state.accounts.slice(0, accountIndex),
                    ...state.accounts.slice(accountIndex + 1)
                ]
            };
        case actions.TRANSACTION_ADD:
            return {
                accounts: updateAccount(
                    state.accounts,
                    action.accountId,
                    (account) => ({
                        ...account,
                        balance: account.balance + action.transaction.amount,
                        // When adding a transaction, generate a new id
                        transactions: insertTransaction(
                            account.transactions,
                            { ...action.transaction, id: uuid() }
                        )
                    })
                )
            };
        case actions.TRANSACTION_EDIT:
            return {
                accounts: updateAccount(
                    state.accounts,
                    action.accountId,
                    (account) => {
                        // Replace is implemented as an id-preserving remove and insert
                        const { transactions, removed } = removeTransaction(account.transactions, action.transactionId);
                        return {
                            ...account,
                            balance: account.balance - removed.amount + action.transaction.amount,
                            transactions: insertTransaction(
                                transactions,
                                { ...action.transaction, id: removed.id }
                            )
                        };
                    }
                )
            };
        case actions.TRANSACTION_DELETE:
            return {
                accounts: updateAccount(
                    state.accounts,
                    action.accountId,
                    (account) => {
                        const { transactions, removed } = removeTransaction(account.transactions, action.transactionId);
                        return {
                            ...account,
                            balance: account.balance - removed.amount,
                            transactions
                        };
                    }
                )
            };
        default:
            return state;
    }
}


const AccountsTransform = createTransform(
    // When serializing, convert cleared dates to ISO strings
    accounts => accounts.map(
        account => ({
            ...account,
            transactions: account.transactions.map(
                transaction => ({
                    ...transaction,
                    cleared: transaction.cleared.toISOString()
                })
            )
        })
    ),
    // When rehydrating, convert cleared dates back from ISO strings
    accounts => accounts.map(
        account => ({
            ...account,
            transactions: account.transactions.map(
                transaction => ({
                    ...transaction,
                    cleared: new Date(transaction.cleared)
                })
            )
        })
    ),
    { whitelist: ['accounts'] }
);


export default () => {
    const persistConfig = { key: 'root', storage: AsyncStorage, transforms: [AccountsTransform] };
    const persistedReducer = persistReducer(persistConfig, reducer);
    const store = createStore(persistedReducer);
    const persistor = persistStore(store);
    return { store, persistor };
};
