"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([
    { id: 1001, customer: "張三", product: "產品A", total: 1200 },
    { id: 1002, customer: "李四", product: "產品B", total: 450 },
  ]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ customer: "", product: "", total: "" });

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrder = () => {
    const id = orders.length ? orders[orders.length - 1].id + 1 : 1001;
    setOrders([...orders, { id, ...newOrder, total: parseFloat(newOrder.total) }]);
    setNewOrder({ customer: "", product: "", total: "" });
    handleCloseModal();
  };

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        訂單列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {orders.map((o) => (
          <ListItem key={o.id} divider>
            訂單 #{o.id} - {o.customer} - {o.product} - NT${o.total}
          </ListItem>
        ))}
      </List>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/">
          <Button variant="outlined">回到首頁 (Link)</Button>
        </Link>

        <Button variant="contained" onClick={() => router.push('/')}>使用 JS 跳轉回首頁</Button>

        <Button variant="contained" color="primary" onClick={handleOpenModal}>
          新增訂單
        </Button>
      </div>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            新增訂單
          </Typography>
          <TextField
            fullWidth
            label="顧客"
            name="customer"
            value={newOrder.customer}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="產品"
            name="product"
            value={newOrder.product}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="總金額"
            name="total"
            value={newOrder.total}
            onChange={handleInputChange}
            type="number"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddOrder}>
            確認新增
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
