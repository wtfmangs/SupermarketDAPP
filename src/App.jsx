import { useState, useEffect } from "react";
import { ethers } from "ethers";
import SupermarketABI from "./SupermarketABI.json";

const contractAddress = "0x1d139694C20AbEb40806a0554fAA7D31906b94Bb";
const adminAddress = "0x7b75C7B4D3eae33bC212515Cc1B7Af662cDA3fe3";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productId, setProductId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        const tempSigner = await tempProvider.getSigner();
        const userAddress = await tempSigner.getAddress();
        const tempContract = new ethers.Contract(contractAddress, SupermarketABI, tempSigner);

        setProvider(tempProvider);
        setSigner(tempSigner);
        setContract(tempContract);
        setAccount(userAddress);
        loadProducts(tempContract);
      }
    };
    init();
  }, []);

  const loadProducts = async (contractInstance) => {
    const count = await contractInstance.getTotalProducts();
    const loadedProducts = [];

    for (let i = 1; i <= count; i++) {
      const exists = await contractInstance.isProductExists(i);
      if (exists) {
        const [name, price, quantity] = await contractInstance.getProductDetails(i);
        loadedProducts.push({ id: i, name, price, quantity });
      }
    }

    setProducts(loadedProducts);
  };

  const addProduct = async () => {
    await contract.addProduct(name, ethers.parseEther(price), quantity);
    loadProducts(contract);
  };

  const updateProduct = async () => {
    await contract.updateProduct(productId, newName, ethers.parseEther(newPrice), newQuantity);
    loadProducts(contract);
  };

  const deleteProduct = async () => {
    await contract.deleteProduct(productId);
    loadProducts(contract);
  };

  const purchaseProduct = async (id, price) => {
    await contract.purchaseProduct(id, 1, { value: price });
    loadProducts(contract);
  };

  const isAdmin = account.toLowerCase() === adminAddress.toLowerCase();

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Supermarket DApp</h1>
      <p>Connected wallet: {account}</p>

      {isAdmin && (
        <>
          <h2>Admin Panel</h2>

          <h4>Add Product</h4>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Price (ETH)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <button onClick={addProduct}>Add</button>

          <h4>Update Product</h4>
          <input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
          <input placeholder="New Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input placeholder="New Price (ETH)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
          <input placeholder="New Quantity" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
          <button onClick={updateProduct}>Update</button>

          <h4>Delete Product</h4>
          <input placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
          <button onClick={deleteProduct}>Delete</button>
        </>
      )}

      <h2>🧾 Available Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <strong>{product.name}</strong> - {ethers.formatEther(product.price)} ETH - Qty: {product.quantity}
            <button onClick={() => purchaseProduct(product.id, product.price)} style={{ marginLeft: 10 }}>
              Buy 1
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
