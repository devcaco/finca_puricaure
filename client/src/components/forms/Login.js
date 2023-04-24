import React, { useState } from 'react';
import { Form, Button, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import styles from './Login.module.css';

export const Login = ({ showAlert, handleLogin }) => {
  const handleFormError = (formErrors) => {
    console.log({ formErrors });
    showAlert('error', 'Prease provide a username and password');
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
          label="User Name"
          name="userName"
          rules={[{ required: true, message: 'Please provide your username' }]}
          help={''}
        >
          <Input prefix={<UserOutlined />} placeholder="UserName"></Input>
        </Form.Item>
        <Form.Item
          label="Password"
          name="pwd"
          rules={[{ required: true, message: 'Please provide your password' }]}
          help={''}
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          ></Input.Password>
        </Form.Item>

        <Form.Item className={styles.login__buttons}>
          <Button htmlType="submit" type="primary">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
