import { Stack, Typography } from "@mui/material";

const ChangeChain = ({ chain }) => {
  return (
    <Stack className="div-centered" direction="column">
      <Typography variant="h6">Wrong kingdom</Typography>
      <Typography variant="subtitle1">
        Guardian, you need to travel to the {chain} kingdom to access this
        section.
      </Typography>
    </Stack>
  );
};

export default ChangeChain;
