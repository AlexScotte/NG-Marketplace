import { Button, Stack, Typography } from "@mui/material";
import { useSwitchNetwork } from "wagmi";

const ChangeChain = ({ chain, chainID }) => {
  const { switchNetwork } = useSwitchNetwork();

  const handleClick = async () => {
    try {
      switchNetwork?.(chainID);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Stack className="div-centered" direction="column">
      <Typography variant="h6">Wrong kingdom</Typography>
      <Typography variant="subtitle1">
        Guardian, you need to travel to the {chain} kingdom to access this
        section.
      </Typography>

      <Button
        onClick={handleClick}
        variant="outlined"
        className="generic-button"
        style={{
          marginTop: "20px",
        }}
      >
        Change kingdom
      </Button>
    </Stack>
  );
};

export default ChangeChain;
