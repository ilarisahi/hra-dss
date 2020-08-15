import React, { Fragment, useState } from "react";
import { Grid, IconButton, Icon, Box, Typography, Tooltip, withStyles, Theme, Chip } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { Allocation } from "../interfaces";
import { useGlobalStyles } from "../utils/global";
import { getDateRangeText } from "../utils/misc";

const projectColors = ["#42a5f5", "#66bb6a", "#ffee58", "#ffa726", "#ef5350",
    "#ab47bc", "#26c6da", "#d4e157", "#8d6e63", "#78909c"];
const monthColors = {
    HIGH: "#d32f2f",
    LOW: "#9e9e9e"
};

const ProjectToolTip = withStyles((theme: Theme) => ({
    tooltip: {
        fontSize: theme.typography.fontSize,
        backgroundColor: theme.palette.common.white,
        boxShadow: theme.shadows[1],
    },
}))(Tooltip);

const Timeline = (props: { allocations: Array<Allocation> }) => {
    const { t } = useTranslation();
    const globalClasses = useGlobalStyles();
    const [year, setYear] = useState(moment().dayOfYear(1).hours(0).minutes(0).seconds(0).milliseconds(0));

    const monthLabels = [t("label.january-short"), t("label.february-short"), t("label.march-short"),
        t("label.april-short"), t("label.may-short"), t("label.june-short"), t("label.july-short"),
        t("label.august-short"), t("label.september-short"), t("label.october-short"), t("label.november-short"),
        t("label.december-short")];

    const visibleAllocations = props.allocations.filter(allocation => {
        const startDate = moment(allocation.startDate);
        const endDate = moment(allocation.endDate);

        return startDate.year() === year.year() || endDate.year() === year.year() ||
            (startDate.year() < year.year() && endDate.year() > year.year());
    });

    const timelineHeight = 50 + visibleAllocations.length * 40;

    const getMonthStyle = (index: number): { backgroundColor?: string, color?: string, fontWeight?: "bold" } => {
        const startComparator = index === 11 ?
            moment(year).year(year.year() + 1).month(0) :
            moment(year).month(index + 1);
        const endComparator = index === 0 ? 
            moment(year).year(year.year() - 1).month(11).endOf("month") :
            moment(year).month(index - 1).endOf("month");

        const capacity = visibleAllocations.reduce<number>((total, allocation) => {
            const startDate = moment(allocation.startDate);
            const endDate = moment(allocation.endDate);

            if (startDate < startComparator && endDate > endComparator) {
                return total + allocation.capacity;
            } else {
                return total;
            }
        }, 0);

        if (capacity < 0.9) {
            return {
                color: monthColors.LOW
            };
        } else if (capacity > 1.1) {
            return {
                backgroundColor: monthColors.HIGH,
                color: "white",
                fontWeight: "bold"
            };
        } else {
            return {};
        }
    };

    const getBackground = (allocation: Allocation, index: number) => {
        const color = projectColors[index % 10];
        if (!allocation.draft) {
            return color;
        } else {
            return `${ color }80`;
        }
    };

    const getBorderRadius = (allocation: Allocation) => {
        const radius = "50px";
        const radiusArray = ["0", "0", "0", "0"];
        const startDate = moment(allocation.startDate);
        const endDate = moment(allocation.endDate);

        if (startDate.year() === year.year()) {
            radiusArray[0] = radius;
            radiusArray[3] = radius;
        }

        if (endDate.year() === year.year()) {
            radiusArray[1] = radius;
            radiusArray[2] = radius;
        }

        return radiusArray.join(" ");
    };

    const getWidth = (allocation: Allocation) => {
        const startDate = moment(allocation.startDate);
        const endDate = moment(allocation.endDate);
        const daysInYear = year.isLeapYear() ? 366 : 365;

        const firstDay = startDate.year() === year.year() ? startDate : year;
        const lastDay = endDate.year() === year.year() ? endDate : moment(year).endOf("year");

        return `${ lastDay.diff(firstDay, "days") / daysInYear * 100 }%`;
    };

    const getMargin = (allocation: Allocation) => {
        const startDate = moment(allocation.startDate);
        const daysInYear = year.isLeapYear() ? 366 : 365;

        const firstDay = startDate.year() === year.year() ? startDate : year;

        return `${ firstDay.diff(year, "days") / daysInYear * 100 }%`;
    };

    return (
        <Fragment>
            <Grid container spacing={ 1 } alignItems="center" justify="center">
                <Grid item>
                    <IconButton
                        aria-label="previous year"
                        onClick={ () => setYear(moment(year).subtract(1, "years")) }
                    >
                        <Icon>keyboard_arrow_left</Icon>
                    </IconButton>
                </Grid>
                <Grid item>
                    <b>{ year.year() }</b>
                </Grid>
                <Grid item>
                    <IconButton
                        aria-label="next year"
                        onClick={ () => setYear(moment(year).add(1, "years")) }
                    >
                        <Icon>keyboard_arrow_right</Icon>
                    </IconButton>
                </Grid>
            </Grid>
            <Box position="relative">
                <Grid
                    container
                    className={ [globalClasses.timelineContainer, globalClasses.textCenter].join(" ") }
                    style={ { height: timelineHeight } }
                >
                    { monthLabels.map((label, index) => (
                        <Grid
                            key={ index }
                            item
                            xs={ 1 }
                        >
                            <Typography
                                variant="body1"
                                style={ { ...getMonthStyle(index) } }
                            >
                                { label }
                            </Typography>
                        </Grid>
                    )) }
                </Grid>
                { visibleAllocations.map((allocation, index) => {
                    return (
                        <ProjectToolTip
                            key={ index }
                            title={
                                <Fragment>
                                    <Typography variant="body1" color="textPrimary">
                                        { allocation.project.name }
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        { getDateRangeText(allocation.startDate, allocation.endDate) }
                                    </Typography>
                                    <Typography variant="body2" color="textPrimary">
                                        <b>{ t("label.position") }:</b> { allocation.position }
                                    </Typography>
                                    { allocation.draft && 
                                        <Chip
                                            label={ t("label.draft") }
                                            className={ [globalClasses.bottomMarginSmall,
                                                globalClasses.topMarginSmall].join(" ")
                                            }
                                        />
                                    }
                                </Fragment>
                            }
                            interactive
                            aria-label="allocation information"
                        >
                            <div
                                className={ globalClasses.timelineProject }
                                style={ {
                                    background: getBackground(allocation, index),
                                    borderRadius: getBorderRadius(allocation),
                                    width: getWidth(allocation),
                                    marginLeft: getMargin(allocation),
                                    top: 35 + index * 40
                                } }
                            >
                                { `${ Math.ceil(allocation.capacity * 100) } %` }
                            </div>
                        </ProjectToolTip>
                    );
                }) }
            </Box>
        </Fragment>
    );
};

export default Timeline;
