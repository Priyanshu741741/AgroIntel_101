// This is a local storage implementation replacing Firebase
const PRODUCTS_STORAGE_KEY = 'products';

// Helper functions for local storage
const getProductsFromStorage = () => {
  try {
    const products = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Error reading products from localStorage', error);
    return [];
  }
};

const saveProductsToStorage = (products) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage', error);
  }
};

// Add a new product listing
export const addProduct = async (productData) => {
  try {
    const products = getProductsFromStorage();
    const newProduct = {
      id: 'product-' + Date.now(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProductsToStorage(products);
    return newProduct.id;
  } catch (error) {
    throw new Error('Failed to add product');
  }
};

// Get a specific product by ID
export const getProduct = async (productId) => {
  try {
    const products = getProductsFromStorage();
    return products.find(product => product.id === productId) || null;
  } catch (error) {
    throw new Error('Failed to get product');
  }
};

// Get all products for a specific seller
export const getSellerProducts = async (sellerId) => {
  try {
    const products = getProductsFromStorage();
    return products.filter(product => product.sellerId === sellerId);
  } catch (error) {
    throw new Error('Failed to get seller products');
  }
};

// Update a product listing
export const updateProduct = async (productId, updateData) => {
  try {
    const products = getProductsFromStorage();
    const index = products.findIndex(product => product.id === productId);
    
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveProductsToStorage(products);
    }
  } catch (error) {
    throw new Error('Failed to update product');
  }
};

// Delete a product listing
export const deleteProduct = async (productId) => {
  try {
    const products = getProductsFromStorage();
    const updatedProducts = products.filter(product => product.id !== productId);
    saveProductsToStorage(updatedProducts);
  } catch (error) {
    throw new Error('Failed to delete product');
  }
};

// Get all available products
export const getAllProducts = async () => {
  try {
    return getProductsFromStorage();
  } catch (error) {
    throw new Error('Failed to get all products');
  }
};