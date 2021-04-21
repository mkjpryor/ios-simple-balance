/**
 * Page for adding a transaction in the simple-balance app.
 */

import React, { useLayoutEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import get from 'lodash/get';

import DateTimePickerModal from "react-native-modal-datetime-picker";

import { actionCreators } from '../store';
import styles from './styles';
import { FormGroup, HeaderIconButton, Separator, TextInput, Text } from './utils';


const Toggle = ({
    trueLabel = "On",
    falseLabel = "Off",
    value = null,
    defaultValue = false,
    onChangeValue
}) => {
    const [toggleValue, setToggleValue] = useState(value !== null ? value : defaultValue);
    const trueStyle = StyleSheet.flatten([
        styles.toggleLabel,
        styles.toggleLabelTrue,
        toggleValue || styles.toggleLabelDisabled,
    ]);
    const falseStyle = StyleSheet.flatten([
        styles.toggleLabel,
        styles.toggleLabelFalse,
        toggleValue && styles.toggleLabelDisabled
    ]);
    const onPress = () => {
        // Dismiss the keyboard before toggling
        Keyboard.dismiss();
        const nextValue = !toggleValue;
        setToggleValue(nextValue);
        onChangeValue(nextValue);
    };
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View style={styles.toggleContainer}>
                <Text style={trueStyle}>{trueLabel}</Text>
                <Text style={falseStyle}>{falseLabel}</Text>
            </View>
        </TouchableWithoutFeedback>
    );
};


const FocussableTextInput = (props) => {
    const [focussed, setFocussed] = useState(false);
    return (
        <TextInput
            {...props}
            style={focussed || { color: "darkgrey" }}
            onFocus={() => setFocussed(true)}
            onBlur={() => setFocussed(false)}
        />
    );
};


const formatCurrency = (value) => {
    // Make sure the value is a positive integer
    const integerValue = Math.trunc(Math.abs(value || 0));
    // Use the Javascript decimal conversion to get the display value
    return (integerValue / 100).toLocaleString(
        'en-GB',
        {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
};


// Component for doing currency input
// It allows for entering currency values without a dot, e.g. 1-2-5-0-0 for 125.00
const CurrencyInput = ({
    value = null,
    defaultValue = null,
    onChangeValue,
    onFocus,
    onBlur,
    ...props
}) => {
    const initialValue = value || defaultValue;
    const [displayValue, setDisplayValue] = useState(formatCurrency(initialValue));
    const onChangeText = (text) => {
        // First, strip all the non-numeric characters
        const numeric = text.replace(/[^0-9]/g, '');
        // Then work out the integer value
        const valueInteger = numeric !== '' ?
            Math.trunc(Math.abs(parseInt(numeric, 10))) :
            0;
        // Use the integer value to set the display value and fire the change event
        setDisplayValue(formatCurrency(valueInteger));
        onChangeValue(valueInteger);
    }
    // In order to get a smooth rendering without numbers jumping from one side
    // of the dot to the other, we render a text element which is overlaid with
    // a transparent input element to trigger the keyboard
    const [layout, setLayout] = useState({ height: 0, width: 0, x: 0, y: 0 });
    const onLayout = (event) => setLayout(event.nativeEvent.layout);
    const [focussed, setFocussed] = useState(false);
    return (
        <View style={{ flexGrow: 1 }}>
            <Text
                onLayout={onLayout}
                style={StyleSheet.flatten([styles.input, focussed || { color: "darkgrey" }])}
            >
                {displayValue}
            </Text>
            <TextInput
                {...props}
                contextMenuHidden
                onChangeText={onChangeText}
                value={displayValue}
                keyboardType="numeric"
                caretHidden
                onFocus={() => setFocussed(true)}
                onBlur={() => setFocussed(false)}
                style={{
                    position: "absolute",
                    top: layout.y,
                    left: layout.x,
                    height: layout.height,
                    width: layout.width,
                    backgroundColor: "transparent",
                    color: "transparent"
                }}
            />
        </View>
    );
};


const DateInput = ({ value = null, defaultValue = null, onChangeValue }) => {
    const [selected, setSelected] = useState(value || defaultValue || new Date());
    const [focussed, setFocussed] = useState(false);
    const onPress = () => {
        // Dismiss the keyboard before focussing the picker
        Keyboard.dismiss();
        setFocussed(true);
    };
    const onConfirm = (date) => {
        setFocussed(false);
        setSelected(date);
        onChangeValue(date);
    };
    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={onPress}>
                <Text style={StyleSheet.flatten([styles.input, focussed || { color: "darkgrey" }])}>
                    {selected.toLocaleDateString(
                        'en-GB',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                </Text>
            </TouchableWithoutFeedback>
            <DateTimePickerModal
                isVisible={focussed}
                mode="date"
                onConfirm={onConfirm}
                onCancel={() => setFocussed(false)}
                date={selected}
            />
        </View>
    );
};


const TransactionForm = ({ navigation, transaction, onComplete }) => {
    const [isIncome, setIsIncome] = useState(get(transaction, 'amount', -1) >= 0);
    const [payee, setPayeeRaw] = useState(get(transaction, 'payee', ''));
    const [payeeSanitised, setPayeeSanitised] = useState(get(transaction, 'payee', ''));
    const setPayee = (text) => {
        setPayeeRaw(text);
        setPayeeSanitised(text.trim());
    };
    const [amount, setAmount] = useState(Math.trunc(Math.abs(get(transaction, 'amount', 0))));
    const [cleared, setCleared] = useState(get(transaction, 'cleared', new Date()));
    // When the header button is pressed, run the onComplete action
    const onButtonPress = () => {
        onComplete({
            payee: payeeSanitised,
            amount: isIncome ? amount : -1 * amount,
            cleared
        });
        navigation.goBack();
    };
    // Add a button to the header to say when they are done
    useLayoutEffect(() => navigation.setOptions({
        title: 'Add Transaction',
        headerRight: () => (
            <HeaderIconButton
                iconName="ios-checkmark"
                disabled={!payeeSanitised || amount <= 0}
                onPress={onButtonPress}
            />
        )
    }));
    return (
        <>
            <FormGroup label="Type">
                <Toggle
                    trueLabel="Income"
                    falseLabel="Expense"
                    onChangeValue={setIsIncome}
                    defaultValue={isIncome}
                />
            </FormGroup>
            <Separator />
            <FormGroup label="Payee">
                <FocussableTextInput
                    placeholder="Payee"
                    onChangeText={setPayee}
                    defaultValue={payee}
                    autoFocus
                />
            </FormGroup>
            <Separator />
            <FormGroup label="Amount">
                <CurrencyInput
                    onChangeValue={setAmount}
                    defaultValue={amount}
                />
            </FormGroup>
            <Separator />
            <FormGroup label="Cleared">
                <DateInput
                    onChangeValue={setCleared}
                    defaultValue={cleared}
                />
            </FormGroup>
        </>
    );
};


export const TransactionAdd = connect(
    (state, { route }) => ({
        account: state.accounts.find(a => a.id === route.params.accountId)
    }),
    dispatch => bindActionCreators(actionCreators, dispatch)
)(
    ({ navigation, account, addTransaction }) => (
        <View style={styles.container}>
            <TransactionForm
                navigation={navigation}
                onComplete={t => addTransaction(account.id, t)}
            />
        </View>
    )
);


export const TransactionEdit = connect(
    (state, { route }) => {
        const account = state.accounts.find(a => a.id === route.params.accountId);
        return {
            account,
            transaction: account.transactions.find(t => t.id === route.params.transactionId)
        };
    },
    dispatch => bindActionCreators(actionCreators, dispatch)
)(
    ({ navigation, account, transaction, editTransaction }) => (
        <View style={styles.container}>
            <TransactionForm
                navigation={navigation}
                transaction={transaction}
                onComplete={t => editTransaction(account.id, transaction.id, t)}
            />
        </View>
    )
);
