"use client";

import { BorderColor } from "@mui/icons-material";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

const YesNoSwitch = styled(Switch)(({ theme }) => ({
  width: 137,
  height: 40,
  padding: 0,
  display: "flex",

  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 0,
    top: 8,
    left: 8,
    transform: "translateX(0)",
    transitionDuration: "250ms",

    "&.Mui-checked": {
      transform: "translateX(54px)",
      color: "#fff",

      "& .MuiSwitch-thumb::before": {
        content: '"Yes"',
      },

      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "var(--ww-color-primary)",
      },
    },
  },

  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    backgroundColor: "var(--ww-color-white)",
    width: 65,
    height: 25,
    borderRadius: 999,
    position: "relative",

    "&::before": {
      content: '"No"',
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: 500,
      color: "#666",
      fontFamily: "inherit",
    },
  },

  "& .MuiSwitch-track": {
    borderRadius: 999,
    opacity: 1,
    backgroundColor: "var(--ww-color-primary-light)",
    boxSizing: "border-box",
  },
}));

export default YesNoSwitch;
