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
      <p><small>Developed by <a style={{color: "white"}} href="mailto:ike@holzmann.io">Ike Holzmann</a> @ <a style={{color: "white"}} href="https://radioplusinfo.com/" target="_blank" rel="noopener noreferrer">Radio Plus, Inc.</a></small></p>
    </div>
  )
}

export default Footer;