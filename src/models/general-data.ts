import {NewFieldType} from "@/models/common";
import {RcFile} from "antd/es/upload";
import {LoginResult} from "@/models/auth";
import React from "react";

export enum GeneralDataType {
    customer = 0,
    location = 1,
    operator = 2
}

export interface GeneralData {
    id: string
    type: GeneralDataType
    name: string,
    customerId: string,
    customerNumber: string | null
    location: string | null
    street: string,
    postcode: string,
    city: string,
    telephone?: string | null,
    email?: string | null,
    dynamicFields?: NewFieldType[] | [],
    createdBy?: string | null,
    updatedBy?: string | null,
    createdOn?: Date | null,
    updatedOn?: Date | null,
    logo?: string | null,
    map?: string | null,
    company?: string | null,
    contactPerson?: string | null
    note?: string | null,
}

export interface CustomerSliceModel {
    data: CustomerModel | undefined,
    isFetching: boolean,
    isError: boolean,
    isSuccess: boolean,
    errorMessage: string[],
}

export interface CustomerModel {
    key?: React.Key
    id: string
    type: GeneralDataType
    customerNumber: string,
    customerId?: string | undefined,
    street: string,
    postcode: string,
    company: string,
    contactPerson: string,
    logo: string,
    map: string,
    note: string,
    location: string,
    telephone?: string | null,
    email?: string | null,
    dynamicFields?: NewFieldType[] | [],
    createdBy?: string | null,
    updatedBy?: string | null,
    createdOn?: Date | null,
    updatedOn?: Date | null,
    logoUpload?: RcFile | File,
    mapUpload?: RcFile | File,
}

export interface OperatorSliceModel {
    data: OperatorModel | undefined,
    isFetching: boolean,
    isError: boolean,
    isSuccess: boolean,
    errorMessage: string[],
}

export interface OperatorModel {
    key?: React.Key
    id: string
    type: GeneralDataType,
    customerId?: string | undefined,
    street: string,
    postcode: string,
    company: string,
    contactPerson: string,
    logo: string,
    map: string,
    note: string,
    location: string,
    telephone?: string | null,
    email?: string | null,
    dynamicFields?: NewFieldType[] | [],
    createdBy?: string | null,
    updatedBy?: string | null,
    createdOn?: Date | null,
    updatedOn?: Date | null,
    logoUpload?: RcFile | File,
    mapUpload?: RcFile | File,
}

export interface LocationModel {
    key?: React.Key
    id: string
    type: GeneralDataType,
    customerId?: string | undefined,
    street: string,
    postcode: string,
    company: string,
    contactPerson: string,
    logo: string,
    map: string,
    note: string,
    location: string,
    telephone?: string | null,
    email?: string | null,
    dynamicFields?: NewFieldType[] | [],
    createdBy?: string | null,
    updatedBy?: string | null,
    createdOn?: Date | null,
    updatedOn?: Date | null,
    logoUpload?: RcFile | File,
    mapUpload?: RcFile | File,
}