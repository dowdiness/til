import type { PointerEventHandler } from "react";

const enterTextHover: PointerEventHandler<HTMLElement> = (event) => {
  if (event.pointerType === "mouse" || event.pointerType === "pen") {
    event.currentTarget.dataset.textHovered = "true";
  }
};

const leaveTextHover: PointerEventHandler<HTMLElement> = (event) => {
  delete event.currentTarget.dataset.textHovered;
};

export const textHoverHandlers = {
  onPointerEnter: enterTextHover,
  onPointerLeave: leaveTextHover,
  onPointerCancel: leaveTextHover,
} as const;
