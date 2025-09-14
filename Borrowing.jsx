import React, { useEffect, useState } from "react";

const LS_KEYS = {
  BORROWING: "eq_borrowing",
  ITEMS: "eq_items_v2",
  HISTORY: "eq_history",
};

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

export default function Borrowing() {
  const [borrowing, setBorrowing] = useState([]);
  const [popup, setPopup] = useState({ visible: false, message: "" });

  useEffect(() => {
    setBorrowing(readLS(LS_KEYS.BORROWING, []));
  }, []);

  function handleReturn(id) {
    const bor = [...borrowing];
    const idx = bor.findIndex(b => b.id === id);
    if (idx === -1) return;
    const record = bor[idx];
    bor.splice(idx, 1);
    setBorrowing(bor);
    writeLS(LS_KEYS.BORROWING, bor);

    const items = readLS(LS_KEYS.ITEMS, []);
    const found = items.find(it => it.name === record.item);
    if (found) {
      found.remaining += 1;
      writeLS(LS_KEYS.ITEMS, items);
    }

    const history = readLS(LS_KEYS.HISTORY, []);
    const hIdx = history.findIndex(h => h.id === id && h.status === "Borrowed");
    if (hIdx !== -1) {
      history[hIdx].status = "Returned";
      history[hIdx].returnTime = new Date().toLocaleTimeString();
    }
    writeLS(LS_KEYS.HISTORY, history);

    setPopup({ visible: true, message: "คุณได้ทำการคืนอุปกรณ์เรียบร้อยแล้ว" });
  }

  return (
    <main className="content">
      <h1>My Borrowing</h1>
      <div className="table-container">
        <table id="borrowTable">
          <thead>
            <tr>
              <th>Number</th>
              <th>Item</th>
              <th>Borrowing Date</th>
              <th>Borrowing Time</th>
              <th>Return Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {borrowing.length > 0 ? borrowing.map((b, i) => (
              <tr key={b.id}>
                <td>{String(i+1).padStart(3,'0')}</td>
                <td>{b.item}</td>
                <td>{b.borrowDate}</td>
                <td>{b.borrowTime}</td>
                <td>{b.returnDate}</td>
                <td>
                  <button className="return-btn" onClick={()=>handleReturn(b.id)}>Return Confirm</button>
                </td>
              </tr>
            )) : <tr><td colSpan="6" style={{textAlign:"center", color:"#777"}}>No current borrowing.</td></tr>}
          </tbody>
        </table>
      </div>

      {popup.visible && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h2>สำเร็จ</h2>
            <p>{popup.message}</p>
            <button className="submit-btn" onClick={()=>setPopup({visible:false,message:""})}>ปิด</button>
          </div>
        </div>
      )}
    </main>
  );
}
