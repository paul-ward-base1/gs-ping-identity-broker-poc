import {DropdownProps} from './types';

export const languageOptions = [

    {id: 'en', name: 'english', label: 'EN'},
    {id: 'fr', name: 'french', label: 'FR'},
    {id: 'es', name: 'spanish', label: 'ES'},
];


export const defaultDropdownProps: DropdownProps = {
    options: languageOptions,
    defaultValue: 'en',
    value: 'en',
    optionType: 'radio',
};
