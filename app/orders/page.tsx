"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";

export default function OrdersPage() {
  const router = useRouter();

  const orders = [
    { id: 1001, customer: "張三", total: 1200 },
    { id: 1002, customer: "李四", total: 450 },
  ];

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        訂單列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {orders.map((o) => (
          <ListItem key={o.id} divider>
            訂單 #{o.id} - {o.customer} - NT${o.total}
          </ListItem>
        ))}
      </List>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/">
          <Button variant="outlined">回到首頁 (Link)</Button>
        </Link>

        <Button variant="contained" onClick={() => router.push('/')}>使用 JS 跳轉回首頁</Button>
      </div>
    </Container>
  );
}
