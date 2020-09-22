import React, { useEffect, useState } from "react";
import Logos from "./Logos";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
import censorEmail from '../helpers/censorEmail.js';
import CurrencyFormat from 'react-currency-format';
import Moment from 'react-moment';



let socket = io.connect({ secure: true });

const App = () => {

  const [items, setItems] = useState([]);
  const [userInputsDialogOpen, setUserInputsDialogOpen] = useState(true);
  const [user, setUser] = useState({});
  const [bidInputs, setBidInputs] = useState([]);

  const sendBid = (itemID, amount) => {
    if(!user.email.length) {
      setUserInputsDialogOpen(true);
    } else {
      socket.emit('bid', { user, itemID, amount });
    }
  };

  socket.on("update", (items) => {
    setItems(items);
  });


  socket.on("err", ({ msg }) => {
    alert(msg);
  });

  return (
    <div style={{ backgroundImage: "url('/images/bg.jpg')" }}>
      <div>
        <Dialog 
          aria-labelledby="form-dialog-title"
          open={userInputsDialogOpen} 
          onClose={()=>setUserInputsDialogOpen(false)} 
          disableBackdropClick={true}
          disableEscapeKeyDown={true}
        >
          {/* <DialogTitle id="form-dialog-title">Confirm information</DialogTitle> */}
          <DialogContent>
            <DialogContentText>
              {/* To subscribe to this website, please enter your email address here. We will send updates
              occasionally. */}
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              onChange={(e) => setUser(user => { user.name = e.target.value; return user; })}
              fullWidth
            />
            <TextField
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              onChange={(e) => setUser(user => { user.email = e.target.value; return user; })}
              fullWidth
            />
            <TextField
              margin="dense"
              id="phone"
              label="Phone number"
              type="tel"
              onChange={(e) => setUser(user => { user.phone = e.target.value; return user; })}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={()=> {
              if(user.name.length && user.email.length && user.phone.length) {
                setUserInputsDialogOpen(false);
              }
              }} color="primary">
              Enter Auction
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <Logos />
      <div className="mt-3 col-md-10 offset-md-1 d-flex justify-content-center row">
        {
          items.map((item, i) => { 
            const currentBid = Math.max.apply(Math, item.bids.map((o) => o.amount));
            return(
              <div key={i} className="col-md-5 card rounded text-center m-4 p-0">
                <div className="w-100" style={{ position:"relative", display:"inlineBlock" }}>
                  {item.bids.length ? 
                    <span style={{position: "absolute",bottom: "0",background: "red",textAlign: "center",borderRadius: "0 10px 0 0",color: "white",padding: "5px 10px",fontSize: "20px",zIndex: "10"}}
                      >Current bid: <strong>
                        <CurrencyFormat value={currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                      </strong>
                    </span>
                    : ""
                  }
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
                        <input type="number" className="form-control" 
                          placeholder={
                            item.bids.length ? currentBid + 10 : 0
                          }
                          onChange={e => {
                            bidInputs[i] = e.target.value;
                            setBidInputs(bidInputs);
                          }} />
                        <div className="input-group-append">
                          <button className="btn btn-success" type="button" onClick={() => {
                            if (!bidInputs[i].length) return false;
                            if (bidInputs[i] % 1 != 0) return alert("Whole numbers only");
                            if (!item.bids.length && bidInputs[i] < 10 || parseInt(bidInputs[i] + 10) < bidInputs[i]) {
                              return alert("Your bid must be $10 or more.")
                            }
                            if (item.bids.length && currentBid + 10 > bidInputs[i]) {
                              return alert("Your bid must be at least $10 higher than the current bid.")
                            }
                            if ((parseInt(bidInputs[i]) <= 0) || (parseInt(bidInputs[i]) <= currentBid)) {
                              return alert("Your bid must be higher than the current bid.")
                            } else {
                              sendBid(items[i]._id, bidInputs[i]);
                            }
                          }}>Bid</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {item.bids.length ?
                    <div>
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
                                    <td><CurrencyFormat value={bid.amount} displayType={'text'} thousandSeparator={true} prefix={'$'} /></td>
                                    <td className="text-muted text-right"><small><Moment fromNow date={bid.createdAt} /></small></td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                    : ""
                  }
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
