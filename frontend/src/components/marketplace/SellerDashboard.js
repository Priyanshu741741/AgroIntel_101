import React, { useState } from 'react';
import { Container, Paper, Typography, Grid, Box, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const SellerDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  // Mock data - replace with actual API calls
  const mockProducts = [
    { id: 1, name: 'Organic Fertilizer', price: 500, stock: 100, sales: 25 },
    { id: 2, name: 'Bio Pesticide', price: 750, stock: 50, sales: 15 },
  ];

  const mockOrders = [
    { id: 1, date: '2024-02-20', product: 'Organic Fertilizer', quantity: 5, total: 2500, status: 'Delivered' },
    { id: 2, date: '2024-02-19', product: 'Bio Pesticide', quantity: 3, total: 2250, status: 'Processing' },
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const ProductsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => console.log('Add new product')}
        >
          Add New Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Price (₹)</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Sales</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell align="right">{product.price}</TableCell>
                <TableCell align="right">{product.stock}</TableCell>
                <TableCell align="right">{product.sales}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => console.log('Edit', product.id)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => console.log('Delete', product.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const OrdersTab = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Product</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Total (₹)</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell align="right">{order.quantity}</TableCell>
              <TableCell align="right">{order.total}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Seller Dashboard
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Products" />
            <Tab label="Orders" />
          </Tabs>
        </Box>

        {selectedTab === 0 && <ProductsTab />}
        {selectedTab === 1 && <OrdersTab />}
      </Paper>
    </Container>
  );
};

export default SellerDashboard;