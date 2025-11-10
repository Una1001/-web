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
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Order {
  id: number;
  customer: string;
  total: number;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ customer: "", total: "" });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, customer, total")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data as Order[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([{ ...newOrder, total: parseFloat(newOrder.total) }])
        .single();

      if (error) {
        console.error("Error adding order:", error);
      } else {
        setOrders((prev) => [...prev, data]);
        setNewOrder({ customer: "", total: "" });
        handleCloseModal();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        訂單列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {orders.map((o) => (
          <ListItem key={o.id} divider>
            {o.customer} - NT${o.total}
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
