import { useEffect, EffectCallback, useState, ChangeEvent } from "react";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

/**
 * A useEffect hook that is only called once during the lifecycle of a React component.
 */
export const useEffectOnce = (callback: EffectCallback) => useEffect(callback, []);

export const useInput = (initialValue: any) => {
    const [value, setValue] = useState(initialValue);

    return {
        value,
        bind: {
            value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                setValue(event.target.value);
            }
        }
    };
};

export const useDateInput = (initialValue: MaterialUiPickersDate) => {
    const [value, setValue] = useState(initialValue);

    return {
        value,
        bind: {
            value,
            onChange: (date: MaterialUiPickersDate) => {
                setValue(date);
            }
        }
    };
};
