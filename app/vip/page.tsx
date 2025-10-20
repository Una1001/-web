"use client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function CustomersPage() {
  const router = useRouter();

  const customers = [

    { id: 1, name: "陳魚", email: "fish@gmail.com" },
    { id: 2, name: "高情", email: "high@gmail.com" },
  ];

  return (
    <div className={styles.wrapper}>
      <Container className={styles.card}>
        <Typography variant="h4" className={styles.title} sx={{ mb: 1 }}>
          vip顧客列表
        </Typography>

        <List className={styles.list}>
          {customers.map((c) => (
            <ListItem key={c.id} className={styles.listItem} divider>
              <div>
                <div>{c.name}</div>
                <div className={styles.email}>{c.email}</div>
              </div>
              {/* 若需在右邊放操作按鈕，可放在這裡 */}
            </ListItem>
          ))}
        </List>

        <div className={styles.actions}>
          <Link href="/">
            <Button variant="outlined" className={styles.linkButton}>
              回到首頁 (Link)
            </Button>
          </Link>

          <Button variant="contained" className={styles.primaryButton} onClick={() => router.push('/')}>使用 JS 跳轉回首頁</Button>
        </div>
      </Container>
    </div>
  );
}
