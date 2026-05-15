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
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        await signOut(auth);
        setIsSignUp(false);
        setMsg({ type: 'success', text: 'Registration Complete!' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) { setMsg({ type: 'error', text: 'Auth Failed' }); }
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    setIsRefreshing(true);
    await signOut(auth);
    setTimeout(() => window.location.replace("/"), 800);
  };

  const addRecord = async (e) => {
    e.preventDefault();
    setIsRefreshing(true);
    const token = await user.getIdToken();
    await fetch(PHP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, dob, gender, age })
    });
    setName(''); setDob(''); setGender(''); setAge('');
    await loadData(user);
    setTimeout(() => {
      setActiveTab(0); 
      setIsRefreshing(false);
    }, 800);
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
          <form onSubmit={handleAuth}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn-blue">{isSignUp ? 'REGISTER' : 'LOGIN'}</button>
          </form>
          <p className="link" onClick={() => setIsSignUp(!isSignUp)}>
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
          /* PAGE 1: SEPARATE TABLE PAGE */
          <div className="glass-panel fade-in">
            <div className="panel-header">
              <h2>Student Database</h2>
              <button className="refresh-icon-btn" onClick={manualRefresh}></button>
            </div>
            <div className="table-wrapper">
                <table className="student-table">
                    <thead>
                        <tr><th>Name</th><th>DOB</th><th>Gender</th><th>Age</th></tr>
                    </thead>
                    <tbody>
                        {students.map((s, i) => (
                            <tr key={i}>
                                <td><strong>{s.name}</strong></td>
                                <td>{s.dob}</td>
                                <td>{s.gender}</td>
                                <td><span className="age-tag">{s.age}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        ) : (
          /* PAGE 2: SEPARATE FORM PAGE */
          <div className="glass-panel fade-in">
            <div className="panel-header">
              <h2>New Student Registration</h2>
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
              
              <button type="submit" className="btn-save-large">SAVE STUDENT RECORD</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;