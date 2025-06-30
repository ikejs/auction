const Logos = () => {
  return (
    <div className="container pb-4">
      <div className="d-flex justify-content-center">
        <img 
          src="/images/relay.png" 
          alt="Berg Logo"
          style={{ 
            borderRadius: '0 0 16px 16px', 
            boxShadow: "0 0 10px -5px #231F20", 
            width: '17rem',
            height: 'auto'
          }} 
        />
        {/* <img 
          src="/images/make.png" 
          alt="Make Logo"
          style={{ 
            borderRadius: '0 0 16px 0', 
            boxShadow: "0 0 10px -5px #231F20", 
            width: '10rem',
            height: 'auto'
          }}  */}
        />
      </div>
    </div>
  )
}

export default Logos;