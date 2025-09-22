'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import { Card, CardActions, CardHeader, CardContent } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Container sx={{ width: '100%', display: 'flex', gap: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardHeader title="陳欣妤" />
        <CardContent>
          <CountCard />
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
            資管系三乙 412402529 喜歡睡覺
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1 }}>
        <CardHeader title="黃盈甄" />
        <CardContent>
          <CountCard />
          <Typography variant="body2" color="text.secondary">
            資管系三乙 412402255 喜歡旅行
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
