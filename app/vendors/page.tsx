"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";

export default function VendorsPage() {
  const router = useRouter();

  const vendors = [
    { id: 1, name: "AAA 電子", contact: "aaa@example.com" },
    { id: 2, name: "BBB 材料行", contact: "bbb@example.com" },
  ];

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        廠商列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {vendors.map((v) => (
          <ListItem key={v.id} divider>
            {v.name} - {v.contact}
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
