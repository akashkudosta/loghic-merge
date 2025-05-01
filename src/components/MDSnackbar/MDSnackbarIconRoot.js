// @mui material components
import Icon from "@mui/material/Icon";
import { styled } from "@mui/material/styles";

export default styled(Icon)(({ theme, ownerState }) => {
  const { palette, typography } = theme;
  const { color, bgWhite } = ownerState;

  const { white, transparent, gradients } = palette;
  const { size } = typography;

  // Helper function to create linear gradient
  const createLinearGradient = (mainColor, stateColor) => 
    `linear-gradient(195deg, ${mainColor}, ${stateColor})`;

  // backgroundImage value
  let backgroundImageValue = 'none';

  if (bgWhite && gradients?.[color]) {
    backgroundImageValue = createLinearGradient(gradients[color].main, gradients[color].state);
  } else if (bgWhite && gradients?.info) {
    backgroundImageValue = createLinearGradient(gradients.info.main, gradients.info.state);
  } else if (color === "light" && gradients?.dark) {
    backgroundImageValue = createLinearGradient(gradients.dark.main, gradients.dark.state);
  }

  return {
    backgroundImage: backgroundImageValue,
    WebkitTextFillColor: bgWhite || color === "light" ? transparent?.main : white?.main,
    WebkitBackgroundClip: "text",
    marginRight: "8px",
    fontSize: size?.lg || "1.125rem",
    transform: "translateY(-2px)",
  };
});
