import React,{useState} from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { toast } from "react-toastify";

const CreatePaste = () =>{
    const navigate=useNavigate();
    const [pasteData, setPastedata] = useState({
    content: "",
    expiry: "",
    exposure: "",
  });
  const [pasteId, setPasteId] = useState(null);

  const OnchangeHandler = (event) => {
    const { name, value } = event.target;
    setPastedata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const PasteCreation = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/pastes", {
        content: pasteData.content,
        ttl_seconds: Number(pasteData.expiry),
        max_views: Number(pasteData.exposure),
      });
      console.log("ressss", response.data);
      setPasteId(response.data.id);
      toast.success("Paste created successfully");
      setPastedata({
        content: "",
        expiry: "",
        exposure: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

    return (
      <>
      <div className="col-12 text-center">
        <div className="d-flex justify-content-center">
      <h1 className="text-center">PASTEBIN</h1>
      <span
  title={!pasteId ? "Create a paste first" : "View paste"}
  style={{ display: "inline-block" }}
>
  <button
    className="btn mt-2 mb-2"
    disabled={!pasteId}
    style={{ background: "#6aa96aad", marginLeft: "38px" }}
    onClick={() => navigate(`/pastes/${pasteId}`)}
  >
    ViewPaste
  </button>
</span>
      </div>
        <form onSubmit={PasteCreation}>
          <textarea
            name="content"
            rows="14"
            cols="110"
            value={pasteData.content}
            onChange={OnchangeHandler}
          ></textarea>
          <div className="">
            <div className="py-2">
              <label className="px-2">Paste Expiration (Seconds)</label>
              <select
                name="expiry"
                value={pasteData.expiry}
                onChange={OnchangeHandler}
                required
              >
                <option value="">Select Expiry</option>
                <option value="0">Never</option>
                <option value="600">10 Minutes</option>
                <option value="3600">1 Hour</option>
                <option value="86400">1 Day</option>
              </select>
            </div>
            <div>
              <label className="px-2">Paste Exposure</label>
              <select
                type="number"
                name="exposure"
                value={pasteData.exposure}
                onChange={OnchangeHandler}
              >
                <option value="">Select max views</option>
                <option value="0">Unlimited</option>
                <option value="1">1 View</option>
                <option value="5">5 Views</option>
                <option value="10">10 Views</option>
                <option value="50">50 Views</option>
              </select>
            </div>

            <button className="btn mt-2 w-25" style={{background:"#688294"}}>Create Paste</button>
          </div>
        </form>
      </div>
    </>
    ) 
};
export default CreatePaste;