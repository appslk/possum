import React from "react";
import Image, { StaticImageData } from "next/image";

import PrimaryButton from "./PrimaryButton";

interface CarouelCardProps {
  name: string;
  img: StaticImageData;
  price: string;
  time: string;
}

const CarouelCard: React.FC<CarouelCardProps> = ({
  name,
  img,
  price,
  time,
}) => {
  return (
    <article className="bg-[#fffbd2] font-grandstander border-[#212121] relative mx-auto flex aspect-[10/17] w-[240px] flex-col justify-between overflow-hidden rounded-[24px] border-[0.1em] shadow-[0.3em_0.3em_#212121] sm:w-[270px] sm:rounded-[29px] md:w-[300px] md:rounded-[32px] lg:w-[330px] lg:rounded-[36px] xl:w-[360px] xl:rounded-[40px] 2xl:w-[390px] 2xl:rounded-[44px]">
      {/* Name */}
      <div className="bg-[#fffbd2] text-[#212121] absolute top-0 left-0 w-3/4 overflow-hidden rounded-br-full ps-[0.9em] pe-[1.1em] pt-[0.5em] pb-[0.3em] text-center text-[18px] sm:text-[20px] md:text-[22px] lg:text-[25px] xl:text-[26.5px] 2xl:text-[28px]">
        <p className="line-clamp-1 font-semibold">{name}</p>
      </div>

      {/* Image */}
      <div className="m-[1em] mb-0 overflow-hidden rounded-[24px] sm:rounded-[29px] md:rounded-[32px] lg:rounded-[36px] xl:rounded-[40px] 2xl:rounded-[44px]">
        <Image
          src={img}
          alt={name}
          className="aspect-[5/4] w-full object-cover object-center select-none"
        />
      </div>

      <p className="text-[#212121] px-[1.5em] pt-[1em] pb-[0.5em] text-center text-[12px] 2xl:text-[20px]">
        The unique Possum Gang. Collect these beasties and enjoy the perks of
        holding like revenue share boost of WTFO token for holders and/or
        trending/boost discount for devs. Join our telegram community to learn
        more!
      </p>

      {/* Price */}
      <div className="text-[#212121] ml-[1em] flex items-center gap-[1em]">
        <p className="text-[18px] font-semibold sm:text-[20px] md:text-[22px] lg:text-[25px] xl:text-[26.5px] 2xl:text-[28px]">
          Current price :
        </p>

        <div className="bg-[#65f54e] font-medium grow rounded-l-full pt-[0.2em] pb-[0.1em] text-center text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] xl:text-[25px] 2xl:text-[26px]">
          <p>
            {price}
            <span className="font-anton text-[0.5em] text-white">
              &nbsp; SOL
            </span>
          </p>
        </div>
      </div>

      {/* Time */}
      <div className="p-[1em] pt-[1em]">
        <PrimaryButton
          buttonText={time}
          className="w-full overflow-hidden rounded-full border-none pt-[0.4em] pb-[0.1em] text-[16px] text-nowrap italic sm:text-[18px] md:text-[20px] lg:text-[23px] xl:text-[24.5px] 2xl:text-[26px]"
          disabled
        />
      </div>
    </article>
  );
};

export default CarouelCard;
