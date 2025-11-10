'use client';
import { Card, CardActions, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 檢查用戶登入狀態
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Container sx={{ width: '100%', display: 'flex', gap: 2, flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
        <Typography variant="h6">首頁</Typography>
        <div>
          {user ? (
            <Typography variant="body1">歡迎，{user.email}</Typography>
          ) : (
            <Typography variant="body1">未登入</Typography>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Link href="/products">
          <Button variant="outlined">產品列表</Button>
        </Link>

        <Link href="/customers">
          <Button variant="outlined">顧客列表</Button>
        </Link>

        <Link href="/vip">
          <Button variant="outlined">VIP顧客列表</Button>
        </Link>

        <Link href="/vendors">
          <Button variant="outlined">廠商列表</Button>
        </Link>

        <Link href="/orders">
          <Button variant="outlined">訂單列表</Button>
        </Link>

        <Button variant="contained" onClick={() => router.push('/products')}>用 JS 前往產品</Button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Link href="/register">
          <Button variant="outlined">註冊</Button>
        </Link>

        <Link href="/login">
          <Button variant="outlined">登入</Button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 2 }}>
        <Card sx={{ flex: 1 }}>
        <CardHeader title="陳欣妤" />
        <CardContent>
          <CountCard />
          <Typography variant="body2" sx={{ mt: 1 }}>
            系級：資管三乙<br />
            學號：412402062<br />
            姓名：陳欣妤<br />
            興趣：吃甜食、放空<br />
            專長：休息+沒有專長
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardHeader title="劉姝辰" />
        <CardContent>
          <CountCard />
          <Typography variant="body2" sx={{ mt: 1 }}>
            系級：資管三乙<br />
            學號：412402361<br />
            姓名：劉姝辰<br />
            興趣：喝酒、打傳說<br />
            專長：前端開發
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardHeader title="劉懿萱" />
        <CardContent>
          <CountCard />
          <Typography variant="body2" color="text.secondary">
            系級：資管三乙<br />
            學號：412402529<br />
            姓名：劉懿萱<br />
            興趣：看電影<br />
            專長：前端開發
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardHeader title="黃盈甄" />
        <CardContent>
          <CountCard />
          <Typography variant="body2" color="text.secondary">
            系級：資管三乙<br />
            學號：412402555<br />
            姓名：黃盈甄<br />
            興趣：旅遊<br />
            專長：前端
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardHeader title="高子晴" />
        <CardContent>
          <CountCard />
          <Typography variant="body2" sx={{ mt: 1 }}>
            系級：資管三乙<br />
            學號：4124023206<br />
            姓名：高子晴<br />
            興趣：喝酒、唱歌<br />
            專長：後端開發
          </Typography>
        </CardContent>
      </Card>
      </div>
    </Container>
  );
}

function CountCard() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(prevCount => prevCount + 1);
    alert(count); 
  }

  return (
    <>
      <Typography variant="body1">{count}</Typography>
      <CardActions>
        <Button variant="contained" onClick={handleClick}>
          Click Me
        </Button>
      </CardActions>
    </>
  );
}
