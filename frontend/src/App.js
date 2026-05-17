import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "firebase/auth";

const firebaseConfig = { 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const PHP_URL = "http://localhost:8000/api.php";

function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [authLoading, setAuthLoading] = useState(true); 
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState(0); 

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        loadData(u).then(() => setAuthLoading(false));
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (u) => {
    try {
      const token = await u.getIdToken();
      const res = await fetch(PHP_URL, { headers: { 'Authorization': `Bearer ${token}` }});
      const data = await res.json();
      setStudents(data);
    } catch (e) { console.log("Fetch error"); }
  };

  const navigateTo = (tabIndex) => {
    setIsRefreshing(true);
    if (tabIndex === 1) {
        setEditId(null);
        setName(''); setDob(''); setGender(''); setAge('');
    }
    setTimeout(() => {
      setActiveTab(tabIndex);
      setIsRefreshing(false);
    }, 800);
  };

  const manualRefresh = async () => {
    setIsRefreshing(true);
    if (user) await loadData(user);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsRefreshing(true); 
    setMsg({ type: '', text: '' });

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        await signOut(auth);
        setTimeout(() => {
            setIsSignUp(false);
            setEmail(''); 
            setPassword('');
            setMsg({ type: 'success', text: 'Account Created! Please Login.' });
            setIsRefreshing(false);
        }, 1000); 
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          setTimeout(() => {
              setIsRefreshing(false);
          }, 1000);
        } catch (loginErr) {
          
          setTimeout(() => {
            setEmail('');
            setPassword('');
            setMsg({ 
                type: 'error', 
                text: 'Login Failed: Please Create Account or Check values.' 
            });
            setIsRefreshing(false);
          }, 1000);
        }
      }
    } catch (err) { 
        setTimeout(() => {
            setEmail('');
            setPassword('');
            setMsg({ type: 'error', text: 'Error: Please Create Account or Check values.' }); 
            setIsRefreshing(false);
        }, 1000);
    }
  };

  const handleLogout = async () => {
    setIsRefreshing(true); 
    await signOut(auth);
    setEmail(''); 
    setPassword('');
    setMsg({ type: '', text: '' });
    setTimeout(() => {
        setIsRefreshing(false);
    }, 1000); 
  };

  const addRecord = async (e) => {
    e.preventDefault();
    setIsRefreshing(true);
    const token = await user.getIdToken();
    
    const method = editId ? 'PUT' : 'POST';
    const bodyData = editId ? { id: editId, name, dob, gender, age } : { name, dob, gender, age };

    await fetch(PHP_URL, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(bodyData)
    });

    setName(''); setDob(''); setGender(''); setAge(''); setEditId(null);
    await loadData(user);
    setTimeout(() => {
      setActiveTab(0); 
      setIsRefreshing(false);
    }, 800);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setIsRefreshing(true);
    const token = await user.getIdToken();
    
    await fetch(`${PHP_URL}?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    await loadData(user);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setName(s.name);
    setDob(s.dob);
    setGender(s.gender);
    setAge(s.age);
    setActiveTab(1); 
  };

  if (authLoading || isRefreshing) {
    return (
      <div className="full-bg center-all">
        <div className="refresh-box">
          <div className="dual-ring"></div>
          <h2>Global School Portal</h2>
          <p>Processing Request...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="full-bg center-all">
        <div className="auth-card">
          <h1>Global School</h1>
          
          {/* FAILED MESSAGE IN RED COLOR */}
          {msg.text && (
            <div style={{ 
                color: msg.type === 'error' ? 'red' : 'green', 
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontWeight: 'bold',
                textAlign: 'center'
            }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleAuth}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn-blue">{isSignUp ? 'REGISTER' : 'LOGIN'}</button>
          </form>
          <p className="link" onClick={() => {
              setIsSignUp(!isSignUp);
              setEmail(''); 
              setPassword('');
              setMsg({type: '', text: ''});
          }}>
            {isSignUp ? 'Login' : 'Create Account'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-bg">
      <nav className="navbar">
        <div className="brand"> Admin Portal</div>
        <div className="nav-links">
            <button className={activeTab === 0 ? 'active' : ''} onClick={() => navigateTo(0)}>Database</button>
            <button className={activeTab === 1 ? 'active' : ''} onClick={() => navigateTo(1)}>Add Student</button>
        </div>
        <button onClick={handleLogout} className="btn-red">Logout</button>
      </nav>

      <div className="dash-container">
        {activeTab === 0 ? (
          <div className="glass-panel fade-in">
            <div className="panel-header">
              <h2>Student Database</h2>
              <button className="refresh-icon-btn" onClick={manualRefresh}></button>
            </div>
            <div className="table-wrapper">
                <table className="student-table">
                    <thead>
                        <tr><th>Name</th><th>DOB</th><th>Gender</th><th>Age</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {students.map((s, i) => (
                            <tr key={i}>
                                <td><strong>{s.name}</strong></td>
                                <td>{s.dob}</td>
                                <td>{s.gender}</td>
                                <td><span className="age-tag">{s.age}</span></td>
                                <td>
                                    <button className="btn-edit" onClick={() => startEdit(s)}>Edit</button>
                                    <button className="btn-delete" onClick={() => deleteRecord(s.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel fade-in">
            <div className="panel-header">
              <h2>{editId ? 'Update Student Details' : 'New Student Registration'}</h2>
              <button className="btn-back" onClick={() => navigateTo(0)}>Cancel</button>
            </div>
            <form onSubmit={addRecord} className="vertical-form">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              
              <label>Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
              
              <label>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              
              <label>Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} required />
              
              <button type="submit" className="btn-save-large">
                  {editId ? 'UPDATE RECORD' : 'SAVE STUDENT RECORD'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
