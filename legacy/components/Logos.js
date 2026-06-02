import Image from 'next/image';

const Logos = () => {

  
  return (
    <div className="container pb-4">
      <div className="d-flex justify-content-center">
        <Image 
          src="/images/top.png" 
          alt="Auction header"
          style={{ 
            borderRadius: '0 0 16px 16px', 
            boxShadow: "0 0 10px -5px #231F20", 
            width: '100%',
            maxWidth: '31rem',
            height: 'auto'
          }} 
          width={500} height={150}
        />
        {/*
        <Image 
          src="/images/make.png" 
          alt="Make Logo"
          style={{ 
            borderRadius: '0 0 16px 0', 
            boxShadow: "0 0 10px -5px #231F20", 
            width: '10rem',
            height: 'auto'
          }}
          width={160} height={100}
        />
        */}
      </div>
    </div>
  )
}

export default Logos;