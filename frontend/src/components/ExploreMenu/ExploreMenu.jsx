import React from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({category,setCategory}) => {

  return (
    <div className="explore-menu" id='explore-menu'>
      <h1>Explore Our Menu</h1>
      <p className='explore-menu-text'>Discover a wide range of delicious meals crafted with fresh ingredients and love. From savory delights to sweet treats, FreshPlate has something for every craving. Browse through our menu and indulge in flavors that will leave you wanting more. <br />

      <ul>
        <li>✨ Handpicked Ingredients</li>
        <li>🔥 Fresh & Hot Meals</li>
        <li>🚀 Fast & Reliable Delivery</li>
      </ul>

Order now and treat yourself to a delightful feast! 🍕🥗🍔</p>
      <div className="explore-menu-list">
        {menu_list.map((item,index)=>{
            return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className="explore-menu-list-items">
                    <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                    <p>{item.menu_name}</p>
                </div>
            )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu
