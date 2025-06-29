import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Room.css';

export default function Room() {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState('waiting');
  const [me, setMe] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // 登录校验
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchRoomInfo();
    const interval = setInterval(fetchRoomInfo, 2000); // 2秒一次
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  async function fetchRoomInfo() {
    const token = localStorage.getItem('token');
    const res = await fetch(`https://9526.ip-ddns.com/api/room_info.php?roomId=${roomId}&token=${token}`);
    const data = await res.json();
    if (data.success) {
      setPlayers(data.players);
      setStatus(data.status);
      setMe(data.me);
      if (data.status === 'started') {
        navigate(`/play/${roomId}`);
      }
    } else if (data.code === 401) {
      alert('身份验证失败');
      navigate('/login');
    }
  }

  return (
    <div className="room-container">
      <h2>房间ID: {roomId}</h2>
      <div className="players-list">
        <h3>玩家列表</h3>
        <ul>
          {players.map(p => (
            <li key={p.name} className={p.name === me ? 'me' : ''}>
              {p.name}
              {p.isOwner && <span className="owner-tag">房主</span>}
              {p.submitted ? <span style={{color:'#23e67a',marginLeft:8}}>已准备</span> : <span style={{color:'#888',marginLeft:8}}>未准备</span>}
            </li>
          ))}
        </ul>
      </div>
      {errorMsg && <div style={{ color: 'red', marginTop: 10 }}>{errorMsg}</div>}
      <div className="tip">全部玩家准备后会自动发牌，无需房主操作</div>
    </div>
  );
}
