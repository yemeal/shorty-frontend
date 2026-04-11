import React from "react";
import { motion as Motion } from "framer-motion";
import ActionIconButton from "./ActionIconButton";

const CardActions = ({
  actions,
  centered = true,
  mobileWrap = true,
  className = "",
}) => {
  return (
    <div
      className={`flex w-full sm:w-auto items-center ${centered ? "justify-center" : "justify-between sm:justify-start"} gap-2 shrink-0 ${
        mobileWrap ? "flex-wrap" : ""
      } ${className}`}
    >
      {actions.map((action) => {
        if (action.type === "link") {
          return (
            <Motion.a
              key={action.key}
              whileTap={action.whileTap || { scale: 0.92 }}
              href={action.href}
              target={action.target}
              rel={action.rel}
              aria-label={action.ariaLabel}
              title={action.title}
              className={action.className}
            >
              {action.icon}
            </Motion.a>
          );
        }

        return (
          <ActionIconButton
            key={action.key}
            whileTap={action.whileTap}
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            title={action.title}
            variant={action.variant}
            className={action.className}
            disabled={action.disabled}
          >
            {action.icon}
          </ActionIconButton>
        );
      })}
    </div>
  );
};

export default CardActions;
