import AppButton from '@/components/Button';
import ModalApp from '@/components/ModalApp';
import { Col, ConfigProvider, Image, InputNumber, Row, Select, Slider, Switch, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import styles from '../SettingNavItem.module.scss';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind'
import { ANT_THEME } from '@/contants/common';

const cx = classNames.bind(styles)

export default function SettingNavItemModal({ open, setOpen }: SettingNavItemModalProps) {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState<number | null>(1);

  const { asPath, push, locale } = useRouter()

  const optionLang = [
    {
      value: 'en',
      label: <div style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src={`/assets/img/${'en'}.png`}
          width={20}
          height={20}
          preview={false}
          alt={'en'}
        />
        <span style={{ paddingLeft: '5px' }}>
          {t('english')}
        </span>
      </div>,
    },
    {
      value: 'de',
      label: <div style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src={`/assets/img/${'de'}.png`}
          width={20}
          height={20}
          preview={false}
          alt={'de'}
        />
        <span style={{ paddingLeft: '5px' }}>
          {t('german')}
        </span>
      </div>,
    },
  ]
  const optionTheme = [
    {
      value: 'light',
      label: <div style={{ display: 'flex', alignItems: 'center' }}>
        <span><BsFillSunFill /></span>
        <span style={{ paddingLeft: '5px' }}>
          {t('light')}
        </span>
      </div>,
    },
    {
      value: 'dark',
      label: <div style={{ display: 'flex', alignItems: 'center' }}>
        <span><BsFillMoonStarsFill /></span>
        <span style={{ paddingLeft: '5px' }}>
          {t('dark')}
        </span>
      </div>,
    },
  ]

  const onChangeSlider = (newValue: number | null) => {
    setInputValue(newValue);
  };

  const handleOk = () => {
    // Turn off Modal
    setOpen(false)

    // Call api
  }

  const handleCancel = () => {
    // Turn off Modal
    setOpen(false)
  }

  const handleChangeLang = (value: { value: string; label: React.ReactNode }) => {
    push(asPath, asPath, { locale: value.value })
  };
  const handleChangeTheme = (value: { value: string; label: React.ReactNode }) => {
    console.log(value);
  };
  const onChangeAutoSave = (checked: boolean) => {
    console.log(`switch to ${checked}`);
  };

  return (
    <ModalApp
      title={t('general_settings')}
      width={520}
      open={open}
      onCancel={() => {
        handleCancel()
      }}
      onOk={() => {
        handleOk()
      }}
      renderFooter={
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <AppButton
            onClick={() => {
              handleOk()
            }}
          >
            {t('save')}
          </AppButton>
        </div>
      }
      maskClosable={false}
    >
      <ConfigProvider theme={ANT_THEME}>
        <div
          style={{
            width: '100%',
            position: 'relative',
          }}
        >
          <Row
            className={cx('setting-general-wrapper')}>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <Row align='middle' className={cx('setting-general-wrapper__Item')}>
                <Col xs={6} style={{ margin: '10px 0' }}>
                  <label className={cx('setting--title')}>{`${t('language')} :`}</label>
                </Col>
                <Col xs={16} style={{ margin: '10px 0' }}>
                  <Select
                    labelInValue
                    defaultValue={locale === "de" ? optionLang[1] : optionLang[0]}
                    style={{ width: 120 }}
                    onChange={handleChangeLang}
                    options={optionLang}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <Row align='middle' className={cx('setting-general-wrapper__themeForm')}>
                <Col xs={6} style={{ margin: '10px 0' }}>
                  <label className={cx('setting--title')}>{`${t('theme')} :`}</label>
                </Col>
                <Col xs={16} style={{ margin: '10px 0' }}>
                  <Select
                    labelInValue
                    defaultValue={{
                      value: 'light',
                      label: <div
                        className={cx('themeIcon')}
                      >
                        <span><BsFillSunFill /></span>
                        <span style={{ paddingLeft: '5px' }}>
                          {t('light')}
                        </span>
                      </div>,
                    }}
                    style={{ width: 120 }}
                    onChange={handleChangeTheme}
                    options={optionTheme}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <Row style={{ paddingTop: '16px' }}>
                <Col xs={6}>
                  <label className={cx('setting--title')}>{`${t('auto_save')} :`}</label>
                </Col>
                <Col xs={12}>
                  <Switch defaultChecked onChange={onChangeAutoSave} />
                </Col>
              </Row>
            </Col>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <Row style={{ paddingTop: '16px' }}>
                <Col xs={6}>
                  <label className={cx('setting--title')}>{`${t('calculation')} :`}</label>
                </Col>
                <Col xs={12}>
                  <Slider
                    min={1}
                    max={10}
                    onChange={onChangeSlider}
                    value={typeof inputValue === 'number' ? inputValue : 0}
                  />
                </Col>
                <Col xs={4}>
                  <InputNumber
                    min={1}
                    max={10}
                    style={{ margin: '0 16px' }}
                    value={inputValue}
                    onChange={onChangeSlider}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </ModalApp>
  )

}

interface SettingNavItemModalProps {
  open: boolean
  setOpen: (value: boolean) => void
}