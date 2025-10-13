
"use client";
import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

export default function ProductList() {
  const products = [
    { desc: "幫寫作業", price: 20000 },
    { desc: "找小偷", price: 30000 },
  ];

  return (
    <Container sx={{ width: "100%", maxWidth: 600, mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: "#1976d2" }}>
        產品列表
      </Typography>

      {products.map((p, i) => (
        <Card key={i} sx={{ mb: 1, bgcolor: "#f5f5f5" }}>
          <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{p.desc}</Typography>
            <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 700 }}>NT$ {p.price.toLocaleString()}</Typography>
          </CardContent>
        </Card>
      ))}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/">
          <Button variant="outlined">回到首頁 (Link)</Button>
        </Link>
        <Button variant="contained" onClick={() => window.location.href = "/"}>
          JS 跳回首頁
        </Button>
      </div>
    </Container>
  );
}
