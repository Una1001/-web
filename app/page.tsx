'use client';
import {useState} from 'react';
import Button from '@mui/material/Button';
import {Card, CardActions, CardHeader, CardContent} from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Home() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count+1);
    alert(count);
  }
  return (
  <Container sx={{
    width: '100%',
    display: 'flex',
    gap: 2,}}>
    <Card sx={{ flex: 1 }}>
      <CardHeader title="A Counter" />
      <CardContent>
        <Typography variant="body1">{count}</Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={handleClick}>Click Me</Button>
      </CardActions>
    </Card>
    <Card sx={{ flex: 1 }}>
      <CardHeader title="A Counter" />
      <CardContent>
        <Typography variant="body1">{count}</Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={handleClick}>Click Me</Button>
      </CardActions>
    </Card>
  </Container>)
}