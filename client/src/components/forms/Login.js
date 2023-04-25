import React, { useState } from 'react';
import { Form, Button, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import styles from './Login.module.css';

export const Login = ({ showAlert, handleLogin, langText }) => {
  const handleFormError = (formErrors) => {
    console.log({ formErrors });
    showAlert('error', langText['login_form_required_fields']);
  };

  const handleSubmit = (formInput) => {
    form.setFieldValue('pwd', '');
    handleLogin(formInput);
  };

  const [form] = Form.useForm();
  return (
    <div>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 9 }}
        labelAlign="left"
        wrapperCol={{ offset: 0 }}
        requiredMark={false}
        size="large"
        className={styles['login__form']}
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
      >
        <Form.Item
          label={langText['login_form_label_username']}
          name="userName"
          rules={[
            { required: true, message: langText['login_form_label_username_error'] },
          ]}
          help={''}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={langText['login_form_label_username_placeholder']}
          ></Input>
        </Form.Item>
        <Form.Item
          label={langText['login_form_label_pwd']}
          name="pwd"
          rules={[
            { required: true, message: langText['login_form_label_pwd_error'] },
          ]}
          help={''}
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder={langText['login_form_label_pwd_placeholder']}
          ></Input.Password>
        </Form.Item>

        <Form.Item className={styles.login__buttons}>
          <Button htmlType="submit" type="primary">
            {langText['login_form_btn_login']}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
