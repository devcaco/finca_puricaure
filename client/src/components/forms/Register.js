import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Input, Upload, Spin } from 'antd';
import styles from './Register.module.css';
import { UploadOutlined } from '@ant-design/icons';

const Register = ({
  langText,
  toggleModal,
  onRegister,
  onEditProfile,
  formMode,
  onClose,
  theUser,
  setUserData,
  userData,
}) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [mode, setMode] = useState(formMode);
  const [changePwd, setChangePwd] = useState(false);
  const [form] = Form.useForm();
  const [profilePic, setProfilePic] = useState(null);
  const [isUserPicture, setIsUserPicture] = useState(!!userData?.picture);

  const handleSubmit = async (formInput) => {
    setDataLoading(true);
    try {
      const response = await axios.post(
        process.env.REACT_APP_API + 'auth/register',
        {
          ...formInput,
        }
      );

      if (response.data.ok) {
        setDataLoading(false);
        onRegister();
      } else throw new Error(response.data.errorMsg);
    } catch (err) {
      setDataLoading(false);
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
    }
  };

  const handleEditProfile = async (formInput) => {
    try {
      setDataLoading(true);
      const response = await axios.patch(
        process.env.REACT_APP_API + 'auth/',
        {
          ...formInput,
          _id: theUser._id,
          changePwd,
          mode,
          profilePicture: profilePic,
          isUserPicture,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.ok) {
        console.log({ theData: response.data.updatedUser });
        setUserData({
          ...userData,
          ...response.data.updatedUser,
          name:
            response.data.updatedUser.fname +
            ' ' +
            response.data.updatedUser.lname,
          picture: response.data.updatedUser.profilePicture,
        });
        setDataLoading(false);
        onEditProfile();
      } else throw new Error(response.data.errorMsg);
    } catch (err) {
      console.log('ERROR -> ', err);
      setDataLoading(false);
      setErrorMsg(err.message);
    }
  };

  const handleFormError = (fieldErrors) => {
    setErrorMsg(langText['register_form_error']);
  };

  const uploadProps = {
    onRemove: (file) => {
      setProfilePic(file);
    },
    beforeUpload: (file) => {
      console.log({ file });
      setProfilePic(file);
      return false;
    },
    profilePic,
    maxCount: 1,
    name: 'profile_picture',
    accept: 'image/png, image/jpeg',
  };

  return (
    <Spin spinning={dataLoading}>
      <div className={styles.register}>
        {mode === 'new' ? (
          <h1>{langText['register_form_new_title']}</h1>
        ) : (
          <h1>{langText['register_form_edit_title']}</h1>
        )}

        <div className={styles.errorMsg}>{errorMsg}</div>
        <Form
          form={form}
          name="registerForm"
          layout="horizontal"
          labelCol={{ span: 9 }}
          labelAlign="left"
          wrapperCol={{ offset: 0 }}
          requiredMark={false}
          onFinish={mode === 'new' ? handleSubmit : handleEditProfile}
          onFinishFailed={handleFormError}
          labelWrap
          initialValues={{
            fname: theUser?.fname || '',
            lname: theUser?.lname || '',
            email: theUser?.email || '',
          }}
        >
          {mode !== 'new' && (
            <Form.Item label={langText['register_form_label_userId']}>
              <Button type="text" style={{ textAlign: 'unset', padding: '0' }}>
                {theUser._id}
              </Button>
            </Form.Item>
          )}

          <Form.Item
            name="fname"
            label={langText['register_form_label_fname']}
            rules={[
              {
                required: true,
                message: langText['register_form_label_fname_error'],
              },
            ]}
          >
            <Input placeholder={langText['register_form_label_fname']}></Input>
          </Form.Item>
          <Form.Item
            name="lname"
            label={langText['register_form_label_lname']}
            rules={[
              {
                required: true,
                message: langText['register_form_label_lname_error'],
              },
            ]}
          >
            <Input placeholder={langText['register_form_label_lname']}></Input>
          </Form.Item>
          <Form.Item
            name="email"
            label={langText['register_form_label_email']}
            hasFeedback
            rules={[
              {
                type: 'email',
                message: langText['register_form_label_email_error'],
              },
              {
                required: true,
                message: langText['register_form_label_email_error2'],
              },
            ]}
          >
            <Input placeholder={langText['register_form_label_email']}></Input>
          </Form.Item>
          {mode === 'new' || changePwd ? (
            <>
              {changePwd && (
                <Form.Item
                  name="oldPassword"
                  label={langText['register_form_label_old_password']}
                  rules={[
                    {
                      required: true,
                      message:
                        langText['register_form_label_old_password_error'],
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    placeholder={langText['register_form_label_old_password']}
                  ></Input.Password>
                </Form.Item>
              )}
              <Form.Item
                name="password"
                label={langText['register_form_label_password']}
                rules={[
                  {
                    required: true,
                    message: langText['register_form_label_password_error'],
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder={langText['register_form_label_password']}
                ></Input.Password>
              </Form.Item>
              <Form.Item
                name="password_2"
                label={langText['register_form_label_password_2']}
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: langText['register_form_label_password_2_error'],
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          langText['register_form_label_password_2_error2']
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder={langText['register_form_label_password_2']}
                ></Input.Password>
              </Form.Item>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <Button
                style={{ width: 'unset' }}
                onClick={() => {
                  setChangePwd(true);
                }}
              >
                {langText['register_form_btn_change_pwd']}
              </Button>
            </div>
          )}

          {mode !== 'new' && !isUserPicture && (
            <Form.Item>
              <Upload {...uploadProps} className={styles.upload}>
                <Button
                  icon={<UploadOutlined />}
                  type="default"
                  style={{ width: '100%' }}
                >
                  {langText['register_form_btn_profile_picture']}
                </Button>
              </Upload>
            </Form.Item>
          )}

          {mode !== 'new' && isUserPicture && (
            <Form.Item>
              <Button type="default" onClick={() => setIsUserPicture(false)}>
                Delete Profile Picture
              </Button>
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginTop: '20px' }}
            >
              {mode === 'new'
                ? langText['register_form_btn_register']
                : langText['register_form_btn_save_profile']}
            </Button>
          </Form.Item>

          {mode !== 'new' && (
            <Form.Item>
              <Button
                type="default"
                danger
                htmlType="button"
                style={{ marginTop: '0' }}
              >
                {langText['register_form_btn_delete_user']}
              </Button>
            </Form.Item>
          )}
          <Form.Item>
            <Button
              htmlType="button"
              onClick={() => {
                onClose(false);
              }}
            >
              {langText['register_form_btn_close']}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default Register;
