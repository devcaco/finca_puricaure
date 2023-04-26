import React, { useState } from 'react';
import axios from 'axios';
import { Button, Upload, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import styles from './UploadFile.module.css';

const UploadFile = ({ onClose, langText }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleUpload = async () => {
    try {
      const formData = new FormData();

      fileList.forEach((file, index) => {
        console.log({ index });
        formData.append(`file${index}`, file);
      });

      setUploading(true);

      console.log({ formData });

      const response = await axios.post(
        `${process.env.REACT_APP_API}stock/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data.ok) throw new Error(response.data.errorMsg);
      else {
        setUploading(false);
        onClose(true);
      }
    } catch (err) {
      console.log('ERROR ->', err);
      setErrorMsg('ERROR IMPORTING THE DATA');
      setUploading(false);
    }
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Spin spinning={uploading}>
      <div className={styles.fileUpload}>
        <h1> {langText['modal_import_title']} </h1>
        <div className={styles.errorMsg}>{errorMsg !== null && errorMsg}</div>
        <div>
          <Upload {...props} className={styles.upload}>
            <Button icon={<UploadOutlined />}>
              {langText['modal_import_btn_select_file']}
            </Button>
          </Upload>
        </div>
        <div className={styles.buttons}>
          <Button
            type="primary"
            disabled={fileList.length === 0}
            onClick={handleUpload}
            loading={uploading}
          >
            {langText['modal_import_btn_upload_file']}
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default UploadFile;
