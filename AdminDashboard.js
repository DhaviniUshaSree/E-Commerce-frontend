import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "", category: "", stock: "" });
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://e-commerce-backend-es24.onrender.com/api/products");
      const contentType = res.headers.get("content-type");
      if (!res.ok) throw new Error("Failed to fetch products");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setProducts(data);
      } else {
        const text = await res.text();
        throw new Error("Unexpected response from server: " + text.substring(0, 100));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://e-commerce-backend-es24.onrender.com/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://e-commerce-backend-es24.onrender.com/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : undefined,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Failed to add product: " + errorText);
      }
      setForm({ name: "", price: "", description: "", image: "", category: "", stock: "" });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://e-commerce-backend-es24.onrender.com/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete product");
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdatePrice = async (id, price) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://e-commerce-backend-es24.onrender.com/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ price: Number(price) }),
      });
      if (!res.ok) throw new Error("Failed to update price");
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <form onSubmit={handleAddProduct} className="admin-form">
        <input name="name" value={form.name} onChange={handleInputChange} placeholder="Name" required className="admin-input" />
        <input name="price" value={form.price} onChange={handleInputChange} placeholder="Price" required type="number" min="0" className="admin-input" />
        <input name="description" value={form.description} onChange={handleInputChange} placeholder="Description" required className="admin-input" />
        <input name="image" value={form.image} onChange={handleInputChange} placeholder="Image URL" required className="admin-input" />
        <select name="category" value={form.category} onChange={handleInputChange} required className="admin-input">
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <input name="stock" value={form.stock} onChange={handleInputChange} placeholder="Stock (optional)" type="number" min="0" className="admin-input" />
        <button type="submit" className="admin-add-btn">Add Product</button>
      </form>
      <ul className="admin-product-list">
        {products.map((prod) => (
          <li key={prod._id} className="admin-product-item">
            <strong>{prod.name}</strong> - $
            {editingId === prod._id ? (
              <>
                <input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  style={{ width: "70px" }}
                />
                <button onClick={() => handleUpdatePrice(prod._id, newPrice)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {prod.price}
                <button
                  onClick={() => {
                    setEditingId(prod._id);
                    setNewPrice(prod.price);
                  }}
                >
                  Edit
                </button>
              </>
            )}
            <button onClick={() => handleDeleteProduct(prod._id)} className="admin-delete-btn">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard; 