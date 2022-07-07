const Footer = () => {
  return (
    <div 
      className="m-4 w-100"
      style={{
        opacity: 0.5,
        position: 'relative',
        left: 0,
        bottom: 0,
        color: "white",
        textAlign: "center"
      }}
    >
      <p><small>Auction by <a style={{color: "white", fontWeight: 'bold', textDecoration: 'none'}} href="https://radioplusinfo.com/" rel="noopener noreferrer">Radio Plus</a></small></p>
    </div>
  )
}

export default Footer;