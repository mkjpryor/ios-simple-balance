/**
 * Navigation container for the simple-balance app.
 */

import React from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';

import AccountList from './components/accountList';
import { AccountAdd, AccountEdit } from './components/accountForm';
import TransactionList from './components/transactionList';
import { TransactionAdd, TransactionEdit } from './components/transactionForm';


const Stack = createStackNavigator();


const Home = connect(
    (state) => ({ accounts: state.accounts })
)(
    ({ navigation, accounts }) => {
        // Work out if there is a default account
        const defaultAccount = accounts.length === 1 ?
            accounts[0] :
            accounts.find(a => a.isDefault);
        // Rewrite the navigation stack
        if( defaultAccount ) {
            // If there is a default account, simulate going to the
            // accounts page and then navigating to the account
            // This means that goBack works properly
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: "accountList" },
                        {
                            name: "transactionList",
                            params: { accountId: defaultAccount.id }
                        }
                    ]
                })
            );
        }
        else {
            // If there is no default account, just navigate straight
            // to the accounts list with no history
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "accountList" }]
                })
            )
        }
        return <></>;
    }
);


export default Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="home">
                <Stack.Screen
                    name="home"
                    component={Home}
                />
                <Stack.Screen
                    name="accountList"
                    component={AccountList}
                    options={{ title: "Accounts" }}
                />
                <Stack.Screen
                    name="accountAdd"
                    component={AccountAdd}
                    options={{ title: "Add Account" }}
                />
                <Stack.Screen
                    name="accountEdit"
                    component={AccountEdit}
                    options={{ title: "Edit Account" }}
                />
                <Stack.Screen
                    name="transactionList"
                    component={TransactionList}
                />
                <Stack.Screen
                    name="transactionAdd"
                    component={TransactionAdd}
                />
                <Stack.Screen
                    name="transactionEdit"
                    component={TransactionEdit}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
