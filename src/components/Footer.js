import React from "react";

const Footer = () => {
  return (
    <div 
      className="m-4 w-100"
      style={{
        left: 0,
        bottom: 0,
        color: "white",
        textAlign: "center"
      }}
    >
      <p><small>Auction by <a style={{color: "white", fontWeight: 'bold'}} href="https://radioplusinfo.com/" rel="noopener noreferrer">Radio Plus, Inc.</a></small></p>
    </div>
  )
}

export default Footer;