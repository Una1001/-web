"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";

export default function CustomersPage() {
  const router = useRouter();

  const customers = [
    { id: 1, name: "張三", email: "zhangsan@example.com" },
    { id: 2, name: "李四", email: "lisi@example.com" },
    { id: 3, name: "王五", email: "wangwu@example.com" },
  ];

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        顧客列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {customers.map((c) => (
          <ListItem key={c.id} divider>
            {c.name} - {c.email}
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
