import { makeStyles, Theme, createStyles } from "@material-ui/core";
import { green } from "@material-ui/core/colors";

export const globalObject = {
    xsrfToken: ""
}

export const useGlobalStyles = makeStyles((theme: Theme) =>
    createStyles({
        centerFab: {
            alignSelf: "center",
            position: "sticky",
            bottom: "2em",
        },
        greenButton: {
            color: theme.palette.common.white,
            backgroundColor: green[500],
            "&:hover": {
                backgroundColor: green[600],
            },
        },
        materialDatePicker: {
            "& input[type=text]": {
                maxWidth: 100,
            },
        },
        levelInput: {
            "& input[type=number]": {
                maxWidth: 100,
            },
        },
        backButton: {
            alignSelf: "flex-start",
            marginBottom: theme.spacing(2),
        },
        textBold: {
            fontWeight: theme.typography.fontWeightBold,
        },
        bottomMargin: {
            marginBottom: theme.spacing(2),
        },
        bottomMarginSmall: {
            marginBottom: theme.spacing(1),
        },
        topMargin: {
            marginTop: theme.spacing(2),
        },
        topMarginSmall: {
            marginTop: theme.spacing(1),
        },
        customListItem: {
            paddingLeft: 0,
            paddingRight: 100,
        },
        customListItemActions: {
            right: 0,
        },
        chipContainer: {
            marginTop: theme.spacing(1),
            display: "flex",
            flexWrap: "wrap",
            "& > *": {
                margin: theme.spacing(1.5),
            },
        },
        chipContainerNoLevel: {
            display: "flex",
            flexWrap: "wrap",
            "& > *": {
                margin: theme.spacing(0.5),
            },
        },
        autocomplete: {
            maxWidth: 300
        },
        paperContainer: {
            marginBottom: theme.spacing(2),
            marginTop: theme.spacing(2),
            padding: theme.spacing(2),
        },
        skillLevelAvatar: {
            width: theme.spacing(3),
            height: theme.spacing(3),
            fontSize: 12,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        primaryAvatar: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        timelineContainer: {
            "& > *:not(:last-child)": {
                "border-right": "1px solid #bdbdbd",
            },
        },
        textCenter: {
            textAlign: "center",
        },
        timelineProject: {
            textAlign: "center",
            minWidth: 50,
            paddingTop: theme.spacing(0.5),
            paddingBottom: theme.spacing(0.5),
            boxShadow: theme.shadows[1],
            color: "white",
            fontWeight: "bold",
            position: "absolute",
            cursor: "default",
        },
        projectTooltip: {
            fontSize: theme.typography.fontSize,
        },
        positionResultContainer: {
            "& > *:not(:first-child)": {
                marginTop: theme.spacing(4),
            },
        },
    }),
);
