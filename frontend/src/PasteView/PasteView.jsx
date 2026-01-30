import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function PasteView() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`/api/pastes/${id}`)
      .then((res) => setPaste(res.data))
      .catch(() => setError("Paste expired or not found"));
  }, [id]);

  if (error) return <h3>{error}</h3>;
  if (!paste) return <h3>Loading...</h3>;

  return(
    <>
    <h2>Pasted Content</h2>
    <h3>{paste.content}</h3>
    </>
  ) 
}

export default PasteView;