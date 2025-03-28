import React, { useState } from 'react';
import { Card, Button, Image, message, Upload, Spin, List, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('You can only upload image files!');
  }
  const isLt5MB = file.size / 1024 / 1024 < 5;
  if (!isLt5MB) {
    message.error('Image must be smaller than 5MB!');
  }
  return isImage && isLt5MB;
};

const SoilAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async (file) => {
    if (!(file instanceof File)) {
      console.error('Invalid file object:', file);
      return;
    }
    
    try {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      const previewUrl = URL.createObjectURL(file.file || file);
      setImageUrl(previewUrl);
      setSelectedFile(file);
    } catch (error) {
      console.error('Error creating preview:', error);
      setImageUrl(null);
      setSelectedFile(null);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) {
      message.error('Please select an image first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    setLoading(true);
    try {
      const response = await axios.post('/api/analyze-soil', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      });
      setAnalysisResult(response.data);
      message.success('Analysis complete!');
    } catch (error) {
      message.error('Analysis failed: ' + (error.response?.data?.error || 'Server error'));
      setAnalysisResult(null);
    }
    setLoading(false);
  };

  return (
    <Card title="Soil Analysis" style={{ margin: 20 }}>
      <Upload
        name="soil-image"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={({ file }) => handleUpload(file)}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="soil" style={{ width: '100%' }} />
        ) : (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload Soil Image</div>
          </div>
        )}
      </Upload>

      <Button
        type="primary"
        onClick={handleAnalysis}
        disabled={!selectedFile || loading}
        style={{ marginTop: 16 }}
      >
        {loading ? <Spin /> : 'Get Soil Analysis'}
      </Button>

      {analysisResult && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Analysis Results</Title>
          <Text strong>Soil Type:</Text> {analysisResult.class}<br />
          <Text strong>Confidence:</Text> {(analysisResult.confidence * 100).toFixed(1)}%
          
          <Title level={5} style={{ marginTop: 16 }}>Characteristics</Title>
          <List
            bordered
            dataSource={analysisResult.characteristics}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
          
          <Title level={5} style={{ marginTop: 16 }}>Recommendations</Title>
          <List
            bordered
            dataSource={analysisResult.recommendations}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
        </div>
      )}
    </Card>
  );
};

export default SoilAnalysis;