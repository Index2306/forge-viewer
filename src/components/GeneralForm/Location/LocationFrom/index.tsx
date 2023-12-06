import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import { NewFieldType } from "@/models";
import styles from './LocationForm.module.scss'
import { useTranslation } from "next-i18next";
import { Alert, Col, Form, Row } from "antd";
import InputCustom from "@/components/InputCustom";
import { RcFile } from "antd/es/upload";
import NewField from "@/components/NewField";
import LogoUpload from "@/components/GeneralForm/Upload/LogoUpload";
import DataLoading from "@/components/AppLoading/DataLoading";
import GoogleMap from "@/components/AppGoogleMap";
const LocationFrom: React.FC<LocationFromProps> = ({ locationData,
  errorMessage,
  setLocationData,
  dynamicFields,
  setDynamicFields,
  isFetching }) => {
  const { t } = useTranslation()
  const [locationDataEdit, setLocationDataEdit] = useState<any | undefined>(undefined)

  useEffect(() => {
    if (!locationDataEdit) {
      setLocationDataEdit(locationData)
    }
  }, [locationData])

  // change all value form
  const onChangeAllValue = (name: string | undefined, data: any) => {
    if (name) {
      const newData = { ...locationDataEdit };
      newData[name] = data;
      setLocationData(newData);
      setLocationDataEdit(newData)
    }
  }

  // handle check before add new dynamic field to form
  const onHandleAddNewField = (newValue: NewFieldType): boolean => {
    const oldList = [...dynamicFields];
    const existIndex = oldList.findIndex((v: NewFieldType) => v.name === newValue.name);
    if (existIndex >= 0) {
      return false;
    }

    oldList.push(newValue);
    setDynamicFields(oldList);
    return true;
  }

  const renderErrorMessage = (): ReactNode => {
    return errorMessage?.map((msg: string, index) => <Alert
      key={index}
      message={msg}
      type="error"
      showIcon
    />)
  }

  // handle change value of dynamic field
  const onChangeValueDynamicField = useCallback((name: string | undefined, value: any) => {
    const newList = [...dynamicFields];
    const itemChange = newList.findIndex(v => v.name === name);
    if (itemChange > -1) {
      newList[itemChange].value = value;
      setDynamicFields(newList);
    }
  }, [dynamicFields, setDynamicFields]);

  // handle remove dynamic field to form
  const onHandleRemoveField = useCallback((removeValue: NewFieldType) => {
    const newList = [...dynamicFields].filter(v => v !== removeValue);
    setDynamicFields(newList);
  }, [dynamicFields, setDynamicFields])

  // handle update dynamic field
  const onHandleUpdateDynamicField = useCallback((oldValue?: NewFieldType, newValue?: NewFieldType): boolean => {
    if (!oldValue) return false;

    const oldList = [...dynamicFields];
    const indexOldField = oldList.findIndex((v: NewFieldType) => v.name === oldValue.name);
    if (indexOldField < 0) return false;

    const oldField = oldList[indexOldField];

    if (newValue) {
      if (oldValue.name != newValue.name) {
        const existIndex = oldList.findIndex((v: NewFieldType) => v.name === newValue.name);
        if (existIndex >= 0) {
          return false;
        } else {
          oldField.name = newValue.name;
        }
      }

      oldField.hide = newValue.hide;
      oldList[indexOldField] = oldField;
      setDynamicFields(oldList);
    }

    return true;
  }, [dynamicFields, setDynamicFields])

  // render dynamic field list with condition
  const renderDynamicFields = () => {
    return dynamicFields.map((value: NewFieldType, index) =>
      <Col xs={24} key={index}>
        <Form.Item className={`${styles.formItem} ${styles.formItemDynamic}`}>
          <InputCustom
            name={value.name}
            label={value.name}
            required={false}
            dynamicField={value}
            initValue={value?.value ?? undefined}
            changeValue={onChangeValueDynamicField}
            onRemoveField={onHandleRemoveField}
            onFinishUpdate={onHandleUpdateDynamicField}
            style={{
              width: '100%',
            }} />
        </Form.Item>
      </Col>
    )
  };

  const onChangeLogo = (file: RcFile | undefined, thumbnail: string) => {
    const newData = { ...locationDataEdit };
    newData.logoUpload = file;
    newData.logo = thumbnail;
    setLocationData(newData);
    setLocationDataEdit(newData)
  }

  const onChangeDataMap = (data: any) => {
    const newData = {...locationDataEdit};
    newData.map = data;
    setLocationData(newData);
    setLocationDataEdit(newData)
  }

  return (
    <div className={styles.form}>
      {isFetching ? <DataLoading /> : null}
      <Row>
        <Col xs={{ span: 24, order: 2 }} lg={{ span: 24, order: 2 }} xl={{ span: 8, order: 1 }} xxl={{ span: 10, order: 1 }}>
          <Form className={styles.form}>
            <div style={{ marginBottom: '12px' }}>{renderErrorMessage()}</div>
            <Row>
              <Col xs={24}>
                <Form.Item className={styles.formItem}>
                  <InputCustom
                    name='company'
                    label={`${t('company')}`}
                    required={true}
                    changeValue={onChangeAllValue}
                    initValue={locationDataEdit?.company}
                    style={{
                      width: '100%',
                    }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item className={styles.formItem}>
                  <InputCustom
                    name='street'
                    label={`${t('street')}`}
                    required={false}
                    changeValue={onChangeAllValue}
                    initValue={locationDataEdit?.street}
                    style={{
                      width: '100%',
                    }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item className={styles.formItem}>
                  <InputCustom
                    name='postcode'
                    label={`${t('postcode')}`}
                    required={false}
                    changeValue={onChangeAllValue}
                    initValue={locationDataEdit?.postcode}
                    style={{
                      width: '100%',
                    }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item className={styles.formItem}>
                  <InputCustom
                    name='location'
                    label={`${t('location')}`}
                    required={false}
                    changeValue={onChangeAllValue}
                    initValue={locationDataEdit?.location}
                    style={{
                      width: '100%',
                    }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item className={styles.formItem}>
                  <InputCustom
                    name='telephone'
                    label={`${t('telephone')}`}
                    required={false}
                    changeValue={onChangeAllValue}
                    initValue={locationDataEdit?.telephone}
                    style={{
                      width: '100%',
                    }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item className={styles.formItem} rules={[
                  {type: "email", message: `${t('email_invalid')}`,}
                ]}>
                  <InputCustom
                    name='email'
                    label={`${t('email')}`}
                    required={false}
                    changeValue={onChangeAllValue}
                    initValue={locationDataEdit?.email}
                    style={{
                      width: '100%',
                    }} />
                </Form.Item>
              </Col>
              {dynamicFields?.length > 0 ? renderDynamicFields() : null}
              <Col xs={24} style={{ paddingRight: '10px' }}>
                <NewField onAddNewField={onHandleAddNewField} />
              </Col>
            </Row>

          </Form>
        </Col>
        <Col xs={{ span: 24, order: 1 }} lg={{ span: 12, order: 1 }} xl={{ span: 8, order: 1 }} xxl={{ span: 7, order: 2 }}>
          <div className={styles.mapUpload}>
            <GoogleMap initialData={locationDataEdit?.map} changeData={onChangeDataMap}/>
          </div>
        </Col>
        <Col xs={{ span: 24, order: 1 }} lg={{ span: 12, order: 1 }} xl={{ span: 8, order: 1 }} xxl={{ span: 7, order: 3 }}>
          <LogoUpload className={styles.logoUpload}
            description={t('location_logo')}
            onChangeFile={onChangeLogo}
            recommend={t('recommended_size')}
            initFile={locationDataEdit && (locationDataEdit.logoUpload || locationDataEdit.logo) ? [
              {
                uid: '-1',
                name: 'Logo',
                status: 'done',
                url: locationDataEdit.logo ? locationDataEdit.logo : locationDataEdit.logoUpload
              }
            ] : []} />
        </Col>
      </Row>
    </div>
  );
};

export default LocationFrom;

export interface LocationFromProps {
  locationData?: any,
  errorMessage?: string[]
  isCreate?: boolean | undefined,
  thumbnail?: RcFile | undefined,
  dynamicFields: NewFieldType[]
  setDynamicFields: (data: NewFieldType[]) => void,
  checkExistName?: (data: string) => number
  setLocationData: (data: any) => void,
  isFetching?: boolean
}