import * as Yup from "yup";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import moment from "moment";

export const ISO_DATE_FORMAT = "YYYY-MM-DD";
export const DATE_FORMAT = "DD.MM.YYYY";
export const MAT_PICKER_DATE_FORMAT = "DD.MM.yyyy";

export const getDateText = (dateTime: string) => {
    return moment(dateTime).format(DATE_FORMAT);
};

export const getDateRangeText = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) return undefined;
    return `${ startDate ? moment(startDate).format(DATE_FORMAT) : "" } –
        ${ endDate ? moment(endDate).format(DATE_FORMAT) : "" }`;
};

export const momentToISODate = (momentDate: MaterialUiPickersDate | string | null) => {
    if (momentDate === null || typeof momentDate === "string") return null;
    return momentDate.format(ISO_DATE_FORMAT);
}

export const yupMomentNullable = (error: string) => {
    return Yup.mixed().test("test-date", error, value => {
        return value === null || value.isValid();
    });
};

export const yupMoment = (requiredError: string, invalidError: string) => {
    return Yup.mixed().required(requiredError).test("test-date", invalidError, value => {
        if (value === null) return false;
        return value.isValid();
    });
};

export const yupRequiredString = (error: string) => {
    return Yup.mixed().test("test-string", error, value => {
        return value !== null && value !== "";
    });
}
