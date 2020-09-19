import React, { useState } from "react";
import Logos from "./Logos";
import censorEmail from '../helpers/censorEmail.js';



let socket = io.connect();

const App = () => {

  const [items, setItems] = useState([]);
  const [user, setUser] = useState({
        // name: "Ike",
        // email: "ike@holzmann.io",
        // phone: 19202519700
        // name: prompt("Please enter your name (step 1/3)"),
        // email: prompt("Phone number (step 2/3)"),
        // phone: prompt("Email address (step 3/3)")
  });
  const [bidInputs, setBidInputs] = useState([]);

  const sendBid = (itemID, amount) => {
    socket.emit('bid', { user, itemID, amount })
  };

  socket.on("connect", function(data) {

    // setUser(() => {
    //   return {
    //     name: "Ike",
    //     email: "ike@holzmann.io",
    //     phone: 19202519700
    //     // name: prompt("Please enter your name (step 1/3)"),
    //     // email: prompt("Phone number (step 2/3)"),
    //     // phone: prompt("Email address (step 3/3)")
    //   }
    // });

  });

  socket.on("update", (items) => {
    setItems(items);
  });


  socket.on("err", ({ msg }) => {
    alert(msg);
  });


  return (
    <div style={{ backgroundImage: "url('/images/bg.jpg')" }}>
      <Logos />
      <div className="mt-3 col-md-10 offset-md-1 d-flex justify-content-center">
        {
          items.map((item, i) => { 
            return(
              <div key={i} className="col-md-5 card rounded text-center m-4 p-0">
                <div className="w-100" style={{ position:"relative", display:"inlineBlock" }}>
                  <span
                    style={{position: "absolute",bottom: "0",background: "red",textAlign: "center",borderRadius: "0 10px 0 0",color: "white",padding: "5px 10px",fontSize: "20px",zIndex: "10"}}
                  >Current bid: <strong>${
                    Math.max.apply(Math, item.bids.map(function(o) { return o.amount }))
                  }</strong></span>
                  <img src={`/images/${item.image}`} className="w-100" style={{ position: "relative" }} />
                </div>
                <div className="m-3 text-left">
                  <div className="row d-flex align-items-center">
                    <div className="col-md-8 float-left">
                      <h4 className="mt-2 mb-0 pb-0">{item.name}</h4>
                      <p className="lead text-muted mt-0 pt-0"><strong>{item.name2}</strong></p>
                      <p><small>{item.description}</small></p>
                    </div>
                    <div className="col-md-4 float-right">
                      <div className="input-group">
                        <input type="number" className="form-control" onChange={e => {
                            bidInputs[i] = e.target.value;
                            setBidInputs(bidInputs);
                          }} />
                        <div className="input-group-append">
                          <button className="btn btn-success" type="button" onClick={() => {
                            sendBid(items[i]._id, bidInputs[i])
                          }}>Bid</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <p className="lead m-0 p-0">Bids</p>
                  <div style={{ overflowY: "scroll", height: "300px" }}>
                    <table className="table table-sm">
                      <tbody>
                        {
                          item.bids.sort((a, b) => a.amount > b.amount ? -1 : 1)
                          .map((bid, i) => {
                            return (
                              <tr key={i}>
                                <td>{censorEmail(bid.bidder.email)}</td>
                                <td>${bid.amount}</td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          }) 
        }
      </div>
    </div>
  )
}


export default App;
