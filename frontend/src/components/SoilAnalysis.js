import React, { useState } from 'react';
import { Card, Button, Image, message, Upload, Spin, List, Typography, Row, Col, Progress, Tag } from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

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

  const handleUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
    }

    try {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      const file = info.file.originFileObj;
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      setSelectedFile(file);
    } catch (error) {
      console.error('Error creating preview:', error);
      setImageUrl(null);
      setSelectedFile(null);
      message.error('Error processing image');
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
        headers: { 'Content-Type': 'multipart/form-data' }
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
    <div className="soil-analysis-container">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Soil Image Upload" className="upload-card">
            <Upload
              name="soil-image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              onChange={handleUpload}
              className="soil-image-uploader"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="soil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div>
                  <UploadOutlined style={{ fontSize: '24px' }} />
                  <div style={{ marginTop: 8 }}>Upload Soil Image</div>
                </div>
              )}
            </Upload>

            <Button
              type="primary"
              onClick={handleAnalysis}
              disabled={!selectedFile || loading}
              style={{ marginTop: 16, width: '100%' }}
              size="large"
            >
              {loading ? <Spin /> : 'Analyze Soil'}
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          {analysisResult && (
            <Card title="Analysis Results" className="results-card">
              <div className="result-section">
                <Title level={4}>Soil Classification</Title>
                <Tag color="blue" style={{ fontSize: '16px', padding: '4px 8px', marginBottom: '16px' }}>
                  {analysisResult.class}
                </Tag>
                <Progress
                  percent={Math.round(analysisResult.confidence * 100)}
                  status="active"
                  format={(percent) => `${percent}% Confidence`}
                />
              </div>

              <div className="result-section">
                <Title level={4}>Soil Characteristics</Title>
                <List
                  dataSource={analysisResult.characteristics}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </div>

              <div className="result-section">
                <Title level={4}>Recommendations</Title>
                <List
                  dataSource={analysisResult.recommendations}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <style jsx>{`
        .soil-analysis-container {
          padding: 20px;
        }
        .upload-card,
        .results-card {
          height: 100%;
        }
        .soil-image-uploader {
          width: 100%;
          margin-bottom: 16px;
        }
        .result-section {
          margin-bottom: 24px;
        }
        .result-section:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default SoilAnalysis;