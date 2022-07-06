import React, { useState } from "react";
import io from 'socket.io-client';
// import Logos from "./Logos";
// import Footer from "./Footer";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
import Moment from 'react-moment';
import CurrencyFormat from 'react-currency-format';
import useSound from 'use-sound';
import validateUser from '../helpers/validateUser';
import censorEmail from '../helpers/censorEmail';


const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { transports : ['websocket'] });

const Home = () => {

  const [items, setItems] = useState([]);
  const [userInputsDialogOpen, setUserInputsDialogOpen] = useState(false); // TO CLOSE AUCTION, FALSE
  const [userInputs, setUserInputs] = useState({});
  const [user, setUser] = useState({});
  const [bidInputs, setBidInputs] = useState([]);
  const [play] = useSound('sounds/bid-sound.mp3');


  const handleUserInputChange = ({ target: { name, value } }) => {
    setUserInputs((current) => {
      return {
        ...current,
        [name]: value
      }
    })
  }

  const handleSubmitJoinAuction = () => {
    const user = validateUser(userInputs)
    if(user.error) { return alert(user.error) }
    setUser(user)
    setUserInputsDialogOpen(false)
  }

  const sendBid = (itemID, amount) => {
    if(!user.email.length) {
      setUserInputsDialogOpen(true);
    } else {
      socket.emit('bid', { user, itemID, amount });
      play();
    }
  };

  socket.on("update", (items) => {
    setItems(items);
  });


  socket.on("err", ({ msg }) => {
    alert(msg);
  });

  return (
    <div style={{ 
      // backgroundImage: "url('/images/bg.jpg')"
      backgroundColor: "#FFFFF",
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    }}>
      <>
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
              This auction will NOT share any of your information online.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              onChange={handleUserInputChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              onChange={handleUserInputChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone number"
              type="tel"
              onChange={handleUserInputChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleSubmitJoinAuction}
              color="primary"
            >
              Enter Auction
            </Button>
          </DialogActions>
        </Dialog>
      </>
      {
        user.name && (
          <div className="w-100 p-1 sticky-top text-white text-center" style={{ backgroundColor: "#12233d" }}>
            <p className="h6 mb-0">Bidding as</p>
            <div className="d-flex justify-content-center pb-0 mb-0">
              <p className="px-2 mb-0">{user.name}</p>
              <p className="px-2 mb-0">{user.email}</p>
              <p className="px-2 mb-0">{user.phone}</p>
            </div>
            <a href="/" className="text-white pt-0 mt-0"><small><u>change</u></small></a>
          </div>
          )
      }

      {/* <Logos /> */}
      {/* <div className="col-md-10 offset-md-1 px-4"> */}
        <p className="text-muted h6">Auction completed.</p>
        {/* <p className="text-muted"><small>Bids must be {'≥'}$20 higher than the current bid.</small></p> */}
      {/* </div> */}
      <div className="col-md-10 offset-md-1">
        <div className="mt-4 d-flex justify-content-center row">
          <div className="col-md-12 d-flex justify-content-center">
            <img src="/images/bergstrom2022.jpeg" style={{ maxHeight: "200px", maxWidth: '100%', borderRadius: '10px', boxShadow: '0 8px 12px 0 rgba(0,0,0,0.5)' }} />
          </div>
          {
            items.map((item, i) => { 
              const currentBid = Math.max.apply(Math, item.bids.map((o) => o.amount));
              return(
                <div key={i} className="col-md-5 card text-center m-4 p-0" style={{ borderWidth: 0, borderRadius: '10px', boxShadow: '0 8px 12px 0 rgba(0,0,0,0.5)' }}>
                  <div className="w-100" style={{ position:"relative", display:"inlineBlock" }}>
                    {item.bids.length ? 
                      <span style={{position: "absolute",bottom: "0",background: "#221F20",textAlign: "center",borderRadius: "0 10px 0 0",color: "white",padding: "5px 10px",fontSize: "20px",zIndex: "10"}}
                        >Final Bid: <strong>
                          <CurrencyFormat value={currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                        </strong>
                      </span>
                      : ""
                    }
                    <img src={`/images/${item.image}`} className="w-100" style={{ position: "relative", zIndex: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                  </div>
                  <div className="m-3 text-left">
                    <div className="row d-flex align-items-center">
                      <div className="col-md-8 float-left">
                        <h4 className="mt-2 mb-0 pb-0">{item.name}</h4>
                        <p className="lead text-muted mt-0 pt-0"><strong>{item.name2}</strong></p>
                        <p><small>{item.description}</small></p>
                      </div>
                      {/* <div className="col-md-4 float-right">
                        <div className="input-group">
                          <input type="number" className="form-control" placeholder="0" 
                            onChange={e => {
                              bidInputs[i] = e.target.value;
                              setBidInputs(bidInputs);
                            }} />
                          <div className="input-group-append">
                            <button className="btn" style={{ backgroundColor: "#CC231E", color: "white", fontWeight: "bold" }} type="button" onClick={() => {
                              if (!bidInputs[i].length) return false;
                              if (bidInputs[i] % 1 != 0) return alert("Whole numbers only");
                              if (!item.bids.length && bidInputs[i] < 20 || parseInt(bidInputs[i] + 20) < bidInputs[i]) {
                                return alert("Your bid must be $20 or more.")
                              }
                              if (item.bids.length && currentBid + 20 > bidInputs[i]) {
                                return alert("Your bid must be at least $20 higher than the current bid.")
                              }
                              if ((parseInt(bidInputs[i]) <= 0) || (parseInt(bidInputs[i]) <= currentBid)) {
                                return alert("Your bid must be higher than the current bid.")
                              } else {
                                sendBid(items[i]._id, bidInputs[i]);
                              }
                            }}>Bid</button>
                          </div>
                        </div>
                      </div> */}
                    </div>
                    {item.bids.length ?
                      <div>
                        <hr />
                        <p className="lead m-0 p-0">Bids</p>
                        <div style={{ overflowY: "scroll", height: "200px" }}>
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
                      : "No bids yet"
                    }
                  </div>
                </div>
              )
            }) 
          }
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  )
}


export default Home;