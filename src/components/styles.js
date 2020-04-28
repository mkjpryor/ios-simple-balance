/**
 * Styles for the simple-balance app.
 */

import { StyleSheet } from 'react-native';


export default styles = StyleSheet.create({
    container: {
        flex: 1
    },
    text: {
        fontSize: 18
    },
    listItem: {
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    listItemCaret: {
        fontSize: 18,
        color: "lightgrey",
        paddingLeft: 20
    },
    separator: {
        backgroundColor: "lightgrey",
        height: StyleSheet.hairlineWidth
    },
    sectionHeader: {
        fontWeight: 'bold',
        color: 'dimgrey',
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    formGroup: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    label: {
        flexBasis: 120,
        fontWeight: "bold",
        textAlign: "right",
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    input: {
        fontSize: 18,
        backgroundColor: "white",
        padding: 20,
        flexGrow: 1
    },
    switchContainer: {
        flexDirection: "row",
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: "center"
    },
    switchLabel: {
        flexGrow: 1
    },
    toggleContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 20
    },
    toggleLabel: {
        color: "white",
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexGrow: 1,
        textAlign: "center"
    },
    toggleLabelTrue: {
        backgroundColor: "mediumseagreen"
    },
    toggleLabelFalse: {
        backgroundColor: "tomato"
    },
    toggleLabelDisabled: {
        backgroundColor: "transparent",
        color: "lightgrey"
    },
    balanceBanner: {
        paddingHorizontal: 25,
        paddingVertical: 25,
        borderBottomColor: "lightgrey",
        borderBottomWidth: StyleSheet.hairlineWidth,
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 24
    },
    balanceBannerPositive: {
        backgroundColor: "mediumseagreen"
    },
    balanceBannerNegative: {
        backgroundColor: "tomato"
    },
    currencyAmountPositive: {
        color: "mediumseagreen"
    },
    currencyAmountNegative: {
        color: "tomato"
    },
    transactionAmountContainer: {
        flexDirection: 'column'
    },
    transactionRunningBalance: {
        fontSize: 12,
        color: 'darkgrey',
        textAlign: 'right'
    },
    transactionListItemWithRunningBalance: {
        paddingVertical: 12
    },
    iconButton: {
        fontSize: 28,
        lineHeight: 28,
        width: 28,
        height: 28,
        textAlign: "center"
    },
    iconButtonDisabled: {
        color: "lightgrey"
    },
    headerIconButton: {
        fontSize: 32,
        lineHeight: 32,
        height: 32,
        width: 52,
        color: "cornflowerblue"
    }
});
