import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get("issues/").then(res => {
      setIssues(res.data.results);
    });
  }, []);

  return (
    <div>
      <h1>NammaFix Issues</h1>
      {issues.length === 0 ? <p>No issues yet</p> : null}
      {issues.map((i) => (
        <div key={i.id}>
          <h3>{i.title}</h3>
          <p>{i.description}</p>
        </div>
      ))}
    </div>
  );
}

export default App;