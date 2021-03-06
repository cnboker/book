import * as React from 'react';
import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import {
    AutocompleteInput,
    // BooleanField,
    Datagrid,
    DatagridProps,
    DateField,
    DateInput,
    Filter,
    FilterProps,
    Identifier,
    List,
    ListContextProvider,
    ListProps,
    NullableBooleanInput,
    // NumberField,
    ReferenceInput,
    // ReferenceField,
    SearchInput,
    TextField,
    TextInput,
    useGetList,
    useListContext,
} from 'react-admin';
import { useMediaQuery, Divider, Tabs, Tab, Theme } from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';

import NbItemsField from './NbItemsField';
import CustomerReferenceField from '../visitors/CustomerReferenceField';
import AddressField from '../visitors/AddressField';
import MobileGrid from './MobileGrid';
import { Customer } from '../types';
import NullableDateField from '../components/NullableDateField';

const OrderFilter: FC<Omit<FilterProps, 'children'>> = props => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
        <ReferenceInput source="user_id" reference="customers" label="resources.customers.fields.nickname" alwaysOn>
            <AutocompleteInput
                optionText={(choice: Customer) =>
                    choice.id // the empty choice is { id: '' }
                        ? `${choice.nickname}`
                        : ''
                }
            />
        </ReferenceInput>
        <DateInput source="date_gte" alwaysOn/>
        <DateInput source="date_lte" alwaysOn/>
    </Filter>
);

const useDatagridStyles = makeStyles({
    total: { fontWeight: 'bold' },
});

const tabs = [
    { id: 'ordered', name: '新订单' },
    { id: 'delivered', name: '已发货' },
    { id: 'returning', name: '还书' },
];

interface TabbedDatagridProps extends DatagridProps {}

const useGetTotals = (filterValues: any) => {
    const { total: totalOrdered } = useGetList(
        'commands',
        { perPage: 1, page: 1 },
        { field: 'id', order: 'ASC' },
        { ...filterValues, status: 'ordered' }
    );
    const { total: totalDelivered } = useGetList(
        'commands',
        { perPage: 1, page: 1 },
        { field: 'id', order: 'ASC' },
        { ...filterValues, status: 'delivered' }
    );
    const { total: totalReturning } = useGetList(
        'commands',
        { perPage: 1, page: 1 },
        { field: 'id', order: 'ASC' },
        { ...filterValues, status: 'returning' }
    );

    return {
        ordered: totalOrdered,
        delivered: totalDelivered,
        returning: totalReturning,
    };
};

const TabbedDatagrid: FC<TabbedDatagridProps> = props => {
    const listContext = useListContext();
    const { ids, filterValues, setFilters, displayedFilters } = listContext;
    const classes = useDatagridStyles();
    const isXSmall = useMediaQuery<Theme>(theme =>
        theme.breakpoints.down('xs')
    );
    const [ordered, setOrdered] = useState<Identifier[]>([] as Identifier[]);
    const [delivered, setDelivered] = useState<Identifier[]>(
        [] as Identifier[]
    );
    const [returning, setReturning] = useState<Identifier[]>(
        [] as Identifier[]
    );
    const totals = useGetTotals(filterValues) as any;

    useEffect(() => {
        if (ids && ids !== filterValues.status) {
            switch (filterValues.status) {
                case 'ordered':
                    setOrdered(ids);
                    break;
                case 'delivered':
                    setDelivered(ids);
                    break;
                case 'returning':
                    setReturning(ids);
                    break;
            }
        }
    }, [ids, filterValues.status]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<{}>, value: any) => {
            setFilters &&
                setFilters(
                    { ...filterValues, status: value },
                    displayedFilters
                );
        },
        [displayedFilters, filterValues, setFilters]
    );

    const selectedIds =
        filterValues.status === 'ordered'
            ? ordered
            : filterValues.status === 'delivered'
            ? delivered
            : returning;

    return (
        <Fragment>
            <Tabs
                variant="fullWidth"
                centered
                value={filterValues.status}
                indicatorColor="primary"
                onChange={handleChange}
            >
                {tabs.map(choice => (
                    <Tab
                        key={choice.id}
                        label={
                            totals[choice.name]
                                ? `${choice.name} (${totals[choice.name]})`
                                : choice.name
                        }
                        value={choice.id}
                    />
                ))}
            </Tabs>
            <Divider />
            {isXSmall ? (
                <ListContextProvider
                    value={{ ...listContext, ids: selectedIds }}
                >
                    <MobileGrid {...props} ids={selectedIds} />
                </ListContextProvider>
            ) : (
                <div>
                    {filterValues.status === 'ordered' && (
                        <ListContextProvider
                            value={{ ...listContext, ids: ordered }}
                        >
                            <Datagrid {...props} optimized rowClick="edit">
                                <TextField source="order_sn" />
                                <NullableDateField source="add_time" format="YYYY-MM-DD hh:mm" />
                                <CustomerReferenceField />
                                <AddressField />
                                <NbItemsField />
                               
                            </Datagrid>
                        </ListContextProvider>
                    )}
                    {filterValues.status === 'delivered' && (
                        <ListContextProvider
                            value={{ ...listContext, ids: delivered }}
                        >
                            <Datagrid {...props} rowClick="edit">
                                <TextField source="order_sn" />
                                <NullableDateField source="add_time" format="YYYY-MM-DD hh:mm" />
                                <CustomerReferenceField />
                                <AddressField />
                                <NbItemsField />
                            </Datagrid>
                        </ListContextProvider>
                    )}
                    {filterValues.status === 'returning' && (
                        <ListContextProvider
                            value={{ ...listContext, ids: returning }}
                        >
                            <Datagrid {...props} rowClick="edit">
                                <TextField source="order_sn"  />
                                <NullableDateField source="add_time" format="YYYY-MM-DD hh:mm" />
                                <CustomerReferenceField />
                                <AddressField />
                                <NbItemsField />
                            </Datagrid>
                        </ListContextProvider>
                    )}
                </div>
            )}
        </Fragment>
    );
}; 

const OrderList: FC<ListProps> = props => (
    <List
        {...props}
        filterDefaultValues={{ status: 'ordered' }}
        sort={{ field: 'add_time', order: 'DESC' }}
        perPage={25}
        filters={<OrderFilter />}
    >
        <TabbedDatagrid />
    </List>
);

export default OrderList;
