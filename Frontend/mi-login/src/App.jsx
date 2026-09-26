import TecnoFixLogin from "./components/TecnoFixLogin"; 
function App() { const handleLogin = (email, password) => { console.log("Login enviado:", email, password); }; 
return <TecnoFixLogin onSubmit={handleLogin} />; } export default App;