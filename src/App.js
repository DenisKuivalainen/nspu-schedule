import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import ex from './ex.json';

const App = () => {
  const [ttl, setTtl] = useState();
  useEffect(() => {
    fetch("/schedule").then(data => data.json()).then(data => {
      console.log(data)
      setTtl(data)
    });
  }, [])
  return (
    <div>
      {!!ttl && ttl.map((val, k) => {
        return <div key={k} dangerouslySetInnerHTML={{
          __html: val
        }}/>
      })}
    </div>
  );
}

export default App;