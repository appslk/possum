"use client";

import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { nftData } from "../utils/constants";
import CarouelCard from "./CarouelCard";

const Carousel = () => {
  return (
    <Swiper
      modules={[Autoplay]}
      speed={1000}
      spaceBetween={10}
      slidesPerView={1}
      autoplay={{ pauseOnMouseEnter: true }}
      breakpoints={{
        640: {
          slidesPerView: 2,
        },
        1280: {
          slidesPerView: 3,
        },
      }}
    >
      {nftData.map(({ id, ...props }) => (
        <SwiperSlide key={id}>
          <div className="pb-[15px]">
            <CarouelCard {...props} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
