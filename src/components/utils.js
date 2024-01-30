/**
 * Utilities for the simple-balance app.
 */

import React from 'react';
import {
    Switch as NativeSwitch,
    Text as NativeText,
    TextInput as NativeTextInput,
    View,
    StyleSheet,
    FlatList,
    SectionList,
    Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import styles from './styles';


export const Text = (props) => (
    <NativeText {...props} style={StyleSheet.flatten([styles.text, props.style])}>
        {props.children}
    </NativeText>
);


export const Currency = ({ amount, ...props }) => {
    const amountText = (amount / 100).toLocaleString(
        'en-GB',
        {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
    return (<Text {...props}>{amountText}</Text>);
};


export const TextInput = (props) => (
    <NativeTextInput {...props} style={StyleSheet.flatten([styles.input, props.style])} />
);


export const Switch = ({ label, ...props }) => (
    <View style={styles.switchContainer}>
        {label && <Text style={styles.switchLabel}>{label}</Text>}
        <NativeSwitch {...props} />
    </View>
);


export const ListItem = (props) => {
    const { containerComponent, onPress, onLongPress, caret, ...containerProps } = props;
    const Container = containerComponent || ((onPress || onLongPress) ? Pressable : View);
    return (
        <Container
            {...containerProps}
            onPress={onPress}
            onLongPress={onLongPress}
            style={StyleSheet.flatten([styles.listItem, props.style])}
        >
            {props.children}
            {caret && <Ionicons name="arrow-forward" style={styles.listItemCaret} />}
        </Container>
    );
};


export const SectionHeader = (props) => (<Text style={styles.sectionHeader}>{props.children}</Text>)


export const Separator = (props) => (<View style={StyleSheet.flatten([styles.separator, props.style])} />);


export const List = ({ listComponent, ...props }) => {
    const ListComponent = listComponent || (props.hasOwnProperty('sections') ? SectionList : FlatList);
    return (
        <ListComponent
            ItemSeparatorComponent={Separator}
            SectionSeparatorComponent={Separator}
            renderSectionHeader={({ section }) => <SectionHeader>{section.key}</SectionHeader>}
            {...props}
        />
    );
};


export const FormGroup = (props) => {
    const { label } = props;
    return (
        <ListItem style={styles.formGroup}>
            {label && (<Text style={styles.label}>{label}</Text>)}
            {props.children}
        </ListItem>
    );
};


export const IconButton = ({ iconName, iconStyle, disabled = false, ...props }) => (
    <Pressable disabled={disabled} {...props}>
        <Ionicons
            name={iconName}
            style={StyleSheet.flatten([
                styles.iconButton,
                iconStyle,
                disabled && styles.iconButtonDisabled
            ])}
        />
    </Pressable>
);


export const HeaderIconButton = ({ iconStyle, ...props }) => (
    <IconButton iconStyle={StyleSheet.flatten([styles.headerIconButton, iconStyle])} {...props} />
);
