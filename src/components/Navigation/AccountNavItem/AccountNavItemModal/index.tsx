import AppButton from '@/components/Button'
import InputCustom from '@/components/InputCustom'
import ModalApp from '@/components/ModalApp'
import { ANT_THEME } from '@/contants/common'
import { errorToast, successToast } from '@/helpers/Toast'
import { useAppDispatch } from '@/hooks'
import { changePassword, getProfile, updateProfile } from '@/store/actions/profile.action'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import { Checkbox, Col, ConfigProvider, Row, Typography } from 'antd'
import classNames from 'classnames/bind'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '../AccountNavItem.module.scss'

const cx = classNames.bind(styles)

const { Title } = Typography;

export default function AccountNavItemModal({ open, setOpen }: AccountNavItemModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch()
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [checked, setChecked] = useState(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showCfPass, setShowCfPass] = useState<boolean>(false);


  const [initInfo, setInitInfo] = useState<any>({
    first_name: '',
    last_name: '',
    country: '',
    company_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_passowrd: '',
  });

  const loadProfile = () => {
    setIsFetching(true)
    dispatch(getProfile())
      .then((res) => {
        setInitInfo({
          ...initInfo,
          first_name: res?.payload?.result?.firstName,
          last_name: res?.payload?.result?.lastName,
          country: res?.payload?.result?.country,
          company_name: res?.payload?.result?.companyName,
          email: res?.payload?.result?.email
        })
        setIsFetching(false)
      }).catch((errors: string[]) => {
        setIsFetching(false)
        if (errors?.length > 0) {
          errors.map((v: string) => errorToast(v))
        }
      })
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSubmit = () => {

    if (!checked) {
      const paramProfile = {
        firstName: initInfo?.first_name,
        lastName: initInfo?.last_name,
        country: initInfo?.country,
        companyName: initInfo?.company_name
      }
      dispatch(updateProfile(paramProfile)).then((res) => {

        if (res?.payload?.succeeded) {
          successToast(t('save_successfully'))
          handleCancel()
        }
        else {
          errorToast(res?.payload[0])
        }
      }).catch((errors: string[]) => {

        if (errors?.length > 0) {
          errors.map((v: string) => errorToast(v))
        }
      })
    }

    if (checked) {
      if (!initInfo.current_password) errorToast(t('required_password'))
      else if (!initInfo.new_password) errorToast(t('required_new_password'))
      else if (initInfo.new_password.length < 8) errorToast(t('password_length'))
      else if (!initInfo.confirm_passowrd) errorToast(t('required_confirm_password'))
      else if (initInfo.confirm_passowrd !== initInfo.new_password) errorToast(t('confirm_password_invalid'))

      else {
        const param = {
          password: initInfo.current_password,
          newPassword: initInfo.new_password,
          confirmPassword: initInfo.confirm_passowrd
        }
        dispatch(changePassword(param)).then((res) => {
          if (res?.payload?.succeeded) {
            successToast(t('change_password_successfully'))
            handleCancel()
          }
          else {
            errorToast(res?.payload[0])
          }
        }).catch((errors: string[]) => {

          if (errors?.length > 0) {
            errors.map((v: string) => errorToast(v))
          }
        })

      }
    }
  };

  const handleCancel = () => {
    // Turn off Modal
    loadProfile()
    setInitInfo({
      ...initInfo,
      current_password: '',
      new_password: '',
      confirm_passowrd: '',
    })
    setChecked(false)
    setOpen(false)
  }
  const onChange = (name: string | any, value: any) => {
    setInitInfo({
      ...initInfo,
      [name]: value
    })
  }

  return (
    <ModalApp
      title={t('user_account')}
      width={520}
      open={open}
      onCancel={() => {
        handleCancel()
      }}
      onOk={() => {
        handleCancel()
    }}
      renderFooter={
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <AppButton
            onClick={() => {
              handleSubmit()
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
          maxHeight: '700px',
          position: 'relative',
        }}
      >
        <Row
          className={cx('user-profile-info-wrapper')}>
          <Col xs={24} style={{ margin: '10px 0' }}>
            <Row align='middle' className={cx('user-profile-info-wrapper__Item')}>
              <Col xs={8} style={{ margin: '10px 0' }}>
                <label>{`${t('email')} :`}</label>
              </Col>
              <Col xs={16} style={{ margin: '10px 0' }}>
                <InputCustom
                  name='email'
                  label={`${t('email')}`}
                  initValue={initInfo.email}
                  changeValue={(name, value) => {
                    onChange(name, value)
                  }}
                  readOnly
                />
              </Col>
            </Row>
            <Row align='middle' className={cx('user-profile-info-wrapper__Item')}>
              <Col xs={8} style={{ margin: '10px 0' }}>
                <label>{`${t('first_name')} :`}</label>
              </Col>
              <Col xs={16} style={{ margin: '10px 0' }}>
                <InputCustom
                  name='first_name'
                  label={`${t('first_name')}`}
                  initValue={initInfo.first_name}
                  changeValue={(name, value) => {
                    onChange(name, value)
                  }}
                />
              </Col>
            </Row>
            <Row align='middle' className={cx('user-profile-info-wrapper__Item')}>
              <Col xs={8} style={{ margin: '10px 0' }}>
                <label>{`${t('last_name')} :`}</label>
              </Col>
              <Col xs={16} style={{ margin: '10px 0' }}>
                <InputCustom
                  name='last_name'
                  label={`${t('last_name')}`}
                  initValue={initInfo.last_name}
                  changeValue={(name, value) => {
                    onChange(name, value)
                  }}
                />
              </Col>
            </Row>
            <Row align='middle' className={cx('user-profile-info-wrapper__Item')}>
              <Col xs={8} style={{ margin: '10px 0' }}>
                <label>{`${t('country')} :`}</label>
              </Col>
              <Col xs={16} style={{ margin: '10px 0' }}>
                <InputCustom
                  name='country'
                  label={`${t('country')}`}
                  initValue={initInfo.country}
                  changeValue={(name, value) => {
                    onChange(name, value)
                  }}
                />
              </Col>
            </Row>
            <Row align='middle' className={cx('user-profile-info-wrapper__Item')}>
              <Col xs={8} style={{ margin: '10px 0' }}>
                <label>{`${t('company_name')} :`}</label>
              </Col>
              <Col xs={16} style={{ margin: '10px 0' }}>
                <InputCustom
                  name='company_name'
                  label={`${t('company_name')}`}
                  initValue={initInfo.company_name}
                  changeValue={(name, value) => {
                    onChange(name, value)
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <div className={cx('user-profile-password-title')}>
          <Checkbox checked={checked} onChange={() => setChecked(!checked)} />
          <Title level={4}>{t('change_password')}</Title>
        </div>
        {checked &&
          <Row className={cx('user-profile-password-wrapper')}>
            <div className={cx('user-profile-password-wrapper__lineCt')}></div>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <InputCustom
                required={true}
                name='current_password'
                label={`${t('current_password')}`}
                suffixCustom={!showPass ?
                  <EyeInvisibleOutlined onClick={() => setShowPass(true)} /> : <EyeOutlined onClick={() => setShowPass(false)} />}
                initValue={initInfo.current_password}
                changeValue={(name, value) => {
                  onChange(name, value)
                }}
                type={!showPass ? 'password' : 'text'}
              />
            </Col>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <InputCustom
                required={true}
                name='new_password'
                label={`${t('new_password')}`}
                suffixCustom={!showNewPass ?
                  <EyeInvisibleOutlined onClick={() => setShowNewPass(true)} /> : <EyeOutlined onClick={() => setShowNewPass(false)} />}
                initValue={initInfo.new_password}
                max={32}
                changeValue={(name, value) => {
                  onChange(name, value)
                }}
                type={!showNewPass ? 'password' : 'text'}
              />
            </Col>
            <Col xs={24} style={{ margin: '10px 0' }}>
              <InputCustom
                required={true}
                name='confirm_passowrd'
                label={`${t('confirm_passowrd')}`}
                suffixCustom={!showCfPass ?
                  <EyeInvisibleOutlined onClick={() => setShowCfPass(true)} /> : <EyeOutlined onClick={() => setShowCfPass(false)} />}
                initValue={initInfo.confirm_passowrd}
                changeValue={(name, value) => {
                  onChange(name, value)
                }}
                type={!showCfPass ? 'password' : 'text'}
              />
            </Col>
          </Row>
        }
      </div>
      </ConfigProvider>
    </ModalApp>
  )
}

interface AccountNavItemModalProps {
  open: boolean
  setOpen: (value: boolean) => void
}
