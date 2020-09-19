import React from "react";

const Items = () => {
  return (
    <div className="">
      {
        items.map((item, i) => {
          return(
            <div className="col-md-4 card rounded bg-secondary">
              <img src="/images/pepe.png" />
              {item.name}
            </div>
          )
        })
      }
    </div>
  ) 
}
  
    
    
export default Items;