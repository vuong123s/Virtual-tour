import React, { useState } from 'react'
import { FaAngleDown, FaMap  } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { IoMenu } from "react-icons/io5";
import { NavLink, Link } from 'react-router-dom';
import Logo1 from '../assets/logo.png'
const Navbar = () => {

  
  return (
    <div className='z-20'>
		<div className='z-20 py-7 absolute top-0 left-0 right-0 text-white  !py-1 border-b border-[#27272f] 
			border-solid border-opacity-15 !text-[#27272f] transition-all duration-400 ease-in-out'>
			<div className='max_padd_container flexCenter'>
				<div className='mr-auto'>
					<Link to='/'><img src={Logo1} alt="" /></Link>
				</div>
				<div className='flex items-center space-x-6 text-[20px] text-white'>

						<div className="p-2 rounded-full hover:bg-gray-800">
							<FaMap />
						</div>
						<div className="p-2 rounded-full hover:bg-gray-800">
							<IoMenu />
						</div>
						<Link className="p-2 rounded-full hover:bg-gray-800 text-[18px]">
							<FaRegUser className='white'  />
						</Link>
				</div>	
			</div>
		</div>
		
	</div>
  )
}

export default Navbar