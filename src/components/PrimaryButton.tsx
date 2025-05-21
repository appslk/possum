import React from "react";

import { cn } from "../utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  buttonText?: string;
  spanStyle?: string;
};

const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, buttonText = "", children, spanStyle, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "bg-[#65f54e] border-[#212121] text-[#212121] group relative z-[1] w-fit overflow-clip rounded-[0.5em] border-[0.1em] px-[3em] py-[0.7em] text-[16px] font-bold uppercase shadow-[0.15em_0.15em_0_#212121] disabled:pointer-events-none sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px]",
          className
        )}
        {...props}
      >
        {Array.from({ length: 4 })
          .fill(undefined)
          .map((_e, i) => (
            <span
              key={i}
              className={cn(
                "absolute top-0 -z-[1] h-full w-1/4 translate-y-[150%] rounded-full bg-[#FFFFE4] transition-transform duration-500 ease-in-out group-hover:translate-y-0 group-hover:scale-150 group-focus:translate-y-0 group-focus:scale-150",
                spanStyle
              )}
              style={{ left: `${i * 25}%`, transitionDelay: `${i * 0.1}s` }}
            ></span>
          ))}
        {children ?? buttonText}
      </button>
    );
  }
);
PrimaryButton.displayName = "Button"; //Counters the Component definition is missing display name warning

export default PrimaryButton;
