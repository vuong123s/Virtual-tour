import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const Slider = () => {
  const items = [
    { id: 1, name: 'Switzerland', des: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!', image: 'https://i.ibb.co/qCkd9jS/img1.jpg' },
    { id: 2, name: 'Finland', des: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!', image: 'https://i.ibb.co/jrRb11q/img2.jpg' },
    { id: 3, name: 'Iceland', des: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!', image: 'https://i.ibb.co/NSwVv8D/img3.jpg' },
    { id: 4, name: 'Australia', des: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!', image: 'https://i.ibb.co/Bq4Q0M8/img4.jpg' },
    { id: 5, name: 'Netherland', des: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!', image: 'https://i.ibb.co/jTQfmTq/img5.jpg' },
    { id: 6, name: 'Ireland', des: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!', image: 'https://i.ibb.co/RNkk6L0/img6.jpg' },
  ];

  return (
    <div className="relative w-[1000px] h-[600px] bg-gray-100 shadow-lg mx-auto my-20">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={50}
        slidesPerView={1}
        className="h-full"
      >
        {items.map((item) => (
          <SwiperSlide key={item.id} className="relative h-full">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute top-1/2 left-24 transform -translate-y-1/2 text-left text-white font-sans">
                <div className="text-4xl font-bold uppercase">{item.name}</div>
                <div className="mt-2 mb-4">{item.des}</div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                  See More
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
