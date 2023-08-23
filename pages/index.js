const HAS_AUCTION = false;
const AUCTION_ACTIVE = false;

import React, { useState } from "react";
import Link from 'next/link';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logos from "../components/Logos";
import Footer from "../components/Footer";
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
  const [userInputsDialogOpen, setUserInputsDialogOpen] = useState(AUCTION_ACTIVE);
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
              value={userInputs.name}
              onChange={handleUserInputChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              value={userInputs.email}
              onChange={handleUserInputChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone number"
              type="tel"
              value={userInputs.phone}
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
          <div className="w-100 p-1 sticky-top text-white text-center" style={{ backgroundColor: "#312b2c", boxShadow: "0 0 10px #312b2c" }}>
            <p className="h6 mb-0">Bidding as</p>
            <div className="d-flex justify-content-center pb-0 mb-0">
              <p className="px-2 mb-0">{user.name}</p>
              <p className="px-2 mb-0">{user.email}</p>
              <p className="px-2 mb-0">{user.phone}</p>
            </div>
            <a role="button" onClick={()=>setUserInputsDialogOpen(true)} className="text-white pt-0 mt-0"><small><u>change</u></small></a>
          </div>
          )
      }

      {/* <Logos /> */}
      {/* <div className="col-md-10 offset-md-1 px-4 mt-4 text-center"> */}
        {/* <p className="text-muted h6">Auction completed.</p> */}
        {/* <p className="text-muted"><small>Bids must be {'≥'}$10 higher than the current bid.</small></p> */}
      {/* </div> */}
      <div className="col-md-10 offset-md-1">
        <div className="mt-4 container">
          <p className="text-white text-center" style={{ padding: '1em', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '16px', boxShadow: "0 0 10px #1A244F" }}>
            <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{"NOAH'S"} ARK AUCTION FOR UNITED WAY</span><br />
            Radio Plus has donated a 4 pack and 6 pack of general admission tickets to the Fond du Lac Area United Way.
          </p>
          <div className="row d-flex justify-content-center">
            {
              items.map((item, i) => { 
                const currentBid = Math.max.apply(Math, item.bids.map((o) => o.amount));
                return(
                  <div key={i} className="col-md-4 card text-center p-0 m-4" style={{ borderWidth: 0, borderRadius: '10px', boxShadow: '0 8px 12px 0 rgba(0,0,0,0.5)' }}>
                    <div className="w-100" style={{ position:"relative", display:"inlineBlock" }}>
                      {item.bids.length ? 
                        <span style={{position: "absolute",bottom: "0",background: "#221F20",textAlign: "center",borderRadius: "0 10px 0 0",color: "white",padding: "5px 10px",fontSize: "20px",zIndex: "10"}}
                          >{AUCTION_ACTIVE ? 'Current' : 'Final'} Bid: <strong>
                            <CurrencyFormat value={currentBid} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                          </strong>
                        </span>
                        : ""
                      }
                      <img src={`/images/${item.image}`} className="w-100 p-3" style={{ position: "relative", zIndex: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
                    </div>
                    <div className="m-3">
                      {/* <div className="row d-flex align-items-center"> */}
                      <div className="row d-flex align-items-center mb-3">
                        <div className="col-md-8 float-left" style={{ textAlign: "left" }}>
                          <h4 className="mt-2 mb-0 pb-0">{item.name}</h4>
                          <p className="lead text-muted mt-0 pt-0"><strong>{item.name2}</strong></p>
                          <p><small>{item.description}</small></p>
                        </div>
                        {/* <div className="col-md-4 float-right"> */}
                        {AUCTION_ACTIVE && (<div className="col-md-5">
                          <div className="input-group">
                            <input type="number" className="form-control" placeholder="0" 
                              onChange={e => {
                                bidInputs[i] = e.target.value;
                                setBidInputs(bidInputs);
                              }} />
                            <div className="input-group-append">
                              <button className="btn" style={{ backgroundColor: "black", color: "white", fontWeight: "bold" }} type="button" onClick={() => {
                                if (!bidInputs[i] || !bidInputs[i].length) return false;
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
                        </div>)}
                      </div>
                      {item.bids.length ?
                        <div style={{ textAlign: 'left' }}>
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
                                        <td className="text-muted" style={{ textAlign: 'right' }}><small><Moment fromNow date={bid.createdAt} /></small></td>
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
            <p className="text-white text-center col-md-8" style={{ padding: '1em', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '16px', boxShadow: "0 0 10px #1A244F" }}>
              <small>
                All bidding ends Tuesday August 22nd at 4PM CST.<br />
                Please bid in $10 increments.<br />
                Top bidders will be notified.<br />
                Checks payable to FDL Area United Way.<br />
              </small>
            </p>
          </div>
          </div>
          <Footer />
        {/* </div> */}
      </div>
    </div>
  )
}

const NoAuction = () => (
  <div style={{ marginTop: '20%', paddingTop: '3em', paddingBottom: '3em', backgroundColor: '#107ab0' }} className="d-flex flex-column align-items-center justify-content-center text-white">
    <h1>no auctions available</h1>
    <p className="lead">contact <Link href="mailto:td@radioplusinfo.com"><a className="text-white">td@radioplusinfo.com</a></Link></p>
  </div>
)

export default HAS_AUCTION ? Home : NoAuction;