import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../../api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setMsg('Login to view orders');
    fetchAPI('/orders/my', 'GET', null, token).then(res => {
      if (Array.isArray(res)) setOrders(res);
      else setMsg(res.msg || 'Failed to fetch orders');
    });
  }, []);

  if (msg) return <div className="orders-msg">{msg}</div>;
  if (!orders.length) return <div className="orders-empty">No orders yet.</div>;
  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      <ul className="orders-list">
        {orders.map(order => (
          <li key={order._id} className="order-item">
            <div>Order #{order._id.slice(-6)}</div>
            <div>Status: {order.status}</div>
            <ul>
              {order.products.map(item => (
                <li key={item.product._id}>{item.product.name} x {item.quantity}</li>
              ))}
            </ul>
            <div>Total: ${order.total}</div>
            <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders; 