import React, {FormEvent, forwardRef, Ref, useCallback} from 'react';

import './ChoiceGroup.scss';
import {ChoiceGroupProps} from './types';
import {useSanitizedChildren} from "@/utils/useSanitizedChildren";
import {Choice as ChoiceComponent} from "@/components/Choice";
import {cn, cx} from "@/utils/classNames";
import {ChoiceProps} from "@/components/Choice/types";

const bem = cn('choice-group');

export const ChoiceGroup = forwardRef((props: ChoiceGroupProps, ref: Ref<HTMLFieldSetElement>) => {
    const {children, legend = '', type = 'checkbox', disabled} = props;
    const {className, onChange, name, required, hiddenLegend} = props;

    const classNames = cx(bem({legend: !!legend, type, disabled}), className);


    const sanitizedChildren = useSanitizedChildren({
        children,
        // @ts-ignore
        AllowedComponent: ChoiceComponent,
        mergeProps: () =>
            ({
                type,
                disabled,
            } as ChoiceProps),
    });

    const handleChange = useCallback(
        (e: FormEvent<HTMLFieldSetElement>) => {
            if (typeof onChange === 'function') onChange(e);
        },
        [onChange]
    );

    return (
        <fieldset ref={ref} name={name} className={classNames} disabled={disabled} onChange={handleChange}>
            {!!legend && <legend className={bem('legend', {required, hidden: hiddenLegend})}>{legend}</legend>}
            {sanitizedChildren}
        </fieldset>
    );
});
