import React from 'react';
import { FC } from 'react';
import {
    Create,
    SimpleForm,
    required,
    TextInput,
    NumberInput,
    EditProps,
    useTranslate,
    Toolbar,
    SaveButton,
} from 'react-admin';
import Button from '@material-ui/core/Button';

interface Props extends EditProps {
    onCancel: () => void;
}

const CardCreateToolbar: FC<Props> = ({ onCancel, ...props }) => {
    const translate = useTranslate();
    return (
        <Toolbar {...props}>
            <SaveButton></SaveButton>
            <Button onClick={onCancel}>{translate('ra.action.cancel')}</Button>
        </Toolbar>
    );
};


const CardCreate: FC<Props> = ({ onCancel, ...props }) => (
    <Create {...props} title=" ">
        <SimpleForm toolbar={<CardCreateToolbar onCancel={onCancel} />}>
        <NumberInput source="id" validate={required()} />
            <NumberInput source="order" validate={required()} />
            <TextInput source="name" validate={required()} />
            <TextInput source="remark" validate={required()} />
            <NumberInput source="price" validate={required()} />
            <NumberInput source="useTimes" validate={required()} />
            <NumberInput source="duration" validate={required()} />
        </SimpleForm>
    </Create>
);

export default CardCreate;
